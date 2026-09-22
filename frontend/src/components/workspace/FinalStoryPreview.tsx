"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Film,
  ImageDown,
  Loader2,
  Pause,
  Play,
  Sparkles,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  Scene,
} from "@/types";


type FinalStoryPreviewProps = {
  scenes: Scene[];
  onClose: () => void;
};


const SLIDE_DURATION = 3000;


export default function FinalStoryPreview({
  scenes,
  onClose,
}: FinalStoryPreviewProps) {

  // ========================================================
  // APPROVED SCENES
  // ========================================================

  const finalScenes = useMemo(
    () =>
      scenes.filter(
        (scene) =>
          scene.approved &&
          !!scene.imageUrl
      ),
    [scenes]
  );


  // ========================================================
  // STATE
  // ========================================================

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    playing,
    setPlaying,
  ] = useState(false);

  const [
    exporting,
    setExporting,
  ] = useState(false);

  const [
    exportProgress,
    setExportProgress,
  ] = useState(0);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  // ========================================================
  // REFS
  // ========================================================

  const canvasRef =
    useRef<HTMLCanvasElement>(
      null
    );


  // ========================================================
  // CURRENT SCENE
  // ========================================================

  const currentScene =
    finalScenes[
      currentIndex
    ];


  // ========================================================
  // RESET INDEX
  // ========================================================

  useEffect(() => {

    if (
      currentIndex >=
      finalScenes.length
    ) {

      setCurrentIndex(
        Math.max(
          0,
          finalScenes.length - 1
        )
      );

    }

  }, [
    currentIndex,
    finalScenes.length,
  ]);


  // ========================================================
  // AUTO PLAY
  // ========================================================

  useEffect(() => {

    if (
      !playing ||
      finalScenes.length <= 1 ||
      exporting
    ) {
      return;
    }


    const timer =
      window.setTimeout(
        () => {

          setCurrentIndex(
            (current) =>
              current >=
              finalScenes.length - 1
                ? 0
                : current + 1
          );

        },
        SLIDE_DURATION
      );


    return () =>
      window.clearTimeout(
        timer
      );

  }, [
    playing,
    currentIndex,
    finalScenes.length,
    exporting,
  ]);


  // ========================================================
  // NAVIGATION
  // ========================================================

  function goPrevious() {

    setPlaying(false);

    setCurrentIndex(
      (current) =>
        current <= 0
          ? finalScenes.length - 1
          : current - 1
    );

  }


  function goNext() {

    setPlaying(false);

    setCurrentIndex(
      (current) =>
        current >=
        finalScenes.length - 1
          ? 0
          : current + 1
    );

  }


  // ========================================================
  // DOWNLOAD SINGLE IMAGE
  // ========================================================

  async function downloadImage(
    scene: Scene,
    index: number
  ) {

    if (!scene.imageUrl) {
      return;
    }


    try {

      setError(null);


      const response =
        await fetch(
          scene.imageUrl
        );


      if (!response.ok) {
        throw new Error(
          "Unable to download image."
        );
      }


      const blob =
        await response.blob();


      const blobUrl =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );

      link.href =
        blobUrl;

      link.download =
        `vizzy-scene-${index + 1}.png`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();


      URL.revokeObjectURL(
        blobUrl
      );

    } catch (downloadError) {

      console.error(
        "Image download failed:",
        downloadError
      );


      setError(
        "Image download failed. Please try again."
      );

    }

  }


  // ========================================================
  // DOWNLOAD ALL IMAGES
  // ========================================================

  async function downloadAllImages() {

    if (
      finalScenes.length === 0
    ) {
      return;
    }


    setError(null);


    for (
      let index = 0;
      index < finalScenes.length;
      index++
    ) {

      await downloadImage(
        finalScenes[index],
        index
      );


      /*
       * Small delay so the browser does not
       * block multiple downloads immediately.
       */

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            250
          )
      );

    }

  }


  // ========================================================
  // LOAD IMAGE FOR CANVAS
  // ========================================================

  function loadImage(
    src: string
  ): Promise<HTMLImageElement> {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        const image =
          new Image();


        /*
         * Needed when the generated image
         * is served from Django on port 8000
         * while Next.js runs on port 3000.
         */

        image.crossOrigin =
          "anonymous";


        image.onload =
          () =>
            resolve(
              image
            );


        image.onerror =
          () =>
            reject(
              new Error(
                "Unable to load storyboard image."
              )
            );


        image.src =
          src;

      }
    );

  }


  // ========================================================
  // DRAW IMAGE TO CANVAS
  // ========================================================

  function drawCoverImage(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    image: HTMLImageElement
  ) {

    const canvasWidth =
      canvas.width;

    const canvasHeight =
      canvas.height;


    const imageRatio =
      image.width /
      image.height;

    const canvasRatio =
      canvasWidth /
      canvasHeight;


    let drawWidth =
      canvasWidth;

    let drawHeight =
      canvasHeight;

    let offsetX = 0;
    let offsetY = 0;


    /*
     * Cover image.
     */

    if (
      imageRatio >
      canvasRatio
    ) {

      drawHeight =
        canvasHeight;

      drawWidth =
        drawHeight *
        imageRatio;

      offsetX =
        (
          canvasWidth -
          drawWidth
        ) / 2;

    } else {

      drawWidth =
        canvasWidth;

      drawHeight =
        drawWidth /
        imageRatio;

      offsetY =
        (
          canvasHeight -
          drawHeight
        ) / 2;

    }


    /*
     * Background.
     */

    context.fillStyle =
      "#08070b";

    context.fillRect(
      0,
      0,
      canvasWidth,
      canvasHeight
    );


    /*
     * Image.
     */

    context.drawImage(
      image,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    );


    /*
     * Cinematic dark overlay.
     */

    const gradient =
      context.createLinearGradient(
        0,
        0,
        0,
        canvasHeight
      );


    gradient.addColorStop(
      0,
      "rgba(0,0,0,0.12)"
    );

    gradient.addColorStop(
      0.65,
      "rgba(0,0,0,0.04)"
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0.42)"
    );


    context.fillStyle =
      gradient;

    context.fillRect(
      0,
      0,
      canvasWidth,
      canvasHeight
    );

  }


  // ========================================================
  // EXPORT VIDEO
  // ========================================================

  async function exportVideo() {

    if (
      finalScenes.length === 0
    ) {

      setError(
        "Approve at least one scene before exporting."
      );

      return;
    }


    if (
      typeof MediaRecorder ===
      "undefined"
    ) {

      setError(
        "Video export is not supported by this browser."
      );

      return;
    }


    const canvas =
      canvasRef.current;


    if (!canvas) {

      setError(
        "Video export is not ready yet."
      );

      return;
    }


    try {

      setError(null);

      setExporting(true);

      setPlaying(false);

      setExportProgress(0);


      const context =
        canvas.getContext(
          "2d"
        );


      if (!context) {

        throw new Error(
          "Canvas is not supported."
        );

      }


      /*
       * 16:9 Full HD canvas.
       */

      canvas.width =
        1280;

      canvas.height =
        720;


      /*
       * Load all images first.
       */

      const loadedImages =
        [] as HTMLImageElement[];


      for (
        let index = 0;
        index < finalScenes.length;
        index++
      ) {

        const scene =
          finalScenes[index];


        if (!scene.imageUrl) {
          continue;
        }


        const image =
          await loadImage(
            scene.imageUrl
          );


        loadedImages.push(
          image
        );


        setExportProgress(
          Math.round(
            (
              (index + 1) /
              finalScenes.length
            ) *
            20
          )
        );

      }


      if (
        loadedImages.length === 0
      ) {

        throw new Error(
          "No images available for export."
        );

      }


      // ====================================================
      // MEDIA RECORDER
      // ====================================================

      const stream =
        canvas.captureStream(
          30
        );


      const mimeTypes = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];


      const supportedMime =
        mimeTypes.find(
          (type) =>
            MediaRecorder.isTypeSupported(
              type
            )
        );


      if (!supportedMime) {

        throw new Error(
          "This browser does not support WebM video export."
        );

      }


      const recorder =
        new MediaRecorder(
          stream,
          {
            mimeType:
              supportedMime,

            videoBitsPerSecond:
              8_000_000,
          }
        );


      const chunks:
        BlobPart[] = [];


      recorder.ondataavailable =
        (event) => {

          if (
            event.data &&
            event.data.size > 0
          ) {

            chunks.push(
              event.data
            );

          }

        };


      const recordingFinished =
        new Promise<void>(
          (
            resolve
          ) => {

            recorder.onstop =
              () => resolve();

          }
        );


      recorder.start();


      // ====================================================
      // RENDER EACH SCENE
      // ====================================================

      for (
        let index = 0;
        index < loadedImages.length;
        index++
      ) {

        const image =
          loadedImages[index];


        /*
         * Fade in.
         */

        const fadeFrames =
          15;


        for (
          let frame = 0;
          frame < fadeFrames;
          frame++
        ) {

          drawCoverImage(
            canvas,
            context,
            image
          );


          const opacity =
            frame /
            fadeFrames;


          context.fillStyle =
            `rgba(8,7,11,${1 - opacity})`;


          context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
          );


          await new Promise(
            (resolve) =>
              requestAnimationFrame(
                resolve
              )
          );

        }


        /*
         * Hold scene for 3 seconds.
         */

        const holdStart =
          performance.now();


        while (
          performance.now() -
            holdStart <
          SLIDE_DURATION
        ) {

          drawCoverImage(
            canvas,
            context,
            image
          );


          /*
           * Small cinematic progress bar.
           */

          const elapsed =
            performance.now() -
            holdStart;


          const sceneProgress =
            Math.min(
              1,
              elapsed /
                SLIDE_DURATION
            );


          context.fillStyle =
            "rgba(255,255,255,0.18)";

          context.fillRect(
            80,
            canvas.height - 34,
            (
              canvas.width -
              160
            ) *
              sceneProgress,
            2
          );


          await new Promise(
            (resolve) =>
              requestAnimationFrame(
                resolve
              )
          );

        }


        /*
         * Export progress:
         * 20% image loading +
         * remaining 80% video rendering.
         */

        setExportProgress(
          Math.round(
            20 +
            (
              (
                index + 1
              ) /
              loadedImages.length
            ) *
              80
          )
        );

      }


      recorder.stop();


      await recordingFinished;


      const videoBlob =
        new Blob(
          chunks,
          {
            type:
              supportedMime,
          }
        );


      const videoUrl =
        URL.createObjectURL(
          videoBlob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        videoUrl;


      link.download =
        "vizzy-final-story.webm";


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();


      URL.revokeObjectURL(
        videoUrl
      );


      setExportProgress(
        100
      );

    } catch (exportError) {

      console.error(
        "Video export failed:",
        exportError
      );


      setError(
        exportError instanceof Error
          ? exportError.message
          : "Video export failed."
      );

    } finally {

      setExporting(false);

    }

  }


  // ========================================================
  // EMPTY STATE
  // ========================================================

  if (
    finalScenes.length === 0
  ) {

    return (

      <div
        className="
          fixed
          inset-0
          z-[200]
          flex
          items-center
          justify-center
          bg-black/80
          p-4
          backdrop-blur-xl
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
            p-6
            text-center
            shadow-[0_25px_100px_rgba(0,0,0,0.55)]
          "
        >

          <div
            className="
              mx-auto
              mb-4
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-violet-500/[0.08]
            "
          >

            <Film
              size={20}
              className="
                text-violet-300/70
              "
            />

          </div>


          <h2
            className="
              text-base
              font-semibold
              text-white
            "
          >
            Your story isn't ready yet
          </h2>


          <p
            className="
              mt-2
              text-xs
              leading-6
              text-white/30
            "
          >
            Generate an image and approve at
            least one storyboard scene before
            exporting your final story.
          </p>


          <button
            type="button"
            onClick={onClose}
            className="
              mt-5
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
            Back to storyboard
          </button>

        </div>

      </div>

    );

  }


  // ========================================================
  // MAIN UI
  // ========================================================

  return (

    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        flex-col
        bg-[#08070b]
        text-white
      "
    >

      {/* ====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          flex
          h-16
          shrink-0
          items-center
          justify-between
          border-b
          border-white/[0.07]
          bg-[#111017]/95
          px-4
          backdrop-blur-xl
          sm:px-6
        "
      >

        {/* LEFT */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-violet-400
              via-fuchsia-400
              to-violet-600
              shadow-[0_0_25px_rgba(139,92,246,0.12)]
            "
          >

            <Sparkles
              size={16}
              className="text-white"
            />

          </div>


          <div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  text-sm
                  font-semibold
                "
              >
                Final Story
              </span>


              <span
                className="
                  rounded-full
                  border
                  border-violet-400/[0.15]
                  bg-violet-400/[0.05]
                  px-1.5
                  py-0.5
                  text-[8px]
                  uppercase
                  tracking-wider
                  text-violet-300/60
                "
              >
                Vizzy
              </span>

            </div>


            <p
              className="
                mt-0.5
                text-[10px]
                text-white/25
              "
            >
              {finalScenes.length} approved{" "}
              {finalScenes.length === 1
                ? "scene"
                : "scenes"}
            </p>

          </div>

        </div>


        {/* RIGHT */}

        <button
          type="button"
          onClick={onClose}
          disabled={exporting}
          aria-label="Close final story"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            text-white/35
            transition
            hover:bg-white/[0.06]
            hover:text-white
            disabled:opacity-30
          "
        >

          <X size={18} />

        </button>

      </header>


      {/* ====================================================
          MAIN
      ===================================================== */}

      <main
        className="
          flex
          min-h-0
          flex-1
          flex-col
          overflow-hidden
          lg:flex-row
        "
      >

        {/* ==================================================
            PREVIEW
        =================================================== */}

        <section
          className="
            relative
            flex
            min-h-0
            flex-1
            items-center
            justify-center
            overflow-hidden
            bg-[#08070b]
            p-4
            sm:p-8
          "
        >

          {/* Glow */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-[500px]
              w-[700px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-violet-600/[0.035]
              blur-[120px]
            "
          />


          {/* Image */}

          <div
            className="
              relative
              z-10
              aspect-video
              w-full
              max-w-5xl
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.08]
              bg-black
              shadow-[0_30px_100px_rgba(0,0,0,0.45)]
            "
          >

            {currentScene?.imageUrl && (

              <img
                src={
                  currentScene.imageUrl
                }
                alt={
                  currentScene.title
                }
                className="
                  h-full
                  w-full
                  object-cover
                "
              />

            )}


            {/* Bottom gradient */}

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                h-32
                bg-gradient-to-t
                from-black/70
                to-transparent
              "
            />


            {/* Scene title */}

            <div
              className="
                absolute
                bottom-4
                left-4
                right-4
                sm:bottom-6
                sm:left-6
                sm:right-6
              "
            >

              <div
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.16em]
                  text-white/40
                "
              >
                Scene{" "}
                {currentIndex + 1}
              </div>


              <h2
                className="
                  mt-1
                  text-base
                  font-semibold
                  text-white
                  sm:text-xl
                "
              >
                {currentScene?.title}
              </h2>

            </div>

          </div>

        </section>


        {/* ==================================================
            SIDEBAR
        =================================================== */}

        <aside
          className="
            flex
            w-full
            shrink-0
            flex-col
            border-t
            border-white/[0.07]
            bg-[#111017]
            lg:w-[350px]
            lg:border-l
            lg:border-t-0
          "
        >

          {/* =================================================
              SCENE LIST
          ================================================== */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              p-4
            "
          >

            <div
              className="
                mb-3
                flex
                items-center
                justify-between
              "
            >

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-white/30
                "
              >
                Storyboard
              </span>


              <span
                className="
                  text-[10px]
                  text-white/20
                "
              >
                {currentIndex + 1}/
                {finalScenes.length}
              </span>

            </div>


            <div
              className="
                space-y-2
              "
            >

              {finalScenes.map(
                (
                  scene,
                  index
                ) => (

                  <button
                    key={
                      scene.id
                    }
                    type="button"
                    onClick={() => {

                      if (
                        !exporting
                      ) {

                        setCurrentIndex(
                          index
                        );

                        setPlaying(
                          false
                        );

                      }

                    }}
                    className={`
                      group
                      flex
                      w-full
                      gap-3
                      rounded-xl
                      border
                      p-2
                      text-left
                      transition
                      ${
                        index ===
                        currentIndex
                          ? "border-violet-400/[0.25] bg-violet-500/[0.07]"
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                      }
                    `}
                  >

                    <div
                      className="
                        h-14
                        w-20
                        shrink-0
                        overflow-hidden
                        rounded-lg
                        bg-black
                      "
                    >

                      {scene.imageUrl && (

                        <img
                          src={
                            scene.imageUrl
                          }
                          alt=""
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />

                      )}

                    </div>


                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >

                      <div
                        className="
                          text-[9px]
                          uppercase
                          tracking-wider
                          text-white/20
                        "
                      >
                        Scene {index + 1}
                      </div>


                      <div
                        className="
                          mt-1
                          truncate
                          text-xs
                          font-medium
                          text-white/65
                        "
                      >
                        {scene.title}
                      </div>


                      <div
                        className="
                          mt-1
                          text-[9px]
                          text-emerald-300/50
                        "
                      >
                        Approved
                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          </div>


          {/* =================================================
              CONTROLS
          ================================================== */}

          <div
            className="
              shrink-0
              border-t
              border-white/[0.07]
              p-4
            "
          >

            {/* Navigation */}

            <div
              className="
                mb-3
                flex
                items-center
                justify-center
                gap-2
              "
            >

              <button
                type="button"
                onClick={
                  goPrevious
                }
                disabled={exporting}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  text-white/40
                  transition
                  hover:bg-white/[0.06]
                  hover:text-white
                  disabled:opacity-30
                "
              >

                <ChevronLeft
                  size={16}
                />

              </button>


              <button
                type="button"
                onClick={() =>
                  setPlaying(
                    (value) =>
                      !value
                  )
                }
                disabled={
                  exporting ||
                  finalScenes.length <= 1
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-white
                  text-black
                  transition
                  hover:bg-white/90
                  disabled:opacity-30
                "
              >

                {playing ? (
                  <Pause
                    size={15}
                  />
                ) : (
                  <Play
                    size={15}
                    fill="currentColor"
                  />
                )}

              </button>


              <button
                type="button"
                onClick={
                  goNext
                }
                disabled={exporting}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  text-white/40
                  transition
                  hover:bg-white/[0.06]
                  hover:text-white
                  disabled:opacity-30
                "
              >

                <ChevronRight
                  size={16}
                />

              </button>

            </div>


            {/* Export */}

            <button
              type="button"
              onClick={
                exportVideo
              }
              disabled={
                exporting
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-violet-500
                to-fuchsia-500
                px-4
                py-2.5
                text-xs
                font-semibold
                text-white
                shadow-[0_8px_30px_rgba(139,92,246,0.12)]
                transition
                hover:brightness-110
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {exporting ? (

                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />

                  Exporting{" "}
                  {exportProgress}%
                </>

              ) : (

                <>
                  <Film
                    size={14}
                  />

                  Export Video
                </>

              )}

            </button>


            {/* Download images */}

            <button
              type="button"
              onClick={
                downloadAllImages
              }
              disabled={
                exporting
              }
              className="
                mt-2
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                px-4
                py-2.5
                text-xs
                font-medium
                text-white/55
                transition
                hover:bg-white/[0.06]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              <ImageDown
                size={14}
              />

              Download Images

            </button>


            {/* Error */}

            {error && (

              <div
                className="
                  mt-3
                  rounded-lg
                  border
                  border-red-400/[0.15]
                  bg-red-400/[0.04]
                  px-3
                  py-2
                  text-[10px]
                  leading-5
                  text-red-300/70
                "
              >
                {error}
              </div>

            )}

          </div>

        </aside>

      </main>


      {/* ====================================================
          HIDDEN EXPORT CANVAS
      ===================================================== */}

      <canvas
        ref={
          canvasRef
        }
        className="
          pointer-events-none
          fixed
          -left-[9999px]
          -top-[9999px]
          h-0
          w-0
        "
      />

    </div>

  );
}