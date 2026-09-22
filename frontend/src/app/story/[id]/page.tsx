"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import Workspace from "@/components/workspace/Workspace";

import {
  getProjectWithScenes,
} from "@/lib/api";

import { useProjectStore } from "@/store/projectStore";

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();

  const setProject = useProjectStore(
    (state) => state.setProject
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStory() {
      try {
        setLoading(true);
        setError("");

        const projectId = Number(params.id);

        if (!projectId || Number.isNaN(projectId)) {
          throw new Error("Invalid project ID.");
        }

        /*
         * Load project + scenes directly from Django.
         */

        const data =
          await getProjectWithScenes(projectId);

        if (cancelled) return;

        /*
         * Save currently opened project.
         */

        localStorage.setItem(
          "vizzy-project-id",
          String(data.project.id)
        );

        /*
         * Restore project into Zustand.
         */

        setProject({
          id: String(data.project.id),

          name: data.project.name,

          description:
            data.project.description || "",

          style: {
            name:
              data.project.visual_style ||
              "Cinematic",

            description:
              data.project.description || "",

            colorPalette:
              data.project.color_palette || [],

            mood:
              data.project.mood ||
              "Dark and dramatic",

            artStyle:
              data.project.art_style ||
              "Realistic graphic novel",
          },

          messages: [
            {
              id: "welcome-message",

              role: "assistant",

              content:
                "Welcome to Vizzy. Tell me what kind of visual story you want to create.",

              createdAt:
                new Date().toISOString(),
            },
          ],

          /*
           * Restore scenes from database.
           */

          scenes: data.scenes.map((scene) => ({
            id: String(scene.id),

            title: scene.title,

            description:
              scene.description || "",

            status: scene.status,

            imageUrl:
              scene.image_url || undefined,

            approved:
              scene.approved,
          })),
        });
      } catch (err) {
        console.error(
          "Failed to load story:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load story."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStory();

    return () => {
      cancelled = true;
    };
  }, [params.id, setProject]);

  /*
   * Loading
   */

  if (loading) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-[#080808] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={24}
            className="animate-spin text-white/60"
          />

          <p className="text-sm text-white/40">
            Loading your story...
          </p>
        </div>
      </main>
    );
  }

  /*
   * Error
   */

  if (error) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-[#080808] text-white">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-medium">
            Could not load this story
          </h1>

          <p className="mt-2 text-sm text-white/40">
            {error}
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  /*
   * Story workspace
   */

  return <Workspace />;
}