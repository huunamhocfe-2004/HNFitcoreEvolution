export default function AboutSection({
  getReadyRef,
  getReadyVisible,
  show,
  navigate,
}) {
  return (
    <section
      ref={getReadyRef}
      id="about"
      className="w-full bg-[#4a4545] py-16"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[420px_1fr] lg:px-10">
        <div
          className={`mx-auto w-full max-w-90 overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${
            getReadyVisible
              ? "translate-x-0 opacity-100"
              : "-translate-x-20 opacity-0"
          }`}
        >
          <img
            src="../../../public/gym.webp"
            alt="Fitness woman"
            className="h-90 w-full object-cover"
          />
        </div>

        <div
          className={`transition-all duration-700 ease-out ${
            show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <h2 className="text-4xl font-extrabold leading-tight">
            Hãy sẵn sàng để đạt được mục tiêu{" "}
            <span className="text-red-500">thể chất</span> của bạn!
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">
            Tối ưu vận hành phòng gym với dashboard quản lý tập trung. Theo dõi
            hội viên, check-in, lớp học, doanh thu và hiệu suất huấn luyện viên
            trên một giao diện duy nhất.
          </p>

          <button
            onClick={() => navigate("/login")}
            className={`mt-8 cursor-pointer rounded-xl bg-red-600 px-8 py-3 font-semibold transition-all duration-700 ease-out delay-800 hover:bg-red-500 ${
              getReadyVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-30 opacity-0"
            }`}
          >
            Free Trial Today
          </button>
        </div>
      </div>
    </section>
  );
}