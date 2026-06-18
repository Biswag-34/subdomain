"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BadgeIndianRupee,
  BriefcaseBusiness,
  CalendarRange,
  CheckCircle2,
  Compass,
  Download,
  Dumbbell,
  GraduationCap,
  Landmark,
  Mail,
  MapPin,
  PhoneCall,
  Ruler,
  ShoppingBag,
  Sparkles,
  Trees,
  Waves,
} from "lucide-react";

import projectContent from "@/data/project-content.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LeadIntent =
  | "price-sheet"
  | "brochure"
  | "floor-plans"
  | "site-visit"
  | "updates";

type LeadState = {
  name: string;
  phone: string;
  email: string;
  interest: LeadIntent;
  note: string;
};

type ExperienceMode = "master" | "amenities" | "location";

type DialogCopy = {
  title: string;
  description: string;
  label: string;
};

type NavItem = {
  label: string;
  href: string;
};

gsap.registerPlugin(ScrollTrigger, useGSAP);

const content = projectContent;

const navItems: NavItem[] = [
  { label: "Overview", href: "#overview" },
  { label: "Snapshot", href: "#snapshot" },
  { label: "Residences", href: "#residences" },
  { label: "Life Here", href: "#experience" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const amenityIcons = {
  Landscape: Trees,
  "Club and leisure": Waves,
  "Movement and sport": Dumbbell,
};

const locationIcons = {
  Schools: GraduationCap,
  Retail: ShoppingBag,
  "Work and travel": BriefcaseBusiness,
};

const formatAssetPath = (path: string) =>
  path
    .replace("assets/images/", "/nikoo/images/")
    .replace("assets/plans/", "/nikoo/plans/")
    .replace("assets/docs/", "/nikoo/docs/");

const leadDialogCopy: Record<LeadIntent, DialogCopy> = {
  "price-sheet": {
    title: "Get the latest price sheet",
    description:
      "Best for buyers who already understand the project and want the latest pricing and live availability.",
    label: "Send Price Sheet",
  },
  brochure: {
    title: "Receive the brochure",
    description:
      "A softer conversion for visitors who want the complete presentation before speaking to the sales team.",
    label: "Send Brochure",
  },
  "floor-plans": {
    title: "Get floor plans on WhatsApp",
    description:
      "Ideal after layout comparison, when the visitor is narrowing down a unit type.",
    label: "Share Floor Plans",
  },
  "site-visit": {
    title: "Book a guided site visit",
    description:
      "The highest-intent lead path should feel direct, premium, and effortless.",
    label: "Schedule Visit",
  },
  updates: {
    title: "Save project updates",
    description:
      "A low-friction lead point for shortlist-stage buyers who are not ready for a call yet.",
    label: "Save My Updates",
  },
};

function createLeadState(interest: LeadIntent): LeadState {
  return {
    name: "",
    phone: "",
    email: "",
    interest,
    note: "",
  };
}

async function submitLead(payload: LeadState & { source: string }) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Lead capture failed");
  }

  return response.json();
}

export function LandingPage() {
  const [activeUnit, setActiveUnit] = useState(0);
  const [experienceMode, setExperienceMode] =
    useState<ExperienceMode>("master");
  const [activeLocationTab, setActiveLocationTab] = useState(
    content.location.tabs[0]?.label ?? "",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogIntent, setDialogIntent] = useState<LeadIntent>("price-sheet");
  const [heroLead, setHeroLead] = useState<LeadState>(
    createLeadState("price-sheet"),
  );
  const [modalLead, setModalLead] = useState<LeadState>(
    createLeadState("price-sheet"),
  );
  const [updateLead, setUpdateLead] = useState<LeadState>(
    createLeadState("updates"),
  );
  const [closingLead, setClosingLead] = useState<LeadState>(
    createLeadState("site-visit"),
  );
  const [pendingSource, setPendingSource] = useState("hero-form");
  const [toast, setToast] = useState("");
  const shellRef = useRef<HTMLDivElement>(null);
  const planVisualRef = useRef<HTMLDivElement>(null);

  const selectedUnit = content.units[activeUnit];
  const selectedLocation =
    content.location.tabs.find((tab) => tab.label === activeLocationTab) ??
    content.location.tabs[0];
  const dialogMeta = leadDialogCopy[dialogIntent];
  const unitMaxArea = useMemo(
    () => Math.max(...content.units.map((unit) => unit.area)),
    [],
  );
  const unitFill = `${Math.round((selectedUnit.area / unitMaxArea) * 100)}%`;

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".site-nav-shell", { y: -16, autoAlpha: 0, duration: 0.45 })
        .from(
          ".hero-stagger > *",
          {
            y: 16,
            autoAlpha: 0,
            duration: 0.5,
            stagger: 0.05,
          },
          "-=0.15",
        )
        .from(
          ".hero-side-card, .lead-rail-shell",
          {
            x: 16,
            autoAlpha: 0,
            duration: 0.48,
            stagger: 0.06,
          },
          "-=0.18",
        );

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 22,
          autoAlpha: 0,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
          },
        });
      });

      gsap.utils
        .toArray<HTMLElement>("[data-card-group]")
        .forEach((groupElement) => {
          gsap.from(groupElement.children, {
            y: 16,
            autoAlpha: 0,
            duration: 0.45,
            stagger: 0.05,
            ease: "power2.out",
            scrollTrigger: {
              trigger: groupElement,
              start: "top 88%",
            },
          });
        });
    },
    { scope: shellRef },
  );

  useGSAP(
    () => {
      if (!planVisualRef.current) {
        return;
      }

      gsap.fromTo(
        planVisualRef.current,
        { autoAlpha: 0.65, y: 10, scale: 0.985 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
        },
      );
    },
    {
      dependencies: [activeUnit],
      scope: shellRef,
      revertOnUpdate: true,
    },
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const updateLeadField = (
    setter: (value: LeadState) => void,
    current: LeadState,
    field: keyof LeadState,
    value: string,
  ) => {
    setter({ ...current, [field]: value });
  };

  const openLeadDialog = (intent: LeadIntent, source: string) => {
    setDialogIntent(intent);
    setPendingSource(source);
    setModalLead(createLeadState(intent));
    setDialogOpen(true);
  };

  const handleHeroSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitLead({ ...heroLead, source: "hero-form" });
    setHeroLead(createLeadState("price-sheet"));
    showToast("Enquiry saved successfully.");
  };

  const handleModalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitLead({ ...modalLead, source: pendingSource });
    setDialogOpen(false);
    setModalLead(createLeadState(dialogIntent));
    showToast(`${dialogMeta.title} request saved.`);
  };

  const handleUpdateSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    await submitLead({ ...updateLead, source: "updates-widget" });
    setUpdateLead(createLeadState("updates"));
    showToast("Update request saved.");
  };

  const handleClosingSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    await submitLead({ ...closingLead, source: "closing-form" });
    setClosingLead(createLeadState(closingLead.interest));
    showToast("Closing enquiry saved successfully.");
  };

  const experienceImage =
    experienceMode === "master"
      ? formatAssetPath(content.project.masterPlanImage)
      : experienceMode === "amenities"
        ? formatAssetPath(content.project.townshipImage)
        : formatAssetPath(content.project.elevationImage);

  const experienceAlt =
    experienceMode === "master"
      ? "Nikoo Homes 8 master plan"
      : experienceMode === "amenities"
        ? "Nikoo Homes 8 amenities and township visual"
        : "Nikoo Homes 8 elevation near Thanisandra Main Road";

  return (
    <div ref={shellRef} className="grain bg-[--background]">
      <header className="sticky top-0 z-40 border-b border-[rgba(234,28,41,0.12)] bg-white/98 backdrop-blur-xl">
        <div className="section-shell py-3">
          <div className="site-nav-shell flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/nikoo/logo-red.png"
                  alt="Nikoo Homes"
                  width={151}
                  height={65}
                  className="h-9 w-auto"
                  priority
                />
                <div className="hidden sm:block">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[--accent]">
                    Bhartiya Garden Enclave
                  </p>
                  <p className="font-[family-name:var(--font-display)] text-[1.12rem] font-semibold leading-none tracking-[-0.04em] text-[--foreground]">
                    North Bengaluru Launch
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                className="lg:hidden"
                onClick={() => openLeadDialog("price-sheet", "header-mobile")}
              >
                Price Sheet
              </Button>
            </div>

            <nav className="hide-scrollbar flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[--foreground] lg:justify-center lg:overflow-visible lg:pb-0">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-full px-3 py-2 font-[family-name:var(--font-display)] tracking-[-0.01em] transition hover:bg-[rgba(234,28,41,0.06)] hover:text-[--accent]"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <Button
                variant="outline"
                onClick={() => openLeadDialog("site-visit", "header-visit")}
              >
                <CalendarRange className="size-4" />
                Book Visit
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  openLeadDialog("price-sheet", "header-price-sheet")
                }
              >
                Get Price Sheet
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-6 pb-24 pt-4 md:space-y-7 md:pt-5">
        <section className="section-shell" id="overview">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="glass-panel px-4 py-5 md:px-6 md:py-6">
              <div className="hero-stagger">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="eyebrow">{content.hero.eyebrow}</p>
                  <div className="rounded-full bg-[--surface-soft] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[--accent]">
                    {content.project.location}
                  </div>
                </div>

                <h1 className="display-title mt-3 text-[2.35rem] leading-[0.94] md:text-[3.7rem]">
                  {content.project.publicTitle}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[--foreground-muted]">
                  {content.hero.subheadline}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {content.hero.trustPills.map((pill) => (
                    <div
                      key={pill}
                      className="rounded-full bg-[--surface-soft] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[--foreground]"
                    >
                      {pill}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Button
                    onClick={() =>
                      openLeadDialog("price-sheet", "hero-price-sheet")
                    }
                  >
                    {content.hero.primaryCta}
                  </Button>
                  <Button asChild variant="outline">
                    <Link
                      href={formatAssetPath(content.project.brochureUrl)}
                      target="_blank"
                    >
                      <Download className="size-4" />
                      {content.hero.secondaryCta}
                    </Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <a href="#residences">
                      {content.hero.tertiaryCta}
                      <ArrowRight className="size-4" />
                    </a>
                  </Button>
                </div>

                <div
                  data-card-group
                  className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
                >
                  {[
                    {
                      label: "Starting Price",
                      value: content.hero.startingPrice,
                      icon: BadgeIndianRupee,
                    },
                    {
                      label: "Configurations",
                      value: "Studio to 4 Bed + Staff",
                      icon: Ruler,
                    },
                    {
                      label: "Scale",
                      value: "About 12 acres",
                      icon: Compass,
                    },
                    {
                      label: "Possession",
                      value: "2031 onward",
                      icon: CalendarRange,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-[1.2rem] bg-[--surface-soft] px-3.5 py-3.5"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-white text-[--accent] shadow-[0_10px_18px_rgba(234,28,41,0.08)]">
                            <Icon className="size-4" />
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[--foreground-muted]">
                            {item.label}
                          </p>
                        </div>
                        <p className="mt-3 text-[13px] leading-5 text-[--foreground]">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>

            <div className="grid gap-4">
              <article className="hero-side-card glass-panel p-3">
                <div className="media-stage min-h-[15rem] p-3 md:min-h-[18rem]">
                  <Image
                    src={formatAssetPath(content.project.heroImage)}
                    alt="Nikoo Homes 8 garden lifestyle visual"
                    width={1400}
                    height={960}
                    className="h-full w-full object-contain"
                    priority
                  />
                </div>
              </article>

              <article className="hero-side-card glass-panel p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">Quick Enquiry</p>
                    <h2 className="display-title mt-2 text-[1.9rem] leading-none">
                      Pricing, plans, or a guided callback
                    </h2>
                  </div>
                  <div className="rounded-full bg-[--surface-soft] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[--accent]">
                    Soft first step
                  </div>
                </div>

                <form className="mt-4 grid gap-2.5" onSubmit={handleHeroSubmit}>
                  <input
                    className="compact-input"
                    placeholder="Name"
                    required
                    value={heroLead.name}
                    onChange={(event) =>
                      updateLeadField(
                        setHeroLead,
                        heroLead,
                        "name",
                        event.target.value,
                      )
                    }
                  />
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <input
                      className="compact-input"
                      placeholder="Mobile number"
                      required
                      value={heroLead.phone}
                      onChange={(event) =>
                        updateLeadField(
                          setHeroLead,
                          heroLead,
                          "phone",
                          event.target.value,
                        )
                      }
                    />
                    <input
                      className="compact-input"
                      placeholder="Email (optional)"
                      value={heroLead.email}
                      onChange={(event) =>
                        updateLeadField(
                          setHeroLead,
                          heroLead,
                          "email",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <textarea
                    className="compact-textarea min-h-20"
                    placeholder="Price sheet, brochure, floor plans, or site visit?"
                    value={heroLead.note}
                    onChange={(event) =>
                      updateLeadField(
                        setHeroLead,
                        heroLead,
                        "note",
                        event.target.value,
                      )
                    }
                  />
                  <Button className="w-full" type="submit">
                    Talk to a Project Expert
                  </Button>
                </form>
              </article>
            </div>
          </div>
        </section>

        <section className="section-shell" data-reveal id="snapshot">
          <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
            <article className="glass-panel p-4 md:p-5">
              <p className="eyebrow">Project Snapshot</p>
              <h2 className="display-title mt-2 text-[1.95rem] leading-none md:text-[2.45rem]">
                Why this project stands out quickly
              </h2>
              <p className="mt-3 section-copy">
                A garden-led township address near Thanisandra Main Road, shaped
                for both aspirational first upgrades and larger family moves.
              </p>

              <div className="mt-4 rounded-[1.2rem] bg-[--surface-soft] px-4 py-3.5">
                <p className="display-title text-[1.45rem] italic leading-none">
                  &ldquo;{content.overview.quote}&rdquo;
                </p>
              </div>

              <div data-card-group className="mt-4 grid gap-2.5 md:grid-cols-3">
                {[
                  {
                    title: "Township ecosystem",
                    text: "Close to Bhartiya City and the North Bengaluru growth corridor.",
                    icon: Landmark,
                  },
                  {
                    title: "Landscape identity",
                    text: "Named gardens, trails, and green spines create recall beyond inventory.",
                    icon: Trees,
                  },
                  {
                    title: "Family flexibility",
                    text: "From Studio to 4 Bed + Staff, the mix serves multiple buyer profiles.",
                    icon: Sparkles,
                  },
                ].map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.title}
                      className="rounded-[1.1rem] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(234,28,41,0.06)]"
                    >
                      <div className="flex size-9 items-center justify-center rounded-full bg-[--surface-soft] text-[--accent]">
                        <Icon className="size-4" />
                      </div>
                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[--accent]">
                        {card.title}
                      </p>
                      <p className="mt-2 text-[12px] leading-6 text-[--foreground-muted]">
                        {card.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>

            <div className="grid gap-4">
              <div
                data-card-group
                className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4"
              >
                {[
                  { ...content.metrics[0], icon: Compass },
                  { ...content.metrics[1], icon: Landmark },
                  { ...content.metrics[2], icon: Sparkles },
                  { ...content.metrics[3], icon: CalendarRange },
                ].map((metric) => {
                  const Icon = metric.icon;

                  return (
                    <article
                      key={metric.label}
                      className="rounded-[1.2rem] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(234,28,41,0.06)]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-[--surface-soft] text-[--accent]">
                          <Icon className="size-4" />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[--foreground-muted]">
                          {metric.label}
                        </p>
                      </div>
                      <h3 className="display-title mt-3 text-[1.45rem] leading-none">
                        {metric.value}
                      </h3>
                      <p className="mt-2 text-[12px] leading-5 text-[--foreground-muted]">
                        {metric.note}
                      </p>
                    </article>
                  );
                })}
              </div>

              <article className="glass-panel p-4 md:p-5">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-[--surface-soft] text-[--accent]">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <p className="eyebrow">Buyer Lens</p>
                    <h3 className="display-title mt-1 text-[1.65rem] leading-none">
                      Why the project stands out
                    </h3>
                  </div>
                </div>

                <div data-card-group className="mt-4 grid gap-2.5 md:grid-cols-2">
                  {[
                    {
                      title: "Garden-led identity",
                      text: "A more memorable story than generic luxury copy.",
                      icon: Trees,
                    },
                    {
                      title: "Plan clarity",
                      text: "A real size ladder from 501 to 2506 sq ft.",
                      icon: Ruler,
                    },
                    {
                      title: "Pricing path",
                      text: "Cost sheet CTAs appear after the user understands the product.",
                      icon: BadgeIndianRupee,
                    },
                    {
                      title: "Connected address",
                      text: "Bhartiya City, Manyata, schools, retail, and airport logic.",
                      icon: MapPin,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-[1.1rem] bg-[--surface-soft] px-4 py-3.5"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-white text-[--accent] shadow-[0_8px_18px_rgba(234,28,41,0.06)]">
                            <Icon className="size-4" />
                          </div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[--foreground]">
                            {item.title}
                          </p>
                        </div>
                        <p className="mt-2 text-[12px] leading-6 text-[--foreground-muted]">
                          {item.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section-shell" data-reveal id="residences">
          <article className="glass-panel p-4 md:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Residences</p>
                <h2 className="display-title mt-2 text-[2rem] leading-none md:text-[2.55rem]">
                  Choose your residence
                </h2>
                <p className="mt-3 max-w-3xl section-copy">
                  Swipe through the full apartment mix, then review the selected
                  plan, key numbers, and next action in one compact view.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => openLeadDialog("floor-plans", "plans-top")}
              >
                <Mail className="size-4" />
                Send All Plans
              </Button>
            </div>

            <div className="mt-3 overflow-x-auto pb-1 xl:overflow-visible">
              <div className="hide-scrollbar flex min-w-max snap-x snap-mandatory gap-2 pr-4 xl:grid xl:min-w-0 xl:grid-cols-9 xl:pr-0">
                {content.units.map((unit, index) => {
                  const isActive = index === activeUnit;

                  return (
                    <button
                      key={unit.name}
                      type="button"
                      onClick={() => setActiveUnit(index)}
                      className={`w-[6.95rem] flex-none snap-start rounded-[1.05rem] border px-3 py-2.5 text-left transition duration-300 xl:w-auto ${
                        isActive
                          ? "border-[--accent] bg-[linear-gradient(180deg,#ef3d49,#cf1724)] text-white shadow-[0_16px_28px_rgba(234,28,41,0.18)]"
                          : "border-[--border] bg-white text-[--foreground] hover:-translate-y-0.5 hover:border-[rgba(234,28,41,0.3)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`max-w-none text-[9px] font-semibold uppercase leading-4 tracking-[0.16em] ${
                            isActive
                              ? "text-white/78"
                              : "text-[--foreground-muted]"
                          }`}
                        >
                          {unit.label}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold leading-none ${
                            isActive
                              ? "bg-white/18 text-white"
                              : "bg-[rgba(234,28,41,0.08)] text-[--accent]"
                          }`}
                        >
                          {unit.area}
                        </span>
                      </div>
                      <h3
                        className={`mt-2 min-h-[2rem] font-[family-name:var(--font-display)] text-[1.03rem] leading-[1.05] tracking-[-0.03em] ${
                          isActive ? "text-white" : "text-[--foreground]"
                        }`}
                      >
                        {unit.name}
                      </h3>
                      <p
                        className={`mt-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] ${
                          isActive ? "text-white/82" : "text-[--foreground-muted]"
                        }`}
                      >
                        sq ft
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              ref={planVisualRef}
              className="mt-4 grid gap-3 lg:grid-cols-[0.88fr_1.12fr]"
            >
              <div className="rounded-[1.2rem] border border-[rgba(234,28,41,0.12)] bg-white p-2.5 shadow-[0_14px_32px_rgba(234,28,41,0.06)]">
                <div className="flex items-center justify-between px-1 pb-2">
                  <div>
                    <p className="eyebrow">Plan Preview</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[--foreground-muted]">
                      {selectedUnit.label}
                    </p>
                  </div>
                  <Link
                    href={formatAssetPath(selectedUnit.image)}
                    target="_blank"
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[--accent]"
                  >
                    Open Full
                  </Link>
                </div>
                <div className="media-stage min-h-[10rem] md:min-h-[12rem]">
                  <Image
                    src={formatAssetPath(selectedUnit.image)}
                    alt={`${selectedUnit.label} floor plan`}
                    width={1100}
                    height={1000}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-[--border] bg-white p-4 shadow-[0_14px_32px_rgba(234,28,41,0.06)]">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="eyebrow">Selected Residence</p>
                  <div className="rounded-full bg-[rgba(234,28,41,0.1)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[--accent-strong]">
                    {selectedUnit.area} sq ft
                  </div>
                  <div className="rounded-full bg-[rgba(234,28,41,0.1)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[--accent-strong]">
                    {selectedUnit.price}
                  </div>
                </div>

                <h3 className="display-title mt-2 text-[1.85rem] leading-none md:text-[2.1rem]">
                  {selectedUnit.label}
                </h3>
                <p className="mt-2 text-[13px] leading-5 text-[--foreground-muted]">
                  {selectedUnit.bestFor}
                </p>

                <div className="mt-4 rounded-[1rem] bg-[rgba(234,28,41,0.06)] px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[--foreground-muted]">
                        Size ladder position
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-[--foreground]">
                        {selectedUnit.area} sq ft in the overall residence mix
                      </p>
                    </div>
                    <p className="text-[1.15rem] font-bold text-[--accent]">
                      {unitFill}
                    </p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#ef4b55,#cf1724)]"
                      style={{ width: unitFill }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    {
                      label: "Configuration",
                      value: selectedUnit.label,
                      icon: Ruler,
                    },
                    {
                      label: "Saleable area",
                      value: `${selectedUnit.area} sq ft`,
                      icon: Compass,
                    },
                    {
                      label: "Buyer fit",
                      value: selectedUnit.bestFor,
                      icon: Sparkles,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-[1rem] border border-[--border] px-3.5 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex size-9 items-center justify-center rounded-full bg-[rgba(234,28,41,0.1)] text-[--accent]">
                            <Icon className="size-[1.125rem]" />
                          </div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[--foreground-muted]">
                            {item.label}
                          </p>
                        </div>
                        <p className="mt-2 text-[13px] font-semibold leading-5 text-[--foreground]">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-2">
                  {[
                    "Selected pricing and plan sharing stay tied to this exact unit type.",
                    "Use the miniature plan for quick browsing and open full layout only when needed.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(234,28,41,0.1)] text-[--accent]">
                        <CheckCircle2 className="size-[1.125rem]" />
                      </div>
                      <p className="text-[12px] leading-5 text-[--foreground-muted]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      openLeadDialog("price-sheet", `unit-${selectedUnit.name}`)
                    }
                  >
                    Get Exact Cost Sheet
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      openLeadDialog("site-visit", `visit-${selectedUnit.name}`)
                    }
                  >
                    <CalendarRange className="size-4" />
                    Book Visit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      openLeadDialog("floor-plans", `plans-${selectedUnit.name}`)
                    }
                  >
                    <Mail className="size-4" />
                    Share Plan
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[1.35rem] border border-[rgba(234,28,41,0.12)] bg-white px-4 py-4 md:px-5">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="eyebrow">Save Shortlist</p>
                  <h3 className="display-title mt-2 text-[1.75rem] leading-none">
                    {content.conversion.softCapture.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-[--foreground-muted]">
                    {content.conversion.softCapture.body}
                  </p>
                </div>

                <form
                  className="grid gap-2 sm:grid-cols-[11rem_12rem_auto]"
                  onSubmit={handleUpdateSubmit}
                >
                  <input
                    className="compact-input"
                    placeholder="Name"
                    required
                    value={updateLead.name}
                    onChange={(event) =>
                      updateLeadField(
                        setUpdateLead,
                        updateLead,
                        "name",
                        event.target.value,
                      )
                    }
                  />
                  <input
                    className="compact-input"
                    placeholder="Email address"
                    required
                    value={updateLead.email}
                    onChange={(event) =>
                      updateLeadField(
                        setUpdateLead,
                        updateLead,
                        "email",
                        event.target.value,
                      )
                    }
                  />
                  <Button type="submit">{content.conversion.softCapture.cta}</Button>
                </form>
              </div>
            </div>
          </article>
        </section>

        <section className="section-shell" data-reveal id="experience">
          <article className="glass-panel p-4 md:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Life Here</p>
                <h2 className="display-title mt-2 text-[2rem] leading-none md:text-[2.55rem]">
                  Master plan, amenities, and location
                </h2>
                <p className="mt-3 max-w-3xl section-copy">
                  Keep the buyer on the most decision-making details first, then
                  let each tab expand only the context they want next.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Master Plan", value: "master" as const, icon: Compass },
                  { label: "Amenities", value: "amenities" as const, icon: Dumbbell },
                  { label: "Location", value: "location" as const, icon: MapPin },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setExperienceMode(item.value)}
                    className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
                      experienceMode === item.value
                        ? "bg-[linear-gradient(135deg,#ef4b55,#d81b28)] text-white shadow-[0_12px_24px_rgba(234,28,41,0.2)]"
                        : "border border-[--border] bg-white text-[--foreground] hover:border-[rgba(234,28,41,0.3)] hover:text-[--accent]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      {item.label}
                      {experienceMode === item.value ? (
                        <span className="size-1.5 rounded-full bg-white animate-pulse" />
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="overflow-hidden rounded-[1.35rem]">
                <Image
                  src={experienceImage}
                  alt={experienceAlt}
                  width={1400}
                  height={1100}
                  className="h-full min-h-[18rem] w-full object-cover md:min-h-[22rem]"
                />
              </div>

              <div className="rounded-[1.3rem] border border-[rgba(234,28,41,0.12)] bg-white p-4 md:p-5">
                {experienceMode === "master" ? (
                  <>
                    <p className="eyebrow">Master Plan</p>
                    <h3 className="display-title mt-2 text-[1.85rem] leading-none">
                      Landscape moments buyers remember
                    </h3>
                    <p className="mt-3 text-[13px] leading-5 text-[--foreground-muted]">
                      Named green spaces make the development easier to recall
                      than a generic apartment pitch.
                    </p>

                    <div
                      data-card-group
                      className="mt-4 grid gap-2 sm:grid-cols-2"
                    >
                      {content.masterPlan.markers.slice(0, 6).map((marker, index) => (
                        <div
                          key={marker}
                          className="flex items-center gap-3 rounded-[1rem] border border-[--border] px-3.5 py-3"
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(234,28,41,0.1)] text-[11px] font-semibold text-[--accent]">
                            {index + 1}
                          </div>
                          <p className="text-[12px] font-semibold leading-5 text-[--foreground]">
                            {marker}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="mt-4"
                      onClick={() => openLeadDialog("brochure", "master-plan-more")}
                    >
                      View Full Landscape Story
                    </Button>
                  </>
                ) : experienceMode === "amenities" ? (
                  <>
                    <p className="eyebrow">Amenities</p>
                    <h3 className="display-title mt-2 text-[1.85rem] leading-none">
                      Wellness, leisure, and family routine
                    </h3>
                    <p className="mt-3 text-[13px] leading-5 text-[--foreground-muted]">
                      Group the amenity story by how residents actually judge
                      everyday living, recreation, and movement.
                    </p>

                    <div data-card-group className="mt-4 grid gap-2.5">
                      {content.amenities.categories.map((category) => {
                        const Icon =
                          amenityIcons[
                            category.name as keyof typeof amenityIcons
                          ] ?? Trees;

                        return (
                          <div
                            key={category.name}
                            className="rounded-[1rem] border border-[--border] px-4 py-3.5"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(234,28,41,0.1)] text-[--accent]">
                                <Icon className="size-5" />
                              </div>
                              <h4 className="display-title text-[1.35rem] leading-none">
                                {category.name}
                              </h4>
                            </div>
                            <div className="mt-3 grid gap-2">
                              {category.items.slice(0, 4).map((item) => (
                                <div key={item} className="flex items-start gap-2.5">
                                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[--accent]" />
                                  <p className="text-[12px] font-medium leading-5 text-[--foreground]">
                                    {item}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="eyebrow">Location</p>
                    <h3 className="display-title mt-2 text-[1.85rem] leading-none">
                      Nearby anchors that shorten decision time
                    </h3>
                    <p className="mt-3 text-[13px] leading-5 text-[--foreground-muted]">
                      Start with fast landmark confidence, then let the buyer
                      open the category tied to their daily routine.
                    </p>

                    <div
                      data-card-group
                      className="mt-4 grid gap-2 sm:grid-cols-2"
                    >
                      {content.location.quickFacts.map((fact) => (
                        <div
                          key={fact}
                          className="flex gap-3 rounded-[1rem] border border-[--border] px-3.5 py-3"
                        >
                          <MapPin className="mt-0.5 size-5 shrink-0 text-[--accent]" />
                          <p className="text-[12px] font-semibold leading-5 text-[--foreground]">
                            {fact}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {content.location.tabs.map((tab) => {
                        const Icon =
                          locationIcons[
                            tab.label as keyof typeof locationIcons
                          ] ?? Landmark;

                        return (
                          <button
                            key={tab.label}
                            type="button"
                            onClick={() => setActiveLocationTab(tab.label)}
                            className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                              selectedLocation.label === tab.label
                                ? "bg-[linear-gradient(135deg,#ef4b55,#d81b28)] text-white shadow-[0_12px_24px_rgba(234,28,41,0.2)]"
                                : "border border-[--border] bg-white text-[--foreground] hover:text-[--accent]"
                            }`}
                          >
                            <Icon className="size-4" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    <div
                      data-card-group
                      className="mt-4 grid gap-2 sm:grid-cols-2"
                    >
                      {selectedLocation.items.map((item) => {
                        const Icon =
                          locationIcons[
                            selectedLocation.label as keyof typeof locationIcons
                          ] ?? Landmark;

                        return (
                          <div
                            key={item}
                            className="rounded-[1rem] border border-[--border] px-3.5 py-3"
                          >
                            <div className="flex items-center gap-2 text-[--accent]">
                              <Icon className="size-5" />
                              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[--foreground-muted]">
                                {selectedLocation.label}
                              </p>
                            </div>
                            <p className="mt-2 text-[12px] font-semibold leading-5 text-[--foreground]">
                              {item}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <Button asChild className="mt-4">
                      <Link href={content.location.mapUrl} target="_blank">
                        <MapPin className="size-4" />
                        Open Location Map
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </article>
        </section>

        <section className="section-shell" data-reveal id="faq">
          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <article className="glass-panel overflow-hidden p-0">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <Image
                  src={formatAssetPath(content.project.elevationImage)}
                  alt="Nikoo Homes 8 elevation"
                  width={1200}
                  height={1000}
                  className="h-full min-h-[16rem] w-full object-cover"
                />
                <div className="p-4 md:p-5">
                  <p className="eyebrow">Project Data</p>
                  <h2 className="display-title mt-2 text-[1.85rem] leading-none">
                    Key project data at a glance
                  </h2>
                  <div className="mt-4 grid gap-2.5">
                    <div className="rounded-[1rem] border border-[--border] px-3.5 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[--foreground-muted]">
                        Phase 1 RERA
                      </p>
                      <p className="mt-2 text-[13px] font-semibold leading-5 text-[--foreground]">
                        {content.project.rera.phase1}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-[--border] px-3.5 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[--foreground-muted]">
                        Phase 2 RERA
                      </p>
                      <p className="mt-2 text-[13px] font-semibold leading-5 text-[--foreground]">
                        {content.project.rera.phase2}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-[--border] px-3.5 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[--foreground-muted]">
                        Important note
                      </p>
                      <p className="mt-2 text-[12px] leading-5 text-[--foreground-muted]">
                        {content.project.priceDisclaimer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="glass-panel p-4 md:p-5">
              <p className="eyebrow">FAQ</p>
              <h2 className="display-title mt-2 text-[1.85rem] leading-none">
                Clear answers before the next step
              </h2>
              <p className="mt-3 text-[13px] leading-5 text-[--foreground-muted]">
                Keep the objections light, the answers sharp, and the next action
                easy to find.
              </p>
              <Accordion type="single" collapsible className="mt-4 space-y-2.5">
                {content.faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </article>
          </div>
        </section>

        <section className="section-shell" data-reveal>
          <div className="grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
            <article className="overflow-hidden rounded-[1.6rem] bg-[linear-gradient(180deg,#ef4b55,#c91a26)] text-white shadow-[0_24px_50px_rgba(234,28,41,0.2)]">
              <div className="relative min-h-[24rem]">
                <Image
                  src={formatAssetPath(content.project.heroImage)}
                  alt="Nikoo Homes garden-facing lifestyle"
                  width={1400}
                  height={1100}
                  className="absolute inset-0 h-full w-full object-cover opacity-24"
                />
                <div className="relative p-5 md:p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/76">
                    Project Concierge
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] leading-none tracking-[-0.04em] text-white md:text-[2.5rem]">
                    Move from browsing to a real buying step
                  </h2>
                  <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/84">
                    Give visitors one polished place to ask for pricing,
                    brochure, selected plans, or a guided visit without breaking
                    the premium feel of the page.
                  </p>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {[
                      "Latest price sheet for current inventory",
                      "Brochure with master plan and amenity story",
                      "Selected unit floor plans based on interest",
                      "Priority callback for a guided site visit",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[1rem] border border-white/18 bg-white/10 px-4 py-3 text-[12px] font-medium text-white backdrop-blur"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-2">
                    {[
                      "Best time to call and preferred unit format can be captured here.",
                      "Every CTA on the page can flow into the same premium follow-up path.",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/14">
                          <CheckCircle2 className="size-4 text-white" />
                        </div>
                        <p className="text-[12px] leading-5 text-white/88">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <article className="glass-panel p-4 md:p-5">
              <p className="eyebrow">Lead Desk</p>
              <h2 className="display-title mt-2 text-[1.95rem] leading-none">
                Choose the next action
              </h2>
              <p className="mt-3 text-[13px] leading-5 text-[--foreground-muted]">
                Start with the most relevant request, then capture the minimum
                lead information needed to continue the conversation smoothly.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  { label: "Price Sheet", value: "price-sheet" as const, icon: BadgeIndianRupee },
                  { label: "Brochure", value: "brochure" as const, icon: Download },
                  { label: "Floor Plans", value: "floor-plans" as const, icon: Mail },
                  { label: "Site Visit", value: "site-visit" as const, icon: CalendarRange },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setClosingLead({ ...closingLead, interest: item.value })
                      }
                      className={`rounded-[1rem] border px-4 py-3 text-left transition ${
                        closingLead.interest === item.value
                          ? "border-[--accent] bg-[rgba(234,28,41,0.08)] shadow-[0_12px_24px_rgba(234,28,41,0.08)]"
                          : "border-[--border] bg-white hover:border-[rgba(234,28,41,0.3)]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(234,28,41,0.1)] text-[--accent]">
                          <Icon className="size-4" />
                        </div>
                        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[--foreground]">
                          {item.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-[1rem] border border-[rgba(234,28,41,0.12)] bg-[rgba(234,28,41,0.04)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[--foreground-muted]">
                  Current request
                </p>
                <p className="mt-2 text-[1.15rem] font-[family-name:var(--font-display)] tracking-[-0.02em] text-[--foreground]">
                  {leadDialogCopy[closingLead.interest].title}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[--foreground-muted]">
                  {leadDialogCopy[closingLead.interest].description}
                </p>
              </div>

              <form className="mt-4 grid gap-2.5" onSubmit={handleClosingSubmit}>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <input
                    className="compact-input"
                    placeholder="Name"
                    required
                    value={closingLead.name}
                    onChange={(event) =>
                      updateLeadField(
                        setClosingLead,
                        closingLead,
                        "name",
                        event.target.value,
                      )
                    }
                  />
                  <input
                    className="compact-input"
                    placeholder="Mobile number"
                    required
                    value={closingLead.phone}
                    onChange={(event) =>
                      updateLeadField(
                        setClosingLead,
                        closingLead,
                        "phone",
                        event.target.value,
                      )
                    }
                  />
                </div>
                <input
                  className="compact-input"
                  placeholder="Email (optional)"
                  value={closingLead.email}
                  onChange={(event) =>
                    updateLeadField(
                      setClosingLead,
                      closingLead,
                      "email",
                      event.target.value,
                    )
                  }
                />
                <textarea
                  className="compact-textarea min-h-24"
                  placeholder="Preferred unit type, visit time, or request"
                  value={closingLead.note}
                  onChange={(event) =>
                    updateLeadField(
                      setClosingLead,
                      closingLead,
                      "note",
                      event.target.value,
                    )
                  }
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button className="w-full" type="submit">
                    {leadDialogCopy[closingLead.interest].label}
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    type="button"
                    onClick={() => openLeadDialog("site-visit", "closing-visit")}
                  >
                    <CalendarRange className="size-4" />
                    Book Visit Instead
                  </Button>
                </div>
              </form>
            </article>
          </div>
        </section>
      </main>

      <footer className="section-shell pb-6" data-reveal id="contact">
        <div className="grid gap-4 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="glass-panel overflow-hidden p-0">
            <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
              <div className="px-4 py-5 md:px-5">
                <Image
                  src="/nikoo/logo-red.png"
                  alt="Nikoo Homes"
                  width={151}
                  height={65}
                  className="h-10 w-auto"
                />
                <h2 className="display-title mt-3 text-[2rem] leading-none">
                  Nikoo Homes 8
                </h2>
                <p className="mt-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-[--accent]">
                  Bhartiya Garden Enclave, North Bengaluru
                </p>
                <p className="mt-3 text-[13px] leading-6 text-[--foreground-muted]">
                  Use this landing experience as a concise, conversion-led
                  project desk for serious buyers evaluating Bhartiya City and
                  Thanisandra-side launches.
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[1rem] border border-[--border] px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[--foreground-muted]">
                      Phase 1 RERA
                    </p>
                    <p className="mt-2 text-[13px] font-semibold leading-5 text-[--foreground]">
                      {content.project.rera.phase1}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-[--border] px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[--foreground-muted]">
                      Phase 2 RERA
                    </p>
                    <p className="mt-2 text-[13px] font-semibold leading-5 text-[--foreground]">
                      {content.project.rera.phase2}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      openLeadDialog("price-sheet", "footer-price-sheet")
                    }
                  >
                    <PhoneCall className="size-4" />
                    Talk to Expert
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      openLeadDialog("site-visit", "footer-site-visit")
                    }
                  >
                    <CalendarRange className="size-4" />
                    Schedule Visit
                  </Button>
                </div>
              </div>

              <Image
                src={formatAssetPath(content.project.elevationImage)}
                alt="Nikoo Homes 8 elevation"
                width={1200}
                height={1000}
                className="h-full min-h-[16rem] w-full object-cover"
              />
            </div>
          </div>

          <div className="glass-panel px-4 py-5 md:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Project Notes</p>
                <h3 className="display-title text-[1.8rem] leading-none">
                  Downloads and disclosures
                </h3>
              </div>
              <Button asChild variant="outline">
                <Link
                  href={formatAssetPath(content.project.brochureUrl)}
                  target="_blank"
                >
                  <Download className="size-4" />
                  Download Brochure
                </Link>
              </Button>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-[1rem] border border-[--border] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[--foreground-muted]">
                  Important pricing note
                </p>
                <p className="mt-2 text-[12px] font-medium leading-5 text-[--foreground]">
                  {content.project.priceDisclaimer}
                </p>
              </div>

              <div className="rounded-[1rem] border border-[--border] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[--foreground-muted]">
                  Source summary
                </p>
                <p className="mt-2 text-[12px] font-medium leading-5 text-[--foreground]">
                  {content.footer.sourceSummary}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="secondary"
                  onClick={() => openLeadDialog("updates", "footer-updates")}
                >
                  <Mail className="size-4" />
                  Save Updates
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openLeadDialog("floor-plans", "footer-plans")}
                >
                  <Mail className="size-4" />
                  Send Floor Plans
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="lead-rail-shell fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-2 lg:flex">
        <div className="rounded-[1.8rem] bg-[linear-gradient(180deg,#d91b28,#9c111c)] p-1.5 shadow-[0_24px_50px_rgba(234,28,41,0.24)]">
          {[
            {
              label: "Price Sheet",
              intent: "price-sheet" as const,
              icon: BadgeIndianRupee,
            },
            {
              label: "Floor Plans",
              intent: "floor-plans" as const,
              icon: Mail,
            },
            {
              label: "Book Visit",
              intent: "site-visit" as const,
              icon: CalendarRange,
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => openLeadDialog(item.intent, `rail-${item.intent}`)}
                className={`group flex w-[11rem] items-center gap-2 rounded-full border border-[rgba(255,255,255,0.22)] bg-white px-3 py-2.5 text-left text-[--accent-strong] shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition duration-300 hover:-translate-x-1 ${
                  index > 0 ? "mt-1.5" : ""
                }`}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[--accent] text-white">
                  <Icon className="size-3.5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] transition group-hover:tracking-[0.2em]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <p className="eyebrow">Project Desk</p>
            <DialogTitle>{dialogMeta.title}</DialogTitle>
            <DialogDescription>{dialogMeta.description}</DialogDescription>
          </DialogHeader>

          <form className="mt-5 space-y-2.5" onSubmit={handleModalSubmit}>
            <input
              className="compact-input"
              placeholder="Name"
              required
              value={modalLead.name}
              onChange={(event) =>
                updateLeadField(
                  setModalLead,
                  modalLead,
                  "name",
                  event.target.value,
                )
              }
            />
            <input
              className="compact-input"
              placeholder="Mobile number"
              required
              value={modalLead.phone}
              onChange={(event) =>
                updateLeadField(
                  setModalLead,
                  modalLead,
                  "phone",
                  event.target.value,
                )
              }
            />
            <input
              className="compact-input"
              placeholder="Email (optional)"
              value={modalLead.email}
              onChange={(event) =>
                updateLeadField(
                  setModalLead,
                  modalLead,
                  "email",
                  event.target.value,
                )
              }
            />
            <textarea
              className="compact-textarea"
              placeholder="Preferred configuration or special request"
              value={modalLead.note}
              onChange={(event) =>
                updateLeadField(
                  setModalLead,
                  modalLead,
                  "note",
                  event.target.value,
                )
              }
            />
            <Button className="w-full" type="submit">
              {dialogMeta.label}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div
        className={`fixed bottom-4 left-4 z-50 rounded-full bg-[--surface-strong] px-4 py-2 text-[12px] text-white shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition duration-300 ${
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        {toast}
      </div>
    </div>
  );
}
