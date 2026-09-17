import { ChevronRight } from "lucide-react";

type HeroProductSectionProps = {
  onStartOrder: () => void;
};

const droplets = [
  "left-[2%] top-[20%] h-3 w-3 animate-[heroDropletFloat_6.2s_ease-in-out_infinite]",
  "left-[10%] top-[28%] h-4 w-4 animate-[heroDropletFloat_7.4s_ease-in-out_infinite_0.6s]",
  "right-[20%] top-[24%] h-2.5 w-2.5 animate-[heroDropletFloat_6.8s_ease-in-out_infinite_1.1s]",
  "right-[12%] bottom-[38%] h-3.5 w-3.5 animate-[heroDropletFloat_7.8s_ease-in-out_infinite_0.3s]",
  "right-[3%] top-[42%] h-2 w-2 animate-[heroDropletFloat_7s_ease-in-out_infinite_0.9s]",
];

export default function HeroProductSection({ onStartOrder }: HeroProductSectionProps) {
  return (
    <section className="hero-product-section relative isolate min-h-[calc(100vh-130px)] overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/milk-splash-bg.jpg"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/videoplayback.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-[1] hero-video-softener" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 z-[2] hero-product-mesh" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-130px)] w-full max-w-7xl grid-cols-1 items-center gap-2 px-5 pb-10 pt-12 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:px-10 lg:pb-12 lg:pt-10">
        <div className="max-w-2xl text-center lg:pl-10 lg:text-left">
          <div className="hero-trust-line mx-auto mb-24 flex max-w-[28rem] items-center justify-center gap-5 text-xl font-extrabold uppercase tracking-tight sm:mb-28 lg:mx-0">
            <span className="text-[#b88935]">Premium</span>
            <span className="hero-wave hero-wave-gold" aria-hidden="true" />
            <span className="text-[#a3762a]">Local</span>
            <span className="hero-wave hero-wave-green" aria-hidden="true" />
            <span className="text-[#3b842d]">Sustainable</span>
          </div>

          <h1 className="hero-display-title text-5xl font-black leading-[0.96] text-[#11160e] sm:text-6xl lg:text-[5.65rem]">
            Farm Fresh Dairy,
            <span className="block text-[#357a2f]">Delivered</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[33rem] text-lg font-medium leading-8 text-[#172016]/85 sm:text-xl lg:mx-0">
            From our farm to your doorstep in 24 hours. Pure, natural,
            preservative-free.
          </p>
          <div className="mt-9 flex items-center justify-center lg:justify-start">
            <button
              type="button"
              onClick={onStartOrder}
              className="hero-gold-button group inline-flex items-center justify-center px-8 py-4 text-lg font-extrabold text-white transition duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Ordering
              <ChevronRight className="ml-2 h-7 w-7 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <div className="hero-product-stage relative mx-auto h-[34rem] w-full max-w-[40rem] sm:h-[43rem] lg:h-[48rem] lg:translate-x-10 xl:translate-x-16">
          <div className="absolute inset-x-[6%] bottom-[7%] z-10 h-16 rounded-full bg-[#1d2a1d]/18 blur-2xl" aria-hidden="true" />
          <div className="absolute left-[61%] top-[42%] z-10 h-[27rem] w-[27rem] -translate-x-1/2 -translate-y-1/2 rounded-full hero-product-glow sm:h-[38rem] sm:w-[38rem]" aria-hidden="true" />

          <div className="hero-platform-bottom absolute left-[60%] top-[78%] z-20 h-[6.8rem] w-[25rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] sm:h-[8.5rem] sm:w-[36rem]" aria-hidden="true" />
          <div className="hero-platform-top absolute left-[60%] top-[72%] z-30 h-[4.7rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] sm:h-[6rem] sm:w-[25rem]" aria-hidden="true" />

          <img
            src="/transparent_bottle.png"
            alt="SR Dairy premium milk bottle"
            className="hero-product-bottle absolute left-[60%] top-[43%] z-40 h-[26rem] w-auto -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_34px_34px_rgba(35,55,35,0.18)] sm:h-[36rem] lg:h-[40rem]"
            draggable={false}
          />

          <span className="hero-leaf hero-leaf-one absolute left-[14%] bottom-[25%] z-50" aria-hidden="true" />
          <span className="hero-leaf hero-leaf-two absolute right-[9%] top-[43%] z-50" aria-hidden="true" />
          <span className="hero-leaf hero-leaf-three absolute right-[17%] bottom-[25%] z-50" aria-hidden="true" />

          {droplets.map((classes) => (
            <span
              key={classes}
              className={`hero-droplet absolute z-50 rounded-full ${classes}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
