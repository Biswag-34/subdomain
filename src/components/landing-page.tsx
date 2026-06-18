"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Download,
  Dumbbell,
  GraduationCap,
  Home,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  PhoneCall,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trees,
  Waves,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  consentText,
  nikooHomes8,
  operatorDisclosure,
  whatsAppUrl,
} from "@/data/nikoo-homes-8";
import { getLeadMetadata, trackEvent } from "@/lib/analytics";
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

gsap.registerPlugin(ScrollTrigger, useGSAP);

const content = nikooHomes8;

const leadIntentSchema = z.enum([
  "price-sheet",
  "brochure",
  "floor-plans",
  "site-visit",
  "whatsapp",
]);

type LeadIntent = z.infer<typeof leadIntentSchema>;

type LeadDialogState = {
  intent: LeadIntent;
  source: string;
  section: string;
  unitLabel?: string;
};

const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid mobile number.")
    .regex(/^[0-9+\-\s()]+$/, "Use numbers and phone symbols only."),
  interestedIn: z.string().min(1, "Please choose a configuration."),
  preferredAction: leadIntentSchema,
  callbackTime: z.string().optional(),
  note: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

type LeadPayload = LeadFormValues & {
  email?: string;
  interest: LeadIntent;
  metadata: Record<string, unknown>;
  source: string;
};

const navItems = [
  { label: "Overview", href: "#overview" },
  { label: "Residences", href: "#residences" },
  { label: "Pricing", href: "#pricing" },
  { label: "Plans", href: "#floor-plans" },
  { label: "Location", href: "#location" },
  { label: "FAQ", href: "#faq" },
];

const intentLabels: Record<LeadIntent, string> = {
  "price-sheet": "Get Price Sheet on WhatsApp",
  brochure: "Send Brochure",
  "floor-plans": "Send Selected Floor Plans",
  "site-visit": "Book My Site Visit",
  whatsapp: "Continue on WhatsApp",
};

const dialogCopy: Record<LeadIntent, { title: string; description: string }> = {
  "price-sheet": {
    title: "Get the latest price sheet",
    description:
      "Share your details and the latest price guidance can be sent to you with current availability.",
  },
  brochure: {
    title: "Download the project brochure",
    description:
      "Receive the brochure and key project details for easier shortlisting.",
  },
  "floor-plans": {
    title: "Get selected floor plans",
    description:
      "Choose the configuration you prefer and receive the matching floor plan.",
  },
  "site-visit": {
    title: "Book a guided site visit",
    description:
      "Share a convenient time and the team can help schedule your project visit.",
  },
  whatsapp: {
    title: "Start a WhatsApp enquiry",
    description:
      "Send your interest and continue the conversation with a quick WhatsApp follow-up.",
  },
};

const amenityIcons = {
  Landscape: Trees,
  "Club and leisure": Waves,
  "Movement and sport": Dumbbell,
};

const locationGroups = [
  {
    label: "Schools",
    icon: GraduationCap,
    items: content.location.tabs.find((tab) => tab.label === "Schools")?.items ?? [],
  },
  {
    label: "Malls / Retail",
    icon: ShoppingBag,
    items: content.location.tabs.find((tab) => tab.label === "Retail")?.items ?? [],
  },
  {
    label: "Tech Parks",
    icon: BriefcaseBusiness,
    items: ["Manyata Tech Park", "BCIT, Bhartiya City"],
  },
  {
    label: "Travel",
    icon: MapPin,
    items: ["Nagawara Metro connectivity", "Kempegowda International Airport"],
  },
  {
    label: "Hotels",
    icon: Landmark,
    items: ["North Bengaluru hospitality corridor", "Bhartiya City social district"],
  },
  {
    label: "Hospitals",
    icon: ShieldCheck,
    items: ["Established North Bengaluru healthcare access", "Thanisandra and Hebbal medical network"],
  },
];

const formatAssetPath = (path: string) =>
  path
    .replace("assets/images/", "/nikoo/images/")
    .replace("assets/plans/", "/nikoo/plans/")
    .replace("assets/docs/", "/nikoo/docs/");

