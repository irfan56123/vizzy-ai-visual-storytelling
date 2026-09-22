"use client";

import {
  ArrowRight,
  FolderOpen,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createProject,
  getProjects,
  type ApiProject,
} from "@/lib/api";

export default function Home() {
  const router = useRouter();

  const [creating, setCreating] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loadingProjects, setLoadingProjects] =
    useState(false);

  const handleStartCreating = async () => {
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

      // Remember which project is open
      localStorage.setItem(
        "vizzy-project-id",
        String(project.id)
      );

      // IMPORTANT:
      // Workspace now has its own URL.
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

  const handleOpenProjects = async () => {
    setShowProjects(true);
    setLoadingProjects(true);

    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error(
        "Failed to load projects:",
        error
      );

      alert(
        "Could not load projects. Make sure Django is running."
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (!showProjects) return;

    const load = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, [showProjects]);

  const openProject = (project: ApiProject) => {
    localStorage.setItem(
      "vizzy-project-id",
      String(project.id)
    );

    router.push(`/story/${project.id}`);
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6">

        {/* HEADER */}

        <header className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
              <Sparkles size={18} />
            </div>

            <span className="text-xl font-semibold tracking-tight">
              Vizzy
            </span>
          </div>

          <button
            onClick={handleOpenProjects}
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <FolderOpen size={15} />

            My Projects
          </button>
        </header>

        {/* HERO */}

        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="max-w-4xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60">
              <Sparkles size={15} />

              AI Visual Storytelling
            </div>

            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
              Turn your ideas into

              <span className="block bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                visual stories.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/50">
              Create graphic novels, storyboards and
              visual books through a collaborative
              conversation with AI.
            </p>

            <button
              onClick={handleStartCreating}
              disabled={creating}
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 font-medium text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating
                ? "Creating project..."
                : "Start creating"}

              {!creating && (
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </div>
        </section>

        <footer className="flex h-16 items-center justify-center text-xs text-white/30">
          Create. Refine. Visualize.
        </footer>
      </div>

      {/* PROJECT MODAL */}

      {showProjects && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#101010] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-medium">
                  My Projects
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  Your visual stories
                </p>
              </div>

              <button
                onClick={() =>
                  setShowProjects(false)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            {/* PROJECT LIST */}

            <div className="max-h-[60vh] overflow-y-auto p-5">
              {loadingProjects ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
                </div>
              ) : projects.length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                  <FolderOpen
                    size={28}
                    className="text-white/20"
                  />

                  <p className="mt-4 text-sm text-white/50">
                    No projects yet
                  </p>

                  <p className="mt-1 text-xs text-white/25">
                    Create your first visual story.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() =>
                        openProject(project)
                      }
                      className="group flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white/80">
                          {project.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-white/30">
                          {project.description ||
                            "Visual story"}
                        </p>

                        <div className="mt-2 flex items-center gap-3 text-[10px] text-white/20">
                          <span>
                            {project.visual_style ||
                              "Cinematic"}
                          </span>

                          <span>•</span>

                          <span>
                            {project.art_style ||
                              "Graphic novel"}
                          </span>
                        </div>
                      </div>

                      <ArrowRight
                        size={15}
                        className="shrink-0 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-white/60"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CREATE BUTTON */}

            <div className="border-t border-white/10 p-4">
              <button
                onClick={handleStartCreating}
                disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                <Plus size={16} />

                {creating
                  ? "Creating..."
                  : "Create new project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}