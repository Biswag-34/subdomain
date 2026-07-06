export const projectFacts = {
  name: "Nikoo Homes 8",
  publicTitle: "Bhartiya City Nikoo Homes 8",
  developer: "Bhartiya Urban Pvt. Ltd.",
  locationShort: "Bellahalli, Bengaluru",
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
    hero: "/nikoo/hero/hero-desktop-july.png",
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
    title: "73% Open Space",
    text: "Spread across an 11+ acre development, giving you room to breathe, play and explore.",
  },
  {
    title: "Garden Living",
    text: "Immersive green zones include Wildflower, Sensory, Meditation and Community Gardens.",
  },
  {
    title: "Prime Tech & Retail Hub",
    text: "Minutes from Manyata Tech Park, BCIT Tech Park and Bhartiya Mall of Bengaluru.",
  },
  {
    title: "Seamless Connectivity",
    text: "The upcoming Blue Line Metro station is close to the project, helping reduce everyday traffic friction.",
  },
  {
    title: "Premium Architecture",
    text: "Thoughtfully designed homes with elegant Italian-style kitchens and signature wave windows.",
  },
  {
    title: "30+ Luxury Amenities",
    text: "A grand luxury clubhouse and expansive sports complex support fitness, leisure and community living.",
  },
] as const;

export const amenityHighlights = [
  {
    label: "Gymnasium",
    text: "Dedicated fitness space for daily wellness routines.",
  },
  {
    label: "45,000 sq ft Clubhouse",
    text: "A large clubhouse planned for leisure, fitness and community use.",
  },
  {
    label: "Indoor Games Room",
    text: "Indoor recreation space for all-weather downtime.",
  },
  {
    label: "Workspaces",
    text: "Convenient work zones for focused and flexible routines.",
  },
  {
    label: "Jogging & Skating Track",
    text: "Active outdoor tracks for movement across the community.",
  },
  {
    label: "Multiple Sports Courts",
    text: "Sports courts planned for active recreation and practice.",
  },
  {
    label: "Meditation Yoga Deck",
    text: "A calmer deck for yoga, meditation and reset.",
  },
  {
    label: "Landscaped Gardens",
    text: "Green outdoor pockets woven into everyday community life.",
  },
  {
    label: "Kids Play Area",
    text: "Dedicated play space for younger residents.",
  },
  {
    label: "Party Area",
    text: "A social zone for celebrations and community gatherings.",
  },
  {
    label: "Retail Spaces",
    text: "Convenient retail spaces within the development ecosystem.",
  },
] as const;

export const locationClusters = [
  {
    label: "Schools",
    items: [
      { name: "Chaman Bhartiya School", time: "0.5 km" },
      { name: "New Horizon International School", time: "1.4 km" },
      { name: "National Public School, North", time: "5.6 km" },
      { name: "VIBGYOR Jakkur", time: "3.9 km" },
      { name: "DPS Bangalore North", time: "3.8 km" },
    ],
  },
  {
    label: "Malls",
    items: [
      { name: "Bhartiya Mall of Bengaluru", time: "0.2 km" },
      { name: "Decathlon", time: "9 km" },
      { name: "Elements Mall", time: "4 km" },
      { name: "D Mart Hennur", time: "5 km" },
      { name: "Phoenix Mall of Asia", time: "6 km" },
    ],
  },
  {
    label: "Hotels",
    items: [
      { name: "The Leela Bhartiya City", time: "0.3 km" },
      { name: "Hilton, Embassy Manyata Business Park", time: "5.4 km" },
      { name: "Courtyard by Marriott", time: "6 km" },
      { name: "Four Seasons Hotel", time: "9.7 km" },
    ],
  },
  {
    label: "Tech Parks",
    items: [
      { name: "BCIT, Bhartiya City", time: "0.5 km" },
      { name: "Manyata Tech Park", time: "5 km" },
      { name: "L&T Tech Park", time: "6 km" },
      { name: "Brigade Opus", time: "6.4 km" },
      { name: "Brigade Magnum", time: "6.3 km" },
    ],
  },
  {
    label: "Hospitals",
    items: [
      { name: "REGAL Kidney and Multi Specialty Hospital", time: "1.1 km" },
      { name: "Prolife Multi Speciality Hospital", time: "6 km" },
      { name: "Cytecare Cancer Hospitals", time: "5.5 km" },
      { name: "Motherhood Hospital", time: "6.2 km" },
      { name: "Aster CMI Hospital", time: "6.7 km" },
    ],
  },
  {
    label: "Travel",
    items: [
      { name: "Thanisandra Main Road", time: "3.4 km" },
      { name: "Nagawara Metro Station", time: "6.5 km" },
      { name: "Yelahanka Junction", time: "6.3 km" },
      { name: "Kempegowda International Airport", time: "14 km" },
      { name: "Central Bengaluru District", time: "12 km" },
    ],
  },
] as const;

export const getWhatsAppUrl = (message: string) =>
  `https://wa.me/919008177888?text=${encodeURIComponent(message)}`;
