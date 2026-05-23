import Script from "next/script";
import { aiReadableSite } from "@/lib/ai-readable-site";

export default function SchemaMarkup() {
  const schemas = [
    ["schema-organization", aiReadableSite.organization],
    ["schema-localbusiness", aiReadableSite.localBusiness],
    ["schema-service", aiReadableSite.service],
    ["schema-faq", aiReadableSite.faq],
    ["schema-website", aiReadableSite.website],
  ] as const;

  return (
    <>
      {schemas.map(([id, schema]) => (
        <Script key={id} id={id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
    </>
  );
}
