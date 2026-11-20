// The styles the picker offers: the five built-ins, then every style pack that carries its own card in
// styles/<id>/meta.json (the style market's pack). The folder name is the style's id, so the director and the engine
// find the pack under exactly that name.
import fs from 'node:fs';
import path from 'node:path';
import { ENGINE_DIR } from '@promptreel/engine/tools/project.mjs';

/** what the panel needs to show a style: its names for each interface language, a one-line summary and its colours */
export interface StyleCard {
  id: string; name: string; summary: string;
  /** its colours, ground first, for the small marks a chip draws in place of a picture */
  swatch?: string[];
  /** 'member': a paid plan draws in it */
  tier?: 'free' | 'member';
  /** the name and one-line summary per interface language, when the style's card has them */
  i18n?: Partial<Record<'zh' | 'en', { name: string; summary: string }>>;
}

/** the fallback names of the built-ins; the panel shows its own translated names for these ids */
const BUILT_IN: StyleCard[] = [
  { id: 'warm-story', name: 'Warm illustration', summary: 'Warm flat illustration with one metaphor object carried through the film; for investing, everyday life and psychology' },
  { id: 'study', name: 'Quiet study', summary: 'Hand-drawn on paper, ink lines and light washes; for books, history and methods' },
  { id: 'whiteboard', name: 'Whiteboard', summary: 'Marker on a whiteboard, drawn while explaining; for breaking down concepts, business models, methods and processes' },
  { id: 'chalkboard', name: 'Chalkboard', summary: 'Chalk on a dark green board; for maths, physics, history and other step-by-step classroom explanations' },
  { id: 'tech-dark', name: 'Dark technical', summary: 'Clean architecture diagrams and code on dark graphite; for software, AI and how systems work' },
];

/** a pack's meta.json, as far as the picker reads it */
interface MetaCard {
  name?: { zh?: unknown; en?: unknown };
  tagline?: { zh?: unknown; en?: unknown };
  swatch?: unknown;
  tier?: unknown;
}

const line = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const palette = (v: unknown): string[] | undefined => {
  const colours = Array.isArray(v) ? v.filter((c): c is string => typeof c === 'string' && !!c.trim()) : [];
  return colours.length ? colours : undefined;
};

/** one pack's card, or nothing when the pack has no name to show */
function fromMeta(id: string, meta: MetaCard): StyleCard | undefined {
  const zhName = line(meta.name?.zh), enName = line(meta.name?.en);
  const name = enName ?? zhName;
  if (!name) return undefined;
  const summary = line(meta.tagline?.en) ?? line(meta.tagline?.zh) ?? '';
  const zh = { name: zhName ?? name, summary: line(meta.tagline?.zh) ?? summary };
  const en = { name: enName ?? name, summary: line(meta.tagline?.en) ?? summary };
  const swatch = palette(meta.swatch);
  const tier = meta.tier === 'member' || meta.tier === 'free' ? meta.tier : undefined;
  return { id, name, summary, ...(swatch ? { swatch } : {}), ...(tier ? { tier } : {}), i18n: { zh, en } };
}

/** the built-ins first, then the packs with a card, each once, in id order */
function catalog(): StyleCard[] {
  const styles = [...BUILT_IN];
  const seen = new Set(styles.map((s) => s.id));
  let dirs: string[];
  try {
    dirs = fs.readdirSync(path.join(ENGINE_DIR, 'styles'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return styles;
  }
  for (const id of dirs.sort()) {
    if (seen.has(id)) continue;
    let meta: MetaCard;
    try {
      meta = JSON.parse(fs.readFileSync(path.join(ENGINE_DIR, 'styles', id, 'meta.json'), 'utf8'));
    } catch {
      continue; // a pack without a card (or one that cannot be read) is not offered
    }
    const style = fromMeta(id, meta);
    if (!style) continue;
    seen.add(id);
    styles.push(style);
  }
  return styles;
}

export const STYLES: StyleCard[] = catalog();
