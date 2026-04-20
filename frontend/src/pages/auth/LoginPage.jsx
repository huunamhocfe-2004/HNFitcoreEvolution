import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  Dumbbell,
  ShieldCheck,
  Users,
  BarChart3,
} from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 120);
    return () => clearTimeout(timer);
  }, []);

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);
      toast.success(`Chào mừng, ${data.user.name}!`);
      navigate(data.user.role === "member" ? "/member" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#2b2626] text-white">
      {/* Animated background */}
      <div
        className={`pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-red-700/20 blur-3xl transition-all duration-500 ${
          show ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />
      <div
        className={`pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-red-600/10 blur-3xl transition-all duration-500 delay-200 ${
          show ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />
      <div
        className={`pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-black/30 blur-3xl transition-all duration-500 delay-300 ${
          show ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />

      {/* floating glow */}
      <div className="pointer-events-none absolute left-[8%] top-[18%] h-24 w-24 animate-pulse rounded-full bg-red-500/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-[12%] right-[10%] h-28 w-28 animate-pulse rounded-full bg-red-400/10 blur-2xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-10">
        <div
          className={`grid w-full items-stretch overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-sm transition-all duration-500 lg:grid-cols-[1.05fr_0.95fr] ${
            show
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-8 scale-95 opacity-0"
          }`}
        >
          {/* Left content */}
          <div className="relative hidden overflow-hidden bg-[#3a3434] p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-red-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-black/30 blur-3xl" />

            <div
              className={`relative z-10 transition-all duration-500 delay-200 ${
                show ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
              }`}
            >
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mb-10 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft size={16} />
                Quay về trang chủ
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 animate-[pulse_3s_ease-in-out_infinite] items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-950/40">
                  <Dumbbell size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-wide text-white">
                    HN FITCORE
                  </h2>
                  <p className="text-sm tracking-[0.25em] text-red-400">
                    EVOLUTION
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-red-400">
                  Chào mừng trở lại
                </p>
                <h1 className="max-w-xl text-4xl font-extrabold leading-tight">
                  Đăng nhập để quản lý hệ thống{" "}
                  <span className="text-red-500">HN Fitcore Evolution</span>
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                  Truy cập bảng điều khiển để quản lý hội viên, lớp học, huấn
                  luyện viên, gói tập và doanh thu trên cùng một nền tảng.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: <Users className="mb-3 text-red-400" size={20} />,
                    value: "978+",
                    label: "Hội viên",
                  },
                  {
                    icon: <BarChart3 className="mb-3 text-red-400" size={20} />,
                    value: "200+",
                    label: "Chương trình",
                  },
                  {
                    icon: (
                      <ShieldCheck className="mb-3 text-red-400" size={20} />
                    ),
                    value: "24/7",
                    label: "Vận hành",
                  },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-700 hover:-translate-y-1 hover:bg-white/10 ${
                      show
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: `${350 + index * 150}ms` }}
                  >
                    {item.icon}
                    <div className="text-lg font-extrabold">{item.value}</div>
                    <div className="mt-1 text-xs text-slate-300">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`relative z-10 mt-10 rounded-3xl border border-white/10 bg-black/20 p-6 transition-all duration-500 delay-500 ${
                show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              <p className="text-sm italic leading-7 text-slate-300">
                “Tối ưu vận hành phòng gym với giao diện hiện đại, tập trung và
                đồng bộ trải nghiệm từ landing page đến hệ thống quản trị.”
              </p>
            </div>
          </div>

          {/* Right form */}
          <div className="bg-[#2b2626] p-6 sm:p-8 lg:p-10 flex col justify-center items-center">
            <div
              className={`mx-auto w-full max-w-md transition-all duration-500 delay-300 ${
                show ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              }`}
            >
              <div className="mb-8 lg:hidden">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft size={16} />
                  Quay về trang chủ
                </button>
              </div>

              <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-red-400">
                  Đăng Nhập
                </p>
                <h2 className="mt-3 text-3xl font-extrabold text-white">
                  Chào mừng trở lại
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Đăng nhập để tiếp tục sử dụng hệ thống quản lý phòng gym.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <div
                  className={`transition-all duration-700 delay-500 ${
                    show
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0"
                  }`}
                >
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="admin@fitcore.vn"
                      value={form.email}
                      onChange={handle}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white transition-all placeholder:text-slate-400 focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div
                  className={`transition-all duration-700 delay-700 ${
                    show
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0"
                  }`}
                >
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="password"
                      type={showPw ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handle}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-12 text-white transition-all placeholder:text-slate-400 focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-white hover:scale-110"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div
                  className={`transition-all duration-700 delay-900 ${
                    show
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0"
                  }`}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full cursor-pointer rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition hover:-translate-y-0.5 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>
                </div>
              </form>

              <div
                className={`mt-6 text-center text-xs text-slate-400 transition-all duration-500 delay-1250 ${
                  show ? "opacity-100" : "opacity-0"
                }`}
              >
                HN Fitcore Evolution • Gym Management Platform
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
