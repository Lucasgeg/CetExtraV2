import { useSignUpStore } from "@/store/useSignUpstore";
import { LabelledInput } from "../ui/atom/LabelledInput";
import { Company, CompanyErrorMessages } from "@/store/types";
import { AddressAutocomplete } from "../ui/atom/AutocompleteAdressSearch/AutocompleteAdressSearch";

export const CompanySignupDisplay = ({
  errorMessages
}: {
  errorMessages?: CompanyErrorMessages;
}) => {
  // Informations nécessaire pour un entreprise:
  const {
    company,
    updateCompanyProperty,
    setErrorMessages,
    updateUserProperty
  } = useSignUpStore();

  const handleChange = (key: keyof Omit<Company, "id">, value?: string) => {
    if (errorMessages) {
      setErrorMessages({});
    }
    updateCompanyProperty(key, value);
  };

  return (
    <>
      <LabelledInput
        label="Nom de votre entreprise"
        inputProps={{
          onChange: (e) => handleChange("company_name", e.target.value),
          value: company.company_name,
          errorMessage: errorMessages?.companyName
        }}
      />
      <LabelledInput
        label="Prénom du contact"
        inputProps={{
          onChange: (e) => handleChange("contactFirstName", e.target.value),
          value: company.contactFirstName,
          errorMessage: errorMessages?.contactFirstName
        }}
      />
      <LabelledInput
        label="Nom du contact"
        inputProps={{
          onChange: (e) => handleChange("contactLastName", e.target.value),
          value: company.contactLastName,
          errorMessage: errorMessages?.contactLastName
        }}
      />
      <div className="flex flex-col items-center justify-between gap-1 lg:flex-row">
        <span>Adresse de votre entreprise:</span>

        <AddressAutocomplete
          errorMessage={errorMessages?.location}
          handleClick={(s) => updateUserProperty("location", s)}
        />
      </div>
    </>
  );
};
