export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nikoo-homes-8-bellahalli.com"
).replace(/\/$/, "");

export const siteName = "Nikoo Homes 8 Bellahalli";

export const siteDescription =
  "Nikoo Homes 8 by Bhartiya Urban in Bellahalli, Bengaluru offers premium apartments from Rs. 88 L onwards with 30+ amenities, clubhouse, sports courts, landscaped gardens and strong connectivity to Manyata Tech Park, Bhartiya City, schools, malls, hospitals and airport routes.";

export const siteKeywords = [
  "Nikoo Homes 8",
  "Nikoo Homes 8 Bellahalli",
  "Bhartiya City Nikoo Homes 8",
  "Nikoo Homes 8 price",
  "Nikoo Homes 8 brochure",
  "Nikoo Homes 8 floor plans",
  "Nikoo Homes Bellahalli",
  "Bhartiya Urban Bellahalli apartments",
  "apartments near Manyata Tech Park",
  "flats near Bhartiya City Bengaluru",
  "Bellahalli apartments for sale",
  "North Bengaluru apartments",
];

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
