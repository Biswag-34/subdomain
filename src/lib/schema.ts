import { amenityHighlights, locationClusters, micrositeDisclaimer, projectFacts, units } from "@/data/nikoo-homes-8";
import { absoluteUrl, siteDescription, siteName, siteUrl } from "@/lib/site";

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
        item: absoluteUrl("/#hero"),
      },
    ],
  };
}

export function getProjectSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: projectFacts.publicTitle,
    description: siteDescription,
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
      absoluteUrl(projectFacts.images.hero),
      absoluteUrl(projectFacts.images.elevation),
      absoluteUrl(projectFacts.images.masterPlan),
    ],
    amenityFeature: amenityHighlights.map((item) => ({
      "@type": "LocationFeatureSpecification",
      name: item.label,
      value: true,
      description: item.text,
    })),
    containsPlace: locationClusters.flatMap((cluster) =>
      cluster.items.slice(0, 4).map((item) => ({
        "@type": "Place",
        name: item.name,
        description: `${item.time} from ${projectFacts.name}`,
      })),
    ),
    url: siteUrl,
  };
}

export function getDisclosureSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: micrositeDisclaimer,
  };
}

export function getWebPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Nikoo Homes 8 Bellahalli Price, Brochure and Floor Plans",
    url: siteUrl,
    description: siteDescription,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(projectFacts.images.hero),
      width: 1672,
      height: 941,
    },
    about: {
      "@type": "Residence",
      name: projectFacts.publicTitle,
    },
  };
}

export function getOfferCatalogSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Nikoo Homes 8 apartment options",
    url: absoluteUrl("/#floorplans"),
    itemListElement: units.map((unit) => ({
      "@type": "Offer",
      name: unit.label,
      category: "Apartment",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/#floorplans"),
      itemOffered: {
        "@type": "Accommodation",
        name: `${unit.label} apartment at ${projectFacts.name}`,
        floorSize: {
          "@type": "QuantitativeValue",
          value: unit.saleableArea,
          unitText: "sq ft",
        },
      },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "INR",
        description: unit.price,
      },
    })),
  };
}

export function getFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Where is Nikoo Homes 8 located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nikoo Homes 8 is located in Bellahalli, Bengaluru, with connectivity to Thanisandra Main Road, Bhartiya City, Manyata Tech Park and airport-side routes.",
        },
      },
      {
        "@type": "Question",
        name: "What amenities are planned at Nikoo Homes 8?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Amenities include a gymnasium, 45,000 sq ft clubhouse, indoor games room, workspaces, jogging and skating track, sports courts, meditation yoga deck, landscaped gardens, kids play area, party area and retail spaces.",
        },
      },
      {
        "@type": "Question",
        name: "How can I get the Nikoo Homes 8 brochure and floor plans?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the enquiry or brochure forms on the landing page to request the latest brochure, apartment options and floor plan details.",
        },
      },
    ],
  };
}
