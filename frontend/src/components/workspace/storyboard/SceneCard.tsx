"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import type { Scene } from "@/types";

import ImageOptions from "./ImageOptions";

type SceneCardProps = {
  scene: Scene;
  index: number;
  generating: boolean;

  onGenerate: (scene: Scene) => void;

  imageOptions: string[];

  selectedImage?: string;

  onSelectImage: (imageUrl: string) => void;

  onApprove: (scene: Scene) => void;
};

export default function SceneCard({
  scene,
  index,
  generating,
  onGenerate,
  imageOptions,
  selectedImage,
  onSelectImage,
  onApprove,
}: SceneCardProps) {
  const hasImage = Boolean(scene.imageUrl);

  const isCompleted =
    scene.status === "completed";

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.08]
        bg-white/[0.025]
      "
    >
      {/* =====================================================
          MAIN IMAGE
      ====================================================== */}

      <div
        className="
          relative
          aspect-[16/10]
          overflow-hidden
          bg-[#101010]
        "
      >
        {hasImage ? (
          <img
            src={scene.imageUrl}
            alt={scene.title}
            className="
              h-full
              w-full
              object-cover
              transition
              duration-500
              group-hover:scale-[1.02]
            "
          />
        ) : generating ? (
          <div
            className="
              flex
              h-full
              flex-col
              items-center
              justify-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-white/[0.04]
              "
            >
              <Loader2
                size={20}
                className="animate-spin text-white/60"
              />
            </div>

            <div className="text-center">
              <p
                className="
                  text-xs
                  font-medium
                  text-white/70
                "
              >
                Generating 3 options
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-white/30
                "
              >
                FLUX is creating your scene...
              </p>
            </div>
          </div>
        ) : (
          <div
            className="
              flex
              h-full
              flex-col
              items-center
              justify-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                border-white/10
                bg-white/[0.03]
              "
            >
              <ImageIcon
                size={20}
                className="text-white/25"
              />
            </div>

            <p className="text-xs text-white/25">
              No image generated yet
            </p>
          </div>
        )}

        {/* PAGE NUMBER */}

        <div
          className="
            absolute
            left-3
            top-3
            rounded-md
            border
            border-white/10
            bg-black/50
            px-2
            py-1
            text-[10px]
            font-medium
            text-white/50
            backdrop-blur
          "
        >
          Page{" "}
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* STATUS BADGE */}

        {scene.approved ? (
          <div
            className="
              absolute
              right-3
              top-3
              flex
              items-center
              gap-1
              rounded-md
              border
              border-emerald-400/20
              bg-black/60
              px-2
              py-1
              text-[10px]
              text-emerald-300
              backdrop-blur
            "
          >
            <Check size={11} />
            Approved
          </div>
        ) : isCompleted ? (
          <div
            className="
              absolute
              right-3
              top-3
              flex
              items-center
              gap-1
              rounded-md
              border
              border-white/10
              bg-black/60
              px-2
              py-1
              text-[10px]
              text-white/50
              backdrop-blur
            "
          >
            <Check size={11} />
            Generated
          </div>
        ) : null}
      </div>

      {/* =====================================================
          IMAGE OPTIONS
      ====================================================== */}

      {imageOptions.length > 0 && !generating && (
        <ImageOptions
          imageOptions={imageOptions}
          selectedImage={selectedImage}
          onSelectImage={onSelectImage}
        />
      )}

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="p-4">
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div className="min-w-0">
            <p
              className="
                mb-1
                text-[10px]
                uppercase
                tracking-[0.12em]
                text-white/25
              "
            >
              Scene {index + 1}
            </p>

            <h3
              className="
                text-sm
                font-semibold
                leading-5
                text-white/85
              "
            >
              {scene.title}
            </h3>
          </div>

          <span
            className="
              shrink-0
              rounded-full
              border
              border-white/10
              px-2
              py-1
              text-[9px]
              uppercase
              tracking-wider
              text-white/30
            "
          >
            {scene.approved
              ? "approved"
              : scene.status}
          </span>
        </div>

        {scene.description && (
          <p
            className="
              mt-3
              line-clamp-4
              text-xs
              leading-5
              text-white/40
            "
          >
            {scene.description}
          </p>
        )}

        {/* ===================================================
            ACTIONS
        ==================================================== */}

        <div
          className="
            mt-4
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
            border-t
            border-white/[0.06]
            pt-3
          "
        >
          <span
            className="
              text-[10px]
              text-white/20
            "
          >
            {scene.approved
              ? "Scene approved"
              : hasImage
                ? "Image ready"
                : "Ready to generate"}
          </span>

          <div className="flex items-center gap-2">
            {/* REGENERATE */}

            <button
              onClick={() => onGenerate(scene)}
              disabled={generating || scene.approved}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-white
                px-3
                py-2
                text-[11px]
                font-semibold
                text-black
                transition
                hover:bg-white/90
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {generating ? (
                <>
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                  Generating...
                </>
              ) : hasImage ? (
                <>
                  <RefreshCw size={13} />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Generate Image
                </>
              )}
            </button>

            {/* APPROVE */}

            {scene.approved ? (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-emerald-400/20
                  bg-emerald-400/[0.08]
                  px-3
                  py-2
                  text-[11px]
                  font-semibold
                  text-emerald-300
                "
              >
                <Check size={13} />
                Approved
              </div>
            ) : (
              <button
                onClick={() => onApprove(scene)}
                disabled={
                  generating ||
                  !hasImage
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-emerald-400/20
                  bg-emerald-400/[0.08]
                  px-3
                  py-2
                  text-[11px]
                  font-semibold
                  text-emerald-300
                  transition
                  hover:bg-emerald-400/[0.14]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <Check size={13} />
                Approve
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          border-t
          border-white/[0.05]
          px-4
          py-2
        "
      >
        <button
          disabled={index === 0}
          className="
            flex
            items-center
            gap-1
            text-[10px]
            text-white/20
            transition
            hover:text-white/50
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <ChevronLeft size={13} />
          Previous
        </button>

        <button
          disabled
          className="
            flex
            items-center
            gap-1
            text-[10px]
            text-white/20
            transition
            hover:text-white/50
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          Next
          <ChevronRight size={13} />
        </button>
      </div>
    </article>
  );
}