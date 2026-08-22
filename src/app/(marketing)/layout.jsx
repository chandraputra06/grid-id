import { SiteNav } from "@/components/site-nav";
import { ConditionalFooter } from "@/components/conditional-footer";
import { ReportFloatingButton } from "@/components/report-floating-button";

export default function MarketingLayout({ children }) {
  return (
    <>
      <SiteNav />
      <main className="flex-1">{children}</main>
      <ConditionalFooter />
      <ReportFloatingButton />
    </>
  );
}