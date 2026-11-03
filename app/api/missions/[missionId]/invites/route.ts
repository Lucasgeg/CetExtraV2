import { auth } from "@clerk/nextjs/server";
import { type MissionJob, Prisma, UserMissionStatus } from "@prisma/client";
import { render } from "@react-email/components";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/app/lib/prisma";
import MissionInvitation, {
  type MissionInvitationProps
} from "@/components/MailTemplate/MissionInvitation";
import { EnumRole, type PrismaMissionJob } from "@/store/types";
import type { GetMissionInvitesResponse } from "@/types/GetMissionIdInvites";
import type { InviteListDelete } from "@/types/InviteListDelete";
import type { MissionInviteResponse } from "@/types/MissionInvite";
import {
  getInviteBlocker,
  getMissionInviteBlocker,
  type InviteBlocker
} from "@/utils/engagement.util";
import {
  convertToDbMissionJob,
  convertToFrontendMissionJob
} from "@/utils/enum";
import { handlePrismaError } from "@/utils/prismaErrors.util";
import { absoluteUrl } from "@/utils/siteUrl";
import { isEmailValid } from "@/utils/string";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Nombre maximal d'ids acceptés par tableau (`employees`, `invites`) dans le DELETE. */
const MAX_IDS_PER_LIST = 100;

/** Champs de l'engagement (ou de l'`Invitation`) écrits par une (ré)invitation. */
type InviteFields = {
  missionId: string;
  missionJob: MissionJob;
  missionStartDate: Date;
  missionEndDate: Date;
};

type InviteOutcome =
  | { ok: false; status: number; message: string }
  | { ok: true; email: { to: string; props: MissionInvitationProps } };

type ParsedInvite = {
  expeditorUserId: string;
  /** User.id de l'extra inscrit, si l'invitation vise un identifiant. */
  userId: string | undefined;
  /** Email normalisé (trim + minuscules), si l'invitation vise un email. */
  receiverEmail: string | undefined;
  missionJob: MissionJob;
  startDate: Date;
  endDate: Date;
};

/** Normalisation des emails d'invitation : écriture, verrou et recherche. */
const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Valide le corps `MissionInviteBody` sans faire confiance au typage : renvoie
 * les champs prêts à l'emploi, ou le message (400) du premier champ invalide.
 */
const parseInviteBody = (body: unknown): ParsedInvite | string => {
  if (typeof body !== "object" || body === null) {
    return "Format de données invalide";
  }
  const {
    expeditorUserId,
    receiverEmail,
    userId,
    missionJob,
    missionStartDate,
    missionEndDate
  } = body as Record<string, unknown>;

  if (!isNonEmptyString(expeditorUserId) || !isNonEmptyString(missionJob)) {
    return "Tous les champs obligatoires doivent être renseignés";
  }

  if (
    (receiverEmail !== undefined &&
      receiverEmail !== null &&
      typeof receiverEmail !== "string") ||
    (userId !== undefined && userId !== null && typeof userId !== "string")
  ) {
    return "Format de données invalide";
  }

  const email = isNonEmptyString(receiverEmail)
    ? normalizeEmail(receiverEmail)
    : undefined;
  if (email !== undefined && !isEmailValid(email)) {
    return "L'adresse email n'est pas valide";
  }

  const targetUserId = isNonEmptyString(userId) ? userId : undefined;
  if (!targetUserId && !email) {
    return "Vous devez fournir soit un email soit un identifiant d'utilisateur";
  }

  if (
    !isNonEmptyString(missionStartDate) ||
    !isNonEmptyString(missionEndDate)
  ) {
    return "Les dates de début et de fin sont obligatoires";
  }
  const startDate = new Date(missionStartDate);
  const endDate = new Date(missionEndDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Les dates de début et de fin ne sont pas valides";
  }
  if (startDate < new Date()) {
    return "La date de début doit être dans le futur";
  }
  if (startDate >= endDate) {
    return "La date de début doit être antérieure à la date de fin";
  }

  let dbMissionJob: MissionJob;
  try {
    dbMissionJob = convertToDbMissionJob(missionJob);
  } catch {
    return "Poste inconnu";
  }

  return {
    expeditorUserId,
    userId: targetUserId,
    receiverEmail: email,
    missionJob: dbMissionJob,
    startDate,
    endDate
  };
};

