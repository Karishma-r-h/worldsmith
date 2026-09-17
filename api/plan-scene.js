const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    ops: {
      type: "array",
      items: {
        type: "object",
        properties: {
          op: { type: "string", enum: ["add", "addGenerated", "setLighting", "setFog"] },
          shape: { type: "string", enum: ["box", "sphere", "cone"] },
          color: { type: "string", description: "A hex color like #FF0000" },
          prompt: { type: "string", description: "Only for addGenerated: a text-to-3D prompt describing the real object, e.g. 'a weathered wooden log cabin, low poly'." },
          mood: { type: "string", enum: ["midday", "sunset", "night"] },
          enabled: { type: "boolean" },
        },
        required: ["op", "shape", "color"],
      },
    },
  },
  required: ["ops"],
};

const SYSTEM_INSTRUCTION = `You control a 3D scene editor. Given a user's request,
respond with a short list of scene operations as JSON, matching the provided schema.

Use "add" ONLY for simple geometric requests where the user explicitly names a basic
shape (box, sphere, cone) — e.g. "add a red sphere," "add a blue cube."

Use "addGenerated" for anything real-world or specific — trees, buildings, vehicles,
animals, furniture, anything that isn't just a plain geometric primitive. For these,
write a concise, descriptive "prompt" field suitable for a text-to-3D generator, e.g.
"a weathered wooden log cabin, low poly" or "a tall pine tree, stylized."

Every "add" op MUST always include both "shape" and "color" (convert named colors
to hex, e.g. red -> #E53E3E, blue -> #3B82F6, green -> #22C55E). Every "addGenerated"
op MUST include a "prompt" field instead.

For lighting or fog changes, emit "setLighting" or "setFog". Only emit operations
for what the user actually asked for.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body ?? {};
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  try {
    const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(502).json({ error: `Gemini error: ${errText}` });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text);
    return res.status(200).json({ ops: parsed.ops ?? [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Scene planning failed" });
  }
}