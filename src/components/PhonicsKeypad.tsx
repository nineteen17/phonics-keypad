"use client";

import { useCallback, useEffect, useState } from "react";
import { LETTERS, VOWELS, playLetter, preloadVoices, type PhonicsLetter, type VoiceType } from "@/lib/phonics";

const PAD_COLORS = [
  "bg-rose-400 border-rose-600",
  "bg-orange-400 border-orange-600",
  "bg-amber-400 border-amber-600",
  "bg-lime-400 border-lime-600",
  "bg-emerald-400 border-emerald-600",
  "bg-sky-400 border-sky-600",
  "bg-indigo-400 border-indigo-600",
  "bg-fuchsia-400 border-fuchsia-600",
];

export default function PhonicsKeypad() {
  const [voice, setVoice] = useState<VoiceType>("girl");
  const [upper, setUpper] = useState(false);
  const [showPictures, setShowPictures] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    preloadVoices();
  }, []);

  const press = useCallback(
    (item: PhonicsLetter) => {
      playLetter(item, voice);
      setActive(item.letter);
      window.setTimeout(() => setActive((cur) => (cur === item.letter ? null : cur)), 250);
    },
    [voice],
  );

  // Physical keyboard support: typing a letter plays its sound.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const item = LETTERS.find((l) => l.letter === e.key.toLowerCase());
      if (item) press(item);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex rounded-full bg-white p-1 shadow-md">
          {(["girl", "boy"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVoice(v)}
              className={`rounded-full px-5 py-2 text-lg font-bold transition-colors ${
                voice === v ? (v === "girl" ? "bg-pink-500 text-white" : "bg-blue-500 text-white") : "text-slate-600"
              }`}
            >
              {v === "girl" ? "👧 Girl" : "👦 Boy"}
            </button>
          ))}
        </div>
        <div className="flex rounded-full bg-white p-1 shadow-md">
          {[false, true].map((u) => (
            <button
              key={String(u)}
              onClick={() => setUpper(u)}
              className={`rounded-full px-5 py-2 text-lg font-bold transition-colors ${
                upper === u ? "bg-violet-500 text-white" : "text-slate-600"
              }`}
            >
              {u ? "ABC" : "abc"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowPictures((s) => !s)}
          aria-pressed={showPictures}
          className={`rounded-full px-5 py-3 text-lg font-bold shadow-md transition-colors ${
            showPictures ? "bg-emerald-500 text-white" : "bg-white text-slate-600"
          }`}
        >
          {showPictures ? "🖼️ Pictures on" : "🚫 Pictures off"}
        </button>
      </div>

      <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
        {LETTERS.map((item, i) => {
          const isVowel = VOWELS.has(item.letter);
          return (
            <button
              key={item.letter}
              onClick={() => press(item)}
              aria-label={`${item.letter} as in ${item.example}`}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border-b-8 text-white shadow-lg transition-transform active:translate-y-1 active:border-b-2 ${
                PAD_COLORS[i % PAD_COLORS.length]
              } ${active === item.letter ? "translate-y-1 scale-95 border-b-2" : ""} ${
                isVowel ? "ring-4 ring-yellow-300" : ""
              }`}
            >
              <span className="text-5xl font-extrabold drop-shadow sm:text-6xl">
                {upper ? item.letter.toUpperCase() : item.letter}
              </span>
              {showPictures && (
                <>
                  <span className="mt-1 text-xl sm:text-2xl" aria-hidden>
                    {item.emoji}
                  </span>
                  <span className="text-xs font-semibold opacity-90 sm:text-sm">{item.example}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-slate-500">Tip: you can also type letters on your keyboard. Vowels have a yellow ring.</p>
    </div>
  );
}
