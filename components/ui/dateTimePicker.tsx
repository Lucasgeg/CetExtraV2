import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { add, format } from "date-fns";
import { type Locale, enUS } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Clock } from "lucide-react";
import * as React from "react";
import { useImperativeHandle, useRef } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DayPicker, DayPickerProps } from "react-day-picker";
import { CheckIcon } from "@heroicons/react/24/outline";
import { ScrollArea } from "./scroll-area";

// ---------- utils start ----------
/**
 * regular expression to check for valid hour format (01-23)
 */
function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

/**
 * regular expression to check for valid 12 hour format (01-12)
 */
function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

/**
 * regular expression to check for valid minute format (00-59)
 */
function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value);
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

function getValidNumber(
  value: string,
  { max, min = 0, loop = false }: GetValidNumberConfig
) {
  let numericValue = parseInt(value, 10);

  if (!Number.isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max;
      if (numericValue < min) numericValue = min;
    } else {
      if (numericValue > max) numericValue = min;
      if (numericValue < min) numericValue = max;
    }
    return numericValue.toString().padStart(2, "0");
  }

  return "00";
}

function getValidHour(value: string) {
  if (isValidHour(value)) return value;
  return getValidNumber(value, { max: 23 });
}

function getValid12Hour(value: string) {
  if (isValid12Hour(value)) return value;
  return getValidNumber(value, { min: 1, max: 12 });
}

function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value;
  return getValidNumber(value, { max: 59 });
}

type GetValidArrowNumberConfig = {
  min: number;
  max: number;
  step: number;
};

function getValidArrowNumber(
  value: string,
  { min, max, step }: GetValidArrowNumberConfig
) {
  let numericValue = parseInt(value, 10);
  if (!Number.isNaN(numericValue)) {
    numericValue += step;
    return getValidNumber(String(numericValue), { min, max, loop: true });
  }
  return "00";
}

function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 23, step });
}

function getValidArrow12Hour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 1, max: 12, step });
}

function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 59, step });
}

function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value);
  date.setMinutes(parseInt(minutes, 10));
  return date;
}

function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value);
  date.setSeconds(parseInt(seconds, 10));
  return date;
}

function setHours(date: Date, value: string) {
  const hours = getValidHour(value);
  date.setHours(parseInt(hours, 10));
  return date;
}

function set12Hours(date: Date, value: string, period: Period) {
  const hours = parseInt(getValid12Hour(value), 10);
  const convertedHours = convert12HourTo24Hour(hours, period);
  date.setHours(convertedHours);
  return date;
}

type TimePickerType = "minutes" | "seconds" | "hours" | "12hours";
type Period = "AM" | "PM";

function setDateByType(
  date: Date,
  value: string,
  type: TimePickerType,
  period?: Period
) {
  switch (type) {
    case "minutes":
      return setMinutes(date, value);
    case "seconds":
      return setSeconds(date, value);
    case "hours":
      return setHours(date, value);
    case "12hours": {
      if (!period) return date;
      return set12Hours(date, value, period);
    }
    default:
      return date;
  }
}

function getDateByType(date: Date | null, type: TimePickerType) {
  if (!date) return "00";
  switch (type) {
    case "minutes":
      return getValidMinuteOrSecond(String(date.getMinutes()));
    case "seconds":
      return getValidMinuteOrSecond(String(date.getSeconds()));
    case "hours":
      return getValidHour(String(date.getHours()));
    case "12hours":
      return getValid12Hour(String(display12HourValue(date.getHours())));
    default:
      return "00";
  }
}

function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case "minutes":
      return getValidArrowMinuteOrSecond(value, step);
    case "seconds":
      return getValidArrowMinuteOrSecond(value, step);
    case "hours":
      return getValidArrowHour(value, step);
    case "12hours":
      return getValidArrow12Hour(value, step);
    default:
      return "00";
  }
}

/**
 * handles value change of 12-hour input
 * 12:00 PM is 12:00
 * 12:00 AM is 00:00
 */
function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === "PM") {
    if (hour <= 11) {
      return hour + 12;
    }
    return hour;
  }

  if (period === "AM") {
    if (hour === 12) return 0;
    return hour;
  }
  return hour;
}

