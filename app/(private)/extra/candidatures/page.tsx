import type { Metadata } from "next";
import { MyEngagements } from "@/components/MyEngagements/MyEngagements";

export const metadata: Metadata = {
  title: "Mes candidatures",
  robots: { index: false, follow: false }
};

export default function ExtraEngagementsPage() {
  return <MyEngagements />;
}
