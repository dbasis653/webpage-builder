import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

interface HeaderProps {
  actions?: React.ReactNode;
}

// Shared site header: logo on the left, Navbar in the center-right area,
// and an optional actions slot on the far right (used by the studio).
export default function Header({ actions }: HeaderProps): React.JSX.Element {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6">
        {/* -- Logo -- */}
        <Link href="/" className="mr-6 text-sm font-bold tracking-tight">
          Eshkon
        </Link>

        {/* -- Navigation -- */}
        <Navbar />

        {/* -- Optional right-side slot (e.g. StudioActions) -- */}
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
    </header>
  );
}
