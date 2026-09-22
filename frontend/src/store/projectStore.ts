import { create } from "zustand";

import type {
  Message,
  Project,
  Scene,
  CreativeStyle,
} from "@/types";


type ProjectStore = {
  project: Project;

  addMessage: (
    message: Message
  ) => void;

  setMessages: (
    messages: Message[]
  ) => void;

  addScene: (
    scene: Scene
  ) => void;

  updateScene: (
    sceneId: string,
    updates: Partial<Scene>
  ) => void;

  setScenes: (
    scenes: Scene[]
  ) => void;

  updateProjectName: (
    name: string
  ) => void;

  updateCreativeStyle: (
    style: CreativeStyle
  ) => void;

  setProject: (
    project: Project
  ) => void;
};


export const useProjectStore =
  create<ProjectStore>((set) => ({

    // ========================================================
    // DEFAULT PROJECT
    // ========================================================

    project: {
      id: "demo-project",

      name:
        "D-Day: A Graphic Novel",

      description:
        "A cinematic graphic novel exploring the events of D-Day.",

      messages: [
        {
          id:
            "welcome-message",

          role:
            "assistant",

          content:
            "Welcome to Vizzy. Tell me what kind of visual story you want to create.",

          createdAt:
            new Date().toISOString(),
        },
      ],

      scenes: [],
    },


    // ========================================================
    // ADD MESSAGE
    // ========================================================

    addMessage: (
      message
    ) =>
      set((state) => ({
        project: {
          ...state.project,

          messages: [
            ...state.project.messages,
            message,
          ],
        },
      })),


    // ========================================================
    // SET COMPLETE MESSAGE LIST
    // ========================================================

    setMessages: (
      messages
    ) =>
      set((state) => ({
        project: {
          ...state.project,

          messages,
        },
      })),


    // ========================================================
    // ADD SCENE
    // ========================================================

    addScene: (
      scene
    ) =>
      set((state) => ({
        project: {
          ...state.project,

          scenes: [
            ...state.project.scenes,
            scene,
          ],
        },
      })),


    // ========================================================
    // UPDATE SCENE
    // ========================================================

    updateScene: (
      sceneId,
      updates
    ) =>
      set((state) => ({
        project: {
          ...state.project,

          scenes:
            state.project.scenes.map(
              (scene) =>
                scene.id === sceneId
                  ? {
                      ...scene,
                      ...updates,
                    }
                  : scene
            ),
        },
      })),


    // ========================================================
    // SET SCENES
    // ========================================================

    setScenes: (
      scenes
    ) =>
      set((state) => ({
        project: {
          ...state.project,

          scenes,
        },
      })),


    // ========================================================
    // UPDATE PROJECT NAME
    // ========================================================

    updateProjectName: (
      name
    ) =>
      set((state) => ({
        project: {
          ...state.project,

          name,
        },
      })),


    // ========================================================
    // UPDATE CREATIVE STYLE
    // ========================================================

    updateCreativeStyle: (
      style
    ) =>
      set((state) => ({
        project: {
          ...state.project,

          style,
        },
      })),


    // ========================================================
    // SET ENTIRE PROJECT
    // ========================================================

    setProject: (
      project
    ) =>
      set(() => ({
        project,
      })),
  }));