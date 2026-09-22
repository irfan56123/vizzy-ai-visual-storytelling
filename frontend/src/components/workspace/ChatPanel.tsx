"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  getChatHistory,
} from "@/lib/api";

import {
  useProjectStore,
} from "@/store/projectStore";

import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";


export default function ChatPanel() {

  // ========================================================
  // STORE
  // ========================================================

  const project =
    useProjectStore(
      (state) =>
        state.project
    );

  const messages =
    useProjectStore(
      (state) =>
        state.project.messages
    );

  const setMessages =
    useProjectStore(
      (state) =>
        state.setMessages
    );


  // ========================================================
  // LOCAL STATE
  // ========================================================

  const [
    loadingHistory,
    setLoadingHistory,
  ] = useState(true);


  // ========================================================
  // REFS
  // ========================================================

  const messagesEndRef =
    useRef<HTMLDivElement>(
      null
    );

  const previousMessageCountRef =
    useRef(0);

  const initialLoadRef =
    useRef(true);


  // ========================================================
  // LOAD CHAT HISTORY
  // ========================================================

  useEffect(() => {

    async function loadChatHistory() {

      const projectId =
        Number(project.id);

      if (
        !project.id ||
        Number.isNaN(projectId)
      ) {

        setLoadingHistory(false);

        return;
      }


      try {

        setLoadingHistory(true);

        const history =
          await getChatHistory(
            projectId
          );


        const mappedMessages =
          history.map(
            (message) => ({
              id:
                String(
                  message.id
                ),

              role:
                message.role,

              content:
                message.content,

              createdAt:
                message.created_at,
            })
          );


        if (
          mappedMessages.length > 0
        ) {

          setMessages(
            mappedMessages
          );

        }

      } catch (error) {

        console.error(
          "Failed to load chat history:",
          error
        );

      } finally {

        setLoadingHistory(false);

      }

    }


    loadChatHistory();

  }, [
    project.id,
    setMessages,
  ]);


  // ========================================================
  // AUTO SCROLL
  //
  // IMPORTANT:
  // Only scroll when the number of messages changes.
  //
  // Storyboard generation / image generation should NOT
  // move the chat position.
  // ========================================================

  useEffect(() => {

    const currentCount =
      messages.length;

    const previousCount =
      previousMessageCountRef.current;


    // First render / history load

    if (initialLoadRef.current) {

      previousMessageCountRef.current =
        currentCount;

      initialLoadRef.current =
        false;

      return;
    }


    // Only scroll when a new message
    // has actually been added.

    if (
      currentCount >
      previousCount
    ) {

      requestAnimationFrame(() => {

        messagesEndRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "end",
          }
        );

      });

    }


    previousMessageCountRef.current =
      currentCount;

  }, [
    messages.length,
  ]);


  // ========================================================
  // RENDER
  // ========================================================

  return (

    <section
      className="
        relative
        flex
        min-w-0
        flex-1
        flex-col
        overflow-hidden
        bg-[#0b0a0f]
        text-white
      "
    >

      {/* ====================================================
          SUBTLE BACKGROUND GLOW
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[-220px]
          h-[420px]
          w-[650px]
          -translate-x-1/2
          rounded-full
          bg-violet-600/[0.055]
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-[-180px]
          left-1/3
          h-[300px]
          w-[500px]
          rounded-full
          bg-fuchsia-600/[0.025]
          blur-[110px]
        "
      />


      {/* ====================================================
          CHAT HEADER
      ===================================================== */}

      <header
        className="
          relative
          z-10
          flex
          h-16
          shrink-0
          items-center
          justify-between
          border-b
          border-white/[0.07]
          bg-[#111017]/90
          px-4
          backdrop-blur-xl
          sm:px-6
        "
      >

        {/* LEFT */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >

          {/* VIZZY ICON */}

          <div
            className="
              relative
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              bg-gradient-to-br
              from-violet-400
              via-fuchsia-400
              to-violet-600
              text-white
              shadow-lg
              shadow-violet-500/10
            "
          >

            <div
              className="
                absolute
                inset-[1px]
                rounded-[10px]
                bg-[#17141f]
              "
            />

            <Sparkles
              size={15}
              className="
                relative
                z-10
                text-violet-200
              "
            />

          </div>


          {/* TITLE */}

          <div
            className="
              min-w-0
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  truncate
                  text-sm
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                Vizzy
              </span>

              <span
                className="
                  hidden
                  rounded-full
                  border
                  border-violet-400/15
                  bg-violet-400/[0.06]
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-wider
                  text-violet-300/60
                  sm:inline-flex
                "
              >
                AI
              </span>

            </div>


            <div
              className="
                mt-0.5
                truncate
                text-[10px]
                text-white/25
              "
            >
              Creative assistant
            </div>

          </div>

        </div>


        {/* STATUS */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
            rounded-full
            border
            border-white/[0.08]
            bg-white/[0.025]
            px-3
            py-1.5
            shadow-inner
          "
        >

          <span
            className="
              relative
              flex
              h-1.5
              w-1.5
            "
          >

            <span
              className="
                absolute
                inline-flex
                h-full
                w-full
                animate-ping
                rounded-full
                bg-emerald-400/40
              "
            />

            <span
              className="
                relative
                inline-flex
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-400
              "
            />

          </span>

          <span
            className="
              text-[10px]
              font-medium
              text-white/40
            "
          >
            {loadingHistory
              ? "Loading"
              : "Ready"}
          </span>

        </div>

      </header>


      {/* ====================================================
          MESSAGE AREA
      ===================================================== */}

      <div
        className="
          relative
          z-[1]
          min-h-0
          flex-1
          overflow-y-auto
          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-white/10
        "
      >

        <div
          className="
            relative
            mx-auto
            w-full
            max-w-4xl
            px-3
            py-6
            sm:px-6
            sm:py-8
            lg:px-8
          "
        >

          {/* =================================================
              LOADING
          ================================================= */}

          {loadingHistory ? (

            <div
              className="
                flex
                min-h-[400px]
                flex-col
                items-center
                justify-center
                text-center
              "
            >

              <div
                className="
                  relative
                  mb-5
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-violet-400/10
                  bg-violet-500/[0.05]
                  shadow-[0_0_45px_rgba(139,92,246,0.08)]
                "
              >

                <div
                  className="
                    absolute
                    inset-2
                    rounded-xl
                    border
                    border-violet-400/[0.08]
                  "
                />

                <Sparkles
                  size={22}
                  className="
                    animate-pulse
                    text-violet-300/60
                  "
                />

              </div>


              <h2
                className="
                  text-base
                  font-medium
                  text-white/85
                "
              >
                Loading your story...
              </h2>


              <p
                className="
                  mt-2
                  max-w-sm
                  text-xs
                  leading-6
                  text-white/25
                "
              >
                Restoring your conversation
                with Vizzy.
              </p>

            </div>

          ) : messages.length === 0 ? (

            /* ===============================================
               EMPTY STATE
            ================================================ */

            <div
              className="
                flex
                min-h-[400px]
                flex-col
                items-center
                justify-center
                text-center
              "
            >

              <div
                className="
                  relative
                  mb-6
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-violet-400/10
                  bg-gradient-to-br
                  from-violet-500/[0.10]
                  to-fuchsia-500/[0.04]
                  shadow-[0_0_50px_rgba(139,92,246,0.08)]
                "
              >

                <WandSparkles
                  size={23}
                  className="
                    text-violet-300/70
                  "
                />

              </div>


              <h2
                className="
                  text-lg
                  font-semibold
                  tracking-tight
                  text-white/90
                "
              >
                What are we creating?
              </h2>


              <p
                className="
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  text-white/30
                "
              >
                Tell Vizzy about your story,
                characters, visual style or
                the scene you want to create.
              </p>


              {/* SUGGESTIONS */}

              <div
                className="
                  mt-6
                  flex
                  flex-wrap
                  justify-center
                  gap-2
                "
              >

                {[
                  "Create a cinematic scene",
                  "Build a character",
                  "Define visual style",
                ].map(
                  (suggestion) => (

                    <div
                      key={suggestion}
                      className="
                        rounded-full
                        border
                        border-white/[0.07]
                        bg-white/[0.025]
                        px-3
                        py-1.5
                        text-[10px]
                        text-white/25
                      "
                    >
                      {suggestion}
                    </div>

                  )
                )}

              </div>

            </div>

          ) : (

            /* ===============================================
               MESSAGE LIST
            ================================================ */

            <div
              className="
                space-y-7
              "
            >

              {messages.map(
                (message) => (

                  <MessageBubble
                    key={
                      message.id
                    }
                    message={
                      message
                    }
                  />

                )
              )}


              {/* =================================================
                  SCROLL ANCHOR

                  Only used when a NEW message arrives.
              ================================================== */}

              <div
                ref={
                  messagesEndRef
                }
                className="
                  h-px
                  w-full
                "
              />

            </div>

          )}

        </div>

      </div>


      {/* ====================================================
          CHAT INPUT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          border-t
          border-white/[0.06]
          bg-[#0b0a0f]/90
          backdrop-blur-xl
        "
      >

        <ChatInput />

      </div>

    </section>

  );
}