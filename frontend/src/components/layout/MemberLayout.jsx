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
      api
        .get("/notifications/unread-count")
        .then((res) =>
          setUnreadNotifications(
            window.location.pathname.startsWith("/member/notifications")
              ? 0
              : res.data.count || 0,
          ),
        )
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
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile top nav / Desktop sidebar */}
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-64 flex-col shrink-0 bg-white shadow-xl shadow-slate-200/60"
        style={{
          borderRight: "1px solid #e5e7eb",
          height: "100vh",
          position: "sticky",
          top: 0,
        }}
      >
        <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-200 bg-white">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-red-200"
            style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)" }}
          >
            <Dumbbell size={20} color="#fff" />
          </div>
          <div>
            <div className="font-black text-sm text-slate-900 tracking-tighter">
              FITCORE
            </div>
            <div className="text-[10px] font-black text-red-600 tracking-[0.2em] -mt-1">
              EVOLUTION
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 bg-white">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Menu Chính
          </div>

          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => handleNavClick(to)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all border duration-200 group ${
                  isActive
                    ? "bg-red-50 text-red-600 border-red-200 shadow-sm"
                    : "border-transparent text-slate-600 hover:text-red-600 hover:bg-red-50"
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

        <div className="p-4 mt-auto bg-white">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-10 w-10 aspect-square shrink-0 rounded-lg flex items-center justify-center font-black text-white shadow-inner overflow-hidden"
                style={{
                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  border: "1px solid #ef4444",
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
                <div className="text-sm font-bold text-slate-900 truncate">
                  {user?.name}
                </div>
                <div className="text-[10px] font-bold text-red-500 uppercase">
                  Hội viên Pro
                </div>
              </div>

              <button
                onClick={() => {
                  setEditForm({ name: user.name, phone: user.phone });
                  setProfileModal(true);
                }}
                className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Settings size={14} />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 justify-center text-xs font-bold py-2.5 rounded-lg bg-white text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all"
            >
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex bg-white shadow-[0_-8px_30px_rgba(15,23,42,0.08)]"
        style={{ borderTop: "1px solid #e5e7eb" }}
      >
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => handleNavClick(to)}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
                isActive ? "text-red-600" : "text-slate-500 hover:text-red-600"
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
          className="flex-1 flex flex-col items-center py-2 text-xs gap-1 text-slate-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} /> <span>Thoát</span>
        </button>
      </div>

      <main className="flex-1 overflow-y-auto bg-slate-50 pb-20 md:pb-0">
        <div className="p-4 md:p-6 fade-in">
          <Outlet />
        </div>
      </main>

      {profileModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={(e) =>
            e.target === e.currentTarget && setProfileModal(false)
          }
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">
                Cập nhật hồ sơ
              </h2>

              <button
                onClick={() => setProfileModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white text-4xl font-black text-red-600 shadow-inner">
                    {file ? (
                      <img
                        src={URL.createObjectURL(file)}
                        className="block h-full w-full object-cover object-center"
                      />
                    ) : user?.avatar ? (
                      <img
                        src={user.avatar}
                        className="block h-full w-full object-cover object-center"
                      />
                    ) : (
                      user?.name?.[0] || "?"
                    )}
                  </div>

                  <label className="flex justify-center items-center cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-3 text-center transition hover:border-red-300 hover:bg-red-50">
                    {/* <span className="block text-[10px] font-black uppercase tracking-widest text-red-600">
                      Thay đổi ảnh đại diện
                    </span>

                    <span className="mt-1 block text-[11px] font-medium text-slate-500">
                      Chọn ảnh mới từ máy của bạn
                    </span> */}
                    <Camera />

                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                    placeholder="0901xxxxxx"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  "ĐANG LƯU..."
                ) : (
                  <>
                    <Save size={16} /> LƯU THAY ĐỔI
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
