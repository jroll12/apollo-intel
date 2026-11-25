import { Phone, Mail } from "lucide-react";
import { Section } from "@/components/shared";

export function About() {
  return (
    <Section eyebrow="About" title="Jarret Roloff">
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4 text-[15px] leading-relaxed">
          <p>
            I build practical marketing and operations systems: a clear plan, fast production, and checks that catch mistakes before anything goes public. This sample is
            how I would work on the Evelo Team: start from what the team already does well, make it travel further, and keep leaders' time for decisions instead of
            chasing details.
          </p>
          <p>
            I use modern AI tools the way a strong coordinator uses a good assistant: to draft quickly, check thoroughly, and free up time for the parts that need a
            person, like agent relationships, client care and judgment calls. Every number here traces to a public source, and every draft went through compliance and
            editorial review before it reached this page.
          </p>
          <p>Thank you for considering me. I would love to walk you through any part of this.</p>
        </div>
        <div className="h-fit space-y-3 rounded-xl border bg-card p-5">
          <div className="font-display text-lg font-semibold">Get in touch</div>
          <a href="tel:6306698697" className="flex items-center gap-2 text-[14px]">
            <Phone className="size-4 text-[var(--sand)]" /> 630-669-8697
          </a>
          <a href="mailto:jroloff1@gmail.com" className="flex items-center gap-2 text-[14px] break-all">
            <Mail className="size-4 shrink-0 text-[var(--sand)]" /> jroloff1@gmail.com
          </a>
        </div>
      </div>
    </Section>
  );
}
