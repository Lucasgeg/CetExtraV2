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
  const { company, updateCompanyProperty, setErrorMessages } = useSignUpStore();

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
        onChange={(e) => handleChange("company_name", e.target.value)}
        value={company.company_name}
        errorMessage={errorMessages?.companyName}
      />
      <LabelledInput
        label="Prénom du contact"
        onChange={(e) => handleChange("contactFirstName", e.target.value)}
        value={company.contactFirstName}
        errorMessage={errorMessages?.contactLastName}
      />
      <LabelledInput
        label="Nom du contact"
        onChange={(e) => handleChange("contactLastName", e.target.value)}
        value={company.contactLastName}
        errorMessage={errorMessages?.contactFirstName}
      />
      <AddressAutocomplete errorMessage={errorMessages?.location} isCompany />
    </>
  );
};
