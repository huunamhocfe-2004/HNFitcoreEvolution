export default function ContactSection({
  contactRef,
  contactVisible,
  navigate,
}) {
  return (
    <section
      ref={contactRef}
      id="contact"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10"
    >
      <div
        className={`relative overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-[#4a4545] to-[#2d2a2a] p-8 shadow-2xl transition-all duration-700 sm:p-10 lg:grid lg:grid-cols-2 lg:gap-10 lg:p-14 ${
          contactVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-20 scale-0 opacity-0"
        }`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/40 blur-3xl" />

        {/* Left: Contact form */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-red-400">
              Liên hệ với chúng tôi
            </p>
          </div>

          <h2 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Kết nối với{" "}
            <span className="bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              HN Fitcore Evolution
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Để lại thông tin của bạn, đội ngũ phòng gym sẽ liên hệ tư vấn gói
            tập, lịch PT và các chương trình ưu đãi phù hợp.
          </p>

          <div className="mt-8 rounded-3xl border border-white/5 bg-black/20 p-6 backdrop-blur-md sm:p-8">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Email của bạn"
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white transition-all placeholder:text-slate-400 focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute left-0 top-4 flex items-center pl-4 text-slate-400">
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
                      d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l1.3-3.9A7.53 7.53 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <textarea
                  rows={5}
                  placeholder="Nội dung liên hệ"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white transition-all placeholder:text-slate-400 focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <button
                onClick={() => navigate("/")}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-red-500 hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98]"
              >
                Gửi thông tin liên hệ
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

        {/* Right: Gym contact + maps */}
        <div className="relative z-10 mt-12 flex flex-col justify-between lg:mt-0">
          <div className="rounded-3xl border border-white/5 bg-black/20 p-6 backdrop-blur-md sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-red-400">
              Thông tin phòng gym
            </p>

            <h3 className="mt-4 text-3xl font-extrabold text-white">
              HN Fitcore Evolution
            </h3>

            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Không gian tập luyện hiện đại, đội ngũ PT chuyên nghiệp và lộ
              trình cá nhân hóa cho từng hội viên.
            </p>

            <div className="mt-8 flex flex-col gap-5 text-sm font-medium text-slate-300">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
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
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-white">Địa chỉ</p>
                  <p className="mt-1 text-slate-400">
                    Số 3 đường Cầu Giấy, Hà Nội
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-white">Hotline</p>
                  <p className="mt-1 text-slate-400">0356625521</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
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
                </span>
                <div>
                  <p className="text-white">Email</p>
                  <p className="mt-1 text-slate-400">nambh@hnfitcore.vn</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-600/15 text-red-400">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-white">Giờ mở cửa</p>
                  <p className="mt-1 text-slate-400">
                    05:30 - 22:00, Thứ 2 - Chủ nhật
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-xl">
            <iframe
              title="HN Fitcore Evolution Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.113115942701!2d105.80084557625523!3d21.028159487797268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab424a50fff9%3A0xbe3a7f3670c0a45f!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBHaWFvIFRow7RuZyBW4bqtbiBU4bqjaQ!5e0!3m2!1svi!2s!4v1778059751535!5m2!1svi!2s"
              className="h-72 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
