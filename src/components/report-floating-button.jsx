import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

export function ReportFloatingButton() {
  return (
    <Link
      href="/lapor"
      aria-label="Scan dan laporkan kondisi infrastruktur"
      className="fixed bottom-5 right-5 z-700 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 font-heading text-sm font-bold text-white shadow-[0_8px_24px_rgba(245,166,35,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(245,166,35,0.5)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 sm:bottom-7 sm:right-7 sm:px-6 sm:py-4 sm:text-base"
    >
      <FontAwesomeIcon icon={faCamera} className="h-4 w-4 sm:h-5 sm:w-5" />
      <span>Scan &amp; Lapor</span>
    </Link>
  );
}
