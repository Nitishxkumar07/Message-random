'use client';
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { Mail, Clock } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import messages from "@/message.json";
import ChatAI from "@/components/ChatAI";

/* Reusable section wrapper: new blocks built with <Section> match automatically */
function Section({
  id, title, subtitle, tone = "white", children,
}: {
  id?: string; title?: string; subtitle?: string;
  tone?: "white" | "muted"; children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`border-b border-slate-200 py-14 sm:py-20 ${tone === "muted" ? "bg-slate-50" : "bg-white"}`}
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {title && (
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
            {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/* Only mounted when "See examples" is clicked, so autoplay starts fresh each time */
function ExamplesCarousel() {
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));

  return (
    <div className="relative mx-auto w-full max-w-lg px-2 sm:px-14">
      <Carousel opts={{ loop: true }} plugins={[autoplay.current]} className="w-full">
        <CarouselContent>
          {messages.map((msg, index) => (
            <CarouselItem key={index}>
              <div className="p-2">
                <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                  <CardHeader className="border-b border-slate-100 pb-3">
                    <CardTitle className="flex items-center gap-3 text-base font-semibold text-slate-900">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                        <Mail className="size-4" />
                      </span>
                      <span className="truncate">Anonymous Feedback</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex min-h-28 items-center pt-5">
                    <p className="text-sm italic leading-relaxed text-slate-700 sm:text-base">
                      &ldquo;{msg.content}&rdquo;
                    </p>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-slate-400" />
                      {msg.received_in}
                    </span>
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                      Received
                    </span>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden border-slate-300 bg-white text-slate-600 hover:bg-slate-100 sm:flex" />
        <CarouselNext className="hidden border-slate-300 bg-white text-slate-600 hover:bg-slate-100 sm:flex" />
      </Carousel>
    </div>
  );
}

export default function Home() {
  const [showExamples, setShowExamples] = useState(false);
  const examplesRef = useRef<HTMLDivElement>(null);

  // scroll down to the cards when they open
  useEffect(() => {
    if (showExamples) {
      examplesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showExamples]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 antialiased">
      <main className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-gradient-to-b from-indigo-50 via-white to-white">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
            <span className="inline-block rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm">
              Anonymous · Honest · Real-time
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Mystery Messages{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                &amp; Feedback
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Explore real-time feedback and anonymous messages shared across the community.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
              >
                Get your link
              </Link>
              <button
                type="button"
                onClick={() => setShowExamples((v) => !v)}
                aria-expanded={showExamples}
                aria-controls="messages"
                className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
              >
                {showExamples ? "Hide examples" : "See examples"}
              </button>
            </div>
          </div>
        </section>

        {/* EXAMPLES: rendered only after the button is clicked */}
        {showExamples && (
          <div ref={examplesRef}>
            <Section
              id="messages"
              title="What people are sharing"
              subtitle="A few recent anonymous messages."
              tone="muted"
            >
              <ExamplesCarousel />
            </Section>
          </div>
        )}

        {/* AI ASSISTANT (rendered once, here only) */}
        <Section id="ask" title="Have a question?" subtitle="Ask our assistant about using Mystery Message.">
          <div className="mx-auto max-w-xl">
            <ChatAI />
          </div>
        </Section>

        {/* ✏️ NEXT SECTIONS GO HERE. Example:
        <Section id="how" title="How it works" tone="muted">
          <HowItWorks />
        </Section>
        */}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© 2026 Mystery Message. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="/sign-in" className="hover:text-slate-900">Sign in</Link>
            <Link href="/sign-up" className="hover:text-slate-900">Sign up</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}