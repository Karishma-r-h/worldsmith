import { useState } from "react";
import { useSceneStore } from "../store/sceneStore.js";

export default function PromptBar() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
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
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      applyOps(data.ops ?? []);
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
      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[min(500px,90vw)]"
    >
      <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-700 rounded-lg px-3 py-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Try: "add a red sphere"'
          className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-neutral-500"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading" || !value.trim()}
          className="text-xs px-3 py-1.5 rounded-md bg-green-600 text-white disabled:opacity-40"
        >
          {status === "loading" ? "Thinking…" : "Build"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-1 text-xs text-red-400">Something went wrong — try again.</p>
      )}
    </form>
  );
}