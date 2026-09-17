export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { taskId } = req.query;
  if (!taskId) {
    return res.status(400).json({ error: "Missing taskId" });
  }

  const apiKey = process.env.TRIPO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "TRIPO_API_KEY is not configured" });
  }

  try {
    const tripoRes = await fetch(`https://openapi.tripo3d.ai/v3/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!tripoRes.ok) {
      const errText = await tripoRes.text();
      return res.status(502).json({ error: `Tripo error: ${errText}` });
    }

    const data = await tripoRes.json();
    const status = data.data?.status;

    if (status === "success") {
      return res.status(200).json({
        status: "success",
        modelUrl: data.data?.output?.pbr_model ?? data.data?.output?.model,
      });
    }
    if (["failed", "banned", "expired", "cancelled"].includes(status)) {
      return res.status(200).json({ status: "failed", error: `Generation ${status}` });
    }
    // "queued" or "running"
    return res.status(200).json({ status: "pending", progress: data.data?.progress ?? 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to check asset status" });
  }
}