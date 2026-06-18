import { nikooHomes8, operatorDisclosure } from "@/data/nikoo-homes-8";

const siteUrl = "https://nikoo-homes-8.local";

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
        name: nikooHomes8.project.name,
        item: `${siteUrl}/#overview`,
      },
    ],
  };
}

export function getProjectSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: nikooHomes8.project.publicTitle,
    description:
      "Nikoo Homes 8 at Bhartiya Garden Enclave is a garden-led residential launch near Thanisandra Main Road in North Bengaluru.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
      streetAddress: nikooHomes8.project.location,
    },
    brand: {
      "@type": "Organization",
      name: nikooHomes8.project.developer,
    },
    image: [
      "/nikoo/images/home_garden.jpg",
      "/nikoo/images/elevation.webp",
      "/nikoo/images/masterplan.jpg",
    ],
  };
}

export function getFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: nikooHomes8.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getDisclosureSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${nikooHomes8.project.name} Enquiry Page`,
    url: siteUrl,
    description: operatorDisclosure,
  };
}
