export default function MembershipSection({
  memberRef,
  memberVisible,
  isAnnual,
  setIsAnnual,
  pricing,
  navigate,
}) {
  return (
    <section
      ref={memberRef}
      id="membership"
      className="bg-[#3f3a3a] px-6 py-16 text-white lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`text-center transition-all duration-700 ${
            memberVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-4xl font-extrabold">Chọn Gói Hội Viên</h2>
          <p className="mt-3 text-slate-300">
            Chọn gói phù hợp cho mô hình phòng gym của bạn.
          </p>

          <div className="mx-auto mt-6 inline-flex rounded-full bg-[#5a5555] p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                !isAnnual
                  ? "bg-red-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                isAnnual
                  ? "bg-red-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Năm
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pricing.map((plan, index) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 transition-all duration-700 ${
                plan.highlight
                  ? "bg-red-600 shadow-2xl shadow-red-950/30"
                  : "bg-[#5a5555]"
              } ${
                memberVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 350}ms` }}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold">
                    {Number(
                      isAnnual ? plan.annualPrice : plan.monthlyPrice
                    ).toLocaleString("vi-VN")}
                  </span>
                  <span className="text-xl font-bold">đ</span>
                </div>
                <div className="mt-2 text-sm text-slate-200">mỗi tháng</div>
              </div>

              <ul className="mt-8 space-y-4 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="text-green-400">✔</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/login")}
                className={`mt-8 w-full cursor-pointer rounded-full px-5 py-3 font-semibold transition ${
                  plan.highlight
                    ? "bg-white text-red-600 hover:bg-slate-100"
                    : "border border-white/40 hover:bg-white/10"
                }`}
              >
                Đăng ký ngay
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}