import { create } from "zustand";

let nextId = 1;

export const useSceneStore = create((set, get) => ({
  objects: [],
  selectedId: null,
  lighting: { mood: "midday" },
  fog: { enabled: false, density: 0.03 },

  setLighting: (mood) => set({ lighting: { mood } }),
  setFog: (changes) => set((state) => ({ fog: { ...state.fog, ...changes } })),

  serializeScene: () => {
    const { objects, lighting, fog } = get();
    return JSON.stringify({ objects, lighting, fog }, null, 2);
  },

  loadScene: (json) => {
    const data = JSON.parse(json);
    const maxId = data.objects.reduce((max, o) => Math.max(max, o.id), 0);
    nextId = maxId + 1; // so newly-added objects never collide with loaded ones
    set({
      objects: data.objects ?? [],
      lighting: data.lighting ?? { mood: "midday" },
      fog: data.fog ?? { enabled: false, density: 0.03 },
      selectedId: null,
    });
  },

  addObject: (shape) =>
    set((state) => {
      const id = nextId++;
      return {
        objects: [
          ...state.objects,
          {
            id,
            shape,
            position: [Math.random() * 4 - 2, 0.5, Math.random() * 4 - 2],
            color: "#8A9A80",
          },
        ],
        selectedId: id,
      };
    }),
    addPlaceholder: ({ prompt, position }) =>
    set((state) => {
      const id = nextId++;
      return {
        objects: [
          ...state.objects,
          {
            id,
            shape: "icosahedron",
            status: "generating", // new field: "generating" or "ready"
            prompt,
            assetUrl: null,
            position: position ?? [Math.random() * 4 - 2, 0.5, Math.random() * 4 - 2],
            color: "#D8A55C",
          },
        ],
        selectedId: id,
      };
    }),

  resolveAsset: (id, assetUrl) =>
    set((state) => ({
      objects: state.objects.map((o) =>
        o.id === id ? { ...o, status: "ready", assetUrl } : o
      ),
    })),

  failAsset: (id) =>
    set((state) => ({
      objects: state.objects.map((o) => (o.id === id ? { ...o, status: "failed" } : o)),
    })),
      addObjectWithProps: ({ shape, color, position }) =>
    set((state) => {
      const id = nextId++;
      return {
        objects: [
          ...state.objects,
          {
            id,
            shape: shape ?? "box",
            position: position ?? [Math.random() * 4 - 2, 0.5, Math.random() * 4 - 2],
            color: color ?? "#8A9A80",
          },
        ],
        selectedId: id,
      };
    }),

   applyOps: (ops) =>
    set((state) => {
      ops.forEach((op) => {
        if (op.op === "add") {
          state.addObjectWithProps(op);
        } else if (op.op === "addGenerated") {
          state.addPlaceholder(op);
        } else if (op.op === "setLighting") {
          state.setLighting(op.mood);
        } else if (op.op === "setFog") {
          state.setFog({ enabled: op.enabled });
        }
      });
      return {};
    }),
  selectObject: (id) => set({ selectedId: id }),

  updateObject: (id, changes) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...changes } : obj
      ),
    })),

  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),
}));