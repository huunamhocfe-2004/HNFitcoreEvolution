export default function ContactSection({ contactRef, contactVisible, navigate }) {
  return (
    <section
      ref={contactRef}
      id="contact"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10"
    >
      <div
        className={`relative overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-[#4a4545] to-[#2d2a2a] p-8 shadow-2xl transition-all duration-700 sm:p-10 lg:grid lg:grid-cols-2 lg:gap-16 lg:p-14 ${
          contactVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-20 scale-0 opacity-0"
        }`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/40 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-red-400">
              Book a demo
            </p>
          </div>

          <h2 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Sẵn sàng bứt phá cho{" "}
            <span className="bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              HN Fitcore Evolution
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 italic sm:text-lg">
            "Tự động hóa toàn bộ quy trình vận hành. Từ quản lý thẻ hội viên,
            sắp xếp lịch PT, đến theo dõi doanh thu – tất cả được tích hợp mượt
            mà trong một nền tảng duy nhất."
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Tốc độ tối đa
            </span>

            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Dễ dàng mở rộng
            </span>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex items-center lg:mt-0">
          <div className="w-full rounded-3xl border border-white/5 bg-black/20 p-6 backdrop-blur-md sm:p-8">
            <div className="flex flex-col gap-5">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tên phòng gym"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white transition-all placeholder:text-slate-400 focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Email quản trị"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white transition-all placeholder:text-slate-400 focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <button
                onClick={() => navigate("/login")}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-red-500 hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98]"
              >
                Trải nghiệm demo ngay
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}