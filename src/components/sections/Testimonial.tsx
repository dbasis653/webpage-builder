import type { TestimonialProps } from "@/types/sections";

// Renders a testimonial with a quote, author attribution, optional role, and optional avatar.
export default function Testimonial({ quote, author, role, avatar }: TestimonialProps): React.JSX.Element {
  return (
    <section aria-label="Testimonial" className="px-6 py-16">
      <figure className="mx-auto max-w-2xl text-center">
        {/* -- Quote -- */}
        <blockquote className="text-xl font-medium text-gray-900 leading-relaxed">
          <p>&ldquo;{quote}&rdquo;</p>
        </blockquote>

        {/* -- Author attribution -- */}
        <figcaption className="mt-6 flex items-center justify-center gap-4">
          {avatar && (
            <img
              src={avatar}
              alt={author}
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">{author}</p>
            {role && <p className="text-sm text-gray-500">{role}</p>}
          </div>
        </figcaption>
      </figure>
    </section>
  );
}
