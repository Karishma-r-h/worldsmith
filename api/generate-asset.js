export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body ?? {};
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const apiKey = process.env.TRIPO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "TRIPO_API_KEY is not configured" });
  }

  try {
    const tripoRes = await fetch("https://openapi.tripo3d.ai/v3/generation/text-to-model", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
        prompt,
        model: "v3.1-20260211",
        texture: true,
      }),
    });

    if (!tripoRes.ok) {
      const errText = await tripoRes.text();
      return res.status(502).json({ error: `Tripo error: ${errText}` });
    }

    const data = await tripoRes.json();
    return res.status(200).json({ taskId: data.data?.task_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to start asset generation" });
  }
}