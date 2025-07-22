import { cn } from "@/lib/utils";

export type DetailListItem = {
  label: string;
  value: string;
};

type DetailsListProps = {
  items?: DetailListItem[];
  theme?: "company" | "extra";
};

export const DetailsList = ({
  items = [],
  theme = "company"
}: DetailsListProps) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {items.map((item, index) => (
        <dl
          key={index}
          className={
            "flex items-center justify-between gap-8 border-b border-employer-border pb-2 last:border-b-0"
          }
        >
          <dt
            className={cn(
              "text-sm font-bold",
              theme === "company"
                ? "text-employer-primary"
                : "text-extra-primary"
            )}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              "text-right text-sm",
              theme === "company"
                ? "text-employer-secondary"
                : "text-extra-secondary"
            )}
          >
            {item.value}
          </dd>
        </dl>
      ))}
    </div>
  );
};
