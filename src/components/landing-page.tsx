"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Baby,
  Brain,
  Building2,
  CalendarDays,
  Download,
  Flower2,
  Home,
  Leaf,
  MapPin,
  PhoneCall,
  Route,
  School,
  Sprout,
  TrainFront,
  Trees,
  Trophy,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  amenityHighlights,
  consentText,
  getWhatsAppUrl,
  locationClusters,
  micrositeDisclaimer,
  projectFacts,
  units,
  uspHighlights,
} from "@/data/nikoo-homes-8";
import { getLeadMetadata, trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

gsap.registerPlugin(useGSAP);

type LeadAction = "price_sheet" | "brochure" | "floor_plan" | "site_visit";
type ModalKind = LeadAction | "instant_call";
type Unit = (typeof units)[number];

type HiddenLeadFields = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  gclid: string;
  fbclid: string;
  msclkid: string;
  landing_page: string;
  referrer: string;
  cta_source: string;
  form_name: string;
  device_type: string;
  timestamp: string;
};

type LeadModal = {
  kind: ModalKind;
  ctaSource: string;
  title: string;
  description: string;
  unit: Unit;
  prefillEmail?: string;
};

const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Enter a valid email address.",
  );

const mainLeadFormSchema = z.object({
  lead_name: z.string().trim().min(2, "Please enter your name."),
  lead_phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .regex(/^[0-9+\-\s()]+$/, "Use numbers only."),
  lead_email: optionalEmailSchema,
  lead_unit_type: z.string().min(1, "Please choose an apartment option."),
  lead_consent: z.boolean().refine(Boolean, "Please accept the consent line."),
});

const secondaryLeadFormSchema = z.object({
  lead_name: z.string().trim().min(2, "Please enter your name."),
  lead_phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .regex(/^[0-9+\-\s()]+$/, "Use numbers only."),
  lead_email: optionalEmailSchema,
  lead_consent: z.boolean().refine(Boolean, "Please accept the consent line."),
});

type MainLeadFormValues = z.infer<typeof mainLeadFormSchema>;
type SecondaryLeadFormValues = z.infer<typeof secondaryLeadFormSchema>;

const blankHiddenFields: HiddenLeadFields = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_term: "",
  utm_content: "",
  gclid: "",
  fbclid: "",
  msclkid: "",
  landing_page: "",
  referrer: "",
  cta_source: "",
  form_name: "",
  device_type: "",
  timestamp: "",
};

const primaryUnit = units.find((unit) => unit.primary) ?? units[0];

const amenityIcons = {
  "Quiet Trail": Route,
  "Community Garden": Sprout,
  "Children's Play Area": Baby,
  "Meditation Garden": Brain,
  "Aroma Garden": Flower2,
  "Sensory Garden": Leaf,
  "Living Canopy": Trees,
  "Tennis Court": Trophy,
} as const;

const uspIcons = {
  "Township-backed living": Building2,
  "Wide configuration ladder": Home,
  "Garden-led planning": Leaf,
  "North Bengaluru access": Route,
} as const;

const locationIcons = {
  Landmarks: Building2,
  Education: School,
  Transit: TrainFront,
  Airport: MapPin,
} as const;

const actionLabels: Record<LeadAction, string> = {
  price_sheet: "Get Price Details",
  brochure: "Get Brochure",
  floor_plan: "Get Enquire",
  site_visit: "Book Site Visit",
};

function getStartingPrice(price: string) {
  if (price === "On Request") {
    return price;
  }

  const [startingPrice] = price.split(" - ");
  return startingPrice.endsWith("*") ? startingPrice : `${startingPrice}*`;
}

function buildWhatsAppMessage(action: LeadAction, unitLabel: string) {
  const intentText: Record<LeadAction, string> = {
    price_sheet: "latest price details",
    brochure: "project brochure",
    floor_plan: "selected floor plan",
    site_visit: "site visit appointment",
  };

  return `I am interested in ${projectFacts.publicTitle}. Please share the ${intentText[action]} for ${unitLabel}.`;
}

async function submitLead(payload: Record<string, unknown>) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Lead submission failed");
  }

  return response.json();
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-4xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display-title mt-3 text-[2.2rem] leading-[0.95] tracking-[-0.05em] md:text-[3.2rem]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)] md:text-base md:leading-7">
        {body}
      </p>
    </div>
  );
}

