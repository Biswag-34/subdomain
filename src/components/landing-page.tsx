"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BadgeIndianRupee,
  CalendarRange,
  ChevronDown,
  Download,
  Home,
  Mail,
  MapPin,
  PhoneCall,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  amenities,
  consentText,
  faqs,
  getWhatsAppUrl,
  micrositeDisclaimer,
  nearbyPlaces,
  pricingSnapshot,
  projectFacts,
  units,
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
import {
  SectionIntro,
  amenityThemes,
  overviewCards,
  placeThemes,
} from "@/components/landing/section-content";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const leadActionSchema = z.enum([
  "price_sheet",
  "brochure",
  "floor_plan",
  "site_visit",
]);

type LeadAction = z.infer<typeof leadActionSchema>;
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
  action: LeadAction;
  ctaSource: string;
  title: string;
  unit?: Unit;
};

const leadFormSchema = z.object({
  lead_name: z.string().trim().min(2, "Please enter your name."),
  lead_phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .regex(/^[0-9+\-\s()]+$/, "Use numbers only."),
  lead_unit_type: z.string().min(1, "Please choose a unit type."),
  lead_action: leadActionSchema,
  lead_callback_time: z.string().optional(),
  lead_consent: z.boolean().refine(Boolean, "Please accept the consent line."),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const actionLabels: Record<LeadAction, string> = {
  price_sheet: "Get Price Sheet on WhatsApp",
  brochure: "Download Brochure",
  floor_plan: "Get This Plan on WhatsApp",
  site_visit: "Book Site Visit",
};

const actionEvents: Record<LeadAction, string> = {
  price_sheet: "price_sheet_request",
  brochure: "brochure_request",
  floor_plan: "floor_plan_request",
  site_visit: "site_visit_request",
};

const primaryUnits = units.filter((unit) => unit.primary);
const additionalUnits = units.filter((unit) => !unit.primary);

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

function getDefaultValues(unit: Unit, action: LeadAction): LeadFormValues {
  return {
    lead_name: "",
    lead_phone: "",
    lead_unit_type: unit.label,
    lead_action: action,
    lead_callback_time: "",
    lead_consent: false,
  };
}

function getHiddenFieldId(formName: string, key: keyof HiddenLeadFields) {
  return formName === "hero" ? key : `${key}_${formName}`;
}

function getFieldId(formName: string, key: keyof LeadFormValues) {
  return formName === "hero" ? key : `${key}_${formName}`;
}

function buildWhatsAppMessage(action: LeadAction, unitLabel: string) {
  const intentText: Record<LeadAction, string> = {
    price_sheet: "latest price sheet",
    brochure: "project brochure",
    floor_plan: "selected floor plan",
    site_visit: "site visit appointment",
  };

  return `I am interested in ${projectFacts.publicTitle}. Please share the ${intentText[action]} for ${unitLabel}.`;
}

async function submitLead(payload: LeadFormValues & HiddenLeadFields) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      name: payload.lead_name,
      phone: payload.lead_phone,
      interestedIn: payload.lead_unit_type,
      preferredAction: payload.lead_action,
      source: payload.cta_source,
      metadata: getLeadMetadata({
        ctaSource: payload.cta_source,
        pageSection: payload.form_name,
        unitSelected: payload.lead_unit_type,
        preferredAction: payload.lead_action,
      }),
    }),
  });

  if (!response.ok) {
    throw new Error("Lead submission failed");
  }

  return response.json();
}