/**
 * time is stored in the 24-hour form,
 * but needs to be displayed to the user
 * in its 12-hour representation
 */
function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return "12";
  if (hours >= 22) return `${hours - 12}`;
  if (hours % 12 > 9) return `${hours}`;
  return `0${hours % 12}`;
}

function genMonths(
  locale: Pick<Locale, "options" | "localize" | "formatLong">
) {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2021, i), "MMMM", { locale })
  }));
}

function genYears(yearRange = 50) {
  const today = new Date();
  return Array.from({ length: yearRange * 2 + 1 }, (_, i) => ({
    value: today.getFullYear() - yearRange + i,
    label: (today.getFullYear() - yearRange + i).toString()
  }));
}

// ---------- utils end ----------

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  yearRange = 50,
  ...props
}: DayPickerProps & { yearRange?: number }) {
  const MONTHS = React.useMemo(() => {
    let locale: Pick<Locale, "options" | "localize" | "formatLong"> = enUS;
    const { options, localize, formatLong } = props.locale || {};
    if (options && localize && formatLong) {
      locale = {
        options,
        localize,
        formatLong
      };
    }
    return genMonths(locale);
  }, [props.locale]);

  const YEARS = React.useMemo(() => genYears(yearRange), [yearRange]);
  const disableLeftNavigation = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear() - yearRange, 0, 1);
    if (props.month) {
      return (
        props.month.getMonth() === startDate.getMonth() &&
        props.month.getFullYear() === startDate.getFullYear()
      );
    }
    return false;
  };
  const disableRightNavigation = () => {
    const today = new Date();
    const endDate = new Date(today.getFullYear() + yearRange, 11, 31);
    if (props.month) {
      return (
        props.month.getMonth() === endDate.getMonth() &&
        props.month.getFullYear() === endDate.getFullYear()
      );
    }
    return false;
  };

  const handlePreviousMonth = () => {
    if (props.month && !disableLeftNavigation()) {
      const newDate = new Date(props.month);
      newDate.setMonth(newDate.getMonth() - 1);
      props.onMonthChange?.(newDate);
    }
  };

  const handleNextMonth = () => {
    if (props.month && !disableRightNavigation()) {
      const newDate = new Date(props.month);
      newDate.setMonth(newDate.getMonth() + 1);
      props.onMonthChange?.(newDate);
    }
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4  sm:space-y-0 justify-center",
        month: "flex flex-col items-center space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center ",
        button_previous: "hidden",
        button_next: "hidden",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: cn("flex", props.showWeekNumber && "justify-end"),
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-1",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-l-md rounded-r-md"
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md rounded-r-md",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames
      }}
      components={{
        MonthCaption: ({ calendarMonth }) => {
          return (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  disableLeftNavigation() && "pointer-events-none opacity-25"
                )}
                onClick={handlePreviousMonth}
                disabled={disableLeftNavigation()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select
                defaultValue={calendarMonth.date.getMonth().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(calendarMonth.date);
                  newDate.setMonth(Number.parseInt(value, 10));
                  props.onMonthChange?.(newDate);
                }}
              >
                <SelectTrigger className="w-fit gap-1 border-none p-0 focus:bg-accent focus:text-accent-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1060]">
                  {MONTHS.map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value.toString()}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                defaultValue={calendarMonth.date.getFullYear().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(calendarMonth.date);
                  newDate.setFullYear(Number.parseInt(value, 10));
                  props.onMonthChange?.(newDate);
                }}
              >
                <SelectTrigger className="w-fit gap-1 border-none p-0 focus:bg-accent focus:text-accent-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1080]">
                  {YEARS.map((year) => (
                    <SelectItem key={year.value} value={year.value.toString()}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  disableRightNavigation() && "pointer-events-none opacity-25"
                )}
                onClick={handleNextMonth}
                disabled={disableRightNavigation()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          );
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

interface PeriodSelectorProps {
  period: Period;
  setPeriod?: (m: Period) => void;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePeriodSelect = React.forwardRef<
  HTMLButtonElement,
  PeriodSelectorProps
>(
  (
    { period, setPeriod, date, onDateChange, onLeftFocus, onRightFocus },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowRight") onRightFocus?.();
      if (e.key === "ArrowLeft") onLeftFocus?.();
    };

    const handleValueChange = (value: Period) => {
      setPeriod?.(value);

      /**
       * trigger an update whenever the user switches between AM and PM;
       * otherwise user must manually change the hour each time
       */
      if (date) {
        const tempDate = new Date(date);
        const hours = display12HourValue(date.getHours());
        onDateChange?.(
          setDateByType(
            tempDate,
            hours.toString(),
            "12hours",
            period === "AM" ? "PM" : "AM"
          )
        );
      }
    };

    return (
      <div className="flex h-10 items-center">
        <Select
          defaultValue={period}
          onValueChange={(value: Period) => handleValueChange(value)}
        >
          <SelectTrigger
            ref={ref}
            className="w-[65px] focus:bg-accent focus:text-accent-foreground"
            onKeyDown={handleKeyDown}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
);

TimePeriodSelect.displayName = "TimePeriodSelect";

interface TimePickerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: TimePickerType;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  period?: Period;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps
>(
  (
    {
      className,
      type = "tel",
      value,
      id,
      name,
      date = new Date(new Date().setHours(0, 0, 0, 0)),
      onDateChange,
      onChange,
      onKeyDown,
      picker,
      period,
      onLeftFocus,
      onRightFocus,
      ...props
    },
    ref
  ) => {
    const [flag, setFlag] = React.useState<boolean>(false);
    const [prevIntKey, setPrevIntKey] = React.useState<string>("0");

    /**
     * allow the user to enter the second digit within 2 seconds
     * otherwise start again with entering first digit
     */
    React.useEffect(() => {
      if (flag) {
        const timer = setTimeout(() => {
          setFlag(false);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }, [flag]);

    const calculatedValue = React.useMemo(() => {
      return getDateByType(date, picker);
    }, [date, picker]);

    const calculateNewValue = (key: string) => {
      /*
       * If picker is '12hours' and the first digit is 0, then the second digit is automatically set to 1.
       * The second entered digit will break the condition and the value will be set to 10-12.
       */
      if (picker === "12hours") {
        if (flag && calculatedValue.slice(1, 2) === "1" && prevIntKey === "0")
          return `0${key}`;
      }

      return !flag ? `0${key}` : calculatedValue.slice(1, 2) + key;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab") return;
      e.preventDefault();
      if (e.key === "ArrowRight") onRightFocus?.();
      if (e.key === "ArrowLeft") onLeftFocus?.();
      if (["ArrowUp", "ArrowDown"].includes(e.key)) {
        const step = e.key === "ArrowUp" ? 1 : -1;
        const newValue = getArrowByType(calculatedValue, step, picker);
        if (flag) setFlag(false);
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
      if (e.key >= "0" && e.key <= "9") {
        if (picker === "12hours") setPrevIntKey(e.key);

        const newValue = calculateNewValue(e.key);
        if (flag) onRightFocus?.();
        setFlag((prev) => !prev);
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
    };

    return (
      <Input
        ref={ref}
        id={id || picker}
        name={name || picker}
        className={cn(
          "w-[48px] text-center font-mono text-base tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        value={value || calculatedValue}
        onChange={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange?.(e);
        }}
        type={type}
        inputMode="decimal"
        onKeyDown={(e) => {
          onKeyDown?.(e);
          handleKeyDown(e);
        }}
        {...props}
      />
    );
  }
);

TimePickerInput.displayName = "TimePickerInput";

interface TimePickerProps {
  date?: Date | null;
  onChange?: (date: Date | undefined) => void;
  hourCycle?: 12 | 24;
  /**
   * Determines the smallest unit that is displayed in the datetime picker.
   * Default is 'second'.
   * */
  granularity?: Granularity;
  disabled?: boolean | DayPickerProps["disabled"];
}

interface TimePickerRef {
  minuteRef: HTMLInputElement | null;
  hourRef: HTMLInputElement | null;
  secondRef: HTMLInputElement | null;
}

const TimePicker = React.forwardRef<TimePickerRef, TimePickerProps>(
  (
    { date, onChange, hourCycle = 24, granularity = "second", disabled },
    ref
  ) => {
    const [period, setPeriod] = React.useState<Period>(
      date && date.getHours() >= 12 ? "PM" : "AM"
    );
    const [selectedHour, setSelectedHour] = React.useState(
      date
        ? hourCycle === 24
          ? date.getHours()
          : date.getHours() % 12 || 12
        : 0
    );
    const [selectedMinute, setSelectedMinute] = React.useState(
      date ? date.getMinutes() : 0
    );

    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);
    const secondRef = React.useRef<HTMLInputElement>(null);

    const hourScrollRef = React.useRef<HTMLDivElement>(null);
    const minuteScrollRef = React.useRef<HTMLDivElement>(null);
    const secondScrollRef = React.useRef<HTMLDivElement>(null);

    // Exposer les refs via useImperativeHandle
    React.useImperativeHandle(ref, () => ({
      minuteRef: minuteRef.current,
      hourRef: hourRef.current,
      secondRef: secondRef.current
    }));
    const isHourDisabled = React.useCallback(
      (hour: number) => {
        if (!disabled || typeof disabled === "boolean") return false;

        if (!date) return false;

        const testDate = new Date(date);
        if (hourCycle === 24) {
          testDate.setHours(hour, selectedMinute);
        } else {
          const hours24 =
            period === "PM"
              ? hour === 12
                ? 12
                : hour + 12
              : hour === 12
                ? 0
                : hour;
          testDate.setHours(hours24, selectedMinute);
        }

        if (typeof disabled === "object" && disabled !== null) {
          if (
            "before" in disabled &&
            disabled.before &&
            testDate < disabled.before
          ) {
            return true;
          }
          if (
            "after" in disabled &&
            disabled.after &&
            testDate > disabled.after
          ) {
            return true;
          }
        }

        if (typeof disabled === "function") {
          return disabled(testDate);
        }

        if (Array.isArray(disabled)) {
          return disabled.some((disabledDate) => {
            if (disabledDate instanceof Date) {
              return testDate.toDateString() === disabledDate.toDateString();
            }
            if (typeof disabledDate === "function") {
              return disabledDate(testDate);
            }
            return false;
          });
        }

        if (disabled instanceof Date) {
          return testDate.toDateString() === disabled.toDateString();
        }

        return false;
      },
      [disabled, date, selectedMinute, hourCycle, period]
    );

    const isMinuteDisabled = React.useCallback(
      (minute: number) => {
        if (!disabled || typeof disabled === "boolean") return false;

        if (!date) return false;

        const testDate = new Date(date);
        if (hourCycle === 24) {
          testDate.setHours(selectedHour, minute);
        } else {
          const hours24 =
            period === "PM"
              ? selectedHour === 12
                ? 12
                : selectedHour + 12
              : selectedHour === 12
                ? 0
                : selectedHour;
          testDate.setHours(hours24, minute);
        }

        if (typeof disabled === "object" && disabled !== null) {
          if (
            "before" in disabled &&
            disabled.before &&
            testDate < disabled.before
          ) {
            return true;
          }
          if (
            "after" in disabled &&
            disabled.after &&
            testDate > disabled.after
          ) {
            return true;
          }
        }

        if (typeof disabled === "function") {
          return disabled(testDate);
        }

        if (Array.isArray(disabled)) {
          return disabled.some((disabledDate) => {
            if (disabledDate instanceof Date) {
              return testDate.toDateString() === disabledDate.toDateString();
            }
            if (typeof disabledDate === "function") {
              return disabledDate(testDate);
            }
            return false;
          });
        }

        if (disabled instanceof Date) {
          return testDate.toDateString() === disabled.toDateString();
        }

        return false;
      },
      [disabled, date, selectedHour, hourCycle, period]
    );

    const hourOptions = React.useMemo(() => {
      const length = hourCycle === 24 ? 24 : 12;
      return Array.from({ length }, (_, i) => {
        const value = hourCycle === 24 ? i : i === 0 ? 12 : i;
        return {
          value,
          label: value.toString().padStart(2, "0"),
          disabled: isHourDisabled(value)
        };
      });
    }, [hourCycle, isHourDisabled]);

    const minuteOptions = React.useMemo(() => {
      return Array.from(
        { length: 12 },
        (_, i) => {
          const value = i * 5;
          return {
            value,
            label: value.toString().padStart(2, "0"),
            disabled: isMinuteDisabled(value)
          };
        },
        []
      );
    }, [isMinuteDisabled]);

    const handleHourChange = React.useCallback(
      (hour: number) => {
        if (isHourDisabled(hour)) return;

        setSelectedHour(hour);
        if (date) {
          const newDate = new Date(date);
          if (hourCycle === 24) {
            newDate.setHours(hour);
          } else {
            const hours24 =
              period === "PM"
                ? hour === 12
                  ? 12
                  : hour + 12
                : hour === 12
                  ? 0
                  : hour;
            newDate.setHours(hours24);
          }
          onChange?.(newDate);
        }
      },
      [date, onChange, hourCycle, period, isHourDisabled]
    );

    const handleMinuteChange = React.useCallback(
      (minute: number) => {
        setSelectedMinute(minute);
        if (date) {
          const newDate = new Date(date);
          newDate.setMinutes(minute);
          onChange?.(newDate);
        }
      },
      [date, onChange]
    );

    const handlePeriodChange = React.useCallback(
      (newPeriod: Period) => {
        setPeriod(newPeriod);
        if (date) {
          const newDate = new Date(date);
          const currentHour = selectedHour;
          const hours24 =
            newPeriod === "PM"
              ? currentHour === 12
                ? 12
                : currentHour + 12
              : currentHour === 12
                ? 0
                : currentHour;
          newDate.setHours(hours24);
          onChange?.(newDate);
        }
      },
      [date, onChange, selectedHour]
    );

    React.useEffect(() => {
      const timeoutId = setTimeout(() => {
        hourScrollRef.current?.scrollIntoView({
          behavior: "auto",
          block: "center"
        });
        minuteScrollRef.current?.scrollIntoView({
          behavior: "auto",
          block: "center"
        });
        secondScrollRef.current?.scrollIntoView({
          behavior: "auto",
          block: "center"
        });
      }, 1);
      return () => clearTimeout(timeoutId);
    }, [selectedHour, selectedMinute]);

    const TimeItem = React.useCallback(
      ({
        option,
        selected,
        onSelect,
        className,
        disabled: itemDisabled = false
      }: {
        option: { value: number; label: string; disabled?: boolean };
        selected: boolean;
        onSelect: (value: number) => void;
        className?: string;
        disabled?: boolean;
      }) => {
        const isDisabled = itemDisabled || option.disabled;

        return (
          <Button
            variant="ghost"
            disabled={isDisabled}
            className={cn(
              "flex justify-center px-1 pe-2 ps-1",
              selected && "bg-accent text-accent-foreground",
              isDisabled && "cursor-not-allowed opacity-50",
              className
            )}
            onClick={(e) => {
              e.preventDefault(); // ✅ Ajouter ceci
              e.stopPropagation(); // ✅ Ajouter ceci
              if (!isDisabled) onSelect(option.value);
            }}
          >
            <div className="w-4">
              {selected && <CheckIcon className="my-auto size-4" />}
            </div>
            <span className="ms-2">{option.label}</span>
          </Button>
        );
      },
      []
    );

    return (
      <div className="flex items-center justify-center gap-2 p-3">
        <label className="cursor-pointer">
          <Clock className="mr-2 h-4 w-4" />
        </label>

        <div className="flex h-48 gap-2">
          <div className="flex flex-col items-center">
            <span className="mb-1 text-sm font-medium">Heures</span>
            <ScrollArea className="h-full w-16">
              <div className="flex flex-col items-stretch pb-24">
                {hourOptions.map((option) => (
                  <div
                    key={option.value}
                    ref={
                      option.value === selectedHour ? hourScrollRef : undefined
                    }
                  >
                    <TimeItem
                      option={option}
                      selected={option.value === selectedHour}
                      onSelect={handleHourChange}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {(granularity === "minute" || granularity === "second") && (
            <div className="flex flex-col items-center">
              <span className="mb-1 text-sm font-medium">Minutes</span>
              <ScrollArea className="h-full w-16">
                <div className="flex flex-col items-stretch pb-24">
                  {minuteOptions.map((option) => (
                    <div
                      key={option.value}
                      ref={
                        option.value === selectedMinute
                          ? minuteScrollRef
                          : undefined
                      }
                    >
                      <TimeItem
                        option={option}
                        selected={option.value === selectedMinute}
                        onSelect={handleMinuteChange}
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {hourCycle === 12 && (
            <div className="flex flex-col items-center">
              <span className="mb-1 text-sm font-medium">Période</span>
              <ScrollArea className="h-full w-16">
                <div className="flex flex-col items-stretch">
                  {[
                    { value: "AM", label: "AM" },
                    { value: "PM", label: "PM" }
                  ].map((option) => (
                    <TimeItem
                      key={option.value}
                      option={{
                        value: option.value === "AM" ? 0 : 1,
                        label: option.label
                      }}
                      selected={period === option.value}
                      onSelect={() =>
                        handlePeriodChange(option.value as Period)
                      }
                      className="h-8"
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    );
  }
);
TimePicker.displayName = "TimePicker";

type Granularity = "day" | "hour" | "minute" | "second";

type DateTimePickerProps = {
  theme?: "company" | "extra";
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onMonthChange?: (date: Date | undefined) => void;
  /**
   * Accepts a DayPicker 'disabled' prop (for disabling dates)
   */
  disabled?: DayPickerProps["disabled"];
  disable?: boolean;
  /** showing `AM/PM` or not. */
  hourCycle?: 12 | 24;
  placeholder?: string;
  /**
   * The year range will be: `This year + yearRange` and `this year - yearRange`.
   * Default is 50.
   * For example:
   * This year is 2024, The year dropdown will be 1974 to 2024 which is generated by `2024 - 50 = 1974` and `2024 + 50 = 2074`.
   * */
  yearRange?: number;
  /**
   * The format is derived from the `date-fns` documentation.
   * @reference https://date-fns.org/v3.6.0/docs/format
   **/
  displayFormat?: { hour24?: string; hour12?: string };
  /**
   * The granularity prop allows you to control the smallest unit that is displayed by DateTimePicker.
   * By default, the value is `second` which shows all time inputs.
   **/
  granularity?: Granularity;
  className?: string;
  /**
   * Show the default month and time when popup the calendar. Default is the current Date().
   **/
  defaultPopupValue?: Date;
  /**
   * The state to handle the open popover.
   * If you want to control the open state of the popover, you can pass `
   */
  open?: boolean;
  onTriggerClick?: () => void;
  onOpenChange?: (open: boolean) => void; // ✅ Corrigé: accepte un paramètre boolean
} & Pick<
  DayPickerProps,
  "locale" | "weekStartsOn" | "showWeekNumber" | "showOutsideDays"
>;

type DateTimePickerRef = {
  value?: Date;
} & Omit<HTMLButtonElement, "value">;

const DateTimePicker = React.forwardRef<
  Partial<DateTimePickerRef>,
  DateTimePickerProps
>(
  (
    {
      locale = enUS,
      defaultPopupValue = new Date(new Date().setHours(0, 0, 0, 0)),
      value,
      onChange,
      onMonthChange,
      hourCycle = 24,
      yearRange = 50,
      disabled = false,
      displayFormat,
      granularity = "minute",
      placeholder = "Pick a date",
      className,
      theme = "company",
      open,
      onOpenChange,
      onTriggerClick,
      disable = false,
      ...props
    },
    ref
  ) => {
    const [month, setMonth] = React.useState<Date>(value ?? defaultPopupValue);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [displayDate, setDisplayDate] = React.useState<Date | undefined>(
      value ?? undefined
    );
    // ✅ État interne pour le popover si pas contrôlé
    const [internalOpen, setInternalOpen] = React.useState(false);

    // ✅ Utiliser l'état contrôlé ou interne
    const isOpen = open !== undefined ? open : internalOpen;
    const handleOpenChange = (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    };

    onMonthChange ||= onChange;

    /**
     * Makes sure display date updates when value change on
     * parent component
     */
    React.useEffect(() => {
      setDisplayDate(value);
    }, [value]);

    /**
     * carry over the current time when a user clicks a new day
     * instead of resetting to 00:00
     */
    const handleMonthChange = (newDay: Date | undefined) => {
      if (!newDay) {
        return;
      }
      if (!defaultPopupValue) {
        newDay.setHours(
          month?.getHours() ?? 0,
          month?.getMinutes() ?? 0,
          month?.getSeconds() ?? 0
        );
        onMonthChange?.(newDay);
        setMonth(newDay);
        return;
      }
      const diff = newDay.getTime() - defaultPopupValue.getTime();
      const diffInDays = diff / (1000 * 60 * 60 * 24);
      const newDateFull = add(defaultPopupValue, {
        days: Math.ceil(diffInDays)
      });
      newDateFull.setHours(
        month?.getHours() ?? 0,
        month?.getMinutes() ?? 0,
        month?.getSeconds() ?? 0
      );
      onMonthChange?.(newDateFull);
      setMonth(newDateFull);
    };

    const onSelect = (newDay?: Date) => {
      if (!newDay) {
        return;
      }
      onChange?.(newDay);
      setMonth(newDay);
      setDisplayDate(newDay);
      // ✅ Ne pas fermer automatiquement le popover quand on sélectionne une date
      // handleOpenChange(false); // Commenté pour garder le popover ouvert
    };

    useImperativeHandle(
      ref,
      () => ({
        ...buttonRef.current,
        value: displayDate
      }),
      [displayDate]
    );

    const initHourFormat = {
      hour24:
        displayFormat?.hour24 ??
        `PPP HH:mm${!granularity || granularity === "second" ? ":ss" : ""}`,
      hour12:
        displayFormat?.hour12 ??
        `PP hh:mm${!granularity || granularity === "second" ? ":ss" : ""} b`
    };

    let loc = enUS;
    const { options, localize, formatLong } = locale;
    if (options && localize && formatLong) {
      loc = {
        ...enUS,
        options,
        localize,
        formatLong
      };
    }
    const popoverContentRef = useRef<HTMLDivElement>(null);

    return (
      <Popover open={isOpen} onOpenChange={handleOpenChange} modal>
        <PopoverTrigger asChild disabled={disable}>
          <Button
            type="button"
            variant="outline"
            theme={theme}
            className={cn(
              "w-full justify-start text-left font-normal",
              !displayDate && "text-muted-foreground",
              className
            )}
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation();
              onTriggerClick?.();
            }}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayDate ? (
              format(
                displayDate,
                hourCycle === 24
                  ? initHourFormat.hour24
                  : initHourFormat.hour12,
                {
                  locale: loc
                }
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div
            ref={popoverContentRef}
            className="rounded-lg border bg-white p-4 shadow-lg"
            onSubmit={(e) => {
              e.preventDefault(); // ✅ Empêcher toute soumission
              e.stopPropagation();
            }}
          >
            <Calendar
              mode="single"
              selected={displayDate}
              month={month}
              onSelect={(newDate) => {
                if (newDate) {
                  const currentTime = displayDate || month;
                  newDate.setHours(
                    currentTime?.getHours() ?? 0,
                    currentTime?.getMinutes() ?? 0,
                    currentTime?.getSeconds() ?? 0
                  );
                  onSelect(newDate);
                }
              }}
              onMonthChange={handleMonthChange}
              yearRange={yearRange}
              locale={locale}
              disabled={typeof disabled === "boolean" ? undefined : disabled}
              {...props}
            />
            {granularity !== "day" && (
              <div className="border-t border-border p-3">
                <TimePicker
                  onChange={(value) => {
                    if (value) {
                      onChange?.(value);
                      setDisplayDate(value);
                      setMonth(value);
                    }
                  }}
                  date={displayDate || month}
                  hourCycle={hourCycle}
                  granularity={granularity}
                  disabled={disabled}
                />
              </div>
            )}

            <div className="flex gap-2 border-t p-3">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenChange(false);
                }}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Annuler
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenChange(false);
                }}
                className="flex-1"
                size="sm"
              >
                Confirmer
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker, TimePickerInput, TimePicker };
export type { TimePickerType, DateTimePickerProps, DateTimePickerRef };
