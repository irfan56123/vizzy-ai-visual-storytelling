"use client";

import { Plus, Sparkles } from "lucide-react";

type EmptyStoryboardProps = {
  onCreate: () => void;
};

export default function EmptyStoryboard({
  onCreate,
}: EmptyStoryboardProps) {
  return (
    <div
      className="
        flex
        h-full
        min-h-[400px]
        items-center
        justify-center
      "
    >
      <div
        className="
          max-w-sm
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-white/10
            bg-white/[0.03]
          "
        >
          <Sparkles
            size={22}
            className="text-white/30"
          />
        </div>

        <h3
          className="
            mt-5
            text-sm
            font-semibold
            text-white/70
          "
        >
          Your storyboard is empty
        </h3>

        <p
          className="
            mt-2
            text-xs
            leading-5
            text-white/30
          "
        >
          Start by creating a page or ask Vizzy
          to turn your story into storyboard scenes.
        </p>

        <button
          onClick={onCreate}
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-white
            px-4
            py-2
            text-xs
            font-semibold
            text-black
            transition
            hover:bg-white/90
          "
        >
          <Plus size={14} />
          Create first page
        </button>
      </div>
    </div>
  );
}