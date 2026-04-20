import {
  Activity,
  AlertCircle,
  Calculator,
  CheckCircle2,
  Ruler,
  Scale,
  TrendingUp,
} from "lucide-react";
import BMIVisual from "./BMIVisual";
import GenderDropdown from "./GenderDropdown";

export default function BMISection({
  bmiRef,
  bmiVisible,
  bmiResult,
  bmiForm,
  setBmiForm,
  handleCalculateBMI,
}) {
  return (
    <section
      ref={bmiRef}
      id="bmi"
      className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10"
    >
      <div
        className={`transition-all duration-700 ease-out ${
          bmiVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
        }`}
      >
        {!bmiResult ? (
          <div className="group relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            {/* Glow nền */}
            <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-red-600/20 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />

            {/* Ảnh chính */}
            <div className="relative overflow-hidden rounded-[28px]">
              <img
                src="/Linda.png"
                alt="BMI placeholder"
                className="h-125 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient phủ ảnh */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-r from-black/35 via-transparent to-transparent" />

              {/* Badge góc trên */}
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 backdrop-blur-md">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-red-300">
                  BMI Analyzer
                </span>
              </div>

              {/* Nội dung chính */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="max-w-md rounded-[28px] border border-white/10 bg-black/35 p-6 shadow-xl backdrop-blur-xl">
                  <h3 className="text-3xl font-extrabold leading-tight text-white">
                    Kiểm tra nhanh thể trạng cơ bản của bạn
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    Nhập chiều cao và cân nặng để xem vùng BMI hiện tại cùng gợi
                    ý tập luyện phù hợp với mục tiêu của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <BMIVisual result={bmiResult} />
        )}
      </div>

      <div
        className={`transition-all duration-700 delay-150 ease-out ${
          bmiVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
        }`}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-red-400">
          <Calculator className="h-4 w-4" /> BMI calculator
        </div>

        <h2 className="mt-5 text-4xl font-extrabold leading-tight">
          Tính nhanh <span className="text-red-500">chỉ số BMI</span> của bạn
        </h2>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Ruler className="h-4 w-4 text-red-400" /> Chiều cao (cm)
              </span>
              <input
                value={bmiForm.height}
                onChange={(e) =>
                  setBmiForm((prev) => ({ ...prev, height: e.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-red-500"
                placeholder="Ví dụ: 170"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Scale className="h-4 w-4 text-red-400" /> Cân nặng (kg)
              </span>
              <input
                value={bmiForm.weight}
                onChange={(e) =>
                  setBmiForm((prev) => ({ ...prev, weight: e.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-red-500"
                placeholder="Ví dụ: 65"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Activity className="h-4 w-4 text-red-400" /> Tuổi
              </span>
              <input
                value={bmiForm.age}
                onChange={(e) =>
                  setBmiForm((prev) => ({ ...prev, age: e.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-red-500"
                placeholder="Ví dụ: 25"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <TrendingUp className="h-4 w-4 text-red-400" /> Giới tính
              </span>
              <GenderDropdown
                value={bmiForm.gender}
                onChange={(newValue) =>
                  setBmiForm((prev) => ({ ...prev, gender: newValue }))
                }
              />
            </label>
          </div>

          <button
            onClick={handleCalculateBMI}
            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-red-500 hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98]"
          >
            <Calculator className="h-5 w-5 transition-transform group-hover:rotate-6" />
            Tính chỉ số ngay
          </button>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Vùng tốt
              </p>
              <p className="mt-2 text-lg font-bold text-emerald-400">
                18.5 - 24.9
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Cảnh báo
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-amber-400">
                <AlertCircle className="h-4 w-4" /> Dưới 18.5 hoặc trên 25
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Mục tiêu
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <CheckCircle2 className="h-4 w-4" /> Theo dõi đều mỗi tuần
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
