"use client";

import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightOpen,
  Sparkles,
} from "lucide-react";

import { useState } from "react";

import Sidebar from "./Sidebar";
import ChatPanel from "./ChatPanel";
import Storyboard from "./Storyboard";

export default function Workspace() {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [storyboardOpen, setStoryboardOpen] =
    useState(false);

  return (
    <main
      className="
        relative
        flex
        h-[100dvh]
        min-h-0
        overflow-hidden
        bg-[#0b0a0f]
        text-white
      "
    >
      {/* =====================================================
          GLOBAL SUBTLE VIOLET GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-[38%]
          top-[-260px]
          z-0
          h-[430px]
          w-[650px]
          rounded-full
          bg-violet-600/[0.035]
          blur-[120px]
        "
      />

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside
        className={`
          relative
          z-20
          hidden
          shrink-0
          overflow-hidden
          border-r
          border-white/[0.07]
          bg-[#111017]
          transition-[width]
          duration-300
          ease-in-out
          lg:block
          ${
            sidebarOpen
              ? "w-[260px]"
              : "w-0 border-r-0"
          }
        `}
      >
        {sidebarOpen && (
          <Sidebar
            onClose={() =>
              setSidebarOpen(false)
            }
          />
        )}
      </aside>

      {/* =====================================================
          MOBILE / TABLET SIDEBAR
      ====================================================== */}

      {sidebarOpen && (
        <div className="lg:hidden">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="
              fixed
              inset-0
              z-40
              bg-black/65
              backdrop-blur-[4px]
            "
          />

          {/* Drawer */}

          <aside
            className="
              fixed
              inset-y-0
              left-0
              z-50
              w-[280px]
              max-w-[86vw]
              overflow-hidden
              border-r
              border-white/[0.08]
              bg-[#111017]
              shadow-[20px_0_70px_rgba(0,0,0,0.55)]
            "
          >
            <Sidebar
              onClose={() =>
                setSidebarOpen(false)
              }
            />
          </aside>
        </div>
      )}

      {/* =====================================================
          MAIN WORKSPACE
      ====================================================== */}

      <section
        className="
          relative
          z-10
          flex
          min-w-0
          flex-1
          flex-col
          overflow-hidden
        "
      >
        {/* ===================================================
            TOP BAR
        ==================================================== */}

        <header
          className="
            relative
            z-20
            flex
            h-14
            shrink-0
            items-center
            border-b
            border-white/[0.07]
            bg-[#111017]/95
            px-2.5
            shadow-[0_1px_25px_rgba(0,0,0,0.15)]
            backdrop-blur-xl
            sm:px-4
          "
        >
          {/* subtle header glow */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/3
              top-0
              h-full
              w-1/3
              bg-violet-500/[0.018]
              blur-2xl
            "
          />

          {/* =================================================
              SIDEBAR BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(
                (current) => !current
              )
            }
            aria-label={
              sidebarOpen
                ? "Close sidebar"
                : "Open sidebar"
            }
            className="
              relative
              z-10
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-transparent
              text-white/35
              transition-all
              hover:border-white/[0.06]
              hover:bg-white/[0.045]
              hover:text-white/80
              active:scale-95
            "
          >
            {/* Desktop */}

            {sidebarOpen ? (
              <PanelLeftClose
                size={17}
                className="hidden lg:block"
              />
            ) : (
              <PanelLeftOpen
                size={17}
                className="hidden lg:block"
              />
            )}

            {/* Mobile */}

            <Menu
              size={18}
              className="lg:hidden"
            />
          </button>

          {/* =================================================
              WORKSPACE BRAND
          ================================================== */}

          <div
            className="
              relative
              z-10
              ml-2.5
              flex
              min-w-0
              flex-1
              items-center
              gap-2.5
            "
          >
            {/* Vizzy icon */}

            <div
              className="
                hidden
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-gradient-to-br
                from-violet-400
                via-fuchsia-400
                to-violet-600
                shadow-[0_0_20px_rgba(139,92,246,0.12)]
                sm:flex
              "
            >
              <Sparkles
                size={13}
                strokeWidth={2.2}
                className="text-white"
              />
            </div>

            {/* Title */}

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
                <div
                  className="
                    truncate
                    text-sm
                    font-semibold
                    tracking-tight
                    text-white/90
                  "
                >
                  Vizzy
                </div>

                <span
                  className="
                    hidden
                    rounded-full
                    border
                    border-violet-400/[0.14]
                    bg-violet-400/[0.055]
                    px-1.5
                    py-0.5
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-violet-300/55
                    sm:inline-flex
                  "
                >
                  AI
                </span>
              </div>

              <div
                className="
                  hidden
                  truncate
                  text-[10px]
                  leading-3
                  text-white/25
                  sm:block
                "
              >
                AI visual storytelling workspace
              </div>
            </div>
          </div>

          {/* =================================================
              STORYBOARD TOGGLE
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              setStoryboardOpen(true)
            }
            aria-label="Open storyboard"
            className="
              relative
              z-10
              mr-2
              flex
              h-8
              items-center
              gap-1.5
              rounded-lg
              border
              border-white/[0.07]
              bg-white/[0.025]
              px-2.5
              text-white/35
              transition-all
              hover:border-violet-400/[0.18]
              hover:bg-violet-500/[0.07]
              hover:text-violet-200/80
              active:scale-95
              xl:hidden
            "
          >
            <PanelRightOpen
              size={15}
            />

            <span
              className="
                hidden
                text-[10px]
                font-medium
                sm:inline
              "
            >
              Storyboard
            </span>
          </button>

          {/* =================================================
              AI STATUS
          ================================================== */}

          <div
            className="
              relative
              z-10
              flex
              shrink-0
              items-center
              gap-2
              rounded-full
              border
              border-emerald-400/[0.10]
              bg-emerald-400/[0.035]
              px-2.5
              py-1.5
              shadow-[0_0_18px_rgba(52,211,153,0.025)]
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
                  bg-emerald-400/35
                "
              />

              <span
                className="
                  relative
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-400
                "
              />
            </span>

            <span
              className="
                hidden
                text-[10px]
                font-medium
                text-emerald-300/55
                sm:block
              "
            >
              AI ready
            </span>
          </div>
        </header>

        {/* ===================================================
            CONTENT AREA
        ==================================================== */}

        <div
          className="
            relative
            flex
            min-h-0
            flex-1
            overflow-hidden
          "
        >
          {/* =================================================
              CHAT
          ================================================== */}

          <section
            className="
              relative
              flex
              min-h-0
              min-w-0
              flex-1
              overflow-hidden
              xl:border-r
              xl:border-white/[0.07]
            "
          >
            <ChatPanel />
          </section>

          {/* =================================================
              DESKTOP STORYBOARD

              Only visible at xl+
          ================================================== */}

          <section
            className="
              hidden
              h-full
              shrink-0
              overflow-hidden
              border-l-0
              bg-[#111017]
              xl:flex
              xl:w-[370px]
              2xl:w-[420px]
            "
          >
            <Storyboard />
          </section>
        </div>
      </section>

      {/* =====================================================
          TABLET / MOBILE STORYBOARD DRAWER
      ====================================================== */}

      {storyboardOpen && (
        <div className="xl:hidden">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close storyboard"
            onClick={() =>
              setStoryboardOpen(false)
            }
            className="
              fixed
              inset-0
              z-50
              bg-black/65
              backdrop-blur-[4px]
            "
          />

          {/* Drawer */}

          <aside
            className="
              fixed
              inset-y-0
              right-0
              z-[60]
              w-[430px]
              max-w-[94vw]
              overflow-hidden
              border-l
              border-white/[0.08]
              bg-[#111017]
              shadow-[-20px_0_70px_rgba(0,0,0,0.55)]
            "
          >
            <Storyboard
              onClose={() =>
                setStoryboardOpen(false)
              }
            />
          </aside>
        </div>
      )}
    </main>
  );
}