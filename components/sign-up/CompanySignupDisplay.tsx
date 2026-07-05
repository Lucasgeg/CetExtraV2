"use client";
import { useState } from "react";
import type { SiretVerification } from "@/app/lib/insee/sirene";
import type { Company, CompanyErrorMessages } from "@/store/types";
import { useSignUpStore } from "@/store/useSignUpstore";
import {
  BUSINESS_SECTOR_OPTIONS,
  COLLECTIVE_AGREEMENT_OPTIONS,
  LEGAL_REPRESENTATIVE_FUNCTION_OPTIONS
} from "@/utils/companyEnums";
import { AddressAutocomplete } from "../ui/atom/AutocompleteAdressSearch/AutocompleteAdressSearch";
import { LabelledInput } from "../ui/atom/LabelledInput";
import { LabelledSelect } from "../ui/atom/LabelledSelect/LabelledSelect";
import { Button } from "../ui/button";

export const CompanySignupDisplay = ({
  errorMessages
}: {
  errorMessages?: CompanyErrorMessages;
}) => {
  const {
    company,
    updateCompanyProperty,
    setErrorMessages,
    updateUserProperty,
    user,
    companySiretVerified,
    setCompanySiretVerified
  } = useSignUpStore();

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string>();
  const [verifiedInfo, setVerifiedInfo] = useState<SiretVerification>();

  const handleChange = (key: keyof Omit<Company, "id">, value?: string) => {
    if (errorMessages) {
      setErrorMessages({});
    }
    updateCompanyProperty(key, value);
  };

  const handleVerifySiret = async () => {
    const siret = (company.siret || "").replace(/\s/g, "");
    setVerificationError(undefined);
    setVerifiedInfo(undefined);
    setCompanySiretVerified(false);

    if (!/^\d{14}$/.test(siret)) {
      setVerificationError("Le SIRET doit contenir 14 chiffres");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(
        `/api/companies/verify-siret?siret=${siret}`
      );
      const data = await response.json();

      if (!response.ok) {
        setVerificationError(data.message || "Impossible de vérifier ce SIRET");
        return;
      }

      const info = data as SiretVerification;
      setVerifiedInfo(info);

      if (!info.isActive) {
        setVerificationError(
          "Cette entreprise est radiée auprès de l'INSEE et ne peut pas s'inscrire."
        );
        return;
      }

      // Pré-remplissage à partir des données officielles INSEE.
      updateCompanyProperty("company_name", info.companyName);
      updateCompanyProperty("headOfficeAddress", info.headOfficeAddress);
      setCompanySiretVerified(true);
    } catch (_error) {
      setVerificationError("Erreur de connexion lors de la vérification");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="md:col-span-2">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
          <LabelledInput
            containerClassName="flex-1"
            label="SIRET de votre entreprise"
            inputProps={{
              onChange: (e) => handleChange("siret", e.target.value),
              value: company.siret ?? "",
              errorMessage: errorMessages?.siret
            }}
          />
          <Button
            type="button"
            theme="company"
            onClick={handleVerifySiret}
            disabled={isVerifying}
            className="sm:shrink-0"
          >
            {isVerifying ? "Vérification…" : "Vérifier"}
          </Button>
        </div>
        {verificationError && (
          <p className="mt-1 text-red-600 text-sm">{verificationError}</p>
        )}
        {companySiretVerified && verifiedInfo && (
          <p className="mt-1 text-green-700 text-sm">
            ✓ Entreprise active : {verifiedInfo.companyName}
            {verifiedInfo.headOfficeAddress
              ? ` — ${verifiedInfo.headOfficeAddress}`
              : ""}
          </p>
        )}
      </div>

      <LabelledInput
        label="Nom de votre entreprise"
        inputProps={{
          onChange: (e) => handleChange("company_name", e.target.value),
          value: company.company_name ?? "",
          errorMessage: errorMessages?.companyName
        }}
      />
      <LabelledSelect
        label="Secteur d'activité"
        placeholder="Sélectionner"
        defaultValue={company.businessSector}
        items={BUSINESS_SECTOR_OPTIONS}
        onValueChange={(value) => handleChange("businessSector", value)}
      />
      <LabelledSelect
        label="Convention collective"
        placeholder="Sélectionner"
        defaultValue={company.collectiveAgreement}
        items={COLLECTIVE_AGREEMENT_OPTIONS}
        onValueChange={(value) => handleChange("collectiveAgreement", value)}
      />
      <LabelledInput
        label="Prénom du contact"
        inputProps={{
          onChange: (e) => handleChange("contactFirstName", e.target.value),
          value: company.contactFirstName ?? "",
          errorMessage: errorMessages?.contactFirstName
        }}
      />
      <LabelledInput
        label="Nom du contact"
        inputProps={{
          onChange: (e) => handleChange("contactLastName", e.target.value),
          value: company.contactLastName ?? "",
          errorMessage: errorMessages?.contactLastName
        }}
      />
      <LabelledSelect
        label="Fonction du représentant légal"
        placeholder="Sélectionner"
        defaultValue={company.legalRepresentativeFunction}
        items={LEGAL_REPRESENTATIVE_FUNCTION_OPTIONS}
        onValueChange={(value) =>
          handleChange("legalRepresentativeFunction", value)
        }
      />
      <div className="flex w-full flex-col gap-1.5 md:col-span-2">
        <span className="font-semibold text-employer-text-primary text-sm">
          Adresse de votre entreprise
        </span>
        <AddressAutocomplete
          errorMessage={errorMessages?.location}
          handleClick={(s) => updateUserProperty("location", s)}
          value={user?.location}
          inputclassName="border-extra-border bg-extra-background focus:border-extra-secondary focus:ring-extra-secondary"
        />
      </div>
    </>
  );
};
