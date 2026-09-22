"use client";

import {
  ArrowUp,
  Loader2,
  Paperclip,
  Sparkles,
} from "lucide-react";

import {
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  sendChatMessage,
} from "@/lib/api";

import {
  useProjectStore,
} from "@/store/projectStore";

export default function ChatInput() {
  // ========================================================
  // STORE
  // ========================================================

  const project =
    useProjectStore(
      (state) =>
        state.project
    );

  const addMessage =
    useProjectStore(
      (state) =>
        state.addMessage
    );

  const addScene =
    useProjectStore(
      (state) =>
        state.addScene
    );

  const updateProjectName =
    useProjectStore(
      (state) =>
        state.updateProjectName
    );

  // ========================================================
  // LOCAL STATE
  // ========================================================

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  // ========================================================
  // REF
  // ========================================================

  const textareaRef =
    useRef<HTMLTextAreaElement>(
      null
    );

  // ========================================================
  // AUTO RESIZE
  // ========================================================

  function resizeTextarea() {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height =
      "auto";

    const nextHeight =
      Math.min(
        textarea.scrollHeight,
        180
      );

    textarea.style.height =
      `${nextHeight}px`;
  }

  useEffect(() => {
    resizeTextarea();
  }, [
    message,
  ]);

  // ========================================================
  // SEND MESSAGE
  // ========================================================

  async function handleSend() {
    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      loading
    ) {
      return;
    }

    const projectId =
      Number(project.id);

    if (
      Number.isNaN(projectId)
    ) {
      setError(
        "Invalid project. Please create a new chat."
      );

      return;
    }

    try {
      setError(null);

      setLoading(true);

      // ----------------------------------------------------
      // Clear composer immediately
      // ----------------------------------------------------

      setMessage("");

      if (
        textareaRef.current
      ) {
        textareaRef.current.style.height =
          "auto";
      }

      // ----------------------------------------------------
      // Send to backend
      // ----------------------------------------------------

      const response =
        await sendChatMessage(
          projectId,
          trimmedMessage
        );

      // ----------------------------------------------------
      // USER MESSAGE
      // ----------------------------------------------------

      if (
        response?.user_message
      ) {
        addMessage({
          id: String(
            response
              .user_message.id
          ),

          role: "user",

          content:
            response
              .user_message
              .content,

          createdAt:
            response
              .user_message
              .created_at,
        });
      } else {
        /*
         * Fallback in case the API
         * doesn't return user_message.
         */

        addMessage({
          id:
            `user-${Date.now()}`,

          role: "user",

          content:
            trimmedMessage,

          createdAt:
            new Date().toISOString(),
        });
      }

      // ----------------------------------------------------
      // AUTO PROJECT TITLE
      // ----------------------------------------------------

      if (
        response?.project?.name
      ) {
        updateProjectName(
          response.project.name
        );
      }

      // ----------------------------------------------------
      // ASSISTANT MESSAGE
      // ----------------------------------------------------

      if (
        response?.assistant_message
      ) {
        addMessage({
          id: String(
            response
              .assistant_message.id
          ),

          role: "assistant",

          content:
            response
              .assistant_message
              .content,

          createdAt:
            response
              .assistant_message
              .created_at,
        });
      }

      // ----------------------------------------------------
      // CREATED STORYBOARD SCENE
      // ----------------------------------------------------

      if (
        response?.scene
      ) {
        const scene =
          response.scene;

        addScene({
          id: String(
            scene.id
          ),

          title:
            scene.title ||
            "Untitled Scene",

          description:
            scene.description ||
            "",

          status:
            scene.status ||
            "empty",

          imageUrl:
            scene.image_url ||
            undefined,

          approved:
            false,
        });
      }
    } catch (err) {
      console.error(
        "Failed to send message:",
        err
      );

      /*
       * Restore the user's message
       * if the request failed.
       */

      setMessage(
        trimmedMessage
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================================
  // KEYBOARD
  // ========================================================

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    /*
     * Enter sends message.
     *
     * Shift + Enter creates a
     * new line.
     */

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();
    }
  }

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div
      className="
        shrink-0
        border-t
        border-white/[0.06]
        bg-[#090909]
        px-2.5
        pb-[max(10px,env(safe-area-inset-bottom))]
        pt-2.5
        sm:px-4
        sm:pb-3
        sm:pt-3
        lg:px-5
      "
    >
      {/* ==================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          className="
            mx-auto
            mb-2
            flex
            max-w-3xl
            items-center
            justify-between
            gap-3
            rounded-xl
            border
            border-red-400/[0.15]
            bg-red-400/[0.045]
            px-3
            py-2
            text-[11px]
            text-red-300/80
          "
        >
          <span className="min-w-0 truncate">
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError(null)
            }
            className="
              shrink-0
              text-red-300/50
              transition
              hover:text-red-200
            "
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ==================================================
          COMPOSER
      =================================================== */}

      <div
        className="
          mx-auto
          max-w-3xl
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.10]
            bg-[#111017]
            shadow-[0_8px_35px_rgba(0,0,0,0.18)]
            transition
            focus-within:border-white/[0.16]
            focus-within:bg-[#13121a]
            focus-within:shadow-[0_10px_45px_rgba(0,0,0,0.28)]
          "
        >
          {/* =================================================
              TEXTAREA
          ================================================== */}

          <textarea
            ref={
              textareaRef
            }
            value={
              message
            }
            onChange={(
              event
            ) =>
              setMessage(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            disabled={
              loading
            }
            rows={1}
            maxLength={12000}
            placeholder={
              "Describe what you want to create..."
            }
            className="
              block
              max-h-[180px]
              min-h-[72px]
              w-full
              resize-none
              overflow-y-auto
              bg-transparent
              px-4
              pb-12
              pt-4
              text-sm
              leading-6
              text-white
              outline-none
              placeholder:text-white/25
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:min-h-[82px]
              sm:px-5
              sm:pt-4
            "
          />

          {/* =================================================
              BOTTOM TOOLBAR
          ================================================== */}

          <div
            className="
              absolute
              bottom-2.5
              left-3
              right-3
              flex
              items-center
              justify-between
              sm:bottom-3
              sm:left-4
              sm:right-4
            "
          >
            {/* LEFT TOOLS */}

            <div
              className="
                flex
                min-w-0
                items-center
                gap-1
              "
            >
              {/* ATTACH */}

              <button
                type="button"
                disabled={
                  loading
                }
                title="Attach file"
                className="
                  flex
                  h-8
                  items-center
                  gap-1.5
                  rounded-lg
                  px-2
                  text-[10px]
                  text-white/30
                  transition
                  hover:bg-white/[0.05]
                  hover:text-white/60
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  sm:text-[11px]
                "
              >
                <Paperclip
                  size={14}
                />

                <span className="hidden sm:inline">
                  Attach
                </span>
              </button>

              {/* DIVIDER */}

              <span
                className="
                  hidden
                  h-4
                  w-px
                  bg-white/[0.07]
                  sm:block
                "
              />

              {/* VIZZY AI */}

              <div
                className="
                  flex
                  h-8
                  items-center
                  gap-1.5
                  rounded-lg
                  px-2
                  text-[10px]
                  text-white/25
                  sm:text-[11px]
                "
              >
                <Sparkles
                  size={13}
                  className="
                    text-violet-300/45
                  "
                />

                <span className="hidden sm:inline">
                  Vizzy AI
                </span>
              </div>
            </div>

            {/* RIGHT */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              {/* CHARACTER COUNT */}

              {message.length >
                0 && (
                <span
                  className="
                    hidden
                    text-[9px]
                    tabular-nums
                    text-white/20
                    sm:block
                  "
                >
                  {
                    message.length
                  }
                </span>
              )}

              {/* SEND */}

              <button
                type="button"
                onClick={
                  handleSend
                }
                disabled={
                  loading ||
                  !message.trim()
                }
                aria-label="Send message"
                title={
                  loading
                    ? "Vizzy is thinking..."
                    : "Send message"
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-black
                  shadow-sm
                  transition
                  hover:bg-white/90
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:bg-white/[0.12]
                  disabled:text-white/25
                  disabled:shadow-none
                  sm:h-9
                  sm:w-9
                "
              >
                {loading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <ArrowUp
                    size={17}
                    strokeWidth={2.2}
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            HINT
        ================================================== */}

        <div
          className="
            mt-1.5
            hidden
            text-center
            text-[9px]
            text-white/15
            sm:block
          "
        >
          Enter to send · Shift + Enter for new line
        </div>
      </div>
    </div>
  );
}