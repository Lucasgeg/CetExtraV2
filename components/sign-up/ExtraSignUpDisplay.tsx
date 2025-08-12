import { useSignUpStore } from "@/store/useSignUpstore";
import { useState } from "react";
import { DatePickerInput } from "../ui/atom/DatePickerInput/DatePickerInput";
import { LabelledInput } from "../ui/atom/LabelledInput";
import {
  Items,
  LabelledSelect
} from "../ui/atom/LabelledSelect/LabelledSelect";
import { Extra, ExtraErrorMessages } from "@/store/types";

export const ExtraSignUpDisplay = ({
  errorMessages
}: {
  errorMessages?: ExtraErrorMessages;
}) => {
  const {
    extra,
    updateExtraProperty,
    setErrorMessages,
    updateUserProperty,
    user
  } = useSignUpStore();

  const [selectedMaxTravelDistance, setSelectedMaxTravelDistance] = useState<
    number | undefined
  >(undefined);

  const handleMaxTravelDistanceChange = (value: string) => {
    setSelectedMaxTravelDistance(Number(value));
    if (selectedMaxTravelDistance)
      updateExtraProperty("max_travel_distance", selectedMaxTravelDistance);
  };

  const handleChange = (
    key: keyof Omit<Extra, "id">,
    value?: string | Date
  ) => {
    if (errorMessages) {
      setErrorMessages({});
    }
    updateExtraProperty(key, value);
  };

  const maxRangeOptions: Items[] = [
    { value: "5", label: "5 km" },
    { value: "10", label: "10 km" },
    { value: "15", label: "15 km" },
    { value: "20", label: "20 km" },
    { value: "25", label: "25 km" },
    { value: "30", label: "30 km" }
  ];

  return (
    <>
      <LabelledInput
        label="Ton nom"
        inputProps={{
          value: extra?.last_name || "",
          onChange: (e) => handleChange("last_name", e.target.value),
          errorMessage: errorMessages?.lastName
        }}
      />
      <LabelledInput
        label="Ton prénom"
        inputProps={{
          value: extra?.first_name || "",
          onChange: (e) => handleChange("first_name", e.target.value),
          errorMessage: errorMessages?.firstName
        }}
      />
      <LabelledInput
        variant="location"
        label="Ton adresse"
        locationProps={{
          errorMessage: errorMessages?.location,
          handleClick: (suggestion) => {
            updateUserProperty("location", suggestion);
          },
          value: user?.location
        }}
      />
      <DatePickerInput
        onSelectedDateAction={(e) => handleChange("birthdate", e)}
        label="Date de naissance"
        value={extra?.birthdate}
        errorMessage={errorMessages?.birthDate}
      />
      <LabelledSelect
        items={maxRangeOptions}
        label="Distance maximale des missions"
        onValueChange={handleMaxTravelDistanceChange}
        defaultValue={maxRangeOptions[0].value}
      />
      <LabelledInput
        label="Ton numéro de téléphone"
        inputProps={{
          value: extra?.phone || "",
          onChange: (e) => handleChange("phone", e.target.value)
        }}
      />
    </>
  );
};
