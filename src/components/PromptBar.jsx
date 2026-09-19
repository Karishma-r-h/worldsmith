import { useState } from "react";
import { useSceneStore } from "../store/sceneStore.js";

export default function PromptBar() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [history, setHistory] = useState([]);
  const applyOps = useSceneStore((s) => s.applyOps);

  const submit = async (e) => {
    e.preventDefault();
    const prompt = value.trim();
    if (!prompt || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/plan-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      applyOps(data.ops ?? []);
      setHistory((h) => [
        ...h.slice(-5),
        { prompt, responseText: JSON.stringify(data.ops ?? []) },
      ]);
      setValue("");
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={submit}
      className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 w-[94vw] sm:w-[min(500px,90vw)]"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-900/90 border border-neutral-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Try: "add a red sphere"'
          className="flex-1 min-w-0 bg-transparent outline-none text-white text-xs sm:text-sm placeholder:text-neutral-500"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading" || !value.trim()}
          className="shrink-0 text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md bg-green-600 text-white disabled:opacity-40"
        >
          {status === "loading" ? "Thinking…" : "Build"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-1 text-[10px] sm:text-xs text-red-400">Something went wrong — try again.</p>
      )}
    </form>
  );
}