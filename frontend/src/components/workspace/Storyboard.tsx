"use client";

import {
  BookOpen,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  approveScene,
  clearProjectScenes,
  generateSceneImageOptions,
  getScenes,
} from "@/lib/api";

import {
  useProjectStore,
} from "@/store/projectStore";

import type {
  Scene,
} from "@/types";

import SceneCard from "./storyboard/SceneCard";
import EmptyStoryboard from "./storyboard/EmptyStoryboard";
import FinalStoryPreview from "./FinalStoryPreview";

type StoryboardProps = {
  onClose?: () => void;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://127.0.0.1:8000";

function getImageUrl(
  url?: string | null
) {
  if (!url) {
    return undefined;
  }

  if (
    url.startsWith("http://127.0.0.1:8000") ||
    url.startsWith("http://localhost:8000")
  ) {
    return url;
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  return `${BACKEND_URL}/${url.replace(/^\/+/, "")}`;
}

export default function Storyboard({
  onClose,
}: StoryboardProps) {
  const {
    project,
    setScenes,
    addScene,
    updateScene,
  } = useProjectStore();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    generatingSceneId,
    setGeneratingSceneId,
  ] = useState<string | null>(null);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    imageOptions,
    setImageOptions,
  ] = useState<
    Record<string, string[]>
  >({});

  const [
    selectedImages,
    setSelectedImages,
  ] = useState<
    Record<string, string>
  >({});

  const [
    showFinalStory,
    setShowFinalStory,
  ] = useState(false);

  const [
    showClearModal,
    setShowClearModal,
  ] = useState(false);

  const [
    clearingStory,
    setClearingStory,
  ] = useState(false);

  // ==========================================================
  // LOAD SCENES
  // ==========================================================

  useEffect(() => {
    async function loadScenes() {
      if (!project.id) {
        return;
      }

      const projectId =
        Number(project.id);

      if (
        Number.isNaN(projectId)
      ) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const scenes =
          await getScenes(
            projectId
          );

        const mappedScenes: Scene[] =
          scenes.map((scene) => ({
            id: String(
              scene.id
            ),

            title:
              scene.title ||
              `Page ${
                scene.order + 1
              }`,

            description:
              scene.description ||
              "",

            status:
              scene.status ||
              "empty",

            imageUrl: getImageUrl(scene.image_url),

            approved:
              scene.approved ||
              false,
          }));

        setScenes(
          mappedScenes
        );
      } catch (err) {
        console.error(
          "Failed to load scenes:",
          err
        );

        setError(
          "Unable to load storyboard scenes."
        );
      } finally {
        setLoading(false);
      }
    }

    loadScenes();
  }, [
    project.id,
    setScenes,
  ]);

  // ==========================================================
  // CREATE SCENE
  // ==========================================================

  function handleCreateScene() {
    const nextNumber =
      project.scenes.length + 1;

    addScene({
      id: crypto.randomUUID(),

      title:
        `Page ${nextNumber}`,

      description:
        "Describe this scene to Vizzy.",

      status:
        "empty",

      approved:
        false,
    });
  }

  // ==========================================================
  // GENERATE IMAGE OPTIONS
  // ==========================================================

  async function handleGenerateImage(
    scene: Scene
  ) {
    const sceneId =
      Number(scene.id);

    if (
      Number.isNaN(sceneId)
    ) {
      setError(
        "This scene is not saved in the database yet."
      );

      return;
    }

    try {
      setError(null);

      setGeneratingSceneId(
        scene.id
      );

      updateScene(
        scene.id,
        {
          status:
            "generating",
        }
      );

      const response =
        await generateSceneImageOptions(
          sceneId,
          3
        );

      const urls: string[] =
        response.images
          ?.map(
            (item: {
              image_url: string;
            }) =>
              getImageUrl(item.image_url)
          )
          .filter(
            (url: string | undefined): url is string =>
              Boolean(url)
          ) || [];

      if (
        urls.length === 0
      ) {
        throw new Error(
          "No image options were generated."
        );
      }

      setImageOptions(
        (previous) => ({
          ...previous,

          [scene.id]:
            urls,
        })
      );

      setSelectedImages(
        (previous) => ({
          ...previous,

          [scene.id]:
            urls[0],
        })
      );

      updateScene(
        scene.id,
        {
          status:
            "completed",

          imageUrl:
            urls[0],

          approved:
            false,
        }
      );
    } catch (err) {
      console.error(
        "Image generation failed:",
        err
      );

      updateScene(
        scene.id,
        {
          status:
            "empty",
        }
      );

      setError(
        err instanceof Error
          ? err.message
          : "Image generation failed."
      );
    } finally {
      setGeneratingSceneId(
        null
      );
    }
  }

  // ==========================================================
  // SELECT IMAGE
  // ==========================================================

  function handleSelectImage(
    sceneId: string,
    imageUrl: string
  ) {
    setSelectedImages(
      (previous) => ({
        ...previous,

        [sceneId]:
          imageUrl,
      })
    );

    updateScene(
      sceneId,
      {
        imageUrl,

        status:
          "completed",

        approved:
          false,
      }
    );
  }

  // ==========================================================
  // APPROVE SCENE
  // ==========================================================

  async function handleApproveScene(
    scene: Scene
  ) {
    const sceneId =
      Number(scene.id);

    if (
      Number.isNaN(sceneId)
    ) {
      setError(
        "This scene is not saved in the database yet."
      );

      return;
    }

    if (!scene.imageUrl) {
      setError(
        "Please generate and select an image before approving."
      );

      return;
    }

    try {
      setError(null);

      const response =
        await approveScene(
          sceneId
        );

      if (
        !response?.success
      ) {
        throw new Error(
          "Scene approval failed."
        );
      }

      updateScene(
        scene.id,
        {
          approved:
            true,
        }
      );
    } catch (err) {
      console.error(
        "Scene approval failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to approve scene."
      );
    }
  }

  // ==========================================================
  // CLEAR STORYBOARD
  // ==========================================================

  async function handleClearStory() {
    const projectId =
      Number(project.id);

    if (
      !projectId ||
      Number.isNaN(projectId)
    ) {
      setError(
        "Invalid project. Cannot clear storyboard."
      );

      return;
    }

    const databaseSceneIds =
      project.scenes
        .map((scene) =>
          Number(scene.id)
        )
        .filter(
          (id) =>
            !Number.isNaN(id)
        );

    try {
      setClearingStory(true);
      setError(null);

      await clearProjectScenes(
        projectId,
        databaseSceneIds
      );

      setScenes([]);

      setImageOptions({});

      setSelectedImages({});

      setShowFinalStory(false);

      setShowClearModal(false);
    } catch (err) {
      console.error(
        "Failed to clear storyboard:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to clear storyboard."
      );
    } finally {
      setClearingStory(
        false
      );
    }
  }

  // ==========================================================
  // APPROVED SCENES
  // ==========================================================

  const hasApprovedScenes =
    project.scenes.some(
      (scene) =>
        scene.approved &&
        !!scene.imageUrl
    );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section
      className="
        relative
        flex
        h-full
        min-h-0
        min-w-0
        flex-1
        flex-col
        overflow-hidden
        bg-[#111017]
        text-white
      "
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="
          flex
          shrink-0
          items-center
          justify-between
          gap-3
          border-b
          border-white/[0.07]
          bg-[#111017]
          px-3
          py-3
          sm:px-5
          sm:py-4
          lg:px-6
        "
      >
        {/* LEFT */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
              sm:gap-3
            "
          >
            <h2
              className="
                truncate
                text-sm
                font-semibold
                tracking-tight
                text-white/90
              "
            >
              Storyboard
            </h2>

            <span
              className="
                shrink-0
                rounded-full
                border
                border-white/[0.08]
                bg-white/[0.04]
                px-2
                py-0.5
                text-[9px]
                text-white/40
                sm:text-[10px]
              "
            >
              {project.scenes.length}{" "}
              {project.scenes.length ===
              1
                ? "page"
                : "pages"}
            </span>
          </div>

          <p
            className="
              mt-1
              hidden
              truncate
              text-[11px]
              text-white/25
              sm:block
              sm:text-xs
            "
          >
            Build your story scene by scene.
          </p>
        </div>

        {/* ACTIONS */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-1.5
            sm:gap-2
          "
        >
          {/* FINAL STORY */}

          {hasApprovedScenes && (
            <button
              type="button"
              onClick={() =>
                setShowFinalStory(
                  true
                )
              }
              className="
                flex
                h-8
                items-center
                gap-2
                rounded-lg
                border
                border-white/[0.08]
                bg-white/[0.035]
                px-2.5
                text-xs
                font-medium
                text-white/60
                transition
                hover:border-white/[0.14]
                hover:bg-white/[0.07]
                hover:text-white
                sm:h-auto
                sm:px-3
                sm:py-2
              "
              title="View final story"
            >
              <BookOpen
                size={14}
              />

              <span className="hidden sm:inline">
                Final Story
              </span>
            </button>
          )}

          {/* CLEAR */}

          {project.scenes.length >
            0 && (
            <button
              type="button"
              onClick={() =>
                setShowClearModal(
                  true
                )
              }
              className="
                flex
                h-8
                items-center
                gap-2
                rounded-lg
                border
                border-red-400/[0.16]
                bg-red-400/[0.035]
                px-2.5
                text-xs
                font-medium
                text-red-300/70
                transition
                hover:border-red-400/25
                hover:bg-red-400/[0.08]
                hover:text-red-200
                sm:h-auto
                sm:px-3
                sm:py-2
              "
              title="Clear storyboard"
            >
              <Trash2
                size={14}
              />

              <span className="hidden sm:inline">
                Clear
              </span>
            </button>
          )}

          {/* ADD PAGE */}

          <button
            type="button"
            onClick={
              handleCreateScene
            }
            className="
              flex
              h-8
              items-center
              gap-2
              rounded-lg
              border
              border-white/[0.08]
              bg-white/[0.04]
              px-2.5
              text-xs
              font-medium
              text-white/65
              transition
              hover:border-white/[0.14]
              hover:bg-white/[0.07]
              hover:text-white
              active:scale-[0.98]
              sm:h-auto
              sm:px-3
              sm:py-2
            "
            title="Add page"
          >
            <Plus
              size={14}
            />

            <span className="hidden sm:inline">
              Add page
            </span>
          </button>

          {/* CLOSE */}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close storyboard"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                text-white/30
                transition
                hover:bg-white/[0.05]
                hover:text-white
                sm:ml-1
              "
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          className="
            mx-3
            mt-3
            rounded-xl
            border
            border-red-400/[0.16]
            bg-red-400/[0.05]
            px-3
            py-2.5
            text-xs
            leading-5
            text-red-300
            sm:mx-5
            sm:mt-4
            sm:px-4
            sm:py-3
            lg:mx-6
          "
        >
          {error}
        </div>
      )}

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          bg-[#111017]
          p-3
          sm:p-5
          lg:p-6
        "
      >
        {loading ? (
          <div
            className="
              flex
              h-full
              min-h-[260px]
              items-center
              justify-center
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                px-4
                py-3
                text-xs
                text-white/35
                sm:text-sm
              "
            >
              <Loader2
                size={15}
                className="animate-spin"
              />

              Loading storyboard...
            </div>
          </div>
        ) : project.scenes.length ===
          0 ? (
          /* EMPTY STATE WRAPPER */

          <div
            className="
              flex
              h-full
              min-h-[420px]
              items-center
              justify-center
              rounded-2xl
              border
              border-white/[0.045]
              bg-white/[0.015]
            "
          >
            <EmptyStoryboard
              onCreate={
                handleCreateScene
              }
            />
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-4
              2xl:grid-cols-2
              2xl:gap-5
            "
          >
            {project.scenes.map(
              (
                scene,
                index
              ) => (
                <SceneCard
                  key={
                    scene.id
                  }
                  scene={
                    scene
                  }
                  index={
                    index
                  }
                  generating={
                    generatingSceneId ===
                    scene.id
                  }
                  onGenerate={
                    handleGenerateImage
                  }
                  imageOptions={
                    imageOptions[
                      scene.id
                    ] || []
                  }
                  selectedImage={
                    selectedImages[
                      scene.id
                    ]
                  }
                  onSelectImage={
                    (imageUrl) =>
                      handleSelectImage(
                        scene.id,
                        imageUrl
                      )
                  }
                  onApprove={
                    handleApproveScene
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      {project.scenes.length >
        0 && (
        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            gap-3
            border-t
            border-white/[0.07]
            bg-[#111017]
            px-3
            py-2.5
            sm:px-5
            sm:py-3
            lg:px-6
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
              text-[10px]
              text-white/20
              sm:text-[11px]
            "
          >
            <Sparkles
              size={13}
              className="
                shrink-0
                text-violet-300/35
              "
            />

            <span className="truncate">
              AI storyboard generation
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const firstEmpty =
                project.scenes.find(
                  (scene) =>
                    scene.status !==
                      "completed" &&
                    !scene.approved
                );

              if (firstEmpty) {
                handleGenerateImage(
                  firstEmpty
                );
              }
            }}
            disabled={
              generatingSceneId !==
              null
            }
            className="
              flex
              shrink-0
              items-center
              gap-2
              rounded-lg
              bg-white
              px-3
              py-2
              text-[11px]
              font-semibold
              text-black
              shadow-sm
              transition
              hover:bg-white/90
              disabled:cursor-not-allowed
              disabled:opacity-40
              sm:px-4
              sm:text-xs
            "
          >
            {generatingSceneId ? (
              <>
                <Loader2
                  size={14}
                  className="animate-spin"
                />

                <span className="hidden sm:inline">
                  Generating...
                </span>

                <span className="sm:hidden">
                  ...
                </span>
              </>
            ) : (
              <>
                <Sparkles
                  size={14}
                />

                <span className="hidden sm:inline">
                  Generate image
                </span>

                <span className="sm:hidden">
                  Generate
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* =====================================================
          CLEAR STORY MODAL
      ====================================================== */}

      {showClearModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/70
            p-4
            backdrop-blur-sm
            sm:p-6
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#111017]
              p-5
              shadow-2xl
              shadow-black/50
              sm:p-6
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
                sm:gap-4
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-red-400/[0.12]
                  bg-red-400/[0.07]
                  text-red-300
                  sm:h-10
                  sm:w-10
                "
              >
                <Trash2
                  size={18}
                />
              </div>

              <div className="min-w-0">
                <h3
                  className="
                    text-base
                    font-semibold
                    text-white
                  "
                >
                  Clear this story?
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-white/40
                  "
                >
                  This will permanently
                  remove all{" "}
                  <span className="text-white/70">
                    {
                      project
                        .scenes
                        .length
                    }
                  </span>{" "}
                  storyboard pages from
                  this project.
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-white/25
                  "
                >
                  Your project itself will
                  not be deleted.
                </p>
              </div>
            </div>

            <div
              className="
                mt-6
                flex
                flex-col-reverse
                gap-2
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={() =>
                  setShowClearModal(
                    false
                  )
                }
                disabled={
                  clearingStory
                }
                className="
                  rounded-lg
                  border
                  border-white/[0.08]
                  px-4
                  py-2.5
                  text-xs
                  font-medium
                  text-white/55
                  transition
                  hover:bg-white/[0.05]
                  hover:text-white
                  disabled:opacity-40
                  sm:py-2
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleClearStory
                }
                disabled={
                  clearingStory
                }
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-red-500
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-500/90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:py-2
                "
              >
                {clearingStory ? (
                  <>
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />

                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={13}
                    />

                    Clear story
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FINAL STORY
      ====================================================== */}

      {showFinalStory && (
        <FinalStoryPreview
          scenes={
            project.scenes
          }
          onClose={() =>
            setShowFinalStory(
              false
            )
          }
        />
      )}
    </section>
  );
}