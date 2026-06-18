export const projectFacts = {
  name: "Nikoo Homes 8",
  publicTitle: "Nikoo Homes 8 at Bhartiya Garden Enclave",
  developer: "Bhartiya Urban Pvt. Ltd.",
  locationShort: "Bellahalli, near Thanisandra Main Road, North Bengaluru",
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
    "https://www.google.com/maps/search/Bellahalli,+Thanisandra+Main+Road,+Bengaluru",
  images: {
    hero: "/nikoo/images/home_garden.jpg",
    elevation: "/nikoo/images/elevation.webp",
    township: "/nikoo/images/township.png",
    masterPlan: "/nikoo/images/masterplan.jpg",
  },
};

export const micrositeDisclaimer =
  "This is a promotional project microsite operated for enquiries. All prices, plans, availability and timelines are indicative and should be verified before booking.";

export const consentText =
  "I agree to be contacted by phone, WhatsApp, SMS or email for this project enquiry.";

export const units = [
  {
    slug: "studio",
    label: "Studio",
    saleableArea: 501,
    carpetArea: 345,
    price: "On Request",
    buyerFit: "Compact garden-facing starter home",
    image: "/nikoo/plans/Studio.jpg",
    primary: false,
  },
  {
    slug: "one-bhk",
    label: "1 BHK",
    saleableArea: 786,
    carpetArea: 462,
    price: "₹95L – ₹1.30Cr*",
    buyerFit: "Best for first move",
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
    price: "₹1.40Cr – ₹1.65Cr*",
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
    price: "₹2.07Cr – ₹2.40Cr*",
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
    price: "₹2.55Cr*",
    buyerFit: "Premium layout",
    image: "/nikoo/plans/Loft.jpg",
    primary: true,
  },
  {
    slug: "four-bhk-staff",
    label: "4 BHK + Staff",
    saleableArea: 2506,
    carpetArea: 1634,
    price: "₹2.99Cr*",
    buyerFit: "Large-format family unit",
    image: "/nikoo/plans/Four-Bed.jpg",
    primary: true,
  },
] as const;

export const pricingSnapshot = [
  units[1],
  units[3],
  units[5],
  units[8],
] as const;

export const amenities = [
  "The Quiet Trail",
  "Community Garden",
  "Children’s Play Area",
  "Meditation Garden",
  "Aroma Garden",
  "Sensory Garden",
  "The Living Canopy",
  "Tennis Court",
] as const;

export const nearbyPlaces = [
  "Bhartiya City",
  "Manyata Tech Park",
  "Nagawara Metro Station",
  "Yelahanka Junction",
  "Kempegowda International Airport",
  "Chaman Bhartiya School",
] as const;

export const faqs = [
  {
    question: "Where is Nikoo Homes 8 located?",
    answer:
      "Nikoo Homes 8 at Bhartiya Garden Enclave is located in Bellahalli near Thanisandra Main Road in North Bengaluru, within the wider Bhartiya City context.",
  },
  {
    question: "What are the RERA numbers for Nikoo Homes 8?",
    answer:
      "Nikoo Homes 8 is listed in two phases: Phase 1 is PRM/KA/RERA/1251/309/PR/070526/008628 and Phase 2 is PRM/KA/RERA/1251/309/PR/070526/008629.",
  },
  {
    question: "What home types are available in Nikoo Homes 8?",
    answer:
      "The configuration ladder includes Studio, 1 BHK, 1.5 BHK, 2 BHK, 2.5 BHK, 3 BHK, 3.5 BHK, Loft, and 4 BHK + Staff homes.",
  },
] as const;

export const getWhatsAppUrl = (message: string) =>
  `https://wa.me/919008177888?text=${encodeURIComponent(message)}`;
