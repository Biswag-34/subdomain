"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  AfricanTree,
  Brain,
  Community,
  Flower,
  HomeAltSlim,
  Leaf,
  MapPin,
  Stroller,
  TennisBallAlt,
  Walking,
} from "iconoir-react";
import type { IconType } from "react-icons";
import {
  PiAirplaneTakeoffDuotone,
  PiArrowRightDuotone,
  PiBabyDuotone,
  PiBrainDuotone,
  PiBuildingsDuotone,
  PiCalendarDotsDuotone,
  PiDownloadSimpleDuotone,
  PiEnvelopeSimpleDuotone,
  PiFlowerLotusDuotone,
  PiFlowerTulipDuotone,
  PiGraduationCapDuotone,
  PiHouseLineDuotone,
  PiLeafDuotone,
  PiMapPinAreaDuotone,
  PiParkDuotone,
  PiPhoneCallDuotone,
  PiPhoneDuotone,
  PiPlantDuotone,
  PiTennisBallDuotone,
  PiTrainDuotone,
  PiTreeEvergreenDuotone,
  PiWhatsappLogoDuotone,
} from "react-icons/pi";
import { TbChevronDown, TbMenu2, TbRouteAltRight, TbX } from "react-icons/tb";
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

const navItems = [
  ["Why Nikoo 8", "overview"],
  ["Floor Plans", "floorplans"],
  ["Amenities", "amenities"],
  ["Location", "location"],
  ["Enquire", "final-enquiry"],
] as const;

const heroHighlights = [
  "11-acre launch across 2 RERA phases",
  "Studio to 4 BHK + Staff formats",
  "5 min to Bhartiya City and 10 min to Manyata",
] as const;

const amenityIcons: Record<string, IconType> = {
  "Quiet Trail": TbRouteAltRight,
  "Community Garden": PiParkDuotone,
  "Children's Play Area": PiBabyDuotone,
  "Meditation Garden": PiBrainDuotone,
  "Aroma Garden": PiFlowerTulipDuotone,
  "Sensory Garden": PiLeafDuotone,
  "Living Canopy": PiTreeEvergreenDuotone,
  "Tennis Court": PiTennisBallDuotone,
};

const uspIcons: Record<string, IconType> = {
  "Township-backed living": PiBuildingsDuotone,
  "Wide configuration ladder": PiHouseLineDuotone,
  "Garden-led planning": PiPlantDuotone,
  "North Bengaluru access": PiMapPinAreaDuotone,
};

const locationIcons: Record<string, IconType> = {
  Landmarks: PiBuildingsDuotone,
  Education: PiGraduationCapDuotone,
  Transit: PiTrainDuotone,
  Airport: PiAirplaneTakeoffDuotone,
};

const uspDesktopIcons = {
  "Township-backed living": Community,
  "Wide configuration ladder": HomeAltSlim,
  "Garden-led planning": Leaf,
  "North Bengaluru access": MapPin,
} as const;

const amenityDesktopIcons = {
  "Quiet Trail": Walking,
  "Community Garden": Community,
  "Children's Play Area": Stroller,
  "Meditation Garden": Brain,
  "Aroma Garden": Flower,
  "Sensory Garden": Leaf,
  "Living Canopy": AfricanTree,
  "Tennis Court": TennisBallAlt,
} as const;

const actionLabels: Record<LeadAction, string> = {
  price_sheet: "Enquiry",
  brochure: "Get Brochure",
  floor_plan: "Get Floor Plan",
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
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display-title mt-3 text-[2.05rem] leading-[0.96] tracking-[-0.05em] md:text-[3.15rem]">
        {title}
      </h2>
      {body ? (
        <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)] md:text-base md:leading-7">
          {body}
        </p>
      ) : null}
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
  showUnitField = true,
}: {
  hiddenBase: HiddenLeadFields;
  formName: string;
  ctaSource: string;
  selectedUnit: Unit;
  submitLabel: string;
  compact?: boolean;
  showUnitField?: boolean;
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
    <form
      className={`mt-4 grid ${compact ? "gap-2.5" : "gap-3"}`}
      onFocus={onFocus}
      onSubmit={handleSubmit(onSubmit)}
    >
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

      {showUnitField ? (
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
      ) : (
        <>
          <input type="hidden" {...register("lead_unit_type")} />
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
        </>
      )}

      <label
        className="flex items-start gap-2 text-[0.72rem] leading-5 text-[var(--foreground-muted)]"
        htmlFor={`${formName}-consent`}
      >
        <input
          id={`${formName}-consent`}
          className="mt-1 size-4 accent-[var(--brand-red)]"
          type="checkbox"
          {...register("lead_consent")}
        />
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

      {status === "success" ? (
        <p className="text-sm font-semibold text-[var(--brand-red)]">
          Thank you. Our team will continue on WhatsApp shortly.
        </p>
      ) : null}

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
      <label
        className="flex items-start gap-2 text-[0.72rem] leading-5 text-[var(--foreground-muted)]"
        htmlFor={`${formName}-consent`}
      >
        <input
          id={`${formName}-consent`}
          className="mt-1 size-4 accent-[var(--brand-red)]"
          type="checkbox"
          {...register("lead_consent")}
        />
        <span>{consentText}</span>
      </label>
      {errors.lead_consent ? <p className="form-error">{errors.lead_consent.message}</p> : null}
      <Button
        type="submit"
        className="min-h-12 w-full bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-strong)]"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : submitLabel}
      </Button>
      <p className="text-[0.72rem] leading-5 text-[var(--foreground-muted)]">
        Your details stay limited to this project enquiry and callback coordination.
      </p>
      {status === "success" ? (
        <p className="text-sm font-semibold text-[var(--brand-red)]">
          Thank you. We have your request and will connect shortly.
        </p>
      ) : null}
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
  const heroTopRef = useRef<HTMLDivElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit>(primaryUnit);
  const [leadModal, setLeadModal] = useState<LeadModal | null>(null);
  const [activeLocationCategory, setActiveLocationCategory] = useState<
    (typeof locationClusters)[number]["label"]
  >(locationClusters[0]?.label ?? "Landmarks");
  const [footerEmail, setFooterEmail] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolledHeader, setHasScrolledHeader] = useState(false);

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
        .from(".hero-entry", { autoAlpha: 0, y: 24, duration: 0.48, stagger: 0.08 }, "-=0.08");
    },
    { scope: shellRef },
  );

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal-card"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const scrollResetStorageKey = "__nikoo_force_scroll_top";

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const navigationEntries =
      typeof window.performance.getEntriesByType === "function"
        ? window.performance.getEntriesByType("navigation")
        : [];
    const navigation = navigationEntries[0] as PerformanceNavigationTiming | undefined;

    const resetScrollPosition = () => {
      if (window.location.hash) {
        return;
      }

      window.scrollTo(0, 0);
      window.requestAnimationFrame(() => window.scrollTo(0, 0));
      window.setTimeout(() => window.scrollTo(0, 0), 220);
    };

    const shouldResetScroll =
      !window.location.hash ||
      window.sessionStorage.getItem(scrollResetStorageKey) === "1" ||
      navigation?.type === "reload";

    if (shouldResetScroll) {
      window.sessionStorage.removeItem(scrollResetStorageKey);
      resetScrollPosition();
    }

    const updateHeaderState = () => setHasScrolledHeader(window.scrollY > 24);
    const markScrollReset = () => window.sessionStorage.setItem(scrollResetStorageKey, "1");

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    window.addEventListener("beforeunload", markScrollReset);

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
      window.removeEventListener("beforeunload", markScrollReset);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !heroTopRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHasScrolledHeader(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-24px 0px 0px 0px",
      },
    );

    observer.observe(heroTopRef.current);

    return () => observer.disconnect();
  }, []);

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

  const scrollToSection = (sectionId: string, source: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    setIsMobileMenuOpen(false);
    trackEvent("cta_section_jump", {
      cta_source: source,
      target_section: sectionId,
      unit_type: selectedUnit.label,
    });

    const headerOffset = window.matchMedia("(max-width: 1023px)").matches ? 88 : 104;
    const nextTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(nextTop, 0),
      behavior: "smooth",
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
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          hasScrolledHeader || isMobileMenuOpen
            ? "bg-white/95 shadow-[0_16px_34px_rgba(22,18,20,0.1)] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="section-shell py-2 md:py-3">
          <div
            className={`site-nav-shell flex items-center justify-between gap-3 px-0 py-1 transition-all duration-300 md:rounded-full md:px-3 md:py-2 ${
              hasScrolledHeader || isMobileMenuOpen
                ? "text-[var(--foreground)] md:bg-white/85"
                : "text-white"
            }`}
          >
            <a href="#hero" className="flex min-w-0 items-center gap-3" aria-label="Nikoo Homes 8 home">
              <Image
                src="/nikoo/logo-red.png"
                alt="Nikoo Homes logo"
                width={151}
                height={65}
                className={`h-9 w-auto transition-all duration-300 ${
                  hasScrolledHeader || isMobileMenuOpen ? "rounded-full bg-white/92 px-2 py-1" : ""
                }`}
                priority
              />
              <div className="hidden min-w-0 lg:block">
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                    hasScrolledHeader || isMobileMenuOpen ? "text-[var(--brand-red)]" : "text-[#fff0ea]"
                  }`}
                >
                  Bhartiya City
                </p>
                <p
                  className={`truncate text-sm ${
                    hasScrolledHeader || isMobileMenuOpen ? "text-[var(--foreground-muted)]" : "text-white/78"
                  }`}
                >
                  Thanisandra Main Road, North Bengaluru
                </p>
              </div>
            </a>

            <nav className="hidden items-center gap-1 text-sm font-semibold lg:flex" aria-label="Main navigation">
              {navItems.map(([label, sectionId]) => (
                <button
                  key={sectionId}
                  type="button"
                  onClick={() => scrollToSection(sectionId, `desktop-nav-${sectionId}`)}
                  className={`rounded-full px-4 py-2 transition ${
                    hasScrolledHeader || isMobileMenuOpen
                      ? "text-[var(--foreground-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
                      : "text-white/80 hover:bg-white/12 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                className="hidden bg-[var(--cta-blue)] text-white hover:bg-[var(--cta-blue-strong)] lg:inline-flex"
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
              <button
                type="button"
                className={`flex size-11 items-center justify-center rounded-full transition lg:hidden ${
                  hasScrolledHeader || isMobileMenuOpen
                    ? "bg-[var(--surface-alt)] text-[var(--foreground)]"
                    : "bg-black/18 text-white hover:bg-black/26"
                }`}
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setIsMobileMenuOpen((current) => !current)}
              >
                {isMobileMenuOpen ? <TbX className="text-[1.35rem]" /> : <TbMenu2 className="text-[1.35rem]" />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen ? (
            <div className="mt-2 rounded-[1.4rem] bg-white p-3 shadow-[0_24px_50px_rgba(14,8,10,0.12)] lg:hidden">
              <nav className="grid gap-2" aria-label="Mobile navigation">
                {navItems.map(([label, sectionId]) => (
                  <button
                    key={sectionId}
                    type="button"
                    onClick={() => scrollToSection(sectionId, `mobile-nav-${sectionId}`)}
                    className="flex items-center justify-between rounded-[1rem] bg-[var(--surface-alt)] px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)]"
                  >
                    <span>{label}</span>
                    <PiArrowRightDuotone className="text-xl" />
                  </button>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      </header>

      <main className="pb-24 lg:pb-10">
        <section id="hero" className="relative overflow-hidden bg-white">
          <div ref={heroTopRef} className="absolute top-0 h-px w-px" aria-hidden="true" />
          <div className="absolute inset-0 hidden md:block">
            <Image
              src={projectFacts.images.hero}
              alt="Nikoo Homes 8 hero view"
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,7,8,0.78)_0%,rgba(11,7,8,0.4)_50%,rgba(11,7,8,0.16)_100%)]" />
          </div>

          <div className="section-shell relative">
            <div className="grid min-h-[calc(100svh-8rem)] gap-4 pb-6 pt-0 md:min-h-[82svh] md:gap-8 md:pb-10 md:pt-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div className="md:hidden">
                <div className="hero-entry relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] h-[58svh] min-h-[28rem] w-screen overflow-hidden">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative h-full w-full">
                    <Image
                      src={projectFacts.images.hero}
                      alt="Nikoo Homes 8 hero banner"
                      fill
                      sizes="100vw"
                      className="object-cover object-center"
                      priority
                    />
                  </div>
                </div>

                <div className="hero-entry px-0 pb-1 pt-5 text-[var(--foreground)]">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--brand-red)]">
                    Bhartiya City presents
                  </p>
                  <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.7rem] leading-[0.9] tracking-[-0.05em] text-[var(--foreground)]">
                    Nikoo Homes 8
                  </h1>
                  <p className="mt-3 max-w-[22ch] text-[1rem] font-medium leading-6 text-[var(--foreground-muted)]">
                    Garden residences shaped for the Thanisandra growth corridor.
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    {heroHighlights.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[var(--foreground)]">
                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--brand-red)]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hero-entry hidden text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)] md:block md:max-w-[42rem] lg:pt-2">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--brand-cream)]">
                  Bhartiya City presents
                </p>
                <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(3rem,6vw,5.8rem)] leading-[0.88] tracking-[-0.05em] text-[#fff8f2]">
                  Nikoo Homes 8
                </h1>
                <p className="mt-3 max-w-[20ch] text-[1.05rem] font-semibold leading-7 text-[#fff4ee] md:text-[1.3rem] md:leading-8">
                  Garden residences shaped for the Thanisandra growth corridor.
                </p>
                <div className="mt-6 grid max-w-3xl gap-3 text-sm font-semibold leading-6 text-[#fff4ee] md:grid-cols-3">
                  {heroHighlights.map((item) => (
                    <div key={item} className="rounded-[1.35rem] border border-white/22 bg-white/18 px-4 py-4 backdrop-blur-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="hero-entry hidden w-full rounded-[1.9rem] bg-[var(--surface)] p-4 shadow-[0_28px_80px_rgba(71,8,13,0.18)] md:p-5 lg:ml-auto lg:block lg:max-w-[23rem]">
                <div className="rounded-[1.3rem] bg-[var(--brand-red)] px-4 py-3 text-[var(--ink-inverse)]">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-cream)]">
                    Main Enquiry
                  </p>
                  <h2 className="mt-2 text-[1.15rem] font-semibold leading-tight text-[var(--ink-inverse)]">
                    Get exact availability and current pricing in one response.
                  </h2>
                </div>
                <MainLeadForm
                  hiddenBase={hiddenBase}
                  formName="hero"
                  ctaSource="hero-main-form"
                  selectedUnit={selectedUnit}
                  submitLabel="Enquiry"
                  compact
                />
              </div>
            </div>
          </div>
        </section>

        <section id="main-enquiry-form" className="bg-[var(--background)] lg:hidden">
          <div className="section-shell py-6">
            <div className="rounded-[2rem] bg-[var(--surface)] p-4 shadow-[0_24px_70px_rgba(71,8,13,0.08)]">
              <div className="rounded-[1.3rem] bg-[var(--surface-alt)] px-4 py-4">
                <p className="eyebrow">Main Enquiry</p>
                <h2 className="display-title mt-2 text-[1.6rem] leading-[1] tracking-[-0.04em]">
                  Enquire now
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  Share your details after the hero and we will continue with pricing, brochure support and callback.
                </p>
              </div>
              <MainLeadForm
                hiddenBase={hiddenBase}
                formName="mobile-hero"
                ctaSource="mobile-hero-main-form"
                selectedUnit={selectedUnit}
                submitLabel="Enquiry"
              />
            </div>
          </div>
        </section>

        <section id="overview" className="bg-[var(--background)]">
          <div className="section-shell py-12 md:py-16">
            <SectionHeader
              eyebrow="Why choose Nikoo 8"
              title="Why Choose Nikoo 8"
              body="A cleaner comparison flow with alternating points, clearer spacing and better visual rhythm on mobile and desktop."
            />

            <div className="relative mt-8 md:hidden">
              <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[var(--line)] md:block" />
              <div className="grid gap-5 md:gap-6">
                {uspHighlights.map((item, index) => {
                  const Icon = uspIcons[item.title];
                  const alignsLeft = index % 2 === 0;

                  return (
                    <article
                      key={item.title}
                      data-reveal={alignsLeft ? "left" : "right"}
                      className={`reveal-card relative md:w-[calc(50%-1.5rem)] ${
                        alignsLeft ? "md:mr-auto" : "md:ml-auto"
                      }`}
                    >
                      <div className="relative rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_48px_rgba(71,8,13,0.08)] md:p-6">
                        <span
                          className={`absolute top-6 hidden size-14 items-center justify-center rounded-[1.2rem] bg-[var(--surface-alt)] text-[var(--brand-red)] shadow-[0_18px_38px_rgba(71,8,13,0.08)] md:flex ${
                            alignsLeft ? "-right-7" : "-left-7"
                          }`}
                        >
                          <Icon className="text-[1.9rem]" />
                        </span>

                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
                              Point {String(index + 1).padStart(2, "0")}
                            </p>
                            <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-[1.55rem]">
                              {item.title}
                            </h3>
                          </div>
                          <span className="flex size-12 items-center justify-center rounded-[1rem] bg-[var(--surface-alt)] text-[var(--brand-red)] md:hidden">
                            <Icon className="text-[1.75rem]" />
                          </span>
                        </div>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--foreground-muted)] md:text-base md:leading-7">
                          {item.text}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 hidden md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-12 lg:gap-x-16">
              {uspHighlights.map((item) => {
                const Icon = uspDesktopIcons[item.title as keyof typeof uspDesktopIcons];

                return (
                  <article
                    key={item.title}
                    className="flex items-start gap-5 border-b border-[var(--line)] pb-10 last:border-b md:last:border-b lg:pb-12"
                  >
                    <div className="shrink-0 pt-1 text-[var(--brand-red)]">
                      <Icon width={44} height={44} strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="text-[1.45rem] font-semibold tracking-[-0.035em] text-[var(--foreground)] lg:text-[1.7rem]">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-[34ch] text-[0.98rem] leading-7 text-[var(--foreground-muted)] lg:text-base">
                        {item.text}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="floorplans" className="bg-[var(--surface-alt)]">
          <div className="section-shell py-12 md:py-16">
            <SectionHeader eyebrow="Floor plans" title="Choose Apartment Option" />

            <div className="mt-6 rounded-[2rem] bg-[var(--surface)] p-4 shadow-[0_24px_70px_rgba(71,8,13,0.08)] md:p-6">
              <div className="rounded-[1.5rem] bg-[var(--surface-alt)] p-4 md:p-5">
                <label className="form-label text-[var(--foreground)]" htmlFor="floorplan-selector">
                  Choose Apartment option
                </label>
                <div className="relative">
                  <select
                    id="floorplan-selector"
                    value={selectedUnit.slug}
                    onChange={(event) =>
                      setSelectedUnit(units.find((unit) => unit.slug === event.target.value) ?? primaryUnit)
                    }
                    className="compact-input min-h-12 appearance-none pr-11 text-base font-semibold"
                  >
                    {units.map((unit) => (
                      <option key={unit.slug} value={unit.slug}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  <TbChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[1.1rem] text-[var(--brand-red)]" />
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
                <div className="rounded-[1.6rem] bg-[var(--surface-alt)] p-4 md:p-5">
                  <div className="grid grid-cols-2 gap-3 rounded-[1.25rem] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(71,8,13,0.06)]">
                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
                        Selected
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{selectedUnit.label}</p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
                        Starting
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{selectedStartingPrice}</p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
                        Saleable area
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                        {selectedUnit.saleableArea} sq ft
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
                        Best fit
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{selectedUnit.buyerFit}</p>
                    </div>
                  </div>

                  <div className="mt-4 hidden md:block">
                    <p className="eyebrow">Basic enquiry</p>
                    <h3 className="display-title mt-2 text-[1.45rem] leading-[1] tracking-[-0.04em]">
                      Ask for this plan
                    </h3>
                    <MainLeadForm
                      hiddenBase={hiddenBase}
                      formName="floorplans"
                      ctaSource="floorplan-basic-form"
                      selectedUnit={selectedUnit}
                      submitLabel="Enquiry"
                      compact
                      showUnitField={false}
                    />
                  </div>
                </div>

                <div className="rounded-[1.6rem] bg-[#fffaf8] p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">Plan preview</p>
                      <h3 className="display-title mt-2 text-[1.55rem] leading-[1] tracking-[-0.04em]">
                        {selectedUnit.label}
                      </h3>
                    </div>
                    <div className="rounded-full bg-[var(--surface-alt)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-red)]">
                      Miniature view
                    </div>
                  </div>

                  <div className="relative mt-4 flex min-h-[16rem] items-center justify-center overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-white">
                    <Image
                      key={`${selectedUnit.slug}-image`}
                      src={selectedUnit.image}
                      alt={`${selectedUnit.label} floor plan`}
                      width={1400}
                      height={1050}
                      className="h-full max-h-[22rem] w-full animate-[fade-in_220ms_ease] object-contain p-3 md:p-5"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 md:hidden">
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
                  <PiArrowRightDuotone className="text-xl" />
                  Get Selected Floor Plan
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="amenities" className="bg-[var(--background)]">
          <div className="section-shell py-12 md:py-16">
            <SectionHeader
              eyebrow="Amenities"
              title="Amenities"
              body="A neater two-column read with larger sketch-style icons and stronger labels."
              align="center"
            />

            <div className="mt-8 grid grid-cols-2 gap-3 md:hidden">
              {amenityHighlights.map((item, index) => {
                const Icon = amenityIcons[item.label] ?? PiFlowerLotusDuotone;

                return (
                  <article
                    key={item.label}
                    data-reveal="up"
                    className="reveal-card rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_18px_46px_rgba(71,8,13,0.07)] md:p-5"
                    style={{ transitionDelay: `${index * 40}ms` }}
                  >
                    <div className="flex justify-center text-[var(--brand-red)]">
                      <Icon className="text-[2.85rem] md:text-[3.35rem]" />
                    </div>
                    <h3 className="mt-3 text-center text-[1.05rem] font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-[1.28rem]">
                      {item.label}
                    </h3>
                    <p className="mt-2 text-center text-sm leading-6 text-[var(--foreground-muted)] md:px-2">
                      {item.text}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 hidden overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] md:grid md:grid-cols-4">
              {amenityHighlights.map((item, index) => {
                const Icon = amenityDesktopIcons[item.label as keyof typeof amenityDesktopIcons] ?? Community;
                const isLastCol = (index + 1) % 4 === 0;
                const isTopRow = index < 4;

                return (
                  <article
                    key={item.label}
                    className={`relative min-h-[17rem] overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fff8f5_100%)] px-6 py-7 ${
                      !isLastCol ? "border-r border-[var(--line)]" : ""
                    } ${isTopRow ? "border-b border-[var(--line)]" : ""}`}
                  >
                    <span className="absolute inset-x-5 top-4 h-px bg-[linear-gradient(90deg,transparent,var(--line),transparent)]" />
                    <span className="absolute inset-x-5 bottom-4 h-px bg-[linear-gradient(90deg,transparent,var(--line),transparent)]" />
                    <div className="relative z-10 flex h-full flex-col items-start">
                      <div className="rounded-[1rem] border border-[rgba(143,23,32,0.16)] bg-white/90 p-3 text-[var(--brand-red)]">
                        <Icon width={38} height={38} strokeWidth={1.6} />
                      </div>
                      <h3 className="mt-5 text-[1.25rem] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                        {item.label}
                      </h3>
                      <p className="mt-3 max-w-[18rem] text-sm leading-6 text-[var(--foreground-muted)]">
                        {item.text}
                      </p>
                    </div>
                  </article>
                );
              })}
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
                        tabIndex={-1}
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
                      const Icon = locationIcons[cluster.label];
                      const isOpen = activeLocationCategory === cluster.label;

                      return (
                        <div
                          key={cluster.label}
                          className="overflow-hidden rounded-[1.2rem] bg-[var(--surface)] shadow-[0_10px_30px_rgba(71,8,13,0.05)]"
                        >
                          <button
                            type="button"
                            onClick={() => setActiveLocationCategory(cluster.label)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="text-[1.45rem] text-[var(--brand-red)]" />
                              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--foreground)]">
                                {cluster.label}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                              {cluster.items.length} places
                            </span>
                          </button>
                          {isOpen ? (
                            <div className="grid gap-3 px-4 pb-4 animate-[fade-in_220ms_ease]">
                              {cluster.items.map((item) => (
                                <div
                                  key={item.name}
                                  className="flex items-center justify-between gap-3 rounded-[1rem] bg-[#fff5f2] px-4 py-3"
                                >
                                  <span className="text-sm font-medium text-[var(--foreground)]">{item.name}</span>
                                  <span className="rounded-full bg-[var(--brand-red)] px-3 py-1 text-xs font-semibold text-white">
                                    {item.time}
                                  </span>
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
            <div className="grid gap-6 rounded-[2rem] bg-[var(--surface)] p-5 shadow-[0_24px_70px_rgba(71,8,13,0.08)] lg:grid-cols-[0.82fr_1.18fr] lg:p-8">
              <div className="relative pl-4">
                <span className="absolute left-0 top-1 h-24 w-1 rounded-full bg-[var(--brand-red)]" />
                <p className="eyebrow">Final Enquiry</p>
                <h2 className="display-title mt-3 max-w-[13ch] text-[2rem] leading-[0.96] tracking-[-0.05em] md:text-[3rem]">
                  Request the right apartment update without a long form.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--foreground-muted)] md:text-base md:leading-7">
                  Share your preferred apartment option once and we will route the brochure, price guidance or visit support through the right channel.
                </p>
              </div>

              <div className="rounded-[1.6rem] bg-[var(--surface-alt)] p-4 md:p-5">
                <div className="flex items-center gap-4">
                  <Image src="/nikoo/logo-red.png" alt="Nikoo Homes logo" width={151} height={65} className="h-10 w-auto" />
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
                      Bhartiya City
                    </p>
                    <p className="text-sm text-[var(--foreground-muted)]">Main project enquiry form</p>
                  </div>
                </div>
                <MainLeadForm
                  hiddenBase={hiddenBase}
                  formName="final"
                  ctaSource="final-main-form"
                  selectedUnit={selectedUnit}
                  submitLabel="Enquiry"
                />
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
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--brand-red)]">
                    Bhartiya City
                  </p>
                  <p className="text-sm text-[var(--foreground-muted)]">Nikoo Homes 8</p>
                </div>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
                Nikoo Homes 8 at Bhartiya Garden Enclave on {projectFacts.locationShort}. Request brochure, pricing and site visit support from the project enquiry desk.
              </p>
            </div>

            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--brand-red)]">
                Get updates
              </p>
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

          <p className="mt-6 text-xs leading-6 text-[var(--foreground-muted)]">{micrositeDisclaimer}</p>
        </div>
      </footer>

      <div className="mobile-sticky-actions fixed bottom-4 left-3 right-3 z-50 lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => scrollToSection("main-enquiry-form", "mobile-sticky-enquiry")}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.15rem] border border-white/75 bg-white/90 text-[var(--cta-blue)] shadow-[0_14px_34px_rgba(31,102,229,0.16)] backdrop-blur"
          >
            <PiEnvelopeSimpleDuotone className="text-[1.2rem]" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em]">Enquiry</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("floorplans", "mobile-sticky-floorplan")}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.15rem] border border-white/75 bg-white/90 text-[var(--brand-red)] shadow-[0_14px_34px_rgba(143,23,32,0.14)] backdrop-blur"
          >
            <PiHouseLineDuotone className="text-[1.2rem]" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em]">Floor Plan</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("final-enquiry", "mobile-sticky-sitevisit")}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.15rem] border border-white/75 bg-white/90 text-[var(--cta-green)] shadow-[0_14px_34px_rgba(31,157,89,0.14)] backdrop-blur"
          >
            <PiCalendarDotsDuotone className="text-[1.2rem]" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em]">Site Visit</span>
          </button>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-50 hidden flex-col gap-3 lg:flex">
        <button
          type="button"
          aria-label="Instant connect"
          onClick={() =>
            openLeadModal(
              "instant_call",
              "desktop-sticky-call",
              "Instant connect",
              "Choose direct call or WhatsApp, or leave your details for a fast callback.",
            )
          }
          className="flex size-14 items-center justify-center rounded-full bg-[rgba(255,255,255,0.94)] text-[var(--cta-green)] shadow-[0_18px_40px_rgba(30,120,68,0.16)]"
        >
          <PiPhoneCallDuotone className="text-[1.7rem]" />
        </button>
        <button
          type="button"
          aria-label="Request brochure"
          onClick={() =>
            openLeadModal(
              "brochure",
              "desktop-sticky-brochure",
              "Request brochure",
              "Share your details to receive the brochure link for Nikoo Homes 8.",
            )
          }
          className="flex size-14 items-center justify-center rounded-full bg-[rgba(255,255,255,0.94)] text-[var(--brand-red)] shadow-[0_18px_40px_rgba(154,23,36,0.16)]"
        >
          <PiDownloadSimpleDuotone className="text-[1.7rem]" />
        </button>
        <button
          type="button"
          aria-label="Book site visit"
          onClick={() =>
            openLeadModal(
              "site_visit",
              "desktop-sticky-visit",
              "Book a site visit",
              "Tell us how to reach you and we will coordinate a guided site visit.",
            )
          }
          className="flex size-14 items-center justify-center rounded-full bg-[rgba(255,255,255,0.94)] text-[var(--cta-blue)] shadow-[0_18px_40px_rgba(24,86,198,0.16)]"
        >
          <PiCalendarDotsDuotone className="text-[1.7rem]" />
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
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
                      Bhartiya City
                    </p>
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
                    <PiPhoneDuotone className="text-xl" />
                    Call now
                  </a>
                  <a
                    href={getWhatsAppUrl(buildWhatsAppMessage("price_sheet", leadModal.unit.label))}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleWhatsAppClick(`${leadModal.ctaSource}-whatsapp`)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--cta-green)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--cta-green-strong)]"
                  >
                    <PiWhatsappLogoDuotone className="text-xl" />
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
