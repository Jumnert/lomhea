import { NextResponse } from "next/server";

type TranslateRequest = {
  texts?: string[];
  target?: string;
  source?: string;
};

const TRANSLATE_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const MAX_TEXTS = 40;
const MAX_TEXT_LENGTH = 1500;

const cache = new Map<string, { value: string; expiresAt: number }>();

function cacheKey(source: string, target: string, text: string) {
  return `${source}|${target}|${text}`;
}

async function translateViaLibre(
  text: string,
  source: string,
  target: string,
): Promise<string> {
  const configured = process.env.LIBRETRANSLATE_URL?.trim();
  const endpoints = [
    configured,
    "https://translate.argosopentech.com/translate",
    "https://libretranslate.com/translate",
  ].filter(Boolean) as string[];

  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source,
          target,
          format: "text",
        }),
        cache: "no-store",
      });

      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }

      const data = (await res.json()) as { translatedText?: string };
      if (typeof data.translatedText === "string" && data.translatedText) {
        return data.translatedText;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Translation service unavailable");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranslateRequest;
    const source = (body.source || "en").toLowerCase();
    const target = (body.target || "km").toLowerCase();
    const rawTexts = Array.isArray(body.texts) ? body.texts : [];

    const texts = rawTexts
      .slice(0, MAX_TEXTS)
      .map((t) => (typeof t === "string" ? t : ""))
      .map((t) => t.trim())
      .map((t) => t.slice(0, MAX_TEXT_LENGTH));

    if (!texts.length) {
      return NextResponse.json({ translations: [] });
    }

    if (source === target) {
      return NextResponse.json({ translations: texts });
    }

    const now = Date.now();
    const translations: string[] = [];

    for (const text of texts) {
      if (!text) {
        translations.push("");
        continue;
      }

      const key = cacheKey(source, target, text);
      const cached = cache.get(key);
      if (cached && cached.expiresAt > now) {
        translations.push(cached.value);
        continue;
      }

      try {
        const translated = await translateViaLibre(text, source, target);
        cache.set(key, {
          value: translated,
          expiresAt: now + TRANSLATE_CACHE_TTL_MS,
        });
        translations.push(translated);
      } catch {
        // Fail soft: keep original text so UI never breaks.
        translations.push(text);
      }
    }

    return NextResponse.json({ translations });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to translate text" },
      { status: 500 },
    );
  }
}