/**
 * @function POST
 * @async
 * @description
 * Endpoint permettant à une entreprise d'inviter un utilisateur à une mission.
 * Gère la validation des données, la vérification des autorisations, la création de l'invitation
 * (soit pour un utilisateur déjà inscrit, soit pour un nouvel utilisateur), et l'envoi d'un email d'invitation.
 *
 * - Vérifie que l'utilisateur authentifié est bien une entreprise et l'expéditeur de l'invitation.
 * - Valide les champs obligatoires et le format des dates et de l'email.
 * - Si l'utilisateur existe déjà, crée une entrée dans `userMission`, sinon crée une invitation.
 * - Transitions (`getInviteBlocker`, utils/engagement.util.ts) : aucun
 *   engagement → `pending` ; `cancelled` / `refused` → réinvitation en
 *   `pending` (taux remis à null) ; `pending` / `requested` / `accepted` → 409,
 *   l'engagement existant n'est pas modifié. Même règle pour une `Invitation`
 *   par email (en pratique `pending` → 409, `cancelled` → `pending`).
 * - Invitation par email d'un extra déjà inscrit (email comparé en minuscules,
 *   sans espaces) : bascule silencieuse vers une UserMission, comme par
 *   `userId`, sans `Invitation` ; email « connectez-vous ». Réponse de succès
 *   identique dans tous les cas (pas d'oracle sur l'existence d'un compte).
 * - Mission (`getMissionInviteBlocker`) : 409 si elle est annulée, terminée ou
 *   déjà commencée (contrôle après les 403/404, avant celui de l'engagement).
 * - Concurrence : la mission est verrouillée `FOR SHARE` (contre une
 *   annulation simultanée), puis la ligne existante `FOR UPDATE` avant la
 *   lecture de son statut ; une création concurrente échoue sur l'unicité (409).
 * - Envoie un email d'invitation via Resend APRÈS commit, sans bloquer : 201
 *   `{ message, emailSent }`, `emailSent: false` si l'envoi a échoué
 *   (l'invitation reste enregistrée).
 * - Gère les erreurs courantes (utilisateur déjà invité, mission non trouvée, etc.).
 *
 * @param {Request} req - La requête HTTP contenant le corps de l'invitation.
 * @param {Object} props - Les paramètres de la requête, incluant l'identifiant de la mission.
 * @param {Promise<{ missionId: string }>} props.params - Paramètres contenant l'identifiant de la mission.
 *
 * @returns {Promise<Response>}
 * Retourne une réponse HTTP avec le statut et un message indiquant le succès ou la raison de l'échec.
 *
 * @throws {Prisma.PrismaClientKnownRequestError} - En cas d'erreur lors de l'accès à la base de données.
 * @throws {SyntaxError} - Si le corps de la requête n'est pas un JSON valide.
 */
