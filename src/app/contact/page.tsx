"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n";
import { Container, Section } from "@/components/Layout";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";

export default function ContactPage() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [sent, setSent] = useState(false);

  return (
    <Section className="!pt-16">
      <Container>
        <div className="grid gap-16 md:grid-cols-2 lg:gap-28">
          <Reveal>
            <span className="eyebrow">Contact</span>
            <h1 className="display mt-5 text-4xl md:text-6xl">
              {fr ? "Écrivez-nous." : "Get in touch."}
            </h1>
            <p className="mt-6 max-w-sm text-stone-600">
              {fr
                ? "Pour les commandes sur-mesure, la presse et les collaborations."
                : "For made-to-measure orders, press and collaborations."}
            </p>

            <dl className="mt-10 flex flex-col gap-7 text-sm">
              <div>
                <dt className="eyebrow mb-2">Email</dt>
                <dd>
                  <a href="mailto:contact@j4spar.com" className="link-underline">
                    contact@j4spar.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">Instagram</dt>
                <dd>
                  <a
                    href="https://instagram.com/j4spar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline"
                  >
                    @j4spar
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">TikTok</dt>
                <dd>
                  <a
                    href="https://www.tiktok.com/@jaspar.studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline"
                  >
                    @jaspar.studio
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">{fr ? "Atelier" : "Atelier"}</dt>
                <dd className="text-stone-600">
                  Paris — {fr ? "sur rendez-vous" : "by appointment"}
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={60}>
            {sent ? (
              <div className="flex min-h-48 items-center border border-ink/10 p-8">
                <p className="text-stone-600">
                  {fr
                    ? "Merci. Nous revenons vers vous rapidement."
                    : "Thank you. We'll get back to you shortly."}
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="flex flex-col gap-5"
              >
                <Field label={fr ? "Nom" : "Name"} name="name" />
                <Field label="Email" name="email" type="email" />
                <label className="flex flex-col gap-2">
                  <span className="eyebrow">Message</span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="resize-none border-b border-ink/30 bg-transparent py-2.5 text-sm focus:border-ink focus:outline-none"
                  />
                </label>
                <Button type="submit" size="lg" className="self-start">
                  {fr ? "Envoyer" : "Send"}
                </Button>
              </form>
            )}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      <input
        name={name}
        type={type}
        required
        className="border-b border-ink/30 bg-transparent py-2.5 text-sm focus:border-ink focus:outline-none"
      />
    </label>
  );
}
