"use client";

import {
  Clock3,
  Loader2,
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createProject,
  deleteProject,
  getProjects,
  type ApiProject,
} from "@/lib/api";

import { useProjectStore } from "@/store/projectStore";

type SidebarProps = {
  onClose: () => void;
};

// ============================================================
// DATE GROUPING
// ============================================================

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const difference =
    today.getTime() - target.getTime();

  const oneDay =
    24 * 60 * 60 * 1000;

  if (difference === 0) {
    return "Today";
  }

  if (difference === oneDay) {
    return "Yesterday";
  }

  if (difference < oneDay * 7) {
    return "Previous 7 days";
  }

  return "Older";
}

// ============================================================
// SIDEBAR
// ============================================================

export default function Sidebar({
  onClose,
}: SidebarProps) {
  const project = useProjectStore(
    (state) => state.project
  );

  const setProject = useProjectStore(
    (state) => state.setProject
  );

  const [projects, setProjects] = useState<
    ApiProject[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [switchingId, setSwitchingId] =
    useState<number | null>(null);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  // ==========================================================
  // LOAD CHAT HISTORY
  // ==========================================================

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);

        const data =
          await getProjects();

        const sorted = [...data].sort(
          (a, b) =>
            new Date(
              b.updated_at ||
                b.created_at
            ).getTime() -
            new Date(
              a.updated_at ||
                a.created_at
            ).getTime()
        );

        setProjects(sorted);
      } catch (error) {
        console.error(
          "Failed to load chat history:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  // ==========================================================
  // KEEP CURRENT PROJECT TITLE IN SYNC
  // ==========================================================

  useEffect(() => {
    if (!project.id || !project.name) {
      return;
    }

    const projectId = Number(
      project.id
    );

    if (Number.isNaN(projectId)) {
      return;
    }

    setProjects((current) =>
      current.map((item) => {
        if (item.id !== projectId) {
          return item;
        }

        return {
          ...item,
          name: project.name,
          updated_at:
            new Date().toISOString(),
        };
      })
    );
  }, [
    project.id,
    project.name,
  ]);

  // ==========================================================
  // LOAD PROJECT INTO WORKSPACE
  // ==========================================================

  function openProject(
    apiProject: ApiProject
  ) {
    setProject({
      id: String(apiProject.id),

      name:
        apiProject.name ||
        "Untitled Visual Story",

      description:
        apiProject.description || "",

      style: {
        name:
          apiProject.visual_style ||
          "Cinematic",

        description:
          apiProject.description || "",

        colorPalette:
          apiProject.color_palette ||
          [],

        mood:
          apiProject.mood ||
          "Dark and dramatic",

        artStyle:
          apiProject.art_style ||
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

      scenes: [],
    });
  }

  // ==========================================================
  // NEW CHAT
  // ==========================================================

  async function handleNewChat() {
    if (creating) {
      return;
    }

    try {
      setCreating(true);

      const newProject =
        await createProject({
          name: "Untitled Visual Story",

          description:
            "A new visual story created with Vizzy.",

          visual_style:
            "Cinematic",

          art_style:
            "Realistic graphic novel",

          mood:
            "Dark and dramatic",

          color_palette: [
            "#18152A",
            "#30264A",
            "#6D5A91",
          ],
        });

      openProject(newProject);

      setProjects((current) => [
        newProject,
        ...current,
      ]);

      onClose();
    } catch (error) {
      console.error(
        "Failed to create new chat:",
        error
      );

      alert(
        "Could not create a new chat. Make sure Django is running."
      );
    } finally {
      setCreating(false);
    }
  }

  // ==========================================================
  // OPEN EXISTING CHAT
  // ==========================================================

  async function handleOpenChat(
    apiProject: ApiProject
  ) {
    if (
      switchingId === apiProject.id ||
      deletingId === apiProject.id
    ) {
      return;
    }

    try {
      setSwitchingId(apiProject.id);

      openProject(apiProject);

      onClose();
    } finally {
      setSwitchingId(null);
    }
  }

  // ==========================================================
  // DELETE CHAT
  // ==========================================================

  async function handleDeleteChat(
    apiProject: ApiProject
  ) {
    if (
      deletingId !== null ||
      switchingId === apiProject.id
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${apiProject.name}"?\n\nThis will permanently delete this visual story, chat history, and scenes.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(apiProject.id);

      // ------------------------------------------------------
      // DELETE FROM BACKEND
      // ------------------------------------------------------

      await deleteProject(
        apiProject.id
      );

      // ------------------------------------------------------
      // REMOVE FROM SIDEBAR
      // ------------------------------------------------------

      setProjects((current) =>
        current.filter(
          (item) =>
            item.id !== apiProject.id
        )
      );

      // ------------------------------------------------------
      // IF CURRENT CHAT WAS DELETED
      // ------------------------------------------------------

      const currentProjectId =
        Number(project.id);

      if (
        currentProjectId ===
        apiProject.id
      ) {
        /*
         * Create a fresh chat so the
         * workspace never points to a
         * deleted backend project.
         */

        try {
          setCreating(true);

          const newProject =
            await createProject({
              name:
                "Untitled Visual Story",

              description:
                "A new visual story created with Vizzy.",

              visual_style:
                "Cinematic",

              art_style:
                "Realistic graphic novel",

              mood:
                "Dark and dramatic",

              color_palette: [
                "#18152A",
                "#30264A",
                "#6D5A91",
              ],
            });

          openProject(
            newProject
          );

          setProjects(
            (current) => [
              newProject,
              ...current,
            ]
          );
        } catch (error) {
          console.error(
            "Failed to create replacement chat:",
            error
          );

          alert(
            "Chat deleted, but a new chat could not be created."
          );
        } finally {
          setCreating(false);
        }
      }
    } catch (error) {
      console.error(
        "Failed to delete chat:",
        error
      );

      alert(
        "Could not delete this chat. Make sure Django is running."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ==========================================================
  // GROUP CHAT HISTORY
  // ==========================================================

  const groupedProjects =
    useMemo(() => {
      const groups: Record<
        string,
        ApiProject[]
      > = {};

      projects.forEach((item) => {
        const date =
          item.updated_at ||
          item.created_at;

        const group =
          formatDate(date);

        if (!groups[group]) {
          groups[group] = [];
        }

        groups[group].push(item);
      });

      return groups;
    }, [projects]);

  const groupOrder = [
    "Today",
    "Yesterday",
    "Previous 7 days",
    "Older",
  ];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <aside
      className="
        flex h-full w-full
        flex-col
        bg-[#111017]
        text-white
      "
    >
      {/* ====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          flex h-14 shrink-0
          items-center justify-between
          border-b border-white/[0.07]
          px-3
        "
      >
        <div className="flex items-center gap-2.5">
          <div
            className="
              flex h-8 w-8
              items-center justify-center
              rounded-xl
              bg-gradient-to-br
              from-violet-500
              to-fuchsia-500
              shadow-lg
              shadow-violet-500/10
            "
          >
            <Sparkles size={15} />
          </div>

          <div>
            <div className="text-sm font-semibold tracking-tight">
              Vizzy
            </div>

            <div className="text-[10px] text-white/25">
              Visual storytelling
            </div>
          </div>
        </div>

        {/* CLOSE SIDEBAR */}

        <button
          type="button"
          onClick={onClose}
          className="
            flex h-8 w-8
            items-center justify-center
            rounded-lg
            text-white/35
            transition
            hover:bg-white/5
            hover:text-white
          "
          aria-label="Close sidebar"
        >
          <X size={17} />
        </button>
      </header>

      {/* ====================================================
          NEW CHAT
      ===================================================== */}

      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={handleNewChat}
          disabled={
            creating ||
            deletingId !== null
          }
          className="
            flex w-full
            items-center justify-center
            gap-2
            rounded-xl
            border border-white/[0.08]
            bg-white/[0.04]
            px-4 py-2.5
            text-sm font-medium
            text-white/80
            transition
            hover:border-white/[0.14]
            hover:bg-white/[0.07]
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {creating ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Plus size={16} />
          )}

          {creating
            ? "Creating..."
            : "New Chat"}
        </button>
      </div>

      {/* ====================================================
          CHAT HISTORY
      ===================================================== */}

      <div className="flex-1 overflow-y-auto px-2 py-4">
        {loading ? (
          <div
            className="
              flex flex-col
              items-center
              justify-center
              py-12
              text-white/25
            "
          >
            <Loader2
              size={18}
              className="animate-spin"
            />

            <span className="mt-3 text-xs">
              Loading chats...
            </span>
          </div>
        ) : projects.length === 0 ? (
          <div
            className="
              flex flex-col
              items-center
              justify-center
              px-5
              py-12
              text-center
            "
          >
            <MessageSquare
              size={22}
              className="text-white/15"
            />

            <p className="mt-3 text-xs text-white/35">
              No chats yet
            </p>

            <p className="mt-1 text-[10px] leading-5 text-white/20">
              Create a new visual story
              to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupOrder.map((group) => {
              const groupProjects =
                groupedProjects[group];

              if (
                !groupProjects ||
                groupProjects.length === 0
              ) {
                return null;
              }

              return (
                <section
                  key={group}
                >
                  {/* GROUP TITLE */}

                  <div
                    className="
                      mb-2 flex
                      items-center gap-2
                      px-2
                    "
                  >
                    <Clock3
                      size={11}
                      className="text-white/20"
                    />

                    <span
                      className="
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-[0.12em]
                        text-white/25
                      "
                    >
                      {group}
                    </span>
                  </div>

                  {/* PROJECTS */}

                  <div className="space-y-1">
                    {groupProjects.map(
                      (item) => {
                        const isActive =
                          Number(
                            project.id
                          ) === item.id;

                        const isSwitching =
                          switchingId ===
                          item.id;

                        const isDeleting =
                          deletingId ===
                          item.id;

                        return (
                          <div
                            key={item.id}
                            className={`
                              group flex
                              w-full
                              items-center
                              gap-1
                              rounded-xl
                              transition
                              ${
                                isActive
                                  ? "bg-white/[0.07]"
                                  : "hover:bg-white/[0.04]"
                              }
                            `}
                          >
                            {/* CHAT BUTTON */}

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenChat(
                                  item
                                )
                              }
                              disabled={
                                isSwitching ||
                                isDeleting ||
                                deletingId !==
                                  null
                              }
                              className="
                                flex min-w-0
                                flex-1
                                items-center
                                gap-2.5
                                px-3 py-2.5
                                text-left
                                disabled:cursor-not-allowed
                              "
                            >
                              {/* CHAT ICON */}

                              <div
                                className={`
                                  flex h-7 w-7
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  ${
                                    isActive
                                      ? "bg-white/[0.10] text-white/70"
                                      : "bg-white/[0.04] text-white/25"
                                  }
                                `}
                              >
                                {isSwitching ? (
                                  <Loader2
                                    size={13}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <MessageSquare
                                    size={13}
                                  />
                                )}
                              </div>

                              {/* CHAT TITLE */}

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`
                                    truncate
                                    text-xs
                                    font-medium
                                    ${
                                      isActive
                                        ? "text-white/85"
                                        : "text-white/55"
                                    }
                                  `}
                                >
                                  {item.name ||
                                    "Untitled Visual Story"}
                                </p>

                                <p
                                  className="
                                    mt-0.5
                                    truncate
                                    text-[10px]
                                    text-white/20
                                  "
                                >
                                  {item.description ||
                                    "Visual story"}
                                </p>
                              </div>
                            </button>

                            {/* DELETE BUTTON */}

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();

                                handleDeleteChat(
                                  item
                                );
                              }}
                              disabled={
                                isDeleting ||
                                deletingId !==
                                  null
                              }
                              title="Delete chat"
                              aria-label={`Delete ${item.name}`}
                              className="
                                mr-1.5
                                flex h-7 w-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                text-white/20
                                opacity-0
                                transition
                                hover:bg-red-500/10
                                hover:text-red-400
                                group-hover:opacity-100
                                focus:opacity-100
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              {isDeleting ? (
                                <Loader2
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={13}
                                />
                              )}
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* ====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="
          shrink-0
          border-t border-white/[0.06]
          px-4 py-3
        "
      >
        <div
          className="
            flex items-center
            justify-between
            text-[10px]
            text-white/20
          "
        >
          <span>Vizzy</span>

          <span>
            AI visual storytelling
          </span>
        </div>
      </footer>
    </aside>
  );
}