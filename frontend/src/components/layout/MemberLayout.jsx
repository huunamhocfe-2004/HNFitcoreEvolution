import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  TrendingUp,
  ShoppingBag,
  CalendarDays,
  LogOut,
  Dumbbell,
  ClipboardList,
  BookOpen,
  Settings,
  Save,
  X,
  Camera,
  Bell,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const links = [
  { to: "/member", icon: User, label: "Hồ Sơ", end: true },
  { to: "/member/progress", icon: TrendingUp, label: "Tiến Độ" },
  { to: "/member/workout-logs", icon: BookOpen, label: "Nhật Ký" },
  { to: "/member/store", icon: ShoppingBag, label: "Cửa Hàng" },
  { to: "/member/member-orders", icon: ClipboardList, label: "Đơn Hàng" },
  { to: "/member/booking", icon: CalendarDays, label: "Đặt Lịch" },
  { to: "/member/hire-pt", icon: User, label: "Thuê PT" },
  { to: "/member/notifications", icon: Bell, label: "Thông báo" },
];

export default function MemberLayout() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profileModal, setProfileModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [file, setFile] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const refreshUnread = () => {
      api.get("/notifications/unread-count")
        .then((res) => setUnreadNotifications(window.location.pathname.startsWith("/member/notifications") ? 0 : res.data.count || 0))
        .catch(() => setUnreadNotifications(0));
    };

    refreshUnread();
    const interval = setInterval(refreshUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (to) => {
    if (to === "/member/notifications") {
      setUnreadNotifications(0);
      api.patch("/notifications/read-all").catch(() => {});
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    data.append("name", editForm.name);
    data.append("phone", editForm.phone);
    if (file) data.append("avatar", file);

    try {
      const res = await api.put("/auth/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({
        name: editForm.name,
        phone: editForm.phone,
        avatar: res.data.avatar || user.avatar,
      });
      toast.success("Cập nhật hồ sơ thành công!");
      setProfileModal(false);
    } catch (err) {
      toast.error("Lỗi khi cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Mobile top nav / Desktop sidebar */}
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-64 flex-col shrink-0"
        style={{
          background: "#080808",
          borderRight: "1px solid #111",
          height: "100vh",
          position: "sticky",
          top: 0,
        }}
      >
        <div className="flex items-center gap-3 px-6 py-8">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20"
            style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)" }}
          >
            <Dumbbell size={20} color="#fff" />
          </div>
          <div>
            <div className="font-black text-sm text-white tracking-tighter">
              FITCORE
            </div>
            <div className="text-[10px] font-black text-red-500 tracking-[0.2em] -mt-1">
              EVOLUTION
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            Menu Chính
          </div>
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => handleNavClick(to)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    : "text-zinc-500 hover:text-white hover:bg-zinc-900"
                }`
              }
            >
              <Icon
                size={18}
                className="group-hover:scale-110 transition-transform"
              />{" "}
              <span className="flex flex-1 items-center gap-2">
                {label}
                {to === "/member/notifications" && unreadNotifications > 0 && (
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                )}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-10 w-10 aspect-square shrink-0 rounded-lg flex items-center justify-center font-black text-white shadow-inner overflow-hidden"
                style={{
                  background: "linear-gradient(135deg,#1f1f1f,#0a0a0a)",
                  border: "1px solid #333",
                }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    className="block h-full w-full object-cover object-center"
                  />
                ) : (
                  user?.name?.[0]
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {user?.name}
                </div>
                <div className="text-[10px] font-bold text-red-500/80 uppercase">
                  Hội viên Pro
                </div>
              </div>
              <button
                onClick={() => {
                  setEditForm({ name: user.name, phone: user.phone });
                  setProfileModal(true);
                }}
                className="ml-auto p-1.5 rounded-lg text-zinc-600 hover:text-red-500 transition-colors"
              >
                <Settings size={14} />
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 justify-center text-xs font-bold py-2.5 rounded-lg bg-zinc-950 text-zinc-500 hover:text-red-500 hover:bg-red-500/5 border border-zinc-800 transition-all"
            >
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: "#111", borderTop: "1px solid #1f1f1f" }}
      >
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => handleNavClick(to)}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
                isActive ? "text-yellow-400" : "text-gray-500"
              }`
            }
          >
            <Icon size={18} />
            <span className="relative">
              {label}
              {to === "/member/notifications" && unreadNotifications > 0 && (
                <span className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </span>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center py-2 text-xs gap-1 text-gray-500"
        >
          <LogOut size={18} /> <span>Thoát</span>
        </button>
      </div>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="p-4 md:p-6 fade-in">
          <Outlet />
        </div>
      </main>

      {profileModal && (
        <div
          className="modal-overlay z-1000"
          onClick={(e) =>
            e.target === e.currentTarget && setProfileModal(false)
          }
        >
          <div className="modal-box p-6 max-w-md bg-[#0a0a0a] border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white uppercase italic tracking-tight">
                Cập nhật hồ sơ
              </h2>
              <button
                onClick={() => setProfileModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdate}
              className="max-w-md mx-auto space-y-8 p-1"
            >
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                {/* Chỉ kích hoạt hover trong phạm vi box ảnh */}
                <div className="relative group w-28 h-28">
                  {/* Glow Effect phía sau - Tone Đỏ */}
                  <div className="absolute -inset-1 bg-linear-to-tr from-red-600 to-red-400 rounded-[2.2rem] blur opacity-0 group-hover:opacity-40 transition duration-500"></div>

                  {/* Image Container - Hình Squircle */}
                  <div className="relative w-full h-full rounded-4xl bg-zinc-900 border border-zinc-800/50 overflow-hidden flex items-center justify-center shadow-2xl cursor-pointer">
                    {file ? (
                      <img
                        src={URL.createObjectURL(file)}
                        className="block h-full w-full object-cover object-center transition duration-500 group-hover:scale-110"
                      />
                    ) : user?.avatar ? (
                      <img
                        src={user.avatar}
                        className="block h-full w-full object-cover object-center transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <span className="font-black text-4xl bg-linear-to-br from-red-400 to-red-700 bg-clip-text text-transparent">
                        {user?.name?.[0] || "?"}
                      </span>
                    )}

                    {/* Overlay xuất hiện khi di chuột vào ảnh */}
                    <label className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                      <Camera
                        size={20}
                        className="text-red-500 mb-1 translate-y-2 group-hover:translate-y-0 transition-transform"
                      />
                      <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">
                        Thay đổi ảnh
                      </span>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-4 text-center pointer-events-none">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Ảnh hồ sơ
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 ml-1 tracking-wider group-focus-within:text-red-500 transition-colors">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-sm rounded-2xl px-4 py-3.5 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-zinc-700"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 ml-1 tracking-wider group-focus-within:text-red-500 transition-colors">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-sm rounded-2xl px-4 py-3.5 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-zinc-700"
                    placeholder="0901xxxxxx"
                  />
                </div>
              </div>

              {/* Submit Button - Tone Red Premium */}
              <button
                type="submit"
                disabled={saving}
                className="relative w-full group overflow-hidden rounded-2xl p-px focus:outline-none disabled:opacity-70 disabled:cursor-wait"
              >
                {/* Viền Gradient Đỏ */}
                <div className="absolute inset-0 bg-linear-to-r from-red-700 via-red-500 to-red-700"></div>

                <div className="cursor-pointer relative bg-zinc-950 group-hover:bg-transparent transition-colors duration-300 rounded-[15px] py-4 flex items-center justify-center gap-3">
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">
                        Đang xử lý...
                      </span>
                    </div>
                  ) : (
                    <>
                      <Save
                        size={18}
                        className="text-red-500 group-hover:text-white transition-colors"
                      />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500 group-hover:text-white transition-colors">
                        Lưu
                      </span>
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
