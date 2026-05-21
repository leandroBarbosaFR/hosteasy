const LOGO_COLOR = "#1f1916";

type Logo = {
  name: string;
  src: string;
  aspectRatio: string;
  heightClass?: string;
};

const DEFAULT_HEIGHT = "h-7 md:h-8";

const logos: Logo[] = [
  { name: "Airbnb", src: "/airbnb.svg", aspectRatio: "320 / 100" },
  { name: "Booking.com", src: "/booking.svg", aspectRatio: "304 / 50" },
  { name: "Seazone", src: "/seazone.png", aspectRatio: "2560 / 423" },
  { name: "Chaves na Mão", src: "/chaves-na-mao.svg", aspectRatio: "478 / 70" },
  {
    name: "OLX",
    src: "/olx.png",
    aspectRatio: "1 / 1",
    heightClass: "h-16 md:h-20",
  },
];

export function LogoMarquee() {
  const loop = [...logos, ...logos];

  return (
    <section
      aria-label="Integrações"
      className="relative overflow-hidden bg-background py-10"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="group relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-24"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-24"
          />

          <ul className="flex w-max items-center gap-12 animate-marquee group-hover:[animation-play-state:paused] md:gap-20">
            {loop.map((logo, i) => (
              <li
                key={`${logo.name}-${i}`}
                className="flex shrink-0 items-center justify-center"
              >
                <span
                  role="img"
                  aria-label={logo.name}
                  className={`block ${logo.heightClass ?? DEFAULT_HEIGHT}`}
                  style={{
                    aspectRatio: logo.aspectRatio,
                    backgroundColor: LOGO_COLOR,
                    WebkitMaskImage: `url("${logo.src}")`,
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    WebkitMaskSize: "contain",
                    maskImage: `url("${logo.src}")`,
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    maskSize: "contain",
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes hosteasy-marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          animation: hosteasy-marquee 32s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee { animation: none; }
        }
      `}</style>
    </section>
  );
}
