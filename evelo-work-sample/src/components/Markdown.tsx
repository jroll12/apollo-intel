import { marked } from "marked";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

// Content is our own generated copy (not user input). Raw HTML in the source is escaped anyway.
const renderer = new marked.Renderer();
renderer.html = ({ text }) => text.replace(/</g, "&lt;");
renderer.link = ({ href, text }) => `<a href="${href}" target="_blank" rel="noreferrer">${text}</a>`;

export function Markdown({ source, className }: { source: string; className?: string }) {
  const html = useMemo(() => marked.parse(source, { renderer, async: false }) as string, [source]);
  return <div className={cn("prose-sm text-[15px] leading-relaxed", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
