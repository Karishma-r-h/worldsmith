const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    ops: {
      type: "array",
      items: {
        type: "object",
        properties: {
          op: { type: "string", enum: ["add", "setLighting", "setFog"] },
          shape: { type: "string", enum: ["box", "sphere", "cone"] },
          color: { type: "string", description: "A hex color like #FF0000" },
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

For every "add" operation, you MUST always include both "shape" and "color" —
never omit "color". If the user names a color (e.g. "red", "blue"), convert it to
the matching hex code (red -> #E53E3E, blue -> #3B82F6, green -> #22C55E,
yellow -> #EAB308, orange -> #F97316, purple -> #A855F7, black -> #1A1A1A,
white -> #F5F5F5). If the user doesn't mention a color at all, pick a reasonable
hex color yourself rather than leaving it out.

For each new object the user wants, pick whichever shape (box, sphere, or cone) is
closest to what they described. For lighting or fog changes, emit "setLighting" or
"setFog" instead. Only emit operations for what the user actually asked for.`;

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