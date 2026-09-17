import { useEffect, useState } from "react";

type MilkSplashLottieProps = {
  size?: "sm" | "md" | "lg";
};

const lottieSrc = "https://assets10.lottiefiles.com/packages/lf20_Stt1R6.json";
const playerSrc = "https://unpkg.com/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js";

export default function MilkSplashLottie({ size = "md" }: MilkSplashLottieProps) {
  const [ready, setReady] = useState(() => Boolean(customElements.get("lottie-player")));
  const sizeClass = size === "sm" ? "w-16 h-16" : size === "lg" ? "w-28 h-28" : "w-20 h-20";

  useEffect(() => {
    if (customElements.get("lottie-player")) {
      setReady(true);
      return;
    }

    const load = () => {
      const existing = document.querySelector(`script[src="${playerSrc}"]`);
      if (existing) return;

      const script = document.createElement("script");
      script.src = playerSrc;
      script.async = true;
      script.onload = () => setReady(true);
      document.body.appendChild(script);
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(load);
    } else {
      globalThis.setTimeout(load, 300);
    }
  }, []);

  return (
    <div className={`relative ${sizeClass} mx-auto`} aria-hidden="true">
      {ready ? (
        <lottie-player
          src={lottieSrc}
          background="transparent"
          speed="1"
          loop
          autoplay
          className={sizeClass}
        />
      ) : (
        <div className={`${sizeClass} milk-splash-fallback`} />
      )}
    </div>
  );
}
