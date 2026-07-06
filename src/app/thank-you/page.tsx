import Image from "next/image";
import Link from "next/link";
import { PiArrowRightDuotone, PiHouseLineDuotone, PiPhoneCallDuotone } from "react-icons/pi";

import { projectFacts } from "@/data/nikoo-homes-8";

export const metadata = {
  title: "Thank You | Nikoo Homes 8",
  description: "Thank you for enquiring about Nikoo Homes 8.",
};

export default function ThankYouPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--brand-red-deep)] text-white">
      <Image
        src="/nikoo/hero/hero-desktop-july.png"
        alt="Nikoo Homes 8 township view"
        fill
        sizes="100vw"
        className="object-cover object-center opacity-32"
        priority
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(180deg,rgba(55,8,12,0.48)_0%,rgba(39,5,9,0.96)_100%)]" />

      <section className="section-shell relative z-10 flex min-h-screen items-center py-12">
        <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-white/18 bg-white/12 p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white text-[var(--brand-red)] shadow-[0_18px_50px_rgba(255,255,255,0.18)]">
            <PiHouseLineDuotone className="text-[2.1rem]" />
          </div>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-[2.6rem] leading-[0.92] tracking-[-0.04em] md:text-[4.4rem]">
            Thank you.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-white/86 md:text-lg">
            Your enquiry has been received. The project team will connect with the current apartment details shortly.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={projectFacts.contactHref}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[var(--brand-red)] transition hover:bg-[#fff2ef]"
            >
              <PiPhoneCallDuotone className="text-xl" />
              Call now
            </a>
            <Link
              href="/"
              className="cta-button-red flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm"
            >
              Back to site
              <PiArrowRightDuotone className="text-xl" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
