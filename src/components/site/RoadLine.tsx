/**
 * The road — a wide red curve with a dashed centre line, behind the first screen: the logo's
 * swoosh made into a road, the one motif the site repeats (the ticket's From–To line, the
 * route stubs, How it works).
 *
 * A CSS background rather than an inline SVG: it is stretched to whatever the section's size
 * is, and as a background it is never an element hanging past the screen's edge (the layout
 * audit counts those). Faint on purpose (9% red) — it is a texture, not a picture, and text
 * sits on it.
 */
const ROAD = `url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1440 360%22 preserveAspectRatio=%22none%22%3E%3Cpath d=%22M-20 300 C 260 300, 380 120, 700 150 S 1180 300, 1460 60%22 fill=%22none%22 stroke=%22%23D83028%22 stroke-width=%2222%22 stroke-linecap=%22round%22 opacity=%22.09%22/%3E%3Cpath d=%22M-20 300 C 260 300, 380 120, 700 150 S 1180 300, 1460 60%22 fill=%22none%22 stroke=%22%23ffffff%22 stroke-width=%222%22 stroke-dasharray=%2218 16%22 stroke-linecap=%22round%22 opacity=%22.9%22/%3E%3C/svg%3E")`;

export function RoadLine({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 bg-[length:100%_100%] bg-no-repeat ${className}`}
      style={{ backgroundImage: ROAD }}
    />
  );
}
