import Image from "next/image";

export default function Home() {
  return (
    <main>
      <h1 className="text-3xl font-bold text-white mb-6">Home Page</h1>

      <div className="bg-[#0a7d8c] flex justify-center items-center py-10">


        <div className="w-full lg:w-1/2 relative flex items-center justify-center h-[500px]">

          <Image
            src="/laptop2.png"
            alt="Laptop Background"
            width={900}
            height={450}
            className="absolute top-0 left-1/2 -translate-x-1/2 opacity-30 scale-110"
          />

          <Image
            src="/laptop1.png"
            alt="Laptop Mockup"
            width={720}
            height={460}
            className="relative z-10 drop-shadow-2xl top-5 left-5"
            priority
          />
        </div>
      </div>
    </main>
  );
}
