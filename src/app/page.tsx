import { LandingPage } from "@/components/landing-page";
import {
  getBreadcrumbSchema,
  getDisclosureSchema,
  getFaqSchema,
  getProjectSchema,
} from "@/lib/schema";

export default function Page() {
  const schemas = [
    getBreadcrumbSchema(),
    getProjectSchema(),
    getFaqSchema(),
    getDisclosureSchema(),
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`schema-${schema["@type"]}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <LandingPage />
    </>
  );
}
