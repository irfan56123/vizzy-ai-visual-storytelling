"use client";

import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createProject } from "@/lib/api";

export default function CreateStoryPage() {
  const router = useRouter();

  const [creating, setCreating] = useState(false);

  const handleCreateProject = async () => {
    if (creating) return;

    try {
      setCreating(true);

      const project = await createProject({
        name: "Untitled Visual Story",

        description:
          "A new visual story created with Vizzy.",

        visual_style: "Cinematic",

        art_style:
          "Realistic graphic novel",

        mood: "Dark and dramatic",

        color_palette: [
          "#0B1F33",
          "#263849",
          "#6B7280",
        ],
      });

      console.log("Project created:", project);

      /*
       * Remember the currently opened project.
       */

      localStorage.setItem(
        "vizzy-project-id",
        String(project.id)
      );

      /*
       * Open the newly created story.
       */

      router.push(`/story/${project.id}`);
    } catch (error) {
      console.error(
        "Failed to create project:",
        error
      );

      alert(
        "Could not create project. Make sure Django is running."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">

        {/* HEADER */}

        <header className="flex h-20 items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={16} />

            Back
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
              <Sparkles size={15} />
            </div>

            <span className="font-semibold tracking-tight">
              Vizzy
            </span>
          </div>

          <div className="w-16" />
        </header>

        {/* CONTENT */}

        <section className="flex flex-1 items-center justify-center pb-16">
          <div className="w-full max-w-2xl">

            {/* BADGE */}

            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50">
                <Sparkles size={13} />

                Create a visual story
              </div>
            </div>

            {/* TITLE */}

            <div className="text-center">
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                Start creating
                <span className="block bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                  your story.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/40">
                Start with a simple idea. Vizzy will help
                you turn it into a cinematic visual story,
                one scene at a time.
              </p>
            </div>

            {/* PROJECT CARD */}

            <div className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-medium text-white/90">
                    New Visual Story
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-white/35">
                    We'll create a new project and take
                    you directly into the Vizzy workspace.
                  </p>
                </div>
              </div>

              {/* FEATURES */}

              <div className="mt-6 grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-xs font-medium text-white/70">
                    AI Storytelling
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-white/30">
                    Build your story through conversation.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-xs font-medium text-white/70">
                    Visual Scenes
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-white/30">
                    Generate cinematic scenes and images.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-xs font-medium text-white/70">
                    Storyboard
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-white/30">
                    Organize and approve every page.
                  </p>
                </div>

              </div>

              {/* CREATE BUTTON */}

              <button
                onClick={handleCreateProject}
                disabled={creating}
                className="group mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Creating your story...
                  </>
                ) : (
                  <>
                    Start creating

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

            </div>

            {/* FOOTNOTE */}

            <p className="mt-5 text-center text-[11px] text-white/20">
              You can refine your story and visual style
              inside the workspace.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}