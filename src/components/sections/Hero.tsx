import type { HeroProps } from "@/types/sections";

// Renders the Hero section with a title, optional subtitle, and optional background image.
export default function Hero({ title, subtitle, backgroundImage }: HeroProps): React.JSX.Element {
  return (
    <section
      aria-label="Hero"
      className="relative flex flex-col items-center justify-center text-center px-6 py-24"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {/* -- Title -- */}
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        {title}
      </h1>

      {/* -- Subtitle -- */}
      {subtitle && (
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          {subtitle}
        </p>
      )}
    </section>
  );
}
