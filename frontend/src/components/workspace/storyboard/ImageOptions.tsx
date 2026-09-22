"use client";

import { Check } from "lucide-react";

type ImageOptionsProps = {
  imageOptions: string[];
  selectedImage?: string;
  onSelectImage: (imageUrl: string) => void;
};

export default function ImageOptions({
  imageOptions,
  selectedImage,
  onSelectImage,
}: ImageOptionsProps) {
  return (
    <div
      className="
        border-t
        border-white/[0.06]
        p-3
      "
    >
      <p
        className="
          mb-2
          text-[10px]
          uppercase
          tracking-[0.12em]
          text-white/30
        "
      >
        Choose your preferred image
      </p>

      <div
        className="
          grid
          grid-cols-3
          gap-2
        "
      >
        {imageOptions.map(
          (imageUrl, optionIndex) => {
            const selected =
              selectedImage === imageUrl;

            return (
              <button
                key={imageUrl}
                type="button"
                onClick={() =>
                  onSelectImage(imageUrl)
                }
                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-lg
                  border
                  transition
                  ${
                    selected
                      ? "border-white ring-1 ring-white"
                      : "border-white/10 hover:border-white/30"
                  }
                `}
              >
                <img
                  src={imageUrl}
                  alt={`Option ${
                    optionIndex + 1
                  }`}
                  className="
                    aspect-video
                    w-full
                    object-cover
                    transition
                    duration-300
                    group-hover:scale-105
                  "
                />

                <div
                  className="
                    absolute
                    bottom-1
                    left-1
                    rounded
                    bg-black/70
                    px-1.5
                    py-1
                    text-[9px]
                    text-white/70
                  "
                >
                  Option {optionIndex + 1}
                </div>

                {selected && (
                  <div
                    className="
                      absolute
                      right-1
                      top-1
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-black
                    "
                  >
                    <Check size={12} />
                  </div>
                )}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}