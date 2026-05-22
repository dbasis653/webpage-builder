import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  actions?: React.ReactNode;
}

// Shared site header: logo left, Navbar center-left, optional actions + auth buttons far right.
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

        {/* -- Right side: optional actions slot + auth -- */}
        <div className="ml-auto flex items-center gap-3">
          {/* -- Studio-specific controls (Save, Publish, etc.) -- */}
          {actions}

          {/* -- Auth: sign in button when logged out, avatar when logged in -- */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button size="sm" variant="outline">
                Sign In
              </Button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
