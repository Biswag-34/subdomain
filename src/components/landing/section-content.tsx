import {
  Baby,
  Brain,
  BriefcaseBusiness,
  Building2,
  Flower2,
  Leaf,
  MapPin,
  Plane,
  Route,
  School,
  Sprout,
  TreePalm,
  Trophy,
  Wind,
  TrainFront,
} from "lucide-react";

export function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display-title mt-2 text-[2rem] leading-tight md:text-[3rem]">
        {title}
      </h2>
      {body ? <p className="section-copy mt-3">{body}</p> : null}
    </div>
  );
}

export const overviewCards = [
  {
    title: "Garden-led planning",
    copy: "Named trails, gardens and canopy experiences create a softer everyday rhythm.",
    icon: Leaf,
    bg: "bg-[var(--panel-forest)]",
  },
  {
    title: "Township context",
    copy: "The project benefits from the broader Bhartiya City ecosystem and residential infrastructure.",
    icon: Building2,
    bg: "bg-[var(--panel-sage)]",
  },
  {
    title: "North Bengaluru connectivity",
    copy: "Designed around practical access to work hubs, retail, schools and airport-side movement.",
    icon: MapPin,
    bg: "bg-[var(--panel-clay)]",
  },
];

export const placeThemes = {
  "Bhartiya City": {
    icon: Building2,
    label: "Township",
    className: "bg-[var(--panel-forest)] text-[var(--panel-ink)]",
    accentClass: "bg-[var(--panel-copper)]",
    note: "Integrated retail, dining and community context close to home.",
  },
  "Manyata Tech Park": {
    icon: BriefcaseBusiness,
    label: "Work hub",
    className: "bg-[var(--panel-bark)] text-[var(--panel-ink)]",
    accentClass: "bg-[var(--terracotta-soft)]",
    note: "North Bengaluru employment access for daily commute planning.",
  },
  "Nagawara Metro Station": {
    icon: TrainFront,
    label: "Metro link",
    className: "bg-[var(--panel-sage)] text-[var(--panel-ink)]",
    accentClass: "bg-[var(--panel-copper)]",
    note: "Rail-led connectivity reference for future city movement.",
  },
  "Yelahanka Junction": {
    icon: Route,
    label: "Road access",
    className: "bg-[var(--panel-olive)] text-[var(--panel-ink)]",
    accentClass: "bg-[var(--panel-ink)]",
    note: "Road network access toward established North Bengaluru corridors.",
  },
  "Kempegowda International Airport": {
    icon: Plane,
    label: "Airport",
    className: "bg-[var(--panel-clay)] text-[var(--panel-ink)]",
    accentClass: "bg-[var(--panel-ink)]",
    note: "Airport-side convenience for frequent travel and investment checks.",
  },
  "Chaman Bhartiya School": {
    icon: School,
    label: "Education",
    className: "bg-[var(--panel-forest)] text-[var(--panel-ink)]",
    accentClass: "bg-[var(--terracotta-soft)]",
    note: "School proximity cue for family-led home comparisons.",
  },
};

export const amenityThemes = {
  "The Quiet Trail": {
    icon: Route,
    bg: "bg-[var(--panel-forest)]",
    accent: "text-[var(--panel-ink)]",
    copy: "A calm walking spine for everyday movement.",
  },
  "Community Garden": {
    icon: Sprout,
    bg: "bg-[var(--panel-sage)]",
    accent: "text-[var(--panel-ink)]",
    copy: "Shared green pockets for neighbourly pauses.",
  },
  "Children’s Play Area": {
    icon: Baby,
    bg: "bg-[var(--panel-clay)]",
    accent: "text-[var(--panel-ink)]",
    copy: "Family-first play zone close to home.",
  },
  "Meditation Garden": {
    icon: Brain,
    bg: "bg-[var(--panel-olive)]",
    accent: "text-[var(--panel-ink)]",
    copy: "Quiet garden setting for reset and reflection.",
  },
  "Aroma Garden": {
    icon: Flower2,
    bg: "bg-[var(--panel-bark)]",
    accent: "text-[var(--panel-ink)]",
    copy: "Landscape detail shaped around fragrance.",
  },
  "Sensory Garden": {
    icon: Wind,
    bg: "bg-[var(--panel-copper)]",
    accent: "text-[var(--panel-ink)]",
    copy: "Soft planting, texture and movement cues.",
  },
  "The Living Canopy": {
    icon: TreePalm,
    bg: "bg-[var(--panel-sage)]",
    accent: "text-[var(--panel-ink)]",
    copy: "A shaded green gesture in the master plan.",
  },
  "Tennis Court": {
    icon: Trophy,
    bg: "bg-[var(--panel-forest)]",
    accent: "text-[var(--panel-ink)]",
    copy: "Dedicated active recreation for residents.",
  },
};
