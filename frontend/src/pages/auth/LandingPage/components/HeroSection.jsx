export default function HeroSection({
  introRef,
  heroVisible,
  typedText,
  heroImages,
  prevImageIndex,
  imageIndex,
  isSliding,
  setIsVideoOpen,
  navigate,
}) {
  return (
    <section
      ref={introRef}
      id="home"
      className="relative mx-auto grid max-w-7xl items-center gap-10 overflow-hidden px-6 pb-20 pt-8 lg:grid-cols-2 lg:px-10"
    >
      <div className="absolute -left-16 top-40 h-72 w-72 rounded-full bg-red-700/25 blur-3xl" />

      <div
        className={`transition-all duration-700 ease-out ${
          heroVisible
            ? "translate-x-0 scale-100 opacity-100"
            : "-translate-x-20 scale-95 opacity-0"
        }`}
      >
        <h1 className="max-w-xl text-4xl font-extrabold leading-tight md:text-6xl">
          Chúng tôi tin vào việc thay đổi cuộc sống thông qua{" "}
          <span className="inline-block min-w-55 text-red-500">
            {typedText}
            <span className="ml-1 inline-block h-[1em] w-0.5 animate-pulse bg-red-500 align-middle" />
          </span>
        </h1>

        <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 md:text-base">
          Giải pháp quản lý phòng gym hiện đại giúp bạn kiểm soát hội viên, gói
          tập, huấn luyện viên, lịch lớp và doanh thu trong cùng một hệ thống
          trực quan.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="cursor-pointer rounded-xl bg-red-600 px-6 py-3 font-semibold transition hover:scale-105 hover:bg-red-500"
          >
            Get Started
          </button>

          <button
            onClick={() => setIsVideoOpen(true)}
            className="flex items-center gap-3 text-slate-300 transition hover:text-white"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg transition hover:bg-white/20">
              ▶
            </span>
            Watch Videos
          </button>
        </div>

        <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
            <div className="text-3xl font-extrabold">65+</div>
            <div className="mt-1 text-sm text-slate-300">HLV chuyên nghiệp</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
            <div className="text-3xl font-extrabold">978+</div>
            <div className="mt-1 text-sm text-slate-300">Hội viên</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
            <div className="text-3xl font-extrabold">200+</div>
            <div className="mt-1 text-sm text-slate-300">Chương trình</div>
          </div>
        </div>
      </div>

      <div
        className={`relative flex justify-center transition-all duration-700 delay-200 ease-out lg:justify-end ${
          heroVisible
            ? "translate-x-0 scale-100 opacity-100 blur-0"
            : "translate-x-20 scale-95 opacity-0 blur-sm"
        }`}
      >
        <div className="absolute bottom-8 right-10 h-56 w-56 rounded-full bg-red-600/20 blur-3xl" />

        <div className="relative h-135 w-full max-w-130 overflow-hidden rounded-[28px]">
          {isSliding && (
            <img
              src={heroImages[prevImageIndex]}
              alt="Gym slide old"
              className="absolute inset-0 z-10 h-full w-full animate-slideOutLeft object-cover shadow-2xl shadow-black/40"
            />
          )}

          <img
            key={imageIndex}
            src={heroImages[imageIndex]}
            alt={`Gym slide ${imageIndex + 1}`}
            className={`absolute inset-0 h-full w-full object-cover shadow-2xl shadow-black/40 ${
              isSliding ? "z-20 animate-slideInRight" : "z-20"
            }`}
          />
        </div>
      </div>
    </section>
  );
}