const MAX_CONCURRENT = 2; 
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120_000;

let active = 0;
const pending = [];

function runNext() {
  if (active >= MAX_CONCURRENT || pending.length === 0) return;
  active += 1;
  const { task, resolve, reject } = pending.shift();
  task()
    .then(resolve, reject)
    .finally(() => {
      active -= 1;
      runNext();
    });
}

function enqueue(task) {
  return new Promise((resolve, reject) => {
    pending.push({ task, resolve, reject });
    runNext();
  });
}

async function pollForCompletion(taskId) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    const res = await fetch(`/api/asset-status?taskId=${encodeURIComponent(taskId)}`);
    if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
    const data = await res.json();
    if (data.status === "success") return data.modelUrl;
    if (data.status === "failed") throw new Error(data.error ?? "Generation failed");
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error("Generation timed out");
}

/** Starts a Tripo generation job for this prompt and resolves once it's done. */
export function resolveAssetForPrompt(prompt) {
  return enqueue(async () => {
    const kickoff = await fetch("/api/generate-asset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!kickoff.ok) throw new Error(`Failed to start generation: ${kickoff.status}`);
    const { taskId } = await kickoff.json();
    return pollForCompletion(taskId);
  });
}