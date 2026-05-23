import type { Page, Section } from "@/lib/validators/page";

export type SemVerBump = "major" | "minor" | "patch" | "none";

export interface DiffResult {
  bump: SemVerBump;
  changes: string[];
}

// Bump priority — higher index wins.
const BUMP_PRIORITY: SemVerBump[] = ["none", "patch", "minor", "major"];

// Returns the higher of two bumps.
function maxBump(a: SemVerBump, b: SemVerBump): SemVerBump {
  return BUMP_PRIORITY.indexOf(a) >= BUMP_PRIORITY.indexOf(b) ? a : b;
}

// Deep-equality check for plain JSON-serialisable values.
function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Compares two Page objects and returns the SemVer bump level and a human-readable
// changelog describing every change found.
// Rules (from spec):
//   major → section removed / type changed / required prop removed
//   minor → section added / optional prop added
//   patch → prop value changed (same keys, different values)
//   none  → no difference
export function diffPages(prev: Page, next: Page): DiffResult {
  const changes: string[] = [];
  let bump: SemVerBump = "none";

  const prevById = new Map<string, Section>(
    prev.sections.map((s) => [s.sectionId, s]),
  );
  const nextById = new Map<string, Section>(
    next.sections.map((s) => [s.sectionId, s]),
  );

  // 1. Check sections that existed in prev
  for (const prevSection of prev.sections) {
    const nextSection = nextById.get(prevSection.sectionId);

    if (!nextSection) {
      // Section was removed — breaking change
      changes.push(`[major] Section removed: ${prevSection.type} (${prevSection.sectionId})`);
      bump = maxBump(bump, "major");
      continue;
    }

    if (prevSection.type !== nextSection.type) {
      // Section type changed — breaking change
      changes.push(
        `[major] Section type changed: ${prevSection.type} → ${nextSection.type} (${prevSection.sectionId})`,
      );
      bump = maxBump(bump, "major");
      continue;
    }

    // 2. Compare props for this section
    const prevProps = prevSection.props;
    const nextProps = nextSection.props;

    for (const key of Object.keys(prevProps)) {
      if (!(key in nextProps)) {
        // Required prop removed — breaking change
        changes.push(
          `[major] Prop removed: ${prevSection.type}.${key} (${prevSection.sectionId})`,
        );
        bump = maxBump(bump, "major");
      } else if (!deepEqual(prevProps[key], nextProps[key])) {
        // Prop value changed — patch
        changes.push(
          `[patch] Prop changed: ${prevSection.type}.${key} (${prevSection.sectionId})`,
        );
        bump = maxBump(bump, "patch");
      }
    }

    for (const key of Object.keys(nextProps)) {
      if (!(key in prevProps)) {
        // New optional prop added — minor
        changes.push(
          `[minor] Prop added: ${nextSection.type}.${key} (${nextSection.sectionId})`,
        );
        bump = maxBump(bump, "minor");
      }
    }
  }

  // 3. Check sections that are new in next
  for (const nextSection of next.sections) {
    if (!prevById.has(nextSection.sectionId)) {
      changes.push(`[minor] Section added: ${nextSection.type} (${nextSection.sectionId})`);
      bump = maxBump(bump, "minor");
    }
  }

  return { bump, changes };
}

// Calculates the next SemVer string given a current version string and a bump level.
// Expects version in "MAJOR.MINOR.PATCH" format.
export function bumpVersion(current: string, bump: SemVerBump): string {
  const [major, minor, patch] = current.split(".").map(Number);
  switch (bump) {
    case "major": return `${major + 1}.0.0`;
    case "minor": return `${major}.${minor + 1}.0`;
    case "patch": return `${major}.${minor}.${patch + 1}`;
    default:      return current;
  }
}