export async function POST(
  req: Request,
  props: { params: Promise<{ missionId: string }> }
) {
  const { sessionClaims, userId: currentUserId } = await auth();
  const { missionId } = await props.params;

  try {
    const parsed = parseInviteBody(await req.json().catch(() => null));
    if (typeof parsed === "string" || !missionId) {
      return NextResponse.json(
        {
          message:
            typeof parsed === "string"
              ? parsed
              : "Tous les champs obligatoires doivent être renseignés"
        },
        { status: 400 }
      );
    }
    const {
      expeditorUserId,
      receiverEmail,
      userId,
      missionJob,
      startDate,
      endDate
    } = parsed;

    // Validation de l'autorisation
    if (
      !sessionClaims ||
      sessionClaims.publicMetadata.role !== EnumRole.COMPANY
    ) {
      return new Response(
        JSON.stringify({
          message: "Seules les entreprises peuvent envoyer des invitations"
        }),
        { status: 403 }
      );
    }

    if (currentUserId !== expeditorUserId) {
      return new Response(
        JSON.stringify({
          message: "Vous n'êtes pas autorisé à effectuer cette action"
        }),
        { status: 403 }
      );
    }

    const invite: InviteFields = {
      missionId,
      missionJob,
      missionStartDate: startDate,
      missionEndDate: endDate
    };

    const outcome = await prisma.$transaction(
      async (tx): Promise<InviteOutcome> => {
        // Appartenance vérifiée AVANT tout verrou : on ne verrouille pas les
        // lignes d'une autre entreprise (le créateur d'une mission ne change
        // jamais, cette lecture hors verrou suffit)
        const user = await tx.user.findUnique({
          where: { clerkId: expeditorUserId },
          select: {
            company: {
              select: {
                createdMissions: {
                  where: {
                    id: missionId
                  },
                  select: {
                    name: true,
                    missionLocation: {
                      select: {
                        fullName: true
                      }
                    }
                  }
                },
                company_name: true
              }
            }
          }
        });

        const mission = user?.company?.createdMissions[0];
        if (!user?.company || !mission) {
          return {
            ok: false,
            message:
              "Mission non trouvée ou vous n'êtes pas autorisé à y accéder",
            status: 404
          };
        }

        // Verrou partagé de la mission, pris avant celui de l'engagement (même
        // ordre que l'annulation de mission, qui la verrouille FOR UPDATE) :
        // une annulation simultanée attend la fin de l'invitation, ou
        // l'invitation lit le statut `cancelled` déjà commité. Statut et date
        // relus sous ce verrou
        await tx.$queryRaw`
          SELECT id FROM "Mission" WHERE id = ${missionId} FOR SHARE`;
        const missionState = await tx.mission.findUniqueOrThrow({
          where: { id: missionId },
          select: { status: true, missionStartDate: true }
        });

        // Contrôlé après l'appartenance et les vérifications de l'invité
        // (409 après 403/404), avant le statut de l'engagement
        const missionBlocker = getMissionInviteBlocker({
          missionStatus: missionState.status,
          missionStartDate: missionState.missionStartDate,
          now: new Date()
        });

        let to: string;
        // Choisit le template : se connecter (inscrit) ou s'inscrire
        let isRegisteredExtra: boolean;
        if (userId) {
          const userFromDb = await tx.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              role: true,
              email: true
            }
          });
          if (userFromDb?.role === "company") {
            return {
              ok: false,
              message:
                "Vous ne pouvez pas inviter une entreprise à une mission",
              status: 403
            };
          }

          if (!userFromDb) {
            return {
              ok: false,
              message: "Utilisateur non trouvé",
              status: 404
            };
          }

          if (missionBlocker) {
            return { ok: false, message: missionBlocker.message, status: 409 };
          }

          const blocker = await inviteRegisteredExtra(
            tx,
            invite,
            userFromDb.id
          );
          if (blocker) {
            return { ok: false, message: blocker.message, status: 409 };
          }
          to = userFromDb.email;
          isRegisteredExtra = true;
        } else {
          if (!receiverEmail) {
            return {
              ok: false,
              message:
                "L'adresse email est requise pour inviter un nouvel utilisateur",
              status: 400
            };
          }

          if (missionBlocker) {
            return { ok: false, message: missionBlocker.message, status: 409 };
          }

          // Bascule silencieuse : un email qui appartient à un extra inscrit
          // l'invite comme par son identifiant (UserMission, mêmes règles et
          // même verrou), sans `Invitation`. La réponse ne doit jamais
          // révéler si l'email a un compte : succès identique dans les deux
          // cas, messages de refus communs (`getInviteBlocker`). Un email
          // d'entreprise inscrite garde l'`Invitation` simple.
          const registeredExtra = await tx.user.findFirst({
            where: {
              email: { equals: receiverEmail, mode: "insensitive" },
              role: "extra"
            },
            select: { id: true, email: true }
          });

          const blocker = registeredExtra
            ? await inviteRegisteredExtra(tx, invite, registeredExtra.id)
            : await inviteUnregisteredExtra(tx, invite, receiverEmail);
          if (blocker) {
            return { ok: false, message: blocker.message, status: 409 };
          }
          to = registeredExtra?.email ?? receiverEmail;
          isRegisteredExtra = registeredExtra !== null;
        }

        return {
          ok: true,
          email: {
            to,
            props: {
              companyName: user.company.company_name,
              isAllreadyRegistered: isRegisteredExtra,
              duration: endDate.getTime() - startDate.getTime(),
              missionJob: convertToFrontendMissionJob(
                missionJob as PrismaMissionJob
              ),
              missionDate: startDate.toISOString(),
              missionName: mission.name,
              missionLocation:
                mission.missionLocation?.fullName || "Non spécifié",
              receiverEmail: to
            }
          }
        };
      }
    );

    if (!outcome.ok) {
      return NextResponse.json(
        { message: outcome.message },
        { status: outcome.status }
      );
    }

    // Après commit et non bloquant : l'invitation enregistrée fait foi (comme
    // l'annulation de mission et les décisions sur candidature) ; l'appel à
    // Resend ne prolonge ni la transaction ni les verrous. Les logs ne
    // contiennent que l'erreur, jamais l'adresse du destinataire
    let emailSent = true;
    try {
      const missionInvitation = MissionInvitation(outcome.email.props);
      // Resend ne lève pas sur une erreur API : il la renvoie dans `error`
      const { error: sendError } = await resend.emails.send({
        from: "Cet Extra <no-reply@cetextra.fr>",
        to: [outcome.email.to],
        subject: "Invitation à une mission",
        react: missionInvitation,
        text: await render(missionInvitation),
        headers: {
          "List-Unsubscribe": `<${absoluteUrl("/blog/unsubscribe")}>`
        }
      });
      if (sendError) {
        console.error("Mission invitation email error:", sendError);
        emailSent = false;
      }
    } catch (emailError) {
      console.error("Mission invitation email error:", emailError);
      emailSent = false;
    }

    const response: MissionInviteResponse = emailSent
      ? { message: "Invitation envoyée avec succès", emailSent }
      : {
          message:
            "Invitation enregistrée, mais l'email n'a pas pu être envoyé",
          emailSent
        };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    // Course perdue sur une création (candidature `/apply` ou invitation
    // simultanée sur le même couple) : l'unicité reste la garantie finale
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Cette personne est déjà invitée à cette mission" },
        { status: 409 }
      );
    }

    // Erreur de parsing JSON
    if (error instanceof SyntaxError) {
      return new NextResponse(
        JSON.stringify({ message: "Format de données invalide" }),
        { status: 400 }
      );
    }

    // Utilisation de l'utilitaire pour les erreurs Prisma
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientUnknownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      const { message, status } = handlePrismaError(
        error,
        "POST mission/invites"
      );
      return new NextResponse(JSON.stringify({ message }), { status });
    }

    // Logging plus précis
    console.error("Error in mission invite API:", error);

    // Erreur générique
    return new NextResponse(
      JSON.stringify({
        message:
          "Une erreur inattendue s'est produite. Veuillez réessayer plus tard"
      }),
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to retrieve pending employee invites and invitations for a specific mission.
 *
 * @param request - The incoming Next.js request object.
 * @param props - An object containing route parameters, specifically the missionId.
 * @returns {Promise<NextResponse<GetMissionInvitesResponse | { message: string }>>}
 *
 * @remarks
 * - Only users with the `COMPANY` role and a valid userId are authorized to access this endpoint.
 * - Returns a 401 Unauthorized response if the user is not authorized.
 * - Returns a 400 Bad Request response if the missionId parameter is invalid.
 * - Returns a 404 Not Found response if the mission does not exist.
 * - Returns a 403 Forbidden response if the mission belongs to another company.
 * - On success, returns a 200 OK response with counts and details of pending employees and invitations.
 * - GDPR: pending employees (registered extras who have not accepted yet) only expose first/last
 *   name and profile picture, never their email or user id. Invitations (unregistered extras)
 *   keep the email the company typed in.
 *
 * @example
 * {{baseUrl}}/api/missions/{missionId}/invites
 */
export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ missionId: string }> }
): Promise<NextResponse<GetMissionInvitesResponse | { message: string }>> {
  const { sessionClaims, userId } = await auth();

  if (sessionClaims?.publicMetadata?.role !== EnumRole.COMPANY || !userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { missionId } = await props.params;

  if (!missionId || typeof missionId !== "string") {
    return NextResponse.json(
      { message: "Invalid missionId parameter" },
      { status: 400 }
    );
  }

  const pendingInvites = await prisma.mission.findUnique({
    where: { id: missionId },
    select: {
      creator: { select: { user: { select: { clerkId: true } } } },
      employees: {
        where: {
          status: "pending"
        },
        select: {
          id: true,
          // RGPD : ni email ni id utilisateur pour un extra inscrit invité
          // (`pending`) tant qu'il n'a pas accepté (cf.
          // `CONTACT_VISIBLE_USER_MISSION_STATUSES`). Les `invitations`
          // ci-dessous (extras non inscrits) gardent l'email saisi par
          // l'entreprise.
          user: {
            select: {
              extra: {
                select: {
                  first_name: true,
                  last_name: true
                }
              },
              profilePictureUrl: true
            }
          },
          missionJob: true,
          missionStartDate: true,
          missionEndDate: true
        }
      },
      invitations: {
        where: {
          status: "pending"
        },
        select: {
          id: true,
          email: true,
          missionJob: true,
          missionStartDate: true,
          missionEndDate: true
        }
      },
      _count: {
        select: {
          employees: {
            where: {
              missionId,
              status: "pending"
            }
          },
          invitations: {
            where: {
              missionId,
              status: "pending"
            }
          }
        }
      }
    }
  });
  if (!pendingInvites) {
    return NextResponse.json({ message: "Mission not found" }, { status: 404 });
  }

  if (pendingInvites.creator.user.clerkId !== userId) {
    return NextResponse.json(
      { message: "You are not authorized to view invites for this mission" },
      { status: 403 }
    );
  }

  const response: GetMissionInvitesResponse = {
    counts: {
      employees: pendingInvites._count.employees,
      invitations: pendingInvites._count.invitations,
      total: pendingInvites._count.employees + pendingInvites._count.invitations
    },
    pendingEmployees: pendingInvites.employees.map((employee) => ({
      id: employee.id,
      missionEndDate: employee.missionEndDate.toISOString(),
      missionStartDate: employee.missionStartDate.toISOString(),
      missionJob: employee.missionJob,
      user: {
        firstName: employee.user.extra?.first_name || null,
        lastName: employee.user.extra?.last_name || null,
        profilePictureUrl: employee.user.profilePictureUrl
          ? employee.user.profilePictureUrl
          : null
      }
    })),
    invitations: pendingInvites.invitations.map((invite) => ({
      id: invite.id,
      email: invite.email,
      missionJob: invite.missionJob,
      missionStartDate: invite.missionStartDate.toISOString(),
      missionEndDate: invite.missionEndDate.toISOString()
    }))
  };
  return NextResponse.json(response, { status: 200 });
}

/**
 * Handles the DELETE request for removing employees and/or invites from a mission.
 *
 * This endpoint is restricted to users with the COMPANY role and requires authentication.
 * It expects a JSON body containing arrays of employee and invite IDs to be cancelled.
 * The function performs authorization checks, validates input, and updates the status
 * of the specified employees and invites to "cancelled" within a database transaction.
 *
 * @param request - The incoming Next.js request object.
 * @param props - An object containing route parameters, specifically the missionId.
 * Only pending employees/invites are cancelled: IDs that do not exist, do not belong
 * to this mission or are no longer pending are ignored.
 *
 * @param request - The incoming Next.js request object.
 * @param props - An object containing route parameters, specifically the missionId.
 * @returns A NextResponse object with a JSON payload indicating the result of the operation.
 *   On success (200): `{ message, success: true, cancelled: { employees, invites } }`,
 *   where `cancelled` holds the number of rows actually cancelled.
 *
 * @throws {401} If the user is not authorized or not a company.
 * @throws {400} If the missionId parameter or request body is invalid (invalid JSON,
 *   non-string/empty IDs, or more than 100 IDs per list).
 * @throws {403} If the mission belongs to another company.
 * @throws {404} If the mission is not found.
 * @throws {500} For unexpected errors or database failures.
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ missionId: string }> }
): Promise<
  NextResponse<{
    message: string;
    success?: boolean;
    cancelled?: { employees: number; invites: number };
  }>
> {
  const { sessionClaims, userId } = await auth();

  if (sessionClaims?.publicMetadata?.role !== EnumRole.COMPANY || !userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { missionId } = await props.params;

  if (!missionId || typeof missionId !== "string") {
    return NextResponse.json(
      { message: "Invalid missionId parameter" },
      { status: 400 }
    );
  }

  let body: InviteListDelete;
  try {
    body = (await request.json()) as InviteListDelete;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  const isValidIdList = (ids: unknown): ids is string[] =>
    Array.isArray(ids) &&
    ids.length <= MAX_IDS_PER_LIST &&
    ids.every((id) => typeof id === "string" && id.length > 0);

  if (!body || !isValidIdList(body.employees) || !isValidIdList(body.invites)) {
    return NextResponse.json(
      {
        message: `Invalid request body: employees and invites must be arrays of at most ${MAX_IDS_PER_LIST} non-empty string IDs`
      },
      { status: 400 }
    );
  }

  if (body.employees.length === 0 && body.invites.length === 0) {
    return NextResponse.json(
      { message: "No employees or invites to delete" },
      { status: 400 }
    );
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: {
      creator: { select: { user: { select: { clerkId: true } } } }
    }
  });

  if (!mission) {
    return NextResponse.json({ message: "Mission not found" }, { status: 404 });
  }

  if (mission.creator.user.clerkId !== userId) {
    return NextResponse.json(
      { message: "You are not authorized to delete invites for this mission" },
      { status: 403 }
    );
  }

  const employeeIds = [...new Set(body.employees)];
  const inviteIds = [...new Set(body.invites)];

  try {
    // Le filtre missionId ferme l'IDOR : un id absent ou rattaché à une autre
    // mission est simplement ignoré (non compté dans `cancelled`). Le filtre
    // pending limite la route aux invitations en attente (pas d'annulation
    // d'un extra accepté ni d'une candidature `requested`).
    const cancelled = await prisma.$transaction(async (tx) => {
      let employees = 0;
      let invites = 0;
      if (employeeIds.length > 0) {
        const { count } = await tx.userMission.updateMany({
          where: {
            missionId,
            status: "pending",
            id: {
              in: employeeIds
            }
          },
          data: {
            status: "cancelled"
          }
        });
        employees = count;
      }
      if (inviteIds.length > 0) {
        const { count } = await tx.invitation.updateMany({
          where: {
            missionId,
            status: "pending",
            id: {
              in: inviteIds
            }
          },
          data: {
            status: "cancelled"
          }
        });
        invites = count;
      }
      return { employees, invites };
    });
    return NextResponse.json(
      {
        message: "Invites deleted successfully",
        success: true,
        cancelled
      },
      { status: 200 }
    );
  } catch (error) {
    // Le détail (message Prisma, modèle, champs) reste dans les logs serveur,
    // le client ne reçoit qu'un message générique.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const { message, status } = handlePrismaError(error, "DELETE invites");
      console.error("Error deleting invites:", message, status);
      return NextResponse.json(
        { message: "Failed to delete invites" },
        { status }
      );
    }
    console.error("Error deleting invites:", error);
    return NextResponse.json(
      { message: "Failed to delete invites" },
      { status: 500 }
    );
  }
}

/**
 * Invite un extra inscrit (UserMission) selon `getInviteBlocker` : création en
 * `pending` s'il n'a aucun engagement sur la mission, réinvitation (retour en
 * `pending`, taux remis à null) depuis `cancelled` / `refused`, refus sinon.
 *
 * La ligne existante est verrouillée avant la lecture de son statut : une
 * décision simultanée sur cet engagement s'exécute avant ou après, jamais entre
 * la lecture et l'écriture. Sans ligne existante, rien n'est verrouillé : une
 * candidature `/apply` concurrente fait échouer la création sur l'unicité
 * [userId, missionId] (P2002, traduit en 409 par l'appelant).
 *
 * @returns la raison du refus, ou null si l'extra a été (ré)invité.
 */
const inviteRegisteredExtra = async (
  tx: Prisma.TransactionClient,
  invite: InviteFields,
  userId: string
): Promise<InviteBlocker | null> => {
  await tx.$queryRaw`
    SELECT id FROM "UserMission"
    WHERE "userId" = ${userId} AND "missionId" = ${invite.missionId}
    FOR UPDATE`;

  const existing = await tx.userMission.findUnique({
    where: { userId_missionId: { userId, missionId: invite.missionId } },
    select: { id: true, status: true }
  });

  const blocker = getInviteBlocker(existing?.status ?? null);
  if (blocker) return blocker;

  const data = {
    missionStartDate: invite.missionStartDate,
    missionEndDate: invite.missionEndDate,
    missionJob: invite.missionJob,
    hourlyRate: null,
    status: UserMissionStatus.pending
  };

  if (existing) {
    await tx.userMission.update({
      where: { id: existing.id },
      data,
      select: { id: true }
    });
  } else {
    await tx.userMission.create({
      data: { ...data, userId, missionId: invite.missionId },
      select: { id: true }
    });
  }
  return null;
};

/**
 * Invite un extra non inscrit par email (`Invitation`), selon la même règle
 * `getInviteBlocker` : une invitation encore `pending` n'est pas écrasée, une
 * invitation `cancelled` repasse en `pending`.
 *
 * `email` est déjà normalisé (trim + minuscules) ; les lignes historiques non
 * normalisées sont retrouvées en comparant `lower(trim(email))`, et leur email
 * est normalisé à la réinvitation. Comme pour `inviteRegisteredExtra` : la
 * ligne existante est verrouillée avant la lecture de son statut ; sans ligne
 * existante, rien n'est verrouillé et une invitation concurrente (double clic)
 * fait échouer la création sur l'unicité [email, missionId] (P2002 → 409 chez
 * l'appelant) : un seul 201, un seul email.
 *
 * @returns la raison du refus, ou null si l'email a été (ré)invité.
 */
const inviteUnregisteredExtra = async (
  tx: Prisma.TransactionClient,
  invite: InviteFields,
  email: string
): Promise<InviteBlocker | null> => {
  const [existing] = await tx.$queryRaw<
    { id: string; status: UserMissionStatus }[]
  >`
    SELECT id, status FROM "Invitation"
    WHERE lower(trim(email)) = ${email} AND "missionId" = ${invite.missionId}
    ORDER BY "createdAt"
    FOR UPDATE`;

  const blocker = getInviteBlocker(existing?.status ?? null);
  if (blocker) return blocker;

  const data = {
    email,
    missionStartDate: invite.missionStartDate,
    missionEndDate: invite.missionEndDate,
    missionJob: invite.missionJob,
    hourlyRate: null,
    status: UserMissionStatus.pending
  };

  const invitation = existing
    ? await tx.invitation.update({
        where: { id: existing.id },
        data,
        select: { id: true }
      })
    : await tx.invitation.create({
        data: { ...data, missionId: invite.missionId },
        select: { id: true }
      });
  // Id seulement : l'email saisi par l'entreprise ne va pas dans les logs
  console.info("User invitation created:", invitation.id);
  return null;
};