function LeadForm({
  action,
  ctaSource,
  formName,
  hiddenBase,
  id,
  selectedUnit,
  submitLabel,
}: {
  action: LeadAction;
  ctaSource: string;
  formName: string;
  hiddenBase: HiddenLeadFields;
  id: string;
  selectedUnit: Unit;
  submitLabel?: string;
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [started, setStarted] = useState(false);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: getDefaultValues(selectedUnit, action),
  });

  const leadAction = useWatch({ control, name: "lead_action" });
  const leadUnitType = useWatch({ control, name: "lead_unit_type" });
  const isCompactForm = formName === "hero" || formName === "final";
  const submitTone: Record<LeadAction, string> = {
    price_sheet: "bg-[var(--whatsapp)] text-[var(--surface)] hover:bg-[#145f41]",
    brochure: "bg-[var(--terracotta)] text-[var(--surface)] hover:bg-[#245a43]",
    floor_plan: "bg-[var(--accent)] text-[var(--surface)] hover:bg-[var(--accent-strong)]",
    site_visit: "bg-[var(--terracotta-soft)] text-[var(--accent-strong)] hover:bg-[var(--surface-lift)]",
  };

  useEffect(() => {
    setValue("lead_action", action);
    setValue("lead_unit_type", selectedUnit.label);
  }, [action, selectedUnit.label, setValue]);

  const hiddenFields: HiddenLeadFields = {
    ...hiddenBase,
    cta_source: ctaSource,
    form_name: formName,
    timestamp: new Date().toISOString(),
  };

  const onStart = () => {
    if (started) {
      return;
    }

    setStarted(true);
    trackEvent("lead_form_start", {
      form_name: formName,
      cta_source: ctaSource,
      unit_type: leadUnitType,
    });
  };

  const onSubmit = async (values: LeadFormValues) => {
    setStatus("idle");
    trackEvent("lead_form_submit", {
      form_name: formName,
      cta_source: ctaSource,
      lead_action: values.lead_action,
      unit_type: values.lead_unit_type,
    });
    trackEvent(actionEvents[values.lead_action], {
      form_name: formName,
      cta_source: ctaSource,
      unit_type: values.lead_unit_type,
    });

    try {
      await submitLead({ ...values, ...hiddenFields });
      trackEvent("lead_form_success", {
        form_name: formName,
        cta_source: ctaSource,
        lead_action: values.lead_action,
        unit_type: values.lead_unit_type,
      });
      setStatus("success");
      reset(getDefaultValues(selectedUnit, values.lead_action));
      window.open(
        getWhatsAppUrl(buildWhatsAppMessage(values.lead_action, values.lead_unit_type)),
        "_blank",
        "noopener,noreferrer",
      );
    } catch {
      trackEvent("lead_form_error", {
        form_name: formName,
        cta_source: ctaSource,
        lead_action: values.lead_action,
        unit_type: values.lead_unit_type,
      });
      setStatus("error");
    }
  };

  return (
    <form
      id={id}
      className={`grid ${isCompactForm ? "gap-2" : "gap-3"}`}
      onFocus={onStart}
      onSubmit={handleSubmit(onSubmit)}
    >
      <input
        id={getFieldId(formName, "lead_action")}
        type="hidden"
        value={leadAction}
        {...register("lead_action")}
      />
      {Object.entries(hiddenFields).map(([key, value]) => (
        <input
          key={key}
          id={getHiddenFieldId(formName, key as keyof HiddenLeadFields)}
          name={key}
          type="hidden"
          value={value}
          readOnly
        />
      ))}

      <div className={isCompactForm ? "grid grid-cols-2 gap-2" : "grid gap-3"}>
        <div>
          <label className="form-label" htmlFor={getFieldId(formName, "lead_name")}>
            Full Name
          </label>
          <input
            id={getFieldId(formName, "lead_name")}
            className="compact-input"
            autoComplete="name"
            {...register("lead_name")}
          />
          {errors.lead_name ? <p className="form-error">{errors.lead_name.message}</p> : null}
        </div>

        <div>
          <label className="form-label" htmlFor={getFieldId(formName, "lead_phone")}>
            Mobile Number
          </label>
          <input
            id={getFieldId(formName, "lead_phone")}
            className="compact-input"
            autoComplete="tel"
            inputMode="numeric"
            {...register("lead_phone")}
          />
          {errors.lead_phone ? <p className="form-error">{errors.lead_phone.message}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="form-label" htmlFor={getFieldId(formName, "lead_unit_type")}>
            Interested In
          </label>
          <select
            id={getFieldId(formName, "lead_unit_type")}
            className="compact-input"
            {...register("lead_unit_type")}
          >
            {units.map((unit) => (
              <option key={unit.slug} value={unit.label}>
                {unit.label}
              </option>
            ))}
          </select>
          {errors.lead_unit_type ? (
            <p className="form-error">{errors.lead_unit_type.message}</p>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor={getFieldId(formName, "lead_callback_time")}>
            Callback
          </label>
          <select
            id={getFieldId(formName, "lead_callback_time")}
            className="compact-input"
            {...register("lead_callback_time")}
          >
            <option value="">Any time</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>
      </div>

      <label className={`flex items-start gap-2 text-[var(--foreground-muted)] ${isCompactForm ? "text-[0.68rem] leading-4" : "text-xs leading-5"}`} htmlFor={getFieldId(formName, "lead_consent")}>
        <input
          id={getFieldId(formName, "lead_consent")}
          className="mt-1 size-4 rounded border-[var(--border)] accent-[var(--accent)]"
          type="checkbox"
          {...register("lead_consent")}
        />
        <span>{consentText}</span>
      </label>
      {errors.lead_consent ? (
        <p className="form-error">{errors.lead_consent.message}</p>
      ) : null}

      <Button
        id={formName === "hero" ? "lead_submit_btn" : undefined}
        className={`${submitTone[leadAction]} ${isCompactForm ? "min-h-10 text-[0.78rem]" : ""}`}
        type="submit"
        disabled={isSubmitting}
      >
        {leadAction === "price_sheet" ? <FaWhatsapp className="size-4" /> : null}
        {leadAction === "brochure" ? <Download className="size-4" /> : null}
        {leadAction === "floor_plan" ? <Home className="size-4" /> : null}
        {leadAction === "site_visit" ? <CalendarRange className="size-4" /> : null}
        {isSubmitting ? "Sending..." : submitLabel ?? actionLabels[leadAction]}
      </Button>
      {!isCompactForm ? (
        <p className="text-xs leading-5 text-[var(--foreground-muted)]">
          Share your number to receive the latest cost sheet on WhatsApp.
        </p>
      ) : null}

      {status === "success" ? (
        <div className="rounded-lg bg-[var(--sage-soft)] p-3 text-sm font-semibold text-[var(--accent)]">
          Thank you. Our project advisor will share the latest cost sheet and available inventory on WhatsApp shortly.
        </div>
      ) : null}
      {status === "error" ? (
        <div className="rounded-lg bg-[var(--surface-lift)] p-3 text-sm text-[var(--foreground-muted)]">
          We could not submit the form right now. You can still call{" "}
          <a className="font-bold text-[var(--accent)]" href={projectFacts.contactHref}>
            {projectFacts.contactNumber}
          </a>{" "}
          or continue on{" "}
          <a
            className="font-bold text-[var(--accent)]"
            href={getWhatsAppUrl(buildWhatsAppMessage(leadAction, leadUnitType))}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          .
        </div>
      ) : null}
    </form>
  );
}

export function LandingPage() {
  const [selectedUnit, setSelectedUnit] = useState<Unit>(primaryUnits[0]);
  const [showAllUnits, setShowAllUnits] = useState(false);
  const [leadModal, setLeadModal] = useState<LeadModal | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [hiddenBase, setHiddenBase] = useState<HiddenLeadFields>(blankHiddenFields);
  const shellRef = useRef<HTMLDivElement>(null);

  const currentLeadAction = leadModal?.action ?? "price_sheet";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deviceType = window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
    const nextHiddenFields = {
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

    queueMicrotask(() => setHiddenBase(nextHiddenFields));
    trackEvent("lp_view", {
      landing_page: window.location.href,
      device_type: deviceType,
    });
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        .from(".site-nav-shell", { autoAlpha: 0, y: -12, duration: 0.35 })
        .from(".hero-reveal > *", { autoAlpha: 0, y: 16, duration: 0.42, stagger: 0.05 }, "-=0.1")
        .from("#hero-lead-card", { autoAlpha: 0, y: 18, duration: 0.42 }, "-=0.18");

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((section) => {
        gsap.from(section, {
          autoAlpha: 0,
          y: 18,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 88%" },
        });
      });
    },
    { scope: shellRef },
  );

  const openLeadModal = (
    action: LeadAction,
    ctaSource: string,
    title: string,
    unit = selectedUnit,
  ) => {
    const eventName =
      action === "price_sheet"
        ? "hero_cta_click"
        : action === "site_visit"
          ? "site_visit_request"
          : action === "floor_plan"
            ? "floor_plan_request"
            : "brochure_request";
    trackEvent(eventName, {
      cta_source: ctaSource,
      lead_action: action,
      unit_type: unit.label,
    });
    setLeadModal({ action, ctaSource, title, unit });
  };

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
    trackEvent("unit_card_click", {
      unit_type: unit.label,
      saleable_area: unit.saleableArea,
      carpet_area: unit.carpetArea,
      price: unit.price,
    });
  };

  const handleCall = (source: string) => {
    trackEvent("cta_call_click", { cta_source: source });
  };

  const handleWhatsApp = (source: string) => {
    trackEvent("cta_whatsapp_click", { cta_source: source, unit_type: selectedUnit.label });
  };

  const selectedPlanAlt = `${selectedUnit.label} floor plan for Nikoo Homes 8 with ${selectedUnit.saleableArea} sq ft saleable area`;

  const modalTitle = useMemo(() => {
    if (!leadModal) {
      return "";
    }

    return leadModal.title;
  }, [leadModal]);

  return (
    <div ref={shellRef} className="bg-[var(--background)] text-[var(--foreground)]">
      <header id="site-header" className="sticky top-0 z-50 bg-[var(--surface-lift)]/95 shadow-[0_10px_28px_rgba(31,58,51,0.08)] backdrop-blur">
        <div className="section-shell py-3">
          <div className="site-nav-shell flex items-center justify-between gap-3">
            <a href="#hero" className="flex min-w-0 items-center gap-3" aria-label="Nikoo Homes 8 home">
              <Image
                src="/nikoo/logo-red.png"
                alt="Nikoo Homes logo"
                width={151}
                height={65}
                className="h-9 w-auto"
                priority
              />
              <span className="hidden truncate text-sm font-semibold text-[var(--foreground-muted)] sm:inline">
                Bhartiya Garden Enclave
              </span>
            </a>

            <nav className="hidden items-center gap-1 text-sm font-semibold lg:flex" aria-label="Main navigation">
              {[
                ["Overview", "#overview"],
                ["Pricing", "#pricing"],
                ["Floor Plans", "#floorplans"],
                ["Amenities", "#amenities"],
                ["Location", "#location"],
                ["FAQ", "#faq"],
              ].map(([label, href]) => (
                <a key={href} className="rounded-lg px-3 py-2 hover:bg-[var(--surface-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--terracotta)]" href={href}>
                  {label}
                </a>
              ))}
            </nav>

            <Button
              id="header-enquire-btn"
              size="sm"
              onClick={() => {
                trackEvent("header_cta_click", { cta_source: "header-enquire" });
                openLeadModal("price_sheet", "header-enquire", "Get the latest price sheet");
              }}
            >
              Enquire
            </Button>
          </div>
        </div>
      </header>

      <main className="pb-20 md:pb-0">
        <section id="hero" className="relative min-h-[calc(100svh-3.75rem)] overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
          <Image
            src={projectFacts.images.hero}
            alt="Nikoo Homes 8 landscaped garden living at Bhartiya Garden Enclave"
            fill
            sizes="100vw"
            className="object-cover opacity-100"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.36)_44%,rgba(255,255,255,0.03)_100%)]" />
          <div className="relative section-shell grid min-h-[calc(100svh-3.75rem)] gap-2.5 py-2.5 md:grid-cols-[1fr_22rem] md:items-center md:gap-3 md:py-6 lg:grid-cols-[1fr_24rem]">
            <div className="hero-reveal max-w-4xl drop-shadow-[0_8px_20px_rgba(255,255,255,0.72)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)] md:text-sm">
                {projectFacts.locationShort}
              </p>
              <h1 className="mt-1.5 max-w-4xl font-[family-name:var(--font-display)] text-[1.85rem] leading-[0.93] text-[var(--foreground)] md:text-[4.35rem]">
                Nikoo Homes 8 at Bhartiya Garden Enclave
              </h1>
              <p className="mt-1.5 max-w-3xl text-[0.82rem] font-semibold leading-5 text-[var(--foreground)] md:text-base md:leading-7">
                Garden-led homes in Bellahalli near Thanisandra Main Road by Bhartiya Urban. Studio to 4 Bed + Staff • 501–2506 sq ft • Phase 1 & 2 RERA registered.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
                {["By Bhartiya Urban", "Phase 1 & 2 RERA", "2031 onward*"].map((chip) => (
                  <span key={chip} className="border-b border-[var(--terracotta)] pb-0.5 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent-strong)] md:text-xs">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 md:gap-2">
                <Button
                  id="hero-price-btn"
                  className="min-h-8 bg-[var(--panel-forest)] px-3 text-xs text-[var(--panel-ink)] md:min-h-9 md:px-4 md:text-sm"
                  onClick={() => openLeadModal("price_sheet", "hero-price", "Get the latest price sheet")}
                >
                  Get Price Sheet
                </Button>
                <Button
                  id="hero-plans-btn"
                  variant="secondary"
                  className="min-h-8 bg-[var(--panel-clay)] px-3 text-xs text-[var(--panel-ink)] md:min-h-9 md:px-4 md:text-sm"
                  onClick={() => {
                    trackEvent("hero_cta_click", { cta_source: "hero-plans", lead_action: "floor_plan" });
                    document.getElementById("floorplans")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  View Floor Plans
                </Button>
                <Button
                  id="hero-visit-btn"
                  variant="outline"
                  className="min-h-8 border-0 bg-[var(--visit-soft)] px-3 text-xs text-[var(--accent-strong)] md:min-h-9 md:px-4 md:text-sm"
                  onClick={() => openLeadModal("site_visit", "hero-visit", "Book a guided site visit")}
                >
                  Book Site Visit
                </Button>
              </div>
            </div>

            <aside id="hero-lead-card" className="rounded-[1.1rem] bg-[rgba(251,247,240,0.96)] p-2.5 text-[var(--foreground)] shadow-[0_28px_80px_rgba(31,58,51,0.24)] backdrop-blur-md md:p-4">
              <p className="eyebrow">Get latest pricing</p>
              <h2 className="display-title mt-0.5 text-[1.45rem] leading-tight md:text-[1.65rem]">
                Price sheet on WhatsApp
              </h2>
              <p className="mt-0.5 text-[0.72rem] leading-4 text-[var(--foreground-muted)] md:text-xs md:leading-5">
                Share your number to receive the latest cost sheet on WhatsApp.
              </p>
              <div className="mt-2.5">
                <LeadForm
                  action="price_sheet"
                  ctaSource="hero-form"
                  formName="hero"
                  hiddenBase={hiddenBase}
                  id="lead-form-hero"
                  selectedUnit={selectedUnit}
                  submitLabel="Get Price Sheet on WhatsApp"
                />
              </div>
            </aside>
          </div>
        </section>

        <section id="trust-ribbon" className="bg-[var(--background)]">
          <div className="section-shell grid gap-2 py-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
            {[
              projectFacts.developer,
              `RERA: ${projectFacts.rera.phase1}`,
              `RERA: ${projectFacts.rera.phase2}`,
              `Call ${projectFacts.contactNumber}`,
              "Brochure Available",
            ].map((item, index) => (
              <div
                key={item}
                className={`flex min-w-0 items-start gap-2 rounded-lg px-3 py-3 font-semibold shadow-[0_12px_30px_rgba(31,58,51,0.14)] ${
                  index % 3 === 0 ? "bg-[var(--panel-forest)]" : index % 3 === 1 ? "bg-[var(--panel-sage)]" : "bg-[var(--panel-clay)]"
                }`}
              >
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--panel-ink)]" />
                <span className="min-w-0 break-words text-xs leading-5 text-[var(--panel-ink)]">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing-snapshot" className="bg-[var(--background)]">
          <div className="section-shell py-7">
            <SectionIntro
              eyebrow="Indicative launch pricing"
              title="A quick price scan before you enquire"
              body="Final cost depends on tower, floor, facing and availability. Request the latest cost sheet before making a buying decision."
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pricingSnapshot.map((unit, index) => (
                <article
                  key={unit.slug}
                  className={`rounded-lg p-4 shadow-[0_14px_34px_rgba(31,58,51,0.16)] ${
                    index % 4 === 0
                      ? "bg-[var(--panel-forest)]"
                      : index % 4 === 1
                        ? "bg-[var(--panel-sage)]"
                        : index % 4 === 2
                          ? "bg-[var(--panel-bark)]"
                          : "bg-[var(--panel-clay)]"
                  }`}
                >
                  <BadgeIndianRupee className="size-5 text-[var(--panel-ink)]" />
                  <p className="mt-3 text-sm font-semibold text-[var(--panel-muted)]">{unit.label}</p>
                  <h3 className="mt-2 text-2xl font-bold text-[var(--panel-ink)]">{unit.price}</h3>
                  <p className="mt-1 text-sm text-[var(--panel-muted)]">{unit.saleableArea} sq ft</p>
                  <Button
                    className="snapshot-cta mt-4 w-full bg-[var(--panel-ink)] text-[var(--accent-strong)] hover:bg-[var(--surface-lift)]"
                    size="sm"
                    onClick={() => openLeadModal("price_sheet", `snapshot-${unit.slug}`, "Get the latest price sheet", unit)}
                  >
                    View Price Plan
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="overview" className="bg-[var(--background)]">
          <div className="section-shell py-8 md:py-10" data-reveal>
            <SectionIntro
              eyebrow="Overview"
              title="Premium garden-led township living in North Bengaluru"
              body="Nikoo Homes 8 brings landscaped planning, refined residential formats and Bhartiya City context together in a calm, connected address near Thanisandra Main Road."
            />
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {overviewCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.title} className={`rounded-lg p-4 shadow-[0_12px_26px_rgba(31,58,51,0.16)] ${card.bg}`}>
                    <Icon className="size-9 text-[var(--panel-ink)]" />
                    <h3 className="mt-3 text-lg font-bold text-[var(--panel-ink)]">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--panel-muted)]">{card.copy}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="unit-types" className="bg-[var(--background)]">
          <div className="section-shell py-8 md:py-10" data-reveal>
            <SectionIntro
              eyebrow="Residences"
              title="Choose a home and see its plan instantly"
              body="Swipe the primary formats, select one, and the matching floor plan with price and area details updates in the same compact panel."
            />
            <div className="mt-5 overflow-x-auto pb-2">
              <div className="hide-scrollbar flex min-w-max gap-3">
                {primaryUnits.map((unit) => (
                  <button
                    key={unit.slug}
                    type="button"
                    className={`unit-card-btn w-48 rounded-lg p-4 text-left transition ${
                      selectedUnit.slug === unit.slug
                        ? "bg-[var(--panel-clay)] text-[var(--panel-ink)] shadow-[0_14px_30px_rgba(31,58,51,0.18)]"
                        : "bg-[var(--panel-sage)] text-[var(--panel-ink)] shadow-[0_10px_24px_rgba(31,58,51,0.12)] hover:bg-[var(--panel-olive)]"
                    }`}
                    data-price={unit.price}
                    data-saleable-area={unit.saleableArea}
                    data-carpet-area={unit.carpetArea ?? ""}
                    onClick={() => handleUnitSelect(unit)}
                  >
                    <p className="text-sm font-bold text-[var(--panel-ink)]">{unit.label}</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--panel-ink)]">{unit.saleableArea}</p>
                    <p className="text-xs text-[var(--panel-muted)]">sq ft saleable</p>
                    <p className="mt-3 text-sm font-semibold text-[var(--panel-muted)]">{unit.buyerFit}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="mt-3 flex items-center gap-2 text-sm font-bold text-[var(--accent)]"
              aria-expanded={showAllUnits}
              aria-controls="all-configurations"
              onClick={() => setShowAllUnits((value) => !value)}
            >
              View all configurations
              <ChevronDown className={`size-4 transition ${showAllUnits ? "rotate-180" : ""}`} />
            </button>
            <div id="all-configurations" hidden={!showAllUnits} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {additionalUnits.map((unit) => (
                <button
                  key={unit.slug}
                  type="button"
                  className="unit-card-btn rounded-lg bg-[var(--panel-olive)] p-4 text-left text-[var(--panel-ink)] shadow-[0_10px_24px_rgba(31,58,51,0.12)] hover:bg-[var(--panel-sage)]"
                  data-price={unit.price}
                  data-saleable-area={unit.saleableArea}
                  data-carpet-area={unit.carpetArea ?? ""}
                  onClick={() => handleUnitSelect(unit)}
                >
                  <p className="text-sm font-bold text-[var(--panel-ink)]">{unit.label}</p>
                  <p className="mt-1 text-lg font-bold text-[var(--panel-ink)]">{unit.saleableArea} sq ft</p>
                  <p className="mt-2 text-sm text-[var(--panel-muted)]">{unit.buyerFit}</p>
                </button>
              ))}
            </div>

            <div id="floorplans" className="mt-5 rounded-lg bg-[var(--surface-soft)] p-3 shadow-[0_18px_42px_rgba(31,58,51,0.1)] md:p-4">
              <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
                <aside className="rounded-lg bg-white/75 p-4 text-[var(--foreground)] shadow-[0_16px_34px_rgba(23,61,50,0.12)] backdrop-blur-md">
                  <p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Selected home</p>
                  <h3 className="display-title mt-2 text-3xl leading-tight text-[var(--foreground)]">{selectedUnit.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">{selectedUnit.buyerFit}</p>
                  <div className="mt-4 grid gap-2">
                    {[
                      { label: "Price guidance", value: selectedUnit.price, icon: BadgeIndianRupee },
                      { label: "Saleable area", value: `${selectedUnit.saleableArea} sq ft`, icon: Ruler },
                      { label: "Carpet area", value: selectedUnit.carpetArea ? `${selectedUnit.carpetArea} sq ft` : "On request", icon: Home },
                      { label: "Possession", value: projectFacts.possession, icon: CalendarRange },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div key={item.label} className="rounded-lg bg-[rgba(23,69,54,0.08)] px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 text-[var(--accent)]" />
                            <p className="text-[0.68rem] font-bold uppercase text-[var(--accent)]">{item.label}</p>
                          </div>
                          <p className="mt-1 text-sm font-bold text-[var(--foreground)]">{item.value}</p>
                      </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 grid gap-2">
                    <Button
                      className="bg-[var(--price-soft)] text-[var(--accent-strong)] hover:bg-[var(--surface-lift)]"
                      onClick={() => openLeadModal("price_sheet", "unit-detail-price", "Get exact cost for this unit", selectedUnit)}
                    >
                      <BadgeIndianRupee className="size-4" />
                      Get Exact Cost
                    </Button>
                    <Button
                      id="plan-whatsapp-btn"
                      variant="secondary"
                      className="bg-[var(--whatsapp)] text-[var(--panel-ink)] hover:bg-[#145f41]"
                      onClick={() => openLeadModal("floor_plan", "plan-whatsapp", "Get this plan on WhatsApp", selectedUnit)}
                    >
                      <FaWhatsapp className="size-4" />
                      Get This Plan on WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      className="border-0 bg-[var(--panel-sage)] text-[var(--panel-ink)] hover:bg-[var(--panel-olive)]"
                      onClick={() => openLeadModal("site_visit", "unit-detail-visit", "Book a guided site visit", selectedUnit)}
                    >
                      <CalendarRange className="size-4" />
                      Book Visit for This Unit
                    </Button>
                  </div>
                </aside>

                <div className="rounded-lg bg-[var(--surface-soft)] p-3">
                  <button
                    type="button"
                    className="relative block aspect-[4/3] max-h-[24rem] w-full overflow-hidden rounded-lg bg-[var(--surface)]"
                    onClick={() => setPlanModalOpen(true)}
                    aria-label={`Open ${selectedUnit.label} floor plan`}
                  >
                    <Image
                      src={selectedUnit.image}
                      alt={selectedPlanAlt}
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-contain"
                    />
                  </button>
                  <p className="mt-3 text-sm font-semibold text-[var(--foreground-muted)]">
                    Tap the miniature plan to open a larger preview.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="amenities" className="bg-[var(--background)]">
          <div className="section-shell py-8 md:py-10" data-reveal>
            <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <SectionIntro
                  eyebrow="Amenities"
                  title="Garden moments curated for daily life"
                  body="The landscape story stays focused on memorable spaces instead of a long amenity dump."
                />
                <div className="mt-5 overflow-hidden rounded-lg shadow-[0_18px_42px_rgba(31,58,51,0.1)]">
                  <Image
                    src={projectFacts.images.masterPlan}
                    alt="Master plan of Nikoo Homes 8 showing garden spine and club zone"
                    width={1400}
                    height={1000}
                    className="h-full max-h-[24rem] w-full object-cover"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {amenities.map((item) => {
                  const theme = amenityThemes[item as keyof typeof amenityThemes];
                  const Icon = theme.icon;

                  return (
                    <article
                      key={item}
                      className={`relative overflow-hidden rounded-lg p-3 shadow-[0_10px_24px_rgba(31,58,51,0.06)] ${theme.bg}`}
                    >
                      <Icon className={`absolute -right-3 -top-3 size-20 opacity-[0.18] ${theme.accent}`} />
                      <Icon className={`size-10 ${theme.accent}`} />
                      <h3 className="mt-2 text-base font-bold text-[var(--panel-ink)]">{item}</h3>
                      <p className="mt-1 text-xs leading-5 text-[var(--panel-muted)]">{theme.copy}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="location" className="bg-[var(--background)]">
          <div className="section-shell py-8 md:py-10" data-reveal>
            <SectionIntro
              eyebrow="Location"
              title="Key destinations around Bhartiya Garden Enclave"
              body="A practical location view for buyers comparing schools, work hubs, retail and airport-side access."
            />
            <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-lg bg-[var(--panel-forest)] p-4 text-[var(--panel-ink)] shadow-[0_16px_36px_rgba(31,58,51,0.16)]">
                <div className="overflow-hidden rounded-lg bg-[var(--surface)] shadow-[0_10px_24px_rgba(31,58,51,0.08)]">
                  <iframe
                    title="Nikoo Homes 8 location map"
                    src="https://www.google.com/maps?q=Bellahalli%2C%20Thanisandra%20Main%20Road%2C%20Bengaluru&output=embed"
                    className="h-56 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <MapPin className="mt-4 size-8 text-[var(--panel-ink)]" />
                <h3 className="mt-3 text-2xl font-bold text-[var(--panel-ink)]">Bellahalli project pin</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--panel-muted)]">
                  Bellahalli, near Thanisandra Main Road, North Bengaluru.
                </p>
                <Button asChild id="location-map-btn" className="mt-4 bg-[var(--panel-ink)] text-[var(--accent-strong)] hover:bg-[var(--surface-lift)]">
                  <Link
                    href={projectFacts.mapUrl}
                    target="_blank"
                    onClick={() => trackEvent("map_open", { cta_source: "location-map" })}
                  >
                    Open Location Map
                  </Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {nearbyPlaces.map((place) => {
                  const theme = placeThemes[place as keyof typeof placeThemes];
                  const Icon = theme.icon;

                  return (
                    <div key={place} className={`overflow-hidden rounded-lg p-4 shadow-[0_10px_24px_rgba(31,58,51,0.06)] ${theme.className}`}>
                      <div className={`mb-4 h-1.5 w-20 rounded-full ${theme.accentClass}`} />
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--panel-chip)] text-[var(--panel-ink)] shadow-[0_8px_18px_rgba(31,58,51,0.08)]">
                          <Icon className="size-5" />
                        </div>
                        <span className="rounded-full bg-[var(--panel-chip)] px-2.5 py-1 text-[0.68rem] font-bold uppercase text-[var(--panel-muted)]">
                          {theme.label}
                        </span>
                      </div>
                      <p className="mt-4 text-base font-bold text-[var(--panel-ink)]">{place}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--panel-muted)]">
                        {theme.note}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="brochure" className="bg-[var(--background)]">
          <div className="section-shell py-7" data-reveal>
            <div className="grid gap-4 rounded-lg bg-[var(--panel-bark)] p-5 text-[var(--panel-ink)] shadow-[0_16px_36px_rgba(31,58,51,0.16)] md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[var(--panel-muted)]">Brochure</p>
                <h2 className="display-title mt-2 text-3xl leading-tight text-[var(--panel-ink)]">
                  Download the project brochure
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--panel-muted)]">
                  Receive the brochure link and key project details on WhatsApp.
                </p>
              </div>
              <Button
                id="brochure-btn"
                className="bg-[var(--panel-ink)] text-[var(--accent-strong)] hover:bg-[var(--surface-lift)]"
                onClick={() => openLeadModal("brochure", "brochure-block", "Download the project brochure")}
              >
                <Download className="size-4" />
                Download Brochure
              </Button>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-[var(--background)]">
          <div className="section-shell grid gap-5 py-8 md:py-10 lg:grid-cols-[0.85fr_1.15fr]" data-reveal>
            <SectionIntro
              eyebrow="FAQ"
              title="Answers before you enquire"
              body="The key facts buyers usually confirm before requesting pricing or a site visit."
            />
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger
                    onClick={() => trackEvent("faq_expand", { question: faq.question })}
                  >
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section id="developer" className="bg-[var(--background)]">
          <div className="section-shell py-8 md:py-10" data-reveal>
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-center">
              <SectionIntro
                eyebrow="Developer"
                title="Bhartiya Urban and the Nikoo Homes ecosystem"
                body="Bhartiya Urban Pvt. Ltd. is associated with the wider Bhartiya City and Nikoo Homes residential ecosystem in North Bengaluru, with a township-led approach to living, retail and community infrastructure."
              />
              <div className="overflow-hidden rounded-lg shadow-[0_18px_42px_rgba(31,58,51,0.1)]">
                <Image
                  src={projectFacts.images.township}
                  alt="Bhartiya City township context for Nikoo Homes 8"
                  width={1400}
                  height={1000}
                  className="h-full max-h-[24rem] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="final-enquiry" className="bg-[var(--background)]">
          <div className="section-shell py-6 md:py-8" data-reveal>
            <div className="grid overflow-hidden rounded-[1.4rem] bg-[var(--clay-panel)] shadow-[0_24px_70px_rgba(31,58,51,0.14)] lg:grid-cols-[0.82fr_1.18fr]">
              <div className="p-4 md:p-5">
                <p className="eyebrow">Next step</p>
                <h2 className="display-title mt-1 text-[1.85rem] leading-none md:text-[2.75rem]">
                  Get exact pricing, floor plans and visit slots.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  Tell us the home type you are comparing. Our project advisor can share the latest cost sheet, selected plan and appointment options on WhatsApp.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Cost Sheet", value: "Latest unit-wise guidance", icon: BadgeIndianRupee },
                    { label: "Floor Plan", value: `${selectedUnit.label} selected`, icon: Home },
                    { label: "Site Visit", value: "Callback slot included", icon: CalendarRange },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="rounded-lg bg-[var(--surface-lift)] p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Icon className="size-4 shrink-0 text-[var(--terracotta)]" />
                          <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{item.label}</p>
                        </div>
                        <p className="mt-1 text-[0.72rem] font-semibold leading-4 text-[var(--foreground)]">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-[var(--surface)] p-3 md:p-4">
                <LeadForm
                  action="price_sheet"
                  ctaSource="final-lead-form"
                  formName="final"
                  hiddenBase={hiddenBase}
                  id="lead-form-final"
                  selectedUnit={selectedUnit}
                  submitLabel="Send Price, Plans and Visit Slots"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="site-footer" className="border-t border-[var(--border)] bg-[var(--background)] px-3 py-5 text-[var(--foreground)] md:px-5 md:py-7">
        <div className="section-shell">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr_0.65fr]">
            <div>
              <Image
                src="/nikoo/logo-red.png"
                alt="Nikoo Homes logo"
                width={151}
                height={65}
                className="h-10 w-auto"
              />
              <h2 className="display-title mt-5 text-[2rem] leading-none md:text-[2.8rem]">
                Nikoo Home 8 by Bhartiya Garden Enclave
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
                {projectFacts.publicTitle} by {projectFacts.developer}, located at {projectFacts.locationShort}.
              </p>
              <a className="mt-4 inline-flex rounded-full bg-[var(--price-soft)] px-4 py-2 text-sm font-bold text-[var(--accent)]" href={projectFacts.contactHref}>
                {projectFacts.contactNumber}
              </a>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">RERA registered</h3>
              <div className="mt-3 grid gap-2 text-xs leading-5 text-[var(--foreground-muted)]">
                <p className="rounded-lg bg-[var(--surface)] p-3">
                  <strong className="block text-[var(--foreground)]">Phase 1</strong>
                  {projectFacts.rera.phase1}
                </p>
                <p className="rounded-lg bg-[var(--surface)] p-3">
                  <strong className="block text-[var(--foreground)]">Phase 2</strong>
                  {projectFacts.rera.phase2}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Quick links</h3>
              <div className="mt-3 grid gap-2 text-sm font-semibold text-[var(--foreground-muted)]">
                <a href="#overview">Overview</a>
                <a href="#unit-types">Homes</a>
                <a href="#location">Location</a>
                <a href="#faq">FAQ</a>
                <a href="#privacy">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-lg bg-[var(--surface)] p-4">
            <p className="text-xs leading-5 text-[var(--foreground-muted)]">
              {micrositeDisclaimer}
            </p>
          </div>
          <div className="mt-5 grid gap-2 border-t border-[var(--border)] pt-4 sm:grid-cols-[1.2fr_1.2fr_auto_auto]">
            <a
              href={projectFacts.contactHref}
              className="flex items-center justify-center gap-2 rounded-full bg-[var(--call-soft)] px-3 py-3 text-sm font-bold text-[var(--accent)]"
            >
              <PhoneCall className="size-4" />
              {projectFacts.contactNumber}
            </a>
            <a
              href={projectFacts.emailHref}
              className="flex items-center justify-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-3 text-sm font-bold text-[var(--accent)]"
            >
              <Mail className="size-4" />
              {projectFacts.emailLabel}
            </a>
            <a
              href={projectFacts.socials.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex size-12 items-center justify-center rounded-full bg-[var(--price-soft)] text-[var(--accent)]"
            >
              <FaFacebookF className="size-5" />
            </a>
            <a
              href={projectFacts.socials.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex size-12 items-center justify-center rounded-full bg-[var(--visit-soft)] text-[var(--accent)]"
            >
              <FaInstagram className="size-5" />
            </a>
          </div>
        </div>
      </footer>

      <div id="mobile-cta" className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] p-2 shadow-[0_-12px_28px_rgba(31,58,51,0.16)] md:hidden">
        <div className="grid grid-cols-4 gap-2">
          <a
            id="sticky-call-btn"
            href={projectFacts.contactHref}
            onClick={() => {
              trackEvent("sticky_cta_click", { cta_source: "sticky-call" });
              handleCall("sticky-call");
            }}
            className="flex min-h-14 flex-col items-center justify-center rounded-lg bg-[var(--call-soft)] text-xs font-bold shadow-[0_6px_14px_rgba(31,58,51,0.06)]"
          >
            <PhoneCall className="size-4 text-[var(--accent)]" />
            Call
          </a>
          <a
            id="sticky-whatsapp-btn"
            href={getWhatsAppUrl(buildWhatsAppMessage("price_sheet", selectedUnit.label))}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              trackEvent("sticky_cta_click", { cta_source: "sticky-whatsapp" });
              handleWhatsApp("sticky-whatsapp");
            }}
            className="flex min-h-14 flex-col items-center justify-center rounded-lg bg-[var(--whatsapp)] text-xs font-bold text-[var(--surface)] shadow-[0_6px_14px_rgba(31,58,51,0.08)]"
          >
            <FaWhatsapp className="size-4" />
            WhatsApp
          </a>
          <button
            id="sticky-price-btn"
            type="button"
            onClick={() => {
              trackEvent("sticky_cta_click", { cta_source: "sticky-price" });
              openLeadModal("price_sheet", "sticky-price", "Get the latest price sheet");
            }}
            className="flex min-h-14 flex-col items-center justify-center rounded-lg bg-[var(--price-soft)] text-xs font-bold shadow-[0_6px_14px_rgba(31,58,51,0.06)]"
          >
            <BadgeIndianRupee className="size-4 text-[var(--accent)]" />
            Price
          </button>
          <button
            id="sticky-visit-btn"
            type="button"
            onClick={() => {
              trackEvent("sticky_cta_click", { cta_source: "sticky-visit" });
              openLeadModal("site_visit", "sticky-visit", "Book a guided site visit");
            }}
            className="flex min-h-14 flex-col items-center justify-center rounded-lg bg-[var(--visit-soft)] text-xs font-bold shadow-[0_6px_14px_rgba(31,58,51,0.06)]"
          >
            <CalendarRange className="size-4 text-[var(--accent)]" />
            Visit
          </button>
        </div>
      </div>

      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent>
          <div id="plan-modal">
            <DialogHeader>
              <DialogTitle>{selectedUnit.label} Floor Plan</DialogTitle>
              <DialogDescription>{selectedUnit.saleableArea} sq ft saleable area</DialogDescription>
            </DialogHeader>
            <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-lg bg-[var(--surface)]">
              <Image src={selectedUnit.image} alt={selectedPlanAlt} fill sizes="90vw" className="object-contain" />
            </div>
            <Button className="mt-4 w-full" onClick={() => openLeadModal("floor_plan", "plan-modal", "Get this plan on WhatsApp", selectedUnit)}>
              Get This Plan on WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(leadModal)} onOpenChange={(open) => !open && setLeadModal(null)}>
        <DialogContent>
          {leadModal ? (
            <>
              <DialogHeader>
                <DialogTitle>{modalTitle}</DialogTitle>
                <DialogDescription>
                  Share your details and our project advisor will continue on WhatsApp.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <LeadForm
                  action={currentLeadAction}
                  ctaSource={leadModal.ctaSource}
                  formName="modal"
                  hiddenBase={hiddenBase}
                  id="lead-form-modal"
                  selectedUnit={leadModal.unit ?? selectedUnit}
                  submitLabel={actionLabels[currentLeadAction]}
                />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
