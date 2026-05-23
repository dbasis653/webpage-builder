"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Pencil, Eye } from "lucide-react";

interface PageCardProps {
  pageId: string;
  title: string;
  slug: string;
  sectionCount: number;
}

// Renders a single page card with Edit and Preview actions.
// Viewers see an alert dialog instead of navigating to the studio.
export default function PageCard({ title, slug, sectionCount }: PageCardProps): React.JSX.Element {
  const router = useRouter();
  const { role } = useRole();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Handles the Edit button click — blocks viewers with a dialog.
  function handleEditClick() {
    if (role === "viewer") {
      setDialogOpen(true);
      return;
    }
    router.push(`/studio/${slug}`);
  }

  return (
    <>
      <Card className="bg-slate-300">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="font-mono text-xs">
            /{slug}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            {sectionCount} {sectionCount === 1 ? "section" : "sections"}
          </p>
        </CardContent>

        <CardFooter className="flex gap-2">
          {/* -- Edit button — triggers dialog for viewer role -- */}
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            onClick={handleEditClick}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>

          {/* -- Preview button — open to all roles -- */}
          <Button
            asChild
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5"
          >
            <Link href={`/preview/${slug}`}>
              <Eye className="size-3.5" />
              Preview
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* -- Access denied dialog for viewer role -- */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Access Denied</AlertDialogTitle>
            <AlertDialogDescription>
              You have view-only access. Only editors and publishers can open
              the studio editor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
