import PhonicsKeypad from "@/components/PhonicsKeypad";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 bg-gradient-to-b from-sky-100 to-yellow-50 px-4 py-8">
      <h1 className="text-4xl font-extrabold text-slate-800 sm:text-5xl">Phonics Keypad</h1>
      <PhonicsKeypad />
    </main>
  );
}
