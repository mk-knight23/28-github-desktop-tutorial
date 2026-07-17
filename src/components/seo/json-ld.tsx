/**
 * Renders a JSON-LD <script> tag. Server component — the object is serialized at
 * render time. Never pass user-supplied data without sanitizing; all callers
 * pass static builders from src/lib/jsonld.ts.
 */

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Serialized static data only. `<` is escaped to avoid closing the tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
