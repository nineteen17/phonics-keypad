export type VoiceType = "girl" | "boy";

export interface PhonicsLetter {
  letter: string;
  /** Text fed to the speech engine to approximate the letter's sound. */
  say: string;
  example: string;
  emoji: string;
}

export const LETTERS: PhonicsLetter[] = [
  { letter: "a", say: "aah", example: "apple", emoji: "🍎" },
  { letter: "b", say: "buh", example: "ball", emoji: "⚽" },
  { letter: "c", say: "kuh", example: "cat", emoji: "🐱" },
  { letter: "d", say: "duh", example: "dog", emoji: "🐶" },
  { letter: "e", say: "eh", example: "egg", emoji: "🥚" },
  { letter: "f", say: "fuh", example: "fish", emoji: "🐟" },
  { letter: "g", say: "guh", example: "goat", emoji: "🐐" },
  { letter: "h", say: "huh", example: "hat", emoji: "🎩" },
  { letter: "i", say: "ih", example: "igloo", emoji: "🧊" },
  { letter: "j", say: "juh", example: "jam", emoji: "🍯" },
  { letter: "k", say: "kuh", example: "kite", emoji: "🪁" },
  { letter: "l", say: "luh", example: "lion", emoji: "🦁" },
  { letter: "m", say: "mmm", example: "moon", emoji: "🌙" },
  { letter: "n", say: "nuh", example: "nest", emoji: "🪺" },
  { letter: "o", say: "aw", example: "octopus", emoji: "🐙" },
  { letter: "p", say: "puh", example: "pig", emoji: "🐷" },
  { letter: "q", say: "kwuh", example: "queen", emoji: "👑" },
  { letter: "r", say: "ruh", example: "rabbit", emoji: "🐰" },
  { letter: "s", say: "sss", example: "sun", emoji: "☀️" },
  { letter: "t", say: "tuh", example: "tiger", emoji: "🐯" },
  { letter: "u", say: "uh", example: "umbrella", emoji: "☂️" },
  { letter: "v", say: "vuh", example: "van", emoji: "🚐" },
  { letter: "w", say: "wuh", example: "whale", emoji: "🐳" },
  { letter: "x", say: "ks", example: "fox", emoji: "🦊" },
  { letter: "y", say: "yuh", example: "yo-yo", emoji: "🪀" },
  { letter: "z", say: "zzz", example: "zebra", emoji: "🦓" },
];

export const VOWELS = new Set(["a", "e", "i", "o", "u"]);

const FEMALE_HINTS = ["female", "zira", "samantha", "karen", "moira", "tessa", "fiona", "victoria", "susan", "hazel", "aria", "jenny", "libby", "sonia", "natasha"];
const MALE_HINTS = ["male", "david", "mark", "daniel", "alex", "fred", "george", "guy", "ryan", "thomas", "james", "rishi"];

function pickVoice(voices: SpeechSynthesisVoice[], type: VoiceType): SpeechSynthesisVoice | undefined {
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const hints = type === "girl" ? FEMALE_HINTS : MALE_HINTS;
  const avoid = type === "girl" ? MALE_HINTS : FEMALE_HINTS;
  const name = (v: SpeechSynthesisVoice) => v.name.toLowerCase();
  // "female" contains "male", so check the opposite gender's hints don't match first.
  return (
    english.find((v) => hints.some((h) => name(v).includes(h)) && !(type === "boy" && name(v).includes("female"))) ??
    english.find((v) => !avoid.some((h) => name(v).includes(h))) ??
    english[0] ??
    voices[0]
  );
}

// Child-like settings: higher pitch for both, girl a bit higher than boy.
const VOICE_SETTINGS: Record<VoiceType, { pitch: number; rate: number }> = {
  girl: { pitch: 1.7, rate: 0.85 },
  boy: { pitch: 1.35, rate: 0.85 },
};

// Remembers which recorded files exist so we only probe each once.
const recordingAvailable = new Map<string, boolean>();

function speak(text: string, type: VoiceType) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(synth.getVoices(), type);
  if (voice) utterance.voice = voice;
  utterance.pitch = VOICE_SETTINGS[type].pitch;
  utterance.rate = VOICE_SETTINGS[type].rate;
  synth.speak(utterance);
}

/**
 * Plays /sounds/{girl|boy}/{letter}.mp3 if it exists, otherwise falls back
 * to the browser's speech engine.
 */
export function playLetter(item: PhonicsLetter, type: VoiceType) {
  const src = `/sounds/${type}/${item.letter}.mp3`;
  if (recordingAvailable.get(src) === false) {
    speak(item.say, type);
    return;
  }
  const audio = new Audio(src);
  audio.addEventListener("error", () => {
    recordingAvailable.set(src, false);
    speak(item.say, type);
  });
  audio.play().then(
    () => recordingAvailable.set(src, true),
    () => {
      // play() rejects on missing files too; the error listener handles fallback.
    },
  );
}

/** Some browsers load voices asynchronously; call once on mount to warm them up. */
export function preloadVoices() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }
}
