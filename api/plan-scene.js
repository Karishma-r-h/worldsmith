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