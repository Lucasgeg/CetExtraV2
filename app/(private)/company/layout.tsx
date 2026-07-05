import { CompanyNavbar } from "@/components/CompanyNavbar/CompanyNavbar";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";

export default function CompanyLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col bg-employer-background">
      <CompanyNavbar />
      <main className="mx-auto w-full max-w-screen-xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
