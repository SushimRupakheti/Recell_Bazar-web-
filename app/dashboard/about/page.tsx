import Image from "next/image";
import {
  Store,
  CircleDollarSign,
  Users,
  HandCoins,
  BadgeCheck,
  Headphones,
  ShieldCheck,
} from "lucide-react";

const STATS = [
  {
    value: "10.5 K",
    label: "Sellers active our site",
    icon: Store,
  },
  {
    value: "803 K",
    label: "Monthly Productive Sale",
    icon: CircleDollarSign,
    highlight: true,
  },
  {
    value: "45.5 K",
    label: "Customer active in our site",
    icon: Users,
  },
  {
    value: "20 M+",
    label: "Anual gross sale in our site",
    icon: HandCoins,
  },
];

const FEATURES = [
  {
    title: "TRUSTED BY MANY",
    desc: "Trusted by numbers of people across the country",
    icon: BadgeCheck,
  },
  {
    title: "24/7 CUSTOMER SERVICE",
    desc: "Friendly 24/7 customer support",
    icon: Headphones,
  },
  {
    title: "MONEY BACK GUARANTEE",
    desc: "Cashback within 10 days of return",
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <main className="w-full bg-white text-gray-700">
      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* OUR STORY */}
        <section className="grid gap-12 md:grid-cols-2 md:items-start">
          <div className="max-w-md">
            <h2 className="text-4xl font-semibold tracking-wide text-teal-700">
              Our Story
            </h2>

            <p className="mt-6 text-xs leading-relaxed text-gray-600">
              Born out of a passion for sustainable living and ethical
              craftsmanship, Felt and Wools began with a simple mission: to make
              everyday essentials feel more natural. What started as a small
              community initiative has now grown into a full-blown movement —
              one that empowers local artisans and promotes eco-conscious living.
            </p>

            <p className="mt-4 text-xs leading-relaxed text-gray-600">
              From cotton balls to cozy shoes, yoga mats to cute cat houses,
              every product we make tells a story — woven with tradition,
              sustainability, and heart.
            </p>
          </div>

          <div className="relative h-44 w-full overflow-hidden rounded-md md:h-52">
            <Image
              src="/about-1.png"
              alt="Our Story"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </section>

        {/* VISION */}
        <section className="mt-12 grid gap-12 md:grid-cols-2 md:items-start">
          <div>
            <h3 className="text-xl font-semibold tracking-widest text-teal-700">
              VISION
            </h3>

            <p className="mt-4 text-xs leading-relaxed text-gray-600">
              We envision a world where quality, sustainability, and ethics
              aren’t buzzwords — they’re the baseline. At Felt and Wools, our
              vision is to create an ecosystem where every product adds value
              not just to your home, but to the planet and the people behind the
              scenes.
            </p>

            <p className="mt-4 text-xs leading-relaxed text-gray-600">
              The fast fashion, fast-consumption world has caused burnout — both
              for people and the Earth. We’re flipping that script by creating
              timeless, cotton-based goods made with soul and sustainability at
              the core.
            </p>

            <p className="mt-4 text-xs leading-relaxed text-gray-600">
              We want to be the brand that sparks real change — one that
              inspires others to buy less, choose better, and think deeper. Our
              vision is bold, but so are we. A future where mindful shopping
              becomes the norm? That’s what we’re building — not just for us,
              but for the next generation of creators, consumers, and
              changemakers.
            </p>
          </div>

          {/* smaller image pushed down/right like screenshot */}
          <div className="flex justify-end">
            <div className="relative mt-14 h-52 w-full max-w-sm overflow-hidden rounded-md md:mt-20 md:h-56">
              <Image
                src="/about-2.png"
                alt="Vision"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* STATS + SUSTAINABLE (same row like screenshot) */}
        <section className="mt-14 grid gap-12 lg:grid-cols-[420px_1fr] lg:items-start">
          {/* stats cards */}
          <div className="grid grid-cols-2 gap-5">
            {STATS.map((s) => {
              const Icon = s.icon;
              const isHi = !!s.highlight;

              return (
                <div
                  key={s.label}
                  className={[
                    "rounded-md border p-6 text-center",
                    isHi
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-gray-200 bg-white text-gray-700",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full",
                      isHi ? "bg-white" : "bg-gray-100",
                    ].join(" ")}
                  >
                    <Icon
                      size={18}
                      className={isHi ? "text-teal-700" : "text-gray-700"}
                    />
                  </div>

                  <div className="text-xl font-semibold">{s.value}</div>
                  <div
                    className={[
                      "mt-2 text-[10px] leading-snug",
                      isHi ? "text-white/90" : "text-gray-500",
                    ].join(" ")}
                  >
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* sustainable text */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-teal-700">
              SUSTAINABLE
            </h3>
            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-gray-600">
              To us, sustainability isn’t just a side note — it’s the foundation.
              Every decision we make at Felt and Wools is driven by a long-term
              commitment to environmental responsibility. We work primarily with
              natural, biodegradable cotton materials that are locally sourced
              and processed with minimal environmental impact. Our production
              process focuses on reducing waste, conserving water, and cutting
              out harmful chemicals. We use low-impact packaging and are
              constantly improving how we design for reuse and longevity.
              Because real sustainability isn’t just about what something is
              made from — it’s about how long it lasts and where it ends up. We
              also support circular thinking. From reusing production scraps to
              exploring compostable packaging, we’re designing systems that do
              more than just look green — they actually are.
            </p>
          </div>
        </section>

        {/* COMMUNITY EMPOWERMENT */}
        <section className="mt-12">
          <h3 className="text-xs font-semibold tracking-widest text-teal-700">
            COMMUNITY EMPOWERMENT
          </h3>
          <p className="mt-4 max-w-5xl text-xs leading-relaxed text-gray-600">
            To us, sustainability isn’t just a side note — it’s the foundation.
            Every decision we make at Felt and Wools is driven by a long-term
            commitment to environmental responsibility. We work primarily with
            natural, biodegradable cotton materials that are locally sourced and
            processed with minimal environmental impact. Our production process
            focuses on reducing waste, conserving water, and cutting out harmful
            chemicals. We use low-impact packaging and are constantly improving
            how we design for durability and longevity. Because real
            sustainability isn’t just about what something is made from — it’s
            about how long it lasts and where it ends up. We also support
            circular thinking. From reusing production scraps to exploring
            compostable packaging, we’re designing systems that do more than
            just look green — they actually are.
          </p>
        </section>

        {/* TRUST / SERVICES */}
        <section className="mt-14 grid gap-10 md:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
                  <Icon size={20} className="text-teal-700" />
                </div>
                <h4 className="text-[11px] font-semibold tracking-wide text-gray-800">
                  {f.title}
                </h4>
                <p className="mt-2 text-[10px] leading-relaxed text-gray-500">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
