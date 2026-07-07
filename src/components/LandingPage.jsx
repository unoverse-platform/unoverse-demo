import { useEffect, useRef } from "preact/hooks";
import { UnoverseMark } from "./Logo";

/**
 * The Unoverse landing page (`/`) — a pure, cinematic brand splash. Full-bleed muted video
 * loop behind a dark wash, one glowing logomark and the tagline. Deliberately NO channel links:
 * the demos live at their own paths (`/sab`, `/bpp`), reached directly, so the home page stays
 * a clean statement of the brand.
 */
export function LandingPage() {
  // Force muted autoplay from JS. The `muted` ATTRIBUTE doesn't always reflect to the DOM
  // PROPERTY across frameworks, and browsers only allow autoplay when the property is true —
  // so set it explicitly and kick off play() (ignore the promise rejection if the tab is
  // backgrounded; it'll start on the next visibility change).
  const videoRef = useRef(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black">
      {/* Full-screen muted video loop. A NATIVE <video> (not a YouTube iframe): the HTML spec
          guarantees muted autoplay, and it renders NO player chrome — no play/pause button ever,
          because there's no `controls` attribute. */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
          src="https://videos.pexels.com/video-files/3141210/3141210-uhd_3840_2160_25fps.mp4"
        />
        {/* Cinematic wash — darken the footage, then bleed brand glows in from the corners. */}
        <div className="absolute inset-0 bg-black/55" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70rem 50rem at 80% -10%, rgba(167,139,250,0.28), transparent 55%)," +
              "radial-gradient(60rem 50rem at 5% 115%, rgba(34,211,238,0.22), transparent 55%)",
          }}
        />
        {/* subtle vignette */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)" }}
        />
      </div>

      {/* Center stage */}
      <div className="uv-rise relative flex flex-col items-center px-6 text-center">
        {/* logomark with a soft halo */}
        <div className="relative mb-8">
          <div
            className="absolute -inset-8 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.55), transparent 70%)" }}
          />
          <UnoverseMark size={104} className="relative uv-float drop-shadow-[0_0_30px_rgba(34,211,238,0.35)]" />
        </div>

        {/* wordmark */}
        <h1 className="text-6xl font-semibold lowercase tracking-tight text-white sm:text-7xl">unoverse</h1>

        {/* tagline */}
        <p className="mt-6 max-w-xl bg-gradient-to-b from-white to-white/55 bg-clip-text text-2xl font-medium leading-snug text-transparent sm:text-3xl">
          The experience layer for AI
        </p>
      </div>

      {/* footer */}
      <p className="absolute bottom-6 left-0 right-0 text-center text-xs tracking-wide text-white/35">
        One engine, many hosts.
      </p>

      {/* local keyframes — entrance rise + a slow float on the mark */}
      <style>{`
        @keyframes uv-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .uv-rise { animation: uv-rise 1s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes uv-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .uv-float { animation: uv-float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
