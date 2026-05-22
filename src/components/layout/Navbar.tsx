"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants/nav";

// Navigation links for the site header.
// Active link is highlighted based on current pathname.
export default function Navbar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav>
      <ul className="flex items-center gap-6">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            {link.href ? (
              <Link
                href={link.href}
                className={
                  pathname === link.href
                    ? "text-sm font-medium text-foreground"
                    : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                {link.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
