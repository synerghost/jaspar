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
        <div className="grid gap-12 md:grid-cols-2 lg:gap-24">
          <Reveal>
            <span className="eyebrow">Contact</span>
            <h1 className="display mt-4 text-4xl md:text-6xl">
              {fr ? "Écrivez-nous." : "Get in touch."}
            </h1>
            <p className="mt-6 max-w-sm text-stone-700">
              {fr
                ? "Pour les commandes sur-mesure, la presse, les collaborations et les enchères privées."
                : "For made-to-measure orders, press, collaborations and private auctions."}
            </p>

            <dl className="mt-10 flex flex-col gap-6 text-sm">
              <div>
                <dt className="eyebrow mb-1">Email</dt>
                <dd>
                  <a href="mailto:studio@j4spar.com" className="link-underline">
                    studio@j4spar.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-1">{fr ? "Atelier" : "Atelier"}</dt>
                <dd className="text-stone-700">Paris XI — {fr ? "sur rendez-vous" : "by appointment"}</dd>
              </div>
              <div>
                <dt className="eyebrow mb-1">Instagram</dt>
                <dd>
                  <a href="https://instagram.com" className="link-underline">
                    @jaspar
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={80}>
            {sent ? (
              <div className="flex h-full min-h-48 items-center border border-ink/10 p-8">
                <p className="text-stone-700">
                  {fr
                    ? "Merci. Nous revenons vers vous sous 48h."
                    : "Thank you. We'll get back to you within 48h."}
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
                <p className="text-xs text-stone-500">
                  {fr
                    ? "Formulaire de démonstration — aucun message n'est réellement envoyé."
                    : "Demo form — no message is actually sent."}
                </p>
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
