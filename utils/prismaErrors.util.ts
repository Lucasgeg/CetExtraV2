import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError
} from "@prisma/client/runtime/library";

/**
 * Exemple d'utilisation:
 * ```typescript
 * try {
 *   const user = await prisma.user.findUniqueOrThrow({
 *     where: { email }
 *   });
 * } catch (error) {
 *   const { message, status } = handlePrismaError(error, 'UserLogin');
 *   return NextResponse.json({ error: message }, { status });
 * }
 * ```
 */

export class PrismaErrorHandler {
  /**
   * Analyse une erreur Prisma et retourne un message d'erreur clair
   * @param error L'erreur capturée
   * @param context Contexte optionnel pour personnaliser le message
   * @returns Un objet contenant le message d'erreur et des détails supplémentaires
   */
  static handle(
    error: unknown,
    context?: string
  ): {
    message: string;
    code?: string;
    details?: unknown;
    status: number;
  } {
    // Message de contexte pour améliorer la clarté
    const contextMsg = context ? `[${context}] ` : "";

    // Gérer les erreurs connues de Prisma
    if (error instanceof PrismaClientKnownRequestError) {
      // Erreurs avec un code spécifique
      return PrismaErrorHandler.handleKnownRequestError(error, contextMsg);
    } else if (error instanceof PrismaClientUnknownRequestError) {
      return {
        message: `${contextMsg}Erreur de base de données inattendue.`,
        details: error.message,
        status: 500
      };
    } else if (error instanceof PrismaClientRustPanicError) {
      return {
        message: `${contextMsg}Erreur critique du moteur de base de données.`,
        details: error.message,
        status: 500
      };
    } else if (error instanceof PrismaClientInitializationError) {
      return {
        message: `${contextMsg}Impossible de se connecter à la base de données.`,
        code: error.errorCode,
        details: error.message,
        status: 503 // Service Unavailable
      };
    } else if (error instanceof PrismaClientValidationError) {
      return {
        message: `${contextMsg}Données invalides pour l'opération en base de données.`,
        details: error.message,
        status: 400 // Bad Request
      };
    } else if (error instanceof Error) {
      // Autres erreurs génériques
      return {
        message: `${contextMsg}Une erreur s'est produite: ${error.message}`,
        details: error,
        status: 500
      };
    }

    // Erreur inconnue
    return {
      message: `${contextMsg}Une erreur inconnue s'est produite.`,
      details: error,
      status: 500
    };
  }

  /**
   * Gère les erreurs Prisma avec un code spécifique
   */
  private static handleKnownRequestError(
    error: PrismaClientKnownRequestError,
    contextMsg: string
  ) {
    // Extraire les informations de l'erreur
    const { code, meta } = error;

    switch (code) {
      // Violations de contraintes uniques
      case "P2002": {
        const target = (meta?.target as string[]) || [];
        return {
          message: `${contextMsg}Un enregistrement avec ce ${target.join(", ")} existe déjà.`,
          code,
          details: meta,
          status: 409 // Conflict
        };
      }

      // Enregistrement non trouvé
      case "P2001":
      case "P2018":
      case "P2025":
        return {
          message: `${contextMsg}L'enregistrement demandé n'existe pas.`,
          code,
          details: meta,
          status: 404 // Not Found
        };

      // Violation de contrainte de clé étrangère
      case "P2003": {
        const field = meta?.field_name;
        return {
          message: `${contextMsg}Référence invalide pour ${field || "un champ"}.`,
          code,
          details: meta,
          status: 400 // Bad Request
        };
      }

      // Contrainte de champ requis
      case "P2004":
        return {
          message: `${contextMsg}Un champ requis est manquant.`,
          code,
          details: meta,
          status: 400
        };

      // Contrainte de restriction
      case "P2009":
      case "P2012":
        return {
          message: `${contextMsg}Données invalides: ${error.message}`,
          code,
          details: meta,
          status: 400
        };

      // Autres erreurs
      default:
        return {
          message: `${contextMsg}Erreur de base de données: ${error.message}`,
          code,
          details: meta,
          status: 500
        };
    }
  }
}

/**
 * Fonction utilitaire pour gérer les erreurs Prisma dans les blocs catch
 */
export function handlePrismaError(error: unknown, context?: string) {
  const result = PrismaErrorHandler.handle(error, context);
  console.error(
    `Prisma error (${result.code || "unknown"}):`,
    result.message,
    result.details
  );
  return result;
}