async function submitLead(payload: LeadPayload) {
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

function getDefaultLeadValues(
  intent: LeadIntent,
  interestedIn = content.units[0]?.label ?? "1 RK / Studio",
): LeadFormValues {
  return {
    name: "",
    phone: "",
    interestedIn,
    preferredAction: intent,
    callbackTime: "",
    note: "",
  };
}

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`border-t border-[--border] ${className}`}>
      <div className="section-shell py-8 md:py-10">{children}</div>
    </section>
  );
}

function SectionIntro({
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
      <h2 className="display-title mt-2 text-3xl leading-tight md:text-5xl">
        {title}
      </h2>
      {body ? <p className="section-copy mt-3">{body}</p> : null}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs font-semibold text-[--accent]">{message}</p>;
}

function LeadForm({
  buttonLabel,
  className = "",
  defaultIntent,
  defaultUnit,
  formId,
  onSubmit,
  showNote = false,
}: {
  buttonLabel?: string;
  className?: string;
  defaultIntent: LeadIntent;
  defaultUnit?: string;
  formId: string;
  onSubmit: (values: LeadFormValues) => Promise<void>;
  showNote?: boolean;
}) {
  const [success, setSuccess] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    control,
    register,
    reset,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: getDefaultLeadValues(defaultIntent, defaultUnit),
  });

  const preferredAction = useWatch({
    control,
    name: "preferredAction",
  });
  const submitLabel = buttonLabel ?? intentLabels[preferredAction];

  const submit = async (values: LeadFormValues) => {
    setSuccess("");
    await onSubmit(values);
    reset(getDefaultLeadValues(values.preferredAction, values.interestedIn));
    setSuccess("Request received. The team will share details or call back shortly.");
  };

  return (
    <form className={`grid gap-3 ${className}`} onSubmit={handleSubmit(submit)}>
      <div>
        <label className="form-label" htmlFor={`${formId}-name`}>
          Full Name
        </label>
        <input
          id={`${formId}-name`}
          className="compact-input"
          autoComplete="name"
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <label className="form-label" htmlFor={`${formId}-phone`}>
          Mobile Number
        </label>
        <input
          id={`${formId}-phone`}
          className="compact-input"
          autoComplete="tel"
          inputMode="tel"
          {...register("phone")}
        />
        <FieldError message={errors.phone?.message} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="form-label" htmlFor={`${formId}-unit`}>
            Interested In
          </label>
          <select id={`${formId}-unit`} className="compact-input" {...register("interestedIn")}>
            {content.units.map((unit) => (
              <option key={unit.name} value={unit.label}>
                {unit.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.interestedIn?.message} />
        </div>

        <div>
          <label className="form-label" htmlFor={`${formId}-action`}>
            Preferred Action
          </label>
          <select
            id={`${formId}-action`}
            className="compact-input"
            {...register("preferredAction")}
          >
            <option value="price-sheet">Price Sheet</option>
            <option value="floor-plans">Floor Plans</option>
            <option value="brochure">Brochure</option>
            <option value="site-visit">Site Visit</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <FieldError message={errors.preferredAction?.message} />
        </div>
      </div>

      <div>
        <label className="form-label" htmlFor={`${formId}-time`}>
          Preferred Callback Time
        </label>
        <input
          id={`${formId}-time`}
          className="compact-input"
          placeholder="Optional"
          {...register("callbackTime")}
        />
      </div>

      {showNote ? (
        <div>
          <label className="form-label" htmlFor={`${formId}-note`}>
            Message
          </label>
          <textarea
            id={`${formId}-note`}
            className="compact-textarea min-h-20"
            placeholder="Optional"
            {...register("note")}
          />
        </div>
      ) : null}

      <Button type="submit" className="min-h-11 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : submitLabel}
      </Button>

      <p className="text-xs leading-5 text-[--foreground-muted]">{consentText}</p>
      {success ? (
        <p className="rounded-md bg-[rgba(234,28,41,0.08)] px-3 py-2 text-xs font-semibold text-[--accent-strong]">
          {success}
        </p>
      ) : null}
    </form>
  );
}

export function LandingPage() {
  const [activeUnit, setActiveUnit] = useState(0);
  const [activeLocationTab, setActiveLocationTab] = useState(locationGroups[0]?.label ?? "");
  const [leadDialog, setLeadDialog] = useState<LeadDialogState | null>(null);
  const [toast, setToast] = useState("");
  const shellRef = useRef<HTMLDivElement>(null);

  const selectedUnit = content.units[activeUnit];
  const selectedLocation =
    locationGroups.find((group) => group.label === activeLocationTab) ?? locationGroups[0];
  const activeDialog = leadDialog
    ? {
        ...leadDialog,
        copy: dialogCopy[leadDialog.intent],
      }
    : null;

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        .from(".site-nav-shell", { autoAlpha: 0, y: -10, duration: 0.4 })
        .from(".hero-copy > *", { autoAlpha: 0, y: 14, duration: 0.42, stagger: 0.05 }, "-=0.1")
        .from(".hero-form", { autoAlpha: 0, y: 16, duration: 0.42 }, "-=0.2");

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 18,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
          },
        });
      });
    },
    { scope: shellRef },
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const handleLeadSubmit = async (
    values: LeadFormValues,
    source: string,
    section: string,
    unitLabel?: string,
  ) => {
    const metadata = getLeadMetadata({
      ctaSource: source,
      pageSection: section,
      unitSelected: unitLabel ?? values.interestedIn,
      preferredAction: values.preferredAction,
    });

    await submitLead({
      ...values,
      email: "",
      interest: values.preferredAction,
      metadata,
      source,
    });

    trackEvent("form_submit", {
      source,
      section,
      preferredAction: values.preferredAction,
      unitSelected: unitLabel ?? values.interestedIn,
    });

    showToast("Enquiry saved successfully.");
  };

  const openLeadDialog = (
    intent: LeadIntent,
    source: string,
    section: string,
    unitLabel?: string,
  ) => {
    trackEvent(`${intent}_click`, {
      source,
      section,
      unitSelected: unitLabel ?? selectedUnit.label,
    });
    setLeadDialog({ intent, source, section, unitLabel });
  };

  const handleUnitSelect = (index: number) => {
    const unit = content.units[index];
    setActiveUnit(index);
    trackEvent("unit_selection", {
      unitSelected: unit.label,
      area: unit.area,
    });
  };

  const handleWhatsAppClick = (source: string, section: string) => {
    trackEvent("whatsapp_click", {
      source,
      section,
      unitSelected: selectedUnit.label,
    });
  };

  return (
    <div ref={shellRef} className="bg-white text-[--foreground]">
      <header className="sticky top-0 z-40 border-b border-[--border] bg-white/95 backdrop-blur">
        <div className="section-shell py-3">
          <div className="site-nav-shell flex items-center justify-between gap-3">
            <a href="#overview" className="flex items-center gap-3" aria-label="Nikoo Homes 8 overview">
              <Image
                src="/nikoo/logo-red.png"
                alt="Nikoo Homes"
                width={151}
                height={65}
                className="h-9 w-auto"
                priority
              />
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-[--accent]">Nikoo Homes 8</p>
                <p className="text-xs text-[--foreground-muted]">Bhartiya Garden Enclave</p>
              </div>
            </a>

            <nav className="hide-scrollbar hidden items-center gap-1 overflow-x-auto text-sm font-semibold lg:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 transition hover:bg-[rgba(234,28,41,0.06)] hover:text-[--accent]"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openLeadDialog("site-visit", "header-call", "Header")}
              >
                <PhoneCall className="size-4" />
                <span className="hidden sm:inline">Call</span>
              </Button>
              <Button asChild size="sm">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleWhatsAppClick("header-whatsapp", "Header")}
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-24 md:pb-0">
        <section
          id="overview"
          className="relative overflow-hidden border-b border-[--border] bg-[--surface-strong] text-white"
        >
          <Image
            src={formatAssetPath(content.project.heroImage)}
            alt="Nikoo Homes 8 garden living visual"
            fill
            sizes="100vw"
            className="object-cover opacity-28"
            priority
          />
          <div className="relative section-shell py-7 md:py-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-center">
              <div className="hero-copy max-w-3xl">
                <Image
                  src="/nikoo/logo-red.png"
                  alt="Nikoo Homes"
                  width={151}
                  height={65}
                  className="h-12 w-auto rounded-md bg-white px-2 py-1"
                  priority
                />
                <h1 className="display-title mt-5 text-5xl leading-none text-white md:text-7xl">
                  Nikoo Homes 8
                </h1>
                <p className="mt-3 text-base font-semibold text-white">
                  {content.project.location}
                </p>
                <p className="mt-1 text-sm text-white/80">
                  By {content.project.developer}
                </p>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/86 md:text-lg">
                  A garden-led residential address at Bhartiya Garden Enclave
                  with thoughtfully planned homes, landscaped experiences, club
                  amenities and strong North Bengaluru connectivity.
                </p>

                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    "Studio to 4 BHK",
                    "501 to 2506 sq ft",
                    "Phase-wise RERA listed",
                    "2031 onward guidance",
                  ].map((item) => (
                    <div key={item} className="rounded-md border border-white/18 bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur">
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button onClick={() => openLeadDialog("price-sheet", "hero-price", "Hero")}>
                    <BadgeIndianRupee className="size-4" />
                    Get Latest Price Sheet
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => openLeadDialog("site-visit", "hero-visit", "Hero")}
                  >
                    <CalendarRange className="size-4" />
                    Book Site Visit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openLeadDialog("floor-plans", "hero-plans", "Hero")}
                  >
                    <Ruler className="size-4" />
                    Get Floor Plans
                  </Button>
                  <Button asChild variant="outline">
                    <Link
                      href={formatAssetPath(content.project.brochureUrl)}
                      target="_blank"
                      onClick={() => trackEvent("brochure_click", { source: "hero-brochure", section: "Hero" })}
                    >
                      <Download className="size-4" />
                      Download Brochure
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="hero-form rounded-lg bg-white p-4 text-[--foreground] shadow-[0_20px_48px_rgba(0,0,0,0.2)] md:p-5">
                <p className="eyebrow">Quick Enquiry</p>
                <h2 className="display-title mt-2 text-2xl leading-tight">
                  Pricing, floor plans, or site visit
                </h2>
                <LeadForm
                  className="mt-4"
                  defaultIntent="price-sheet"
                  formId="hero-lead"
                  onSubmit={(values) => handleLeadSubmit(values, "hero-form", "Hero")}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="border-b border-[--border] bg-white">
          <div className="section-shell grid gap-2 py-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Location", value: content.project.location, icon: MapPin },
              { label: "Developer", value: content.project.developer, icon: Building2 },
              { label: "Starting Price", value: `${content.hero.startingPrice}*`, icon: BadgeIndianRupee },
              { label: "Township Context", value: "Garden living inside a modern township", icon: Trees },
              { label: "Configuration Range", value: "Studio to 4 Bed + Staff", icon: Home },
              { label: "Size Range", value: "501 to 2506 sq ft", icon: Ruler },
              { label: "RERA", value: "Phase 1 and Phase 2 listed", icon: ShieldCheck },
              { label: "Possession", value: "2031 onward guidance", icon: CalendarRange },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-lg border border-[--border] bg-white px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Icon className="size-5 text-[--accent]" />
                    <p className="text-xs font-bold text-[--accent]">{item.label}</p>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-5">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        <Section>
          <div data-reveal className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <SectionIntro
              eyebrow="Project Overview"
              title="Garden living inside a connected North Bengaluru address"
              body="Nikoo Homes 8 brings together landscaped open spaces, flexible home formats and the wider Bhartiya City ecosystem near Thanisandra Main Road."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Garden-led identity", text: "Named gardens, trails and outdoor moments give the project a distinct everyday character.", icon: Trees },
                { title: "Township ecosystem", text: "Residents benefit from the wider Bhartiya City setting, retail access and social infrastructure.", icon: Landmark },
                { title: "Connected address", text: "Positioned for Manyata, airport-side movement, retail corridors and North Bengaluru growth.", icon: MapPin },
                { title: "Flexible unit mix", text: "A broad range from compact starter homes to larger family formats.", icon: Ruler },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="rounded-lg border border-[--border] bg-white p-4">
                    <Icon className="size-7 text-[--accent]" />
                    <h3 className="mt-3 text-base font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[--foreground-muted]">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </Section>

        <Section id="residences" className="bg-[rgba(234,28,41,0.035)]">
          <div data-reveal>
            <SectionIntro
              eyebrow="Configurations"
              title="Choose the residence format that fits your plan"
              body="Select a unit type to see the area, buyer fit, plan preview and unit-specific enquiry options."
            />

            <div className="mt-5 overflow-x-auto pb-2">
              <div className="hide-scrollbar flex min-w-max gap-2 lg:grid lg:min-w-0 lg:grid-cols-9">
                {content.units.map((unit, index) => {
                  const isActive = index === activeUnit;

                  return (
                    <button
                      key={unit.name}
                      type="button"
                      onClick={() => handleUnitSelect(index)}
                      className={`w-36 rounded-lg border p-3 text-left transition ${
                        isActive
                          ? "border-[--accent] bg-[--accent] text-white shadow-[0_16px_30px_rgba(234,28,41,0.18)]"
                          : "border-[--border] bg-white hover:border-[--accent]"
                      }`}
                    >
                      <p className="text-xs font-bold">{unit.label}</p>
                      <p className={`mt-1 text-lg font-bold ${isActive ? "text-white" : "text-[--accent]"}`}>
                        {unit.area}
                      </p>
                      <p className="text-xs">sq ft</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-lg border border-[--border] bg-white p-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white">
                  <Image
                    src={formatAssetPath(selectedUnit.image)}
                    alt={`${selectedUnit.label} floor plan preview`}
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[--border] bg-white p-4">
                <p className="eyebrow">Selected Residence</p>
                <h3 className="display-title mt-2 text-3xl leading-tight">
                  {selectedUnit.label}
                </h3>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    { label: "Area", value: `${selectedUnit.area} sq ft`, icon: Ruler },
                    { label: "Price", value: selectedUnit.price, icon: BadgeIndianRupee },
                    { label: "Best Suited For", value: selectedUnit.bestFor, icon: Sparkles },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="rounded-md bg-[rgba(234,28,41,0.055)] p-3">
                        <Icon className="size-5 text-[--accent]" />
                        <p className="mt-2 text-xs font-bold text-[--foreground-muted]">{item.label}</p>
                        <p className="mt-1 text-sm font-bold leading-5">{item.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Button onClick={() => openLeadDialog("price-sheet", "unit-cost", "Configurations", selectedUnit.label)}>
                    Get Exact Cost
                  </Button>
                  <Button variant="secondary" onClick={() => openLeadDialog("floor-plans", "unit-plan", "Configurations", selectedUnit.label)}>
                    Get Selected Plan
                  </Button>
                  <Button variant="outline" onClick={() => openLeadDialog("site-visit", "unit-visit", "Configurations", selectedUnit.label)}>
                    Book Visit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="pricing">
          <div data-reveal className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionIntro
              eyebrow="Price Guidance"
              title="Indicative pricing with a clear cost-sheet path"
              body="Public prices can change with inventory, view and release stage. Use this guidance for shortlisting and request the latest cost sheet before making a decision."
            />
            <div>
              <div className="grid gap-3 sm:grid-cols-2">
                {content.pricing.cards.map((card) => (
                  <article key={card.configuration} className="rounded-lg border border-[--border] bg-white p-4">
                    <p className="text-sm font-bold text-[--accent]">{card.configuration}</p>
                    <h3 className="mt-2 text-2xl font-bold">{card.price}</h3>
                    <p className="mt-1 text-sm text-[--foreground-muted]">{card.area}</p>
                  </article>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-[--border] bg-[rgba(234,28,41,0.055)] p-4">
                <p className="text-sm leading-6 text-[--foreground-muted]">
                  *{content.project.priceDisclaimer} Entry pricing can be tied to
                  limited inventory and should be verified before booking.
                </p>
                <Button className="mt-3" onClick={() => openLeadDialog("price-sheet", "pricing-cost-sheet", "Pricing")}>
                  <BadgeIndianRupee className="size-4" />
                  Request Full Cost Sheet
                </Button>
              </div>
            </div>
          </div>
        </Section>

        <Section id="floor-plans" className="bg-[rgba(234,28,41,0.035)]">
          <div data-reveal>
            <SectionIntro
              eyebrow="Floor Plans"
              title="Preview plans by residence type"
              body="Each plan can be opened for a closer look or sent directly for review."
            />
            <div className="mt-5 grid gap-4 lg:grid-cols-[16rem_1fr]">
              <div className="hide-scrollbar flex gap-2 overflow-x-auto lg:block lg:space-y-2 lg:overflow-visible">
                {content.units.map((unit, index) => (
                  <button
                    key={unit.name}
                    type="button"
                    onClick={() => handleUnitSelect(index)}
                    className={`w-36 shrink-0 rounded-lg border px-3 py-3 text-left text-sm font-bold transition lg:w-full ${
                      activeUnit === index
                        ? "border-[--accent] bg-[--accent] text-white"
                        : "border-[--border] bg-white hover:border-[--accent]"
                    }`}
                  >
                    {unit.label}
                    <span className="mt-1 block text-xs font-semibold">{unit.area} sq ft</span>
                  </button>
                ))}
              </div>

              <div className="rounded-lg border border-[--border] bg-white p-3">
                <Link
                  href={formatAssetPath(selectedUnit.image)}
                  target="_blank"
                  onClick={() =>
                    trackEvent("floor_plan_click", {
                      source: "floor-plan-preview",
                      section: "Floor Plans",
                      unitSelected: selectedUnit.label,
                    })
                  }
                  className="block"
                >
                  <div className="relative aspect-[5/3] overflow-hidden rounded-md bg-white">
                    <Image
                      src={formatAssetPath(selectedUnit.image)}
                      alt={`${selectedUnit.label} floor plan`}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="object-contain"
                    />
                  </div>
                </Link>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{selectedUnit.label}</h3>
                    <p className="text-sm text-[--foreground-muted]">{selectedUnit.area} sq ft</p>
                  </div>
                  <Button onClick={() => openLeadDialog("floor-plans", "send-this-plan", "Floor Plans", selectedUnit.label)}>
                    <Mail className="size-4" />
                    Send This Plan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="experience">
          <div data-reveal className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionIntro
                eyebrow="Master Plan & Amenities"
                title="A landscape-first community experience"
                body="The project story is strongest when the gardens, trails, club life and everyday outdoor moments are seen together."
              />
              <div className="mt-5 overflow-hidden rounded-lg">
                <Image
                  src={formatAssetPath(content.project.masterPlanImage)}
                  alt="Nikoo Homes 8 master plan"
                  width={1400}
                  height={1000}
                  className="h-full max-h-[28rem] w-full object-cover"
                />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-lg border border-[--border] bg-white p-4">
                <h3 className="text-lg font-bold">Signature landscape moments</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {content.masterPlan.markers.slice(0, 8).map((marker) => (
                    <div key={marker} className="flex items-center gap-2 rounded-md bg-[rgba(234,28,41,0.055)] px-3 py-2">
                      <Trees className="size-4 shrink-0 text-[--accent]" />
                      <p className="text-sm font-semibold">{marker}</p>
                    </div>
                  ))}
                </div>
              </div>

              {content.amenities.categories.map((category) => {
                const Icon =
                  amenityIcons[category.name as keyof typeof amenityIcons] ?? CheckCircle2;

                return (
                  <article key={category.name} className="rounded-lg border border-[--border] bg-white p-4">
                    <div className="flex items-center gap-2">
                      <Icon className="size-6 text-[--accent]" />
                      <h3 className="text-lg font-bold">{category.name}</h3>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {category.items.map((item) => (
                        <p key={item} className="flex items-start gap-2 text-sm leading-5 text-[--foreground-muted]">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[--accent]" />
                          {item}
                        </p>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </Section>

        <Section id="location" className="bg-[rgba(234,28,41,0.035)]">
          <div data-reveal>
            <SectionIntro
              eyebrow="Location Advantages"
              title="Practical access around Thanisandra and Bhartiya City"
              body="Use the location view to compare school, retail, work and travel anchors that matter in everyday decision-making."
            />

            <div className="mt-5 grid gap-4 lg:grid-cols-[17rem_1fr]">
              <div className="hide-scrollbar flex gap-2 overflow-x-auto lg:block lg:space-y-2 lg:overflow-visible">
                {locationGroups.map((group) => {
                  const Icon = group.icon;
                  const isActive = group.label === activeLocationTab;

                  return (
                    <button
                      key={group.label}
                      type="button"
                      onClick={() => {
                        setActiveLocationTab(group.label);
                        trackEvent("location_tab_click", { tab: group.label });
                      }}
                      className={`flex w-40 shrink-0 items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm font-bold transition lg:w-full ${
                        isActive
                          ? "border-[--accent] bg-[--accent] text-white"
                          : "border-[--border] bg-white hover:border-[--accent]"
                      }`}
                    >
                      <Icon className="size-5 shrink-0" />
                      {group.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {selectedLocation.items.map((item) => (
                  <article key={item} className="rounded-lg border border-[--border] bg-white p-4">
                    <MapPin className="size-5 text-[--accent]" />
                    <p className="mt-3 text-base font-bold">{item}</p>
                    <p className="mt-2 text-sm leading-6 text-[--foreground-muted]">
                      Useful location reference for buyers evaluating North
                      Bengaluru access and daily convenience.
                    </p>
                  </article>
                ))}
                <Button asChild variant="outline">
                  <Link href={content.location.mapUrl} target="_blank">
                    <MapPin className="size-4" />
                    Open Map
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div data-reveal className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <SectionIntro
                eyebrow="About Developer"
                title="Bhartiya Urban and the Nikoo Homes ecosystem"
                body="Nikoo Homes is part of the Bhartiya Urban residential ecosystem, known for township-led living, community planning and a strong North Bengaluru presence."
              />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "Bhartiya City ecosystem",
                  "Residential, retail and social infrastructure context",
                  "Garden-led planning language",
                  "North Bengaluru growth corridor",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg border border-[--border] bg-white p-3">
                    <CheckCircle2 className="size-5 text-[--accent]" />
                    <p className="text-sm font-bold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-lg">
              <Image
                src={formatAssetPath(content.project.townshipImage)}
                alt="Bhartiya City township context"
                width={1400}
                height={1000}
                className="h-full max-h-[28rem] w-full object-cover"
              />
            </div>
          </div>
        </Section>

        <Section id="faq" className="bg-[rgba(234,28,41,0.035)]">
          <div data-reveal className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <SectionIntro
              eyebrow="FAQ"
              title="Clear answers before you enquire"
              body="Review location, RERA, pricing and visit details before requesting the next step."
            />
            <Accordion type="single" collapsible className="space-y-2">
              {content.faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={`faq-${index}`}
                  onClick={() => trackEvent("faq_interaction", { question: faq.question })}
                >
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
              <AccordionItem value="operator-role" onClick={() => trackEvent("faq_interaction", { question: "Who operates this enquiry page?" })}>
                <AccordionTrigger>Who operates this enquiry page?</AccordionTrigger>
                <AccordionContent>{operatorDisclosure}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Section>

        <Section id="contact">
          <div data-reveal className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="eyebrow">Next Step</p>
              <h2 className="display-title mt-2 text-4xl leading-tight md:text-6xl">
                Request pricing, plans or a guided visit
              </h2>
              <p className="section-copy mt-3">
                Choose what you need and the team can follow up with the latest
                price sheet, brochure, selected floor plans or a convenient site
                visit slot.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {["Price Sheet", "Brochure", "Floor Plans", "Site Visit"].map((item) => (
                  <div key={item} className="rounded-lg border border-[--border] bg-white p-3 text-sm font-bold">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[--border] bg-white p-4 shadow-[0_18px_40px_rgba(234,28,41,0.09)] md:p-5">
              <LeadForm
                defaultIntent="site-visit"
                defaultUnit={selectedUnit.label}
                formId="final-lead"
                showNote
                onSubmit={(values) => handleLeadSubmit(values, "final-form", "Final Lead Capture")}
              />
            </div>
          </div>
        </Section>
      </main>

      <footer className="border-t border-[--border] bg-[--surface-strong] text-white">
        <div className="section-shell grid gap-6 py-7 lg:grid-cols-[1fr_1fr]">
          <div>
            <Image
              src="/nikoo/logo-red.png"
              alt="Nikoo Homes"
              width={151}
              height={65}
              className="h-10 w-auto rounded-md bg-white px-2 py-1"
            />
            <h2 className="display-title mt-4 text-3xl text-white">
              {content.project.publicTitle}
            </h2>
            <p className="mt-2 text-sm text-white/78">{content.project.location}</p>
            <p className="mt-4 text-sm leading-6 text-white/72">
              {operatorDisclosure}
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-lg border border-white/14 p-3">
              <p className="text-xs font-bold text-white/72">RERA</p>
              <p className="mt-2 text-sm font-semibold">Phase 1: {content.project.rera.phase1}</p>
              <p className="mt-1 text-sm font-semibold">Phase 2: {content.project.rera.phase2}</p>
            </div>
            <div className="rounded-lg border border-white/14 p-3">
              <p className="text-xs font-bold text-white/72">Disclaimer</p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                {content.project.priceDisclaimer} Availability, promoter details,
                floor plans, specifications, possession timelines and legal
                disclosures should be verified before any purchase decision.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-white/72">
              <span>Privacy Policy</span>
              <span>Terms</span>
              <span>Cookies</span>
              <span>Copyright 2026</span>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[--border] bg-white p-2 shadow-[0_-12px_24px_rgba(0,0,0,0.08)] md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Call", icon: PhoneCall, intent: "site-visit" as LeadIntent, source: "mobile-call" },
            { label: "WhatsApp", icon: MessageCircle, intent: "whatsapp" as LeadIntent, source: "mobile-whatsapp" },
            { label: "Price", icon: BadgeIndianRupee, intent: "price-sheet" as LeadIntent, source: "mobile-price" },
            { label: "Visit", icon: CalendarRange, intent: "site-visit" as LeadIntent, source: "mobile-visit" },
          ].map((item) => {
            const Icon = item.icon;
            const isWhatsApp = item.intent === "whatsapp";

            if (isWhatsApp) {
              return (
                <a
                  key={item.label}
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleWhatsAppClick(item.source, "Mobile Sticky")}
                  className="flex min-h-12 flex-col items-center justify-center rounded-md bg-[--accent] text-xs font-bold text-white"
                >
                  <Icon className="size-4" />
                  {item.label}
                </a>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => openLeadDialog(item.intent, item.source, "Mobile Sticky")}
                className="flex min-h-12 flex-col items-center justify-center rounded-md border border-[--border] bg-white text-xs font-bold text-[--foreground]"
              >
                <Icon className="size-4 text-[--accent]" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <div className="grid gap-2 rounded-lg bg-[--accent] p-2 shadow-[0_20px_40px_rgba(234,28,41,0.22)]">
          {[
            { label: "Price Sheet", icon: BadgeIndianRupee, intent: "price-sheet" as LeadIntent },
            { label: "Floor Plans", icon: Mail, intent: "floor-plans" as LeadIntent },
            { label: "Book Visit", icon: CalendarRange, intent: "site-visit" as LeadIntent },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => openLeadDialog(item.intent, `rail-${item.intent}`, "Desktop Rail")}
                className="group flex w-40 items-center gap-2 rounded-md bg-white px-3 py-2.5 text-left text-xs font-bold text-[--accent-strong] transition hover:-translate-x-1"
              >
                <Icon className="size-4" />
                {item.label}
                <ChevronRight className="ml-auto size-4 transition group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={Boolean(activeDialog)} onOpenChange={(open) => !open && setLeadDialog(null)}>
        <DialogContent>
          {activeDialog ? (
            <>
              <DialogHeader>
                <p className="eyebrow">Project Desk</p>
                <DialogTitle>{activeDialog.copy.title}</DialogTitle>
                <DialogDescription>{activeDialog.copy.description}</DialogDescription>
              </DialogHeader>
              <LeadForm
                key={`${activeDialog.intent}-${activeDialog.source}-${activeDialog.unitLabel ?? "general"}`}
                className="mt-4"
                defaultIntent={activeDialog.intent}
                defaultUnit={activeDialog.unitLabel ?? selectedUnit.label}
                formId="modal-lead"
                showNote
                onSubmit={async (values) => {
                  await handleLeadSubmit(
                    values,
                    activeDialog.source,
                    activeDialog.section,
                    activeDialog.unitLabel,
                  );
                  setLeadDialog(null);
                }}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <div
        className={`fixed left-4 top-4 z-50 rounded-md bg-[--surface-strong] px-4 py-2 text-sm text-white shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        {toast}
      </div>
    </div>
  );
}