function MainLeadForm({
  hiddenBase,
  formName,
  ctaSource,
  selectedUnit,
  submitLabel,
  compact = false,
}: {
  hiddenBase: HiddenLeadFields;
  formName: string;
  ctaSource: string;
  selectedUnit: Unit;
  submitLabel: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [started, setStarted] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<MainLeadFormValues>({
    resolver: zodResolver(mainLeadFormSchema),
    defaultValues: {
      lead_name: "",
      lead_phone: "",
      lead_email: "",
      lead_unit_type: selectedUnit.label,
      lead_consent: false,
    },
  });

  useEffect(() => {
    setValue("lead_unit_type", selectedUnit.label);
  }, [selectedUnit.label, setValue]);

  const onFocus = () => {
    if (started) {
      return;
    }

    setStarted(true);
    trackEvent("lead_form_start", {
      form_name: formName,
      cta_source: ctaSource,
      unit_type: selectedUnit.label,
    });
  };

  const onSubmit = async (values: MainLeadFormValues) => {
    setStatus("idle");
    trackEvent("lead_form_submit", {
      form_name: formName,
      cta_source: ctaSource,
      lead_action: "price_sheet",
      unit_type: values.lead_unit_type,
    });

    try {
      await submitLead({
        ...hiddenBase,
        cta_source: ctaSource,
        form_name: formName,
        timestamp: new Date().toISOString(),
        lead_action: "price_sheet",
        lead_name: values.lead_name,
        lead_phone: values.lead_phone,
        lead_unit_type: values.lead_unit_type,
        name: values.lead_name,
        phone: values.lead_phone,
        email: values.lead_email || undefined,
        interestedIn: values.lead_unit_type,
        preferredAction: "price_sheet",
        source: ctaSource,
        metadata: getLeadMetadata({
          ctaSource,
          pageSection: formName,
          preferredAction: "price_sheet",
          unitSelected: values.lead_unit_type,
        }),
      });
      setStatus("success");
      reset({
        lead_name: "",
        lead_phone: "",
        lead_email: "",
        lead_unit_type: selectedUnit.label,
        lead_consent: false,
      });
      window.open(
        getWhatsAppUrl(buildWhatsAppMessage("price_sheet", values.lead_unit_type)),
        "_blank",
        "noopener,noreferrer",
      );
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className={`mt-4 grid ${compact ? "gap-2.5" : "gap-3"}`} onFocus={onFocus} onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2.5 md:grid-cols-2">
        <div>
          <label className="form-label text-[var(--foreground)]" htmlFor={`${formName}-name`}>
            Name
          </label>
          <input id={`${formName}-name`} className="compact-input" autoComplete="name" {...register("lead_name")} />
          {errors.lead_name ? <p className="form-error">{errors.lead_name.message}</p> : null}
        </div>
        <div>
          <label className="form-label text-[var(--foreground)]" htmlFor={`${formName}-phone`}>
            Number
          </label>
          <input
            id={`${formName}-phone`}
            className="compact-input"
            autoComplete="tel"
            inputMode="numeric"
            {...register("lead_phone")}
          />
          {errors.lead_phone ? <p className="form-error">{errors.lead_phone.message}</p> : null}
        </div>
      </div>
      <div className="grid gap-2.5 md:grid-cols-[1fr_0.95fr]">
        <div>
          <label className="form-label text-[var(--foreground)]" htmlFor={`${formName}-email`}>
            Email (optional)
          </label>
          <input
            id={`${formName}-email`}
            className="compact-input"
            autoComplete="email"
            inputMode="email"
            {...register("lead_email")}
          />
          {errors.lead_email ? <p className="form-error">{errors.lead_email.message}</p> : null}
        </div>
        <div>
          <label className="form-label text-[var(--foreground)]" htmlFor={`${formName}-unit`}>
            Interested in
          </label>
          <select id={`${formName}-unit`} className="compact-input" {...register("lead_unit_type")}>
            {units.map((unit) => (
              <option key={unit.slug} value={unit.label}>
                {unit.label}
              </option>
            ))}
          </select>
          {errors.lead_unit_type ? <p className="form-error">{errors.lead_unit_type.message}</p> : null}
        </div>
      </div>
      <label className="flex items-start gap-2 text-[0.72rem] leading-5 text-[var(--foreground-muted)]" htmlFor={`${formName}-consent`}>
        <input id={`${formName}-consent`} className="mt-1 size-4 accent-[var(--brand-red)]" type="checkbox" {...register("lead_consent")} />
        <span>{consentText}</span>
      </label>
      {errors.lead_consent ? <p className="form-error">{errors.lead_consent.message}</p> : null}
      <Button
        type="submit"
        className={`w-full bg-[var(--cta-blue)] text-white hover:bg-[var(--cta-blue-strong)] ${compact ? "min-h-11" : "min-h-12"}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : submitLabel}
      </Button>
      {!compact ? (
        <p className="text-[0.72rem] leading-5 text-[var(--foreground-muted)]">
          Your details are used only to share project information, brochure access and callback support.
        </p>
      ) : null}
      {status === "success" ? <p className="text-sm font-semibold text-[var(--brand-red)]">Thank you. Our team will continue on WhatsApp shortly.</p> : null}
      {status === "error" ? (
        <p className="text-sm text-[var(--foreground-muted)]">
          We could not submit right now. Please call{" "}
          <a className="font-semibold text-[var(--brand-red)]" href={projectFacts.contactHref}>
            {projectFacts.contactNumber}
          </a>
          .
        </p>
      ) : null}
    </form>
  );
}

function SecondaryLeadForm({
  hiddenBase,
  formName,
  ctaSource,
  selectedUnit,
  action,
  submitLabel,
  initialEmail,
}: {
  hiddenBase: HiddenLeadFields;
  formName: string;
  ctaSource: string;
  selectedUnit: Unit;
  action: LeadAction;
  submitLabel: string;
  initialEmail?: string;
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<SecondaryLeadFormValues>({
    resolver: zodResolver(secondaryLeadFormSchema),
    defaultValues: {
      lead_name: "",
      lead_phone: "",
      lead_email: initialEmail ?? "",
      lead_consent: false,
    },
  });

  useEffect(() => {
    reset({
      lead_name: "",
      lead_phone: "",
      lead_email: initialEmail ?? "",
      lead_consent: false,
    });
  }, [initialEmail, reset]);

  const onSubmit = async (values: SecondaryLeadFormValues) => {
    setStatus("idle");

    try {
      await submitLead({
        ...hiddenBase,
        cta_source: ctaSource,
        form_name: formName,
        timestamp: new Date().toISOString(),
        lead_action: action,
        lead_name: values.lead_name,
        lead_phone: values.lead_phone,
        lead_unit_type: selectedUnit.label,
        name: values.lead_name,
        phone: values.lead_phone,
        email: values.lead_email || undefined,
        interestedIn: selectedUnit.label,
        preferredAction: action,
        source: ctaSource,
        metadata: getLeadMetadata({
          ctaSource,
          pageSection: formName,
          preferredAction: action,
          unitSelected: selectedUnit.label,
        }),
      });
      setStatus("success");
      reset({
        lead_name: "",
        lead_phone: "",
        lead_email: initialEmail ?? "",
        lead_consent: false,
      });
      window.open(
        getWhatsAppUrl(buildWhatsAppMessage(action, selectedUnit.label)),
        "_blank",
        "noopener,noreferrer",
      );
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="form-label" htmlFor={`${formName}-name`}>
          Name
        </label>
        <input id={`${formName}-name`} className="compact-input" autoComplete="name" {...register("lead_name")} />
        {errors.lead_name ? <p className="form-error">{errors.lead_name.message}</p> : null}
      </div>
      <div>
        <label className="form-label" htmlFor={`${formName}-phone`}>
          Number
        </label>
        <input
          id={`${formName}-phone`}
          className="compact-input"
          autoComplete="tel"
          inputMode="numeric"
          {...register("lead_phone")}
        />
        {errors.lead_phone ? <p className="form-error">{errors.lead_phone.message}</p> : null}
      </div>
      <div>
        <label className="form-label" htmlFor={`${formName}-email`}>
          Email (optional)
        </label>
        <input
          id={`${formName}-email`}
          className="compact-input"
          autoComplete="email"
          inputMode="email"
          {...register("lead_email")}
        />
        {errors.lead_email ? <p className="form-error">{errors.lead_email.message}</p> : null}
      </div>
      <label className="flex items-start gap-2 text-[0.72rem] leading-5 text-[var(--foreground-muted)]" htmlFor={`${formName}-consent`}>
        <input id={`${formName}-consent`} className="mt-1 size-4 accent-[var(--brand-red)]" type="checkbox" {...register("lead_consent")} />
        <span>{consentText}</span>
      </label>
      {errors.lead_consent ? <p className="form-error">{errors.lead_consent.message}</p> : null}
      <Button type="submit" className="min-h-12 w-full bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-strong)]" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : submitLabel}
      </Button>
      <p className="text-[0.72rem] leading-5 text-[var(--foreground-muted)]">
        Your details stay limited to this project enquiry and callback coordination.
      </p>
      {status === "success" ? <p className="text-sm font-semibold text-[var(--brand-red)]">Thank you. We have your request and will connect shortly.</p> : null}
      {status === "error" ? (
        <p className="text-sm text-[var(--foreground-muted)]">
          Submission failed just now. Please call{" "}
          <a className="font-semibold text-[var(--brand-red)]" href={projectFacts.contactHref}>
            {projectFacts.contactNumber}
          </a>
          .
        </p>
      ) : null}
    </form>
  );
}

export function LandingPage() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit>(primaryUnit);
  const [leadModal, setLeadModal] = useState<LeadModal | null>(null);
  const [activeLocationCategory, setActiveLocationCategory] = useState<
    (typeof locationClusters)[number]["label"]
  >(locationClusters[0]?.label ?? "Landmarks");
  const [footerEmail, setFooterEmail] = useState("");

  const hiddenBase = useMemo<HiddenLeadFields>(() => {
    if (typeof window === "undefined") {
      return blankHiddenFields;
    }

    const params = new URLSearchParams(window.location.search);
    const deviceType = window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";

    return {
      utm_source: params.get("utm_source") ?? "",
      utm_medium: params.get("utm_medium") ?? "",
      utm_campaign: params.get("utm_campaign") ?? "",
      utm_term: params.get("utm_term") ?? "",
      utm_content: params.get("utm_content") ?? "",
      gclid: params.get("gclid") ?? "",
      fbclid: params.get("fbclid") ?? "",
      msclkid: params.get("msclkid") ?? "",
      landing_page: window.location.href,
      referrer: document.referrer,
      cta_source: "",
      form_name: "",
      device_type: deviceType,
      timestamp: new Date().toISOString(),
    };
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        .from(".site-nav-shell", { autoAlpha: 0, y: -12, duration: 0.35 })
        .from(".hero-entry", { autoAlpha: 0, y: 24, duration: 0.5, stagger: 0.08 }, "-=0.1");
    },
    { scope: shellRef },
  );

  const selectedStartingPrice = useMemo(() => getStartingPrice(selectedUnit.price), [selectedUnit.price]);
  const modalLeadAction: LeadAction =
    leadModal?.kind && leadModal.kind !== "instant_call" ? leadModal.kind : "price_sheet";

  const openLeadModal = (
    kind: ModalKind,
    ctaSource: string,
    title: string,
    description: string,
    unit = selectedUnit,
    prefillEmail?: string,
  ) => {
    setLeadModal({
      kind,
      ctaSource,
      title,
      description,
      unit,
      prefillEmail,
    });
  };

  const handleCallClick = (source: string) => {
    trackEvent("cta_call_click", { cta_source: source, unit_type: selectedUnit.label });
  };

  const handleWhatsAppClick = (source: string) => {
    trackEvent("cta_whatsapp_click", { cta_source: source, unit_type: selectedUnit.label });
  };

  return (
    <div ref={shellRef} className="bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-40 bg-[var(--surface)] shadow-[0_16px_28px_rgba(22,18,20,0.08),0_6px_0_rgba(255,255,255,0.88)]">
        <div className="section-shell py-3">
          <div className="site-nav-shell flex items-center justify-between gap-3">
            <a href="#hero" className="flex min-w-0 items-center gap-3" aria-label="Nikoo Homes 8 home">
              <Image src="/nikoo/logo-red.png" alt="Nikoo Homes logo" width={151} height={65} className="h-9 w-auto" priority />
              <div className="hidden lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-red)]">Bhartiya City</p>
                <p className="text-sm text-[var(--foreground-muted)]">Thanisandra Main Road, North Bengaluru</p>
              </div>
            </a>
            <nav className="hidden items-center gap-1 text-sm font-semibold lg:flex" aria-label="Main navigation">
              {[
                ["Why Nikoo 8", "#overview"],
                ["Floor Plans", "#floorplans"],
                ["Amenities", "#amenities"],
                ["Location", "#location"],
                ["Enquire", "#final-enquiry"],
              ].map(([label, href]) => (
                <a key={href} href={href} className="rounded-full px-4 py-2 text-[var(--foreground-muted)] transition hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]">
                  {label}
                </a>
              ))}
            </nav>
            <Button
              className="bg-[var(--cta-blue)] text-white hover:bg-[var(--cta-blue-strong)]"
              size="sm"
              onClick={() =>
                openLeadModal(
                  "price_sheet",
                  "header-enquire",
                  "Request price details",
                  "Share your details and we will send the current price guidance for your preferred apartment option.",
                )
              }
            >
              Enquire
            </Button>
          </div>
        </div>
      </header>

      <main className="pb-24 lg:pb-10">
        <section id="hero" className="relative overflow-hidden bg-black">
          <Image src={projectFacts.images.hero} alt="Nikoo Homes 8 hero view" fill sizes="100vw" className="object-cover object-center" priority />
          <div className="section-shell relative grid min-h-[84svh] gap-4 py-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="hero-entry self-start pt-6 text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)] md:max-w-[42rem] md:pt-12 lg:pt-18">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--brand-cream)]">Bhartiya City presents</p>
              <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(3rem,6vw,5.8rem)] leading-[0.88] tracking-[-0.05em] text-[#fff8f2]">
                Nikoo Homes 8
              </h1>
              <p className="mt-3 max-w-[18ch] text-[1.05rem] font-semibold leading-7 text-[#fff4ee] md:text-[1.35rem] md:leading-8">
                Garden residences shaped for the Thanisandra growth corridor.
              </p>
              <div className="mt-6 grid max-w-3xl gap-3 text-sm font-semibold leading-6 text-[#fff4ee] md:grid-cols-3">
                {[
                  "11-acre launch planned across 2 RERA phases",
                  "Studio to 4 BHK + Staff within a township address",
                  "5 min to Bhartiya City and 10 min to Manyata Tech Park",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--brand-red)]" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-entry w-full rounded-[1.8rem] bg-[var(--surface)] p-4 shadow-[0_28px_80px_rgba(71,8,13,0.18)] md:p-5 lg:ml-auto lg:max-w-[23rem]">
              <div className="rounded-[1.2rem] bg-[var(--brand-red)] px-4 py-3 text-[var(--ink-inverse)]">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-cream)]">Main Enquiry</p>
                <h2 className="mt-2 text-[1.2rem] font-semibold leading-tight text-[var(--ink-inverse)]">
                  Get exact availability, brochure and visit support.
                </h2>
              </div>
              <MainLeadForm hiddenBase={hiddenBase} formName="hero" ctaSource="hero-main-form" selectedUnit={selectedUnit} submitLabel="Get Price Details" compact />
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => openLeadModal("brochure", "hero-brochure", "Request brochure", "Share your details to receive the brochure link for Nikoo Homes 8.")}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--cta-red)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--cta-red-strong)]"
                >
                  <Download className="size-4" />
                  Brochure
                </button>
                <button
                  type="button"
                  onClick={() => openLeadModal("site_visit", "hero-site-visit", "Book a site visit", "Tell us how to reach you and we will coordinate a guided site visit.")}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--cta-blue)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--cta-blue-strong)]"
                >
                  <CalendarDays className="size-4" />
                  Site Visit
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="overview" className="bg-[var(--background)]">
          <div className="section-shell py-12 md:py-16">
            <SectionHeader eyebrow="Why choose Nikoo 8" title="Why Choose Nikoo 8" body="A cleaner read of the reasons buyers compare first before they enquire." />
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
              <div className="relative overflow-hidden rounded-[1.8rem] shadow-[0_22px_60px_rgba(71,8,13,0.1)]">
                <Image src={projectFacts.images.hero} alt="Garden-led living at Nikoo Homes 8" width={1200} height={1400} className="h-[22rem] w-full object-cover md:h-[30rem]" />
              </div>
              <div className="space-y-6">
                {uspHighlights.map((item, index) => {
                  const Icon = uspIcons[item.title as keyof typeof uspIcons];
                  return (
                    <article key={item.title} className="grid grid-cols-[auto_1fr] gap-4 md:gap-5">
                      <p className="display-title text-[2.4rem] leading-none text-[var(--brand-red)] md:text-[3.25rem]">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <div className="pt-1">
                        <div className="flex items-center gap-3">
                          <Icon className="size-5 text-[var(--brand-red)]" />
                          <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-[1.35rem]">{item.title}</h3>
                        </div>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--foreground-muted)] md:text-base md:leading-7">{item.text}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="floorplans" className="bg-[var(--surface-alt)]">
          <div className="section-shell py-12 md:py-16">
            <SectionHeader
              eyebrow="Floor plans"
              title="Keep the choice visible, then compare only the essentials."
              body="Every apartment option stays in one selection column while the selected plan and quick details stay on the right."
            />
            <div className="mt-8 rounded-[2rem] bg-[var(--surface)] p-4 shadow-[0_24px_70px_rgba(71,8,13,0.08)] md:p-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:items-stretch">
                <div className="flex flex-col justify-between gap-5">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-2">
                    {units.map((unit) => (
                      <button
                        key={unit.slug}
                        type="button"
                        onClick={() => setSelectedUnit(unit)}
                        className={`min-h-11 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                          selectedUnit.slug === unit.slug
                            ? "bg-[var(--brand-red)] text-white shadow-[0_16px_36px_rgba(128,26,32,0.18)]"
                            : "bg-[var(--surface-alt)] text-[var(--foreground)] hover:bg-[#f7dfda]"
                        }`}
                      >
                        {unit.label}
                      </button>
                    ))}
                  </div>

                  <Button
                    className="min-h-12 w-full bg-[var(--cta-blue)] text-white hover:bg-[var(--cta-blue-strong)]"
                    onClick={() =>
                      openLeadModal(
                        "floor_plan",
                        "floorplan-enquire",
                        `Request ${selectedUnit.label} floor plan`,
                        "Share your details and we will send the selected apartment plan with the current availability guidance.",
                        selectedUnit,
                      )
                    }
                  >
                    Get Enquire
                  </Button>
                </div>

                <div className="grid gap-4 p-1 lg:grid-cols-[0.22fr_0.78fr]">
                  <div key={`${selectedUnit.slug}-details`} className="grid content-start gap-4 self-start p-3 animate-[fade-in_220ms_ease]">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground-muted)]">Selected option</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{selectedUnit.label}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground-muted)]">Starting price</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{selectedStartingPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground-muted)]">Saleable area</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{selectedUnit.saleableArea} sq ft</p>
                    </div>
                  </div>
                  <div className="relative flex min-h-[24rem] items-center justify-center overflow-hidden">
                    <div className="absolute left-4 top-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">Floor plan view</div>
                    <Image
                      key={`${selectedUnit.slug}-image`}
                      src={selectedUnit.image}
                      alt={`${selectedUnit.label} floor plan`}
                      width={1400}
                      height={1050}
                      className="h-full max-h-[34rem] w-full animate-[fade-in_220ms_ease] object-contain p-4 md:p-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="amenities" className="bg-[var(--background)]">
          <div className="section-shell py-12 md:py-16">
            <div className="text-center">
              <p className="eyebrow">AMENITIES</p>
              <h2 className="display-title mt-3 text-[2.2rem] leading-[0.95] tracking-[-0.05em] md:text-[3.2rem]">AMENITIES</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)] md:text-base">
                The outdoor story stays smooth, open and easy to scan.
              </p>
            </div>
            <div className="mt-8 overflow-hidden rounded-[1.8rem] bg-[var(--surface)] shadow-[0_22px_60px_rgba(71,8,13,0.08)]">
              <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                {amenityHighlights.map((item, index) => {
                  const Icon = amenityIcons[item.label as keyof typeof amenityIcons];
                  const isLastColDesktop = (index + 1) % 4 === 0;
                  const isLastRow = index >= amenityHighlights.length - 4;

                  return (
                    <article
                      key={item.label}
                      className={`flex min-h-56 flex-col items-center justify-center px-5 py-6 text-center ${
                        !isLastColDesktop ? "xl:shadow-[inset_-1px_0_0_0_var(--line)]" : ""
                      } ${!isLastRow ? "shadow-[inset_0_-1px_0_0_var(--line)]" : ""}`}
                    >
                      <Icon className="size-10 text-[var(--brand-red)]" />
                      <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">{item.label}</h3>
                      <p className="mt-2 max-w-[18rem] text-sm leading-6 text-[var(--foreground-muted)]">{item.text}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="location" className="bg-[var(--background)]">
          <div className="section-shell py-12 md:py-16">
            <div className="rounded-[2rem] bg-[var(--surface)] p-4 shadow-[0_28px_80px_rgba(71,8,13,0.08)] md:p-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.96fr] lg:items-start">
                <div>
                  <SectionHeader
                    eyebrow="Location"
                    title="Thanisandra connectivity with the actual map and nearby anchors in one place."
                    body="Keep the live map on the left and compare surrounding destinations by category on the right."
                  />
                  <div className="mt-6 overflow-hidden rounded-[1.7rem] shadow-[0_18px_48px_rgba(71,8,13,0.1)]">
                    <div className="relative bg-[var(--surface-alt)]">
                      <iframe
                        title="Nikoo Homes 8 location map"
                        src="https://www.google.com/maps?q=Nikoo+Homes+8+Thanisandra+Main+Road+Bengaluru&z=14&output=embed"
                        className="h-[22rem] w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between gap-4">
                        <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-red)] shadow-[0_14px_30px_rgba(71,8,13,0.08)]">
                          Thanisandra Main Road
                        </div>
                        <a
                          href={projectFacts.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="pointer-events-auto rounded-full bg-[var(--cta-blue)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                        >
                          Open Map
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.7rem] bg-[#fff8f6] p-3 md:p-4">
                  <div className="space-y-3">
                    {locationClusters.map((cluster) => {
                      const Icon = locationIcons[cluster.label as keyof typeof locationIcons];
                      const isOpen = activeLocationCategory === cluster.label;

                      return (
                        <div key={cluster.label} className="overflow-hidden rounded-[1.2rem] bg-[var(--surface)] shadow-[0_10px_30px_rgba(71,8,13,0.05)]">
                          <button type="button" onClick={() => setActiveLocationCategory(cluster.label)} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left">
                            <div className="flex items-center gap-3">
                              <Icon className="size-5 text-[var(--brand-red)]" />
                              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--foreground)]">{cluster.label}</span>
                            </div>
                            <span className="text-xs font-semibold text-[var(--foreground-muted)]">{cluster.items.length} places</span>
                          </button>
                          {isOpen ? (
                            <div className="grid gap-3 px-4 pb-4 animate-[fade-in_220ms_ease]">
                              {cluster.items.map((item) => (
                                <div key={item.name} className="flex items-center justify-between gap-3 rounded-[1rem] bg-[#fff5f2] px-4 py-3">
                                  <span className="text-sm font-medium text-[var(--foreground)]">{item.name}</span>
                                  <span className="rounded-full bg-[var(--brand-red)] px-3 py-1 text-xs font-semibold text-white">{item.time}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="final-enquiry" className="bg-[var(--surface-alt)]">
          <div className="section-shell py-12 md:py-16">
            <div className="grid gap-6 rounded-[2rem] bg-[var(--surface)] p-5 shadow-[0_24px_70px_rgba(71,8,13,0.08)] lg:grid-cols-[0.78fr_1.22fr] lg:p-8">
              <div className="relative pl-4">
                <span className="absolute left-0 top-1 h-24 w-1 rounded-full bg-[var(--brand-red)]" />
                <p className="eyebrow">Final Enquiry</p>
                <h2 className="display-title mt-3 max-w-[14ch] text-[2rem] leading-[0.96] tracking-[-0.05em] md:text-[3rem]">
                  Request the right apartment update without a long form.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--foreground-muted)] md:text-base md:leading-7">
                  Share your preferred apartment option once and we will route the brochure, price guidance or visit support through the right channel.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => openLeadModal("instant_call", "bottom-instant-call", "Speak with the enquiry desk", "Use direct call or WhatsApp right away, or leave your details for a quick callback.")}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--cta-green)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--cta-green-strong)]"
                  >
                    <PhoneCall className="size-4" />
                    Instant Call
                  </button>
                  <button
                    type="button"
                    onClick={() => openLeadModal("brochure", "bottom-brochure", "Request brochure", "Share your details to receive the brochure link for Nikoo Homes 8.")}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--cta-red)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--cta-red-strong)]"
                  >
                    <Download className="size-4" />
                    Brochure
                  </button>
                  <button
                    type="button"
                    onClick={() => openLeadModal("site_visit", "bottom-site-visit", "Book a site visit", "Tell us how to reach you and we will coordinate a guided site visit.")}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--cta-blue)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--cta-blue-strong)]"
                  >
                    <CalendarDays className="size-4" />
                    Site Visit
                  </button>
                </div>
              </div>

              <div className="rounded-[1.6rem] bg-[var(--surface-alt)] p-4 md:p-5">
                <div className="flex items-center gap-4">
                  <Image src="/nikoo/logo-red.png" alt="Nikoo Homes logo" width={151} height={65} className="h-10 w-auto" />
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">Bhartiya City</p>
                    <p className="text-sm text-[var(--foreground-muted)]">Main project enquiry form</p>
                  </div>
                </div>
                <MainLeadForm hiddenBase={hiddenBase} formName="final" ctaSource="final-main-form" selectedUnit={selectedUnit} submitLabel="Send Project Details" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
        <div className="section-shell">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-4">
                <Image src="/nikoo/logo-red.png" alt="Nikoo Homes logo" width={151} height={65} className="h-11 w-auto" />
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--brand-red)]">Bhartiya City</p>
                  <p className="text-sm text-[var(--foreground-muted)]">Nikoo Homes 8</p>
                </div>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
                Nikoo Homes 8 at Bhartiya Garden Enclave on {projectFacts.locationShort}. Request brochure, pricing and site visit support from the project enquiry desk.
              </p>
            </div>

            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--brand-red)]">Get updates</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={footerEmail}
                  onChange={(event) => setFooterEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="compact-input flex-1"
                  inputMode="email"
                />
                <button
                  type="button"
                  onClick={() =>
                    openLeadModal(
                      "brochure",
                      "footer-updates",
                      "Get project updates",
                      "Share the remaining details and we will continue with brochure and project updates.",
                      selectedUnit,
                      footerEmail || undefined,
                    )
                  }
                  className="min-h-11 rounded-full bg-[var(--cta-red)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--cta-red-strong)]"
                >
                  Request Updates
                </button>
              </div>
            </div>

            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--brand-red)]">RERA</p>
              <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">Phase 1: {projectFacts.rera.phase1}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Phase 2: {projectFacts.rera.phase2}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex flex-wrap items-center gap-3 rounded-full bg-[var(--surface-alt)] px-4 py-3 shadow-[0_14px_34px_rgba(71,8,13,0.06)]">
            <a href={projectFacts.contactHref} onClick={() => handleCallClick("footer-call")} className="flex size-11 items-center justify-center rounded-full bg-[var(--cta-blue)] text-white" aria-label="Call">
              <PhoneCall className="size-4" />
            </a>
            <a
              href={getWhatsAppUrl(buildWhatsAppMessage("price_sheet", selectedUnit.label))}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleWhatsAppClick("footer-whatsapp")}
              className="flex size-11 items-center justify-center rounded-full bg-[var(--cta-green)] text-white"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="size-4" />
            </a>
            <a href={projectFacts.socials.facebook} target="_blank" rel="noreferrer" className="flex size-11 items-center justify-center rounded-full bg-white text-[var(--brand-red)]" aria-label="Facebook">
              <FaFacebookF className="size-4" />
            </a>
            <a href={projectFacts.socials.instagram} target="_blank" rel="noreferrer" className="flex size-11 items-center justify-center rounded-full bg-white text-[var(--brand-red)]" aria-label="Instagram">
              <FaInstagram className="size-4" />
            </a>
            </div>
          </div>

          <p className="mt-6 text-xs leading-6 text-[var(--foreground-muted)]">{micrositeDisclaimer}</p>
        </div>
      </footer>

      <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
        <div className="grid grid-cols-3 gap-2 rounded-[1.4rem] bg-[var(--surface)] p-2 shadow-[0_20px_50px_rgba(71,8,13,0.18)]">
          <button
            type="button"
            onClick={() => openLeadModal("instant_call", "mobile-sticky-call", "Instant connect", "Choose direct call or WhatsApp, or leave your details for a fast callback.")}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1rem] bg-[var(--cta-green)] text-white"
          >
            <PhoneCall className="size-4" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em]">Instant Call</span>
          </button>
          <button
            type="button"
            onClick={() => openLeadModal("brochure", "mobile-sticky-brochure", "Request brochure", "Share your details to receive the brochure link for Nikoo Homes 8.")}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1rem] bg-[var(--cta-red)] text-white"
          >
            <Download className="size-4" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em]">Brochure</span>
          </button>
          <button
            type="button"
            onClick={() => openLeadModal("site_visit", "mobile-sticky-visit", "Book a site visit", "Tell us how to reach you and we will coordinate a guided site visit.")}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1rem] bg-[var(--cta-blue)] text-white"
          >
            <CalendarDays className="size-4" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em]">Site Visit</span>
          </button>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-50 hidden flex-col gap-3 lg:flex">
        <button
          type="button"
          aria-label="Instant connect"
          onClick={() => openLeadModal("instant_call", "desktop-sticky-call", "Instant connect", "Choose direct call or WhatsApp, or leave your details for a fast callback.")}
          className="flex size-14 items-center justify-center rounded-full bg-[var(--cta-green)] text-white shadow-[0_18px_40px_rgba(30,120,68,0.22)]"
        >
          <PhoneCall className="size-6" />
        </button>
        <button
          type="button"
          aria-label="Request brochure"
          onClick={() => openLeadModal("brochure", "desktop-sticky-brochure", "Request brochure", "Share your details to receive the brochure link for Nikoo Homes 8.")}
          className="flex size-14 items-center justify-center rounded-full bg-[var(--cta-red)] text-white shadow-[0_18px_40px_rgba(154,23,36,0.22)]"
        >
          <Download className="size-6" />
        </button>
        <button
          type="button"
          aria-label="Book site visit"
          onClick={() => openLeadModal("site_visit", "desktop-sticky-visit", "Book a site visit", "Tell us how to reach you and we will coordinate a guided site visit.")}
          className="flex size-14 items-center justify-center rounded-full bg-[var(--cta-blue)] text-white shadow-[0_18px_40px_rgba(24,86,198,0.22)]"
        >
          <CalendarDays className="size-6" />
        </button>
      </div>

      <Dialog open={Boolean(leadModal)} onOpenChange={(open) => !open && setLeadModal(null)}>
        <DialogContent>
          {leadModal ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Image src="/nikoo/logo-red.png" alt="Nikoo Homes logo" width={151} height={65} className="h-10 w-auto" />
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">Bhartiya City</p>
                    <p className="text-sm text-[var(--foreground-muted)]">Nikoo Homes 8 enquiry desk</p>
                  </div>
                </div>
                <DialogTitle className="mt-2">{leadModal.title}</DialogTitle>
                <DialogDescription>{leadModal.description}</DialogDescription>
              </DialogHeader>

              {leadModal.kind === "instant_call" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <a
                    href={projectFacts.contactHref}
                    onClick={() => handleCallClick(`${leadModal.ctaSource}-call`)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--cta-blue)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--cta-blue-strong)]"
                  >
                    <PhoneCall className="size-4" />
                    Call now
                  </a>
                  <a
                    href={getWhatsAppUrl(buildWhatsAppMessage("price_sheet", leadModal.unit.label))}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleWhatsAppClick(`${leadModal.ctaSource}-whatsapp`)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--cta-green)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--cta-green-strong)]"
                  >
                    <FaWhatsapp className="size-4" />
                    WhatsApp
                  </a>
                </div>
              ) : null}

              <div className="mt-4 rounded-[1.25rem] bg-[var(--surface)] p-4 md:p-5">
                <SecondaryLeadForm
                  hiddenBase={hiddenBase}
                  formName="modal"
                  ctaSource={leadModal.ctaSource}
                  selectedUnit={leadModal.unit}
                  action={modalLeadAction}
                  submitLabel={actionLabels[modalLeadAction]}
                  initialEmail={leadModal.prefillEmail}
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">
                Call us directly:{" "}
                <a className="text-[var(--brand-red)]" href={projectFacts.contactHref}>
                  {projectFacts.contactNumber}
                </a>
              </p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
