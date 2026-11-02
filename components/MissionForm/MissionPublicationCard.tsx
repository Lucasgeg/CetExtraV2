"use client";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { type Control, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CreateMissionFormValues } from "@/types/api";
import {
  getRateFloorChangeBlocker,
  validateHourlyRateRange
} from "@/utils/missionPublication.util";
import styles from "../CreateMissionCard/MissionCard.module.css";

type MissionPublicationCardProps = {
  control: Control<CreateMissionFormValues>;
  /** Une adresse de mission est renseignée (condition pour publier). */
  hasLocation: boolean;
  disabled?: boolean;
  /** Erreur de validation de la fourchette (portée par `hourlyRateMin`). */
  rateErrorMessage?: string;
  /**
   * Édition avec engagements actifs : minimum en base, qui ne peut
   * qu'augmenter (`getRateFloorChangeBlocker`). null = pas de contrainte.
   */
  rateFloor?: number | null;
};

/** Saisie d'une borne : chaîne vide = absente (null), sinon nombre. */
const toRate = (value: string): number | null =>
  value.trim() === "" ? null : Number(value);

/**
 * Diffusion publique (intention opt-out, ADR 0002) et fourchette de taux
 * horaire indicative.
 *
 * L'interrupteur garde l'intention en valeur de formulaire mais s'affiche
 * décoché et désactivé sans adresse : le formulaire envoie
 * `isPublic && adresse` (voir MissionForm.onSubmit), si bien qu'une adresse
 * saisie plus tard rétablit l'intention sans que l'utilisateur la perde.
 */
export const MissionPublicationCard = ({
  control,
  hasLocation,
  disabled,
  rateErrorMessage,
  rateFloor = null
}: MissionPublicationCardProps) => (
  <Card className="flex flex-shrink-0 flex-col">
    <CardHeader className="flex flex-row items-center justify-start gap-2 pb-2">
      <div
        className={cn(
          "rounded-lg bg-gradient-to-br from-employer-secondary to-[#F3E8FF] p-1",
          styles.iconWrapper
        )}
      >
        <GlobeAltIcon />
      </div>
      <h2 className="w-auto font-semibold text-employer-primary text-lg">
        Diffusion publique
      </h2>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      <Controller
        name="isPublic"
        control={control}
        render={({ field }) => {
          const checked = hasLocation && field.value !== false;
          return (
            <div className="flex flex-col gap-1">
              <label
                htmlFor="isPublic"
                className={cn(
                  "flex items-center justify-between gap-3 text-sm",
                  hasLocation && !disabled
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-60"
                )}
              >
                <span>Publier sur le site public</span>
                <input
                  id="isPublic"
                  type="checkbox"
                  role="switch"
                  className="peer sr-only"
                  checked={checked}
                  aria-checked={checked}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  disabled={!hasLocation || disabled}
                  aria-describedby="isPublic-help"
                />
                <span
                  aria-hidden="true"
                  className="relative h-6 w-11 flex-shrink-0 rounded-full bg-gray-300 transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-employer-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-employer-primary peer-focus-visible:ring-offset-2"
                />
              </label>
              <p id="isPublic-help" className="text-muted-foreground text-xs">
                {hasLocation
                  ? "La mission est proposée aux extras sur le site public tant qu'elle n'a pas commencé et qu'il reste des postes à pourvoir."
                  : "Une adresse est nécessaire pour publier la mission."}
              </p>
            </div>
          );
        }}
      />
      <fieldset className="flex flex-col gap-1" disabled={disabled}>
        <legend className="mb-1 text-sm">
          Taux horaire indicatif (€/h, facultatif)
        </legend>
        <div className="flex items-center gap-2">
          <Controller
            name="hourlyRateMin"
            control={control}
            rules={{
              validate: (_, values) =>
                validateHourlyRateRange(
                  values.hourlyRateMin,
                  values.hourlyRateMax
                ) ??
                getRateFloorChangeBlocker(
                  rateFloor,
                  values.hourlyRateMin ?? null,
                  rateFloor !== null
                ) ??
                true
            }}
            render={({ field }) => (
              <Input
                id="hourlyRateMin"
                type="number"
                inputMode="decimal"
                min={rateFloor ?? 0.01}
                step={0.01}
                placeholder="Min"
                aria-label="Taux horaire indicatif minimum (€/h)"
                aria-invalid={!!rateErrorMessage}
                aria-describedby={
                  rateFloor !== null
                    ? "hourlyRateMin-floor hourlyRate-help"
                    : "hourlyRate-help"
                }
                className={cn(rateErrorMessage && "border-red-500")}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value ?? ""}
                onChange={(event) => field.onChange(toRate(event.target.value))}
              />
            )}
          />
          <span aria-hidden="true">–</span>
          <Controller
            name="hourlyRateMax"
            control={control}
            // La règle est portée par hourlyRateMin : la revalider quand le
            // max change
            rules={{ deps: ["hourlyRateMin"] }}
            render={({ field }) => (
              <Input
                id="hourlyRateMax"
                type="number"
                inputMode="decimal"
                min={0.01}
                step={0.01}
                placeholder="Max"
                aria-label="Taux horaire indicatif maximum (€/h)"
                aria-invalid={!!rateErrorMessage}
                aria-describedby="hourlyRate-help"
                className={cn(rateErrorMessage && "border-red-500")}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value ?? ""}
                onChange={(event) => field.onChange(toRate(event.target.value))}
              />
            )}
          />
        </div>
        {rateFloor !== null && (
          <p
            id="hourlyRateMin-floor"
            className="text-employer-secondary text-xs"
          >
            Le minimum ne peut qu'augmenter tant que des candidatures sont en
            cours (actuellement {rateFloor.toLocaleString("fr-FR")} €/h).
          </p>
        )}
        {rateErrorMessage && (
          <p role="alert" className="text-red-500 text-sm">
            {rateErrorMessage}
          </p>
        )}
        <p id="hourlyRate-help" className="text-muted-foreground text-xs">
          Fourchette affichée publiquement. Le taux définitif est fixé avec
          chaque extra à l'acceptation ; le minimum sert de plancher.
        </p>
      </fieldset>
    </CardContent>
  </Card>
);
