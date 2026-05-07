import { HeartPulse } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export default function BMIVisual({ result, bmiResultRef, bmiResultVisible }) {
  const pieData = [
    { name: "BMI hiện tại", value: Number(result.bmi.toFixed(1)) },
    { name: "Mốc tham chiếu", value: Math.max(40 - result.bmi, 0.1) },
  ];

  const rangeData = [
    { name: "Thiếu cân", value: 18.4 },
    { name: "Bình thường", value: 6.5 },
    { name: "Thừa cân", value: 5 },
    { name: "Béo phì", value: 10.1 },
  ];

  return (
    <div className="animate-[fadeIn_0.7s_ease-out] space-y-5">
      <div
        ref={bmiResultRef}
        className={`rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-700 ${bmiResultVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Kết quả BMI
            </p>
            <div className="mt-2 flex items-end gap-3">
              <span
                className="text-5xl font-extrabold"
                style={{ color: result.color }}
              >
                {result.bmi.toFixed(1)}
              </span>
              <span
                className="mb-2 rounded-full border px-3 py-1 text-xs font-bold"
                style={{
                  borderColor: `${result.color}66`,
                  color: result.color,
                  backgroundColor: `${result.color}14`,
                }}
              >
                {result.category}
              </span>
            </div>
          </div>
          <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-white/10 sm:flex">
            <HeartPulse className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-300">{result.detail}</p>
        <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
          {result.advice}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div
          className={`transition-all duration-700 ${bmiResultVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
        >
          <div
            className={`rounded-[26px] border border-white/10 bg-white/5 p-4 backdrop-blur-md}`}
          >
            <p className="mb-3 text-sm font-bold text-white">
              Tỷ lệ BMI hiện tại
            </p>
            <div className="h-56 min-h-56 w-full">
              {bmiResultVisible && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={82}
                      paddingAngle={2}
                    >
                      <Cell fill={result.color} />
                      <Cell fill="#334155" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
        <div
          className={`transition-all duration-700 ${bmiResultVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
        >
          <div className="rounded-[26px] border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <p className="mb-3 text-sm font-bold text-white">
              Thang phân loại BMI
            </p>
            <div className="h-56 min-h-56 w-full">
              {bmiResultVisible && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rangeData}
                    layout="vertical"
                    margin={{ top: 8, right: 18, left: 10, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#cbd5e1"
                      width={78}
                    />
                    <Tooltip />
                    <ReferenceLine
                      x={Number(result.bmi.toFixed(1))}
                      stroke={result.color}
                      strokeWidth={3}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 10, 10, 0]}
                      fill="#64748b"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`grid gap-4 sm:grid-cols-2 transition-all duration-700 ${bmiResultVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Cân nặng lý tưởng
          </p>
          <p className="mt-2 text-lg font-bold text-white">
            {result.healthyMin.toFixed(1)}kg - {result.healthyMax.toFixed(1)}kg
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Gợi ý
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            Tập 3-5 buổi/tuần, kết hợp dinh dưỡng phù hợp với mục tiêu tăng cơ
            hoặc giảm mỡ.
          </p>
        </div>
      </div>
    </div>
  );
}
