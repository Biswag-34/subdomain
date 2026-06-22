import { micrositeDisclaimer, projectFacts } from "@/data/nikoo-homes-8";

const siteUrl = "https://example.com";

export function getBreadcrumbSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: projectFacts.publicTitle,
        item: `${siteUrl}/#hero`,
      },
    ],
  };
}

export function getProjectSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: projectFacts.publicTitle,
    description:
      "Garden-led homes in Bellahalli near Thanisandra Main Road by Bhartiya Urban Pvt. Ltd.",
    telephone: projectFacts.contactNumber,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
      streetAddress: projectFacts.locationShort,
    },
    brand: {
      "@type": "Organization",
      name: projectFacts.developer,
    },
    image: [
      projectFacts.images.hero,
      projectFacts.images.elevation,
      projectFacts.images.masterPlan,
    ],
  };
}

export function getDisclosureSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${projectFacts.name} microsite`,
    url: siteUrl,
    description: micrositeDisclaimer,
  };
}
