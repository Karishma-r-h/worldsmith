import { create } from "zustand";

let nextId = 1;

export const useSceneStore = create((set) => ({
  objects: [],
  selectedId: null,

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