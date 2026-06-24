export const projectFacts = {
  name: "Nikoo Homes 8",
  publicTitle: "Nikoo Homes 8 at Bhartiya Garden Enclave",
  developer: "Bhartiya Urban Pvt. Ltd.",
  locationShort: "Thanisandra Main Road, North Bengaluru",
  contactNumber: "+91 90081 77888",
  contactHref: "tel:+919008177888",
  emailLabel: "Email Enquiry",
  emailHref: "#final-enquiry",
  socials: {
    facebook: "https://www.facebook.com/NikooHomesIndia/",
    instagram: "https://www.instagram.com/nikoohomes/",
  },
  possession: "2031 onward*",
  rera: {
    phase1: "PRM/KA/RERA/1251/309/PR/070526/008628",
    phase2: "PRM/KA/RERA/1251/309/PR/070526/008629",
  },
  mapUrl:
    "https://www.google.com/maps/search/Nikoo+Homes+8+Thanisandra+Main+Road+Bengaluru",
  images: {
    hero: "/nikoo/images/banner-image.webp",
    elevation: "/nikoo/images/elevation.webp",
    township: "/nikoo/images/township.png",
    masterPlan: "/nikoo/images/masterplan.jpg",
  },
} as const;

export const micrositeDisclaimer =
  "This promotional microsite is operated for project enquiries. Pricing, inventory, plans, views and timelines are indicative and must be verified before booking.";

export const consentText =
  "I agree to receive project updates by call, WhatsApp, SMS or email.";

export const units = [
  {
    slug: "studio",
    label: "Studio",
    saleableArea: 501,
    carpetArea: 345,
    price: "On Request",
    buyerFit: "Compact starter format",
    image: "/nikoo/plans/Studio.jpg",
    primary: false,
  },
  {
    slug: "one-bhk",
    label: "1 BHK",
    saleableArea: 786,
    carpetArea: 462,
    price: "Rs. 95L - Rs. 1.30Cr*",
    buyerFit: "First move upgrade",
    image: "/nikoo/plans/One-Bed.jpg",
    primary: true,
  },
  {
    slug: "one-point-five-bhk",
    label: "1.5 BHK",
    saleableArea: 1088,
    carpetArea: null,
    price: "On Request",
    buyerFit: "Work-from-home flexibility",
    image: "/nikoo/plans/One-Bed-Study.jpg",
    primary: false,
  },
  {
    slug: "two-bhk",
    label: "2 BHK",
    saleableArea: 1165,
    carpetArea: 725,
    price: "Rs. 1.40Cr - Rs. 1.65Cr*",
    buyerFit: "Family-friendly layout",
    image: "/nikoo/plans/Two-Bed.jpg",
    primary: true,
  },
  {
    slug: "two-point-five-bhk",
    label: "2.5 BHK",
    saleableArea: 1371,
    carpetArea: 876,
    price: "On Request",
    buyerFit: "Future-ready family plan",
    image: "/nikoo/plans/Two-Bed-Study.jpg",
    primary: false,
  },
  {
    slug: "three-bhk",
    label: "3 BHK",
    saleableArea: 1730,
    carpetArea: 1115,
    price: "Rs. 2.07Cr - Rs. 2.40Cr*",
    buyerFit: "Upgrade home",
    image: "/nikoo/plans/Three-Bed.jpg",
    primary: true,
  },
  {
    slug: "three-point-five-bhk",
    label: "3.5 BHK",
    saleableArea: 2006,
    carpetArea: 1308,
    price: "On Request",
    buyerFit: "Larger family flexibility",
    image: "/nikoo/plans/Three-Bed-Study.jpg",
    primary: false,
  },
  {
    slug: "loft",
    label: "Loft",
    saleableArea: 2132,
    carpetArea: 1279,
    price: "Rs. 2.55Cr*",
    buyerFit: "Premium double-height living",
    image: "/nikoo/plans/Loft.jpg",
    primary: true,
  },
  {
    slug: "four-bhk-staff",
    label: "4 BHK + Staff",
    saleableArea: 2506,
    carpetArea: 1634,
    price: "Rs. 2.99Cr*",
    buyerFit: "Large-format family home",
    image: "/nikoo/plans/Four-Bed.jpg",
    primary: true,
  },
] as const;

export const uspHighlights = [
  {
    title: "Township-backed living",
    text: "Nikoo Homes 8 sits inside Bhartiya Garden Enclave, keeping a larger lifestyle ecosystem close to home.",
  },
  {
    title: "Wide configuration ladder",
    text: "From compact studios to 4 BHK plus staff formats, the range covers first homes, upgrades and premium layouts.",
  },
  {
    title: "Garden-led planning",
    text: "Landscape experiences, shaded walks and themed gardens keep the project identity clear instead of generic.",
  },
  {
    title: "North Bengaluru access",
    text: "Thanisandra Main Road, Bhartiya City, Manyata Tech Park and airport-side movement stay practically connected.",
  },
] as const;

export const amenityHighlights = [
  {
    label: "Quiet Trail",
    text: "A calmer walking spine for everyday movement.",
  },
  {
    label: "Community Garden",
    text: "A shared green pocket for neighbourly pause points.",
  },
  {
    label: "Children's Play Area",
    text: "Dedicated family-friendly outdoor activity space.",
  },
  {
    label: "Meditation Garden",
    text: "A quieter garden edge for reset and reflection.",
  },
  {
    label: "Aroma Garden",
    text: "Fragrance-led planting that sharpens the landscape identity.",
  },
  {
    label: "Sensory Garden",
    text: "A softer mix of texture, planting and movement cues.",
  },
  {
    label: "Living Canopy",
    text: "A shaded green gesture that anchors the outdoor experience.",
  },
  {
    label: "Tennis Court",
    text: "An active recreation layer within the community plan.",
  },
] as const;

export const locationClusters = [
  {
    label: "Landmarks",
    items: [
      { name: "Bhartiya City", time: "5 min" },
      { name: "Manyata Tech Park", time: "10 min" },
    ],
  },
  {
    label: "Education",
    items: [{ name: "Chaman Bhartiya School", time: "5 min" }],
  },
  {
    label: "Transit",
    items: [
      { name: "Nagawara Metro Station", time: "15 min" },
      { name: "Yelahanka Junction", time: "18 min" },
    ],
  },
  {
    label: "Airport",
    items: [{ name: "Kempegowda International Airport", time: "25 min" }],
  },
] as const;

export const getWhatsAppUrl = (message: string) =>
  `https://wa.me/919008177888?text=${encodeURIComponent(message)}`;
