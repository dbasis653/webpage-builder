import type { FeatureGridProps } from "@/types/sections";

// Renders a grid of feature cards with title, description, and optional icon label.
export default function FeatureGrid({ features }: FeatureGridProps): React.JSX.Element {
  return (
    <section aria-label="Features" className="px-6 py-16">
      {/* -- Feature grid -- */}
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <li key={index}>
            <article className="flex flex-col gap-3 rounded-lg border border-gray-200 p-6">
              {/* -- Icon label -- */}
              {feature.icon && (
                <span className="text-sm font-medium text-indigo-600 uppercase tracking-wide">
                  {feature.icon}
                </span>
              )}

              {/* -- Feature title -- */}
              <h2 className="text-lg font-semibold text-gray-900">{feature.title}</h2>

              {/* -- Feature description -- */}
              <p className="text-sm text-gray-600">{feature.description}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
