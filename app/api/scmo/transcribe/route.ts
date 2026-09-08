import { NextResponse } from "next/server";
import { isScmoProductMode } from "@/lib/scmo-product-mode";

export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const OPENAI_TRANSCRIPTIONS_URL = "https://api.openai.com/v1/audio/transcriptions";
const DEFAULT_STT_MODEL = "gpt-4o-mini-transcribe";
const TRANSCRIPTION_TIMEOUT_MS = 120_000;

function getOpenAiApiKey(): string | null {
  return process.env.SCMO_STT_OPENAI_API_KEY?.trim()
    || process.env.OPENAI_API_KEY?.trim()
    || null;
}

function getTranscriptionModel(): string {
  return process.env.SCMO_STT_MODEL?.trim() || DEFAULT_STT_MODEL;
}

function getAudioExtension(type: string): string {
  if (type.includes("webm")) return "webm";
  if (type.includes("mp4")) return "mp4";
  if (type.includes("mpeg")) return "mp3";
  if (type.includes("wav")) return "wav";
  if (type.includes("m4a")) return "m4a";
  return "webm";
}

export async function POST(req: Request) {
  if (!isScmoProductMode) {
    return NextResponse.json({ error: "SCMO product mode is required" }, { status: 404 });
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    return NextResponse.json({
      error: "OpenAI speech-to-text is not configured. Set SCMO_STT_OPENAI_API_KEY or OPENAI_API_KEY in the runtime.",
    }, { status: 503 });
  }

  try {
    const formData = await req.formData();
    const audio = formData.get("audio");
    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "audio file is required" }, { status: 400 });
    }
    if (!audio.type.startsWith("audio/")) {
      return NextResponse.json({ error: "audio must be an audio file" }, { status: 400 });
    }
    if (audio.size <= 0) {
      return NextResponse.json({ error: "audio file is empty" }, { status: 400 });
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "audio file exceeds 25 MB" }, { status: 413 });
    }

    const upstreamFormData = new FormData();
    const filename = audio.name || `scmo-voice-intake.${getAudioExtension(audio.type)}`;
    upstreamFormData.set("file", audio, filename);
    upstreamFormData.set("model", getTranscriptionModel());
    upstreamFormData.set("response_format", "json");

    const response = await fetch(OPENAI_TRANSCRIPTIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: upstreamFormData,
      signal: AbortSignal.timeout(TRANSCRIPTION_TIMEOUT_MS),
    });

    const responseText = await response.text();
    if (!response.ok) {
      return NextResponse.json({
        error: "OpenAI transcription failed",
        status: response.status,
        detail: responseText.slice(0, 500),
      }, { status: 502 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(responseText);
    } catch {
      return NextResponse.json({ error: "OpenAI transcription response was not valid JSON" }, { status: 502 });
    }

    const transcript = typeof payload === "object" && payload !== null && "text" in payload
      ? String((payload as { text?: unknown }).text ?? "").trim()
      : "";

    if (!transcript) {
      return NextResponse.json({ error: "OpenAI transcription returned an empty transcript" }, { status: 502 });
    }

    return NextResponse.json({ transcript, model: getTranscriptionModel() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = error instanceof DOMException && error.name === "TimeoutError" ? 504 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
