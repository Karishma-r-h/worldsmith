const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    ops: {
      type: "array",
      items: {
        anyOf: [
          {
            type: "object",
            description: "Add a simple primitive shape.",
            properties: {
              op: { type: "string", enum: ["add"] },
              shape: { type: "string", enum: ["box", "sphere", "cone"] },
              color: { type: "string", description: "A hex color like #FF0000" },
            },
            required: ["op", "shape", "color"],
          },
          {
            type: "object",
            description: "Add a real-world object via text-to-3D generation.",
            properties: {
              op: { type: "string", enum: ["addGenerated"] },
              prompt: { type: "string", description: "A text-to-3D prompt, e.g. 'a weathered wooden log cabin, low poly'." },
            },
            required: ["op", "prompt"],
          },
          {
            type: "object",
            description: "Modify the most recently added/discussed object.",
            properties: {
              op: { type: "string", enum: ["modifyLast"] },
              color: { type: "string", description: "A hex color like #FF0000" },
              position: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
            },
            required: ["op"],
          },
          {
            type: "object",
            description: "Change the lighting mood.",
            properties: {
              op: { type: "string", enum: ["setLighting"] },
              mood: { type: "string", enum: ["midday", "sunset", "night"] },
            },
            required: ["op", "mood"],
          },
          {
            type: "object",
            description: "Turn fog on or off.",
            properties: {
              op: { type: "string", enum: ["setFog"] },
              enabled: { type: "boolean" },
            },
            required: ["op", "enabled"],
          },
        ],
      },
    },
  },
  required: ["ops"],
};

const SYSTEM_INSTRUCTION = `You control a 3D scene editor. Given a user's request and the
recent conversation, respond with a short list of scene operations as JSON, matching the
provided schema.

Use "add" for simple geometric requests naming a basic shape (box, sphere, cone).

Use "addGenerated" for anything real-world or specific (trees, buildings, vehicles, animals,
furniture) — include a concise "prompt" field for a text-to-3D generator.

Use "modifyLast" when the user refers to "it," "that," or clearly means to change the object
they just discussed, rather than create something new — e.g. "make it blue," "move it left."
Only include the fields that should change.

For lighting or fog changes, emit "setLighting" or "setFog". Only emit operations for what
the user actually asked for in their MOST RECENT message — use the earlier conversation only
to understand what "it" or "that" refers to, not to redo earlier requests.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, history } = req.body ?? {};
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
          contents: [
            ...(history ?? []).flatMap((turn) => [
              { role: "user", parts: [{ text: turn.prompt }] },
              { role: "model", parts: [{ text: turn.responseText }] },
            ]),
            { role: "user", parts: [{ text: prompt }] },
          ],
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