import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { createPortal } from "react-dom";
import api from "../../api/axios";
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  CalendarDays,
  ShoppingBag,
  ClipboardList,
  ScanLine,
  LogOut,
  Dumbbell,
  School,
  MessageSquare,
  ClipboardCheck,
  Award,
  ShieldCheck,
  Settings,
  Save,
  X,
  Bell,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/members", icon: Users, label: "Hội Viên" },
  { to: "/admin/packages", icon: Package, label: "Gói Tập" },
  { to: "/admin/subscriptions", icon: CreditCard, label: "Đăng Ký" },
  { to: "/admin/bookings", icon: CalendarDays, label: "Đặt Lịch" },
  {
    to: "/admin/classes-mgmt",
    icon: School,
    label: "Lớp Học",
    roles: ["admin"],
  },
  {
    to: "/admin/products",
    icon: ShoppingBag,
    label: "Sản Phẩm",
    roles: ["admin"],
  },
  { to: "/admin/orders", icon: ClipboardList, label: "Đơn Hàng" },
  { to: "/admin/trainers", icon: Award, label: "Huấn Luyện Viên" },
  { to: "/admin/feedback", icon: MessageSquare, label: "Phản Hồi" },
  {
    to: "/admin/trial-requests",
    icon: ClipboardCheck,
    label: "Yêu cầu tập thử",
  },
  { to: "/admin/notifications", icon: Bell, label: "Thông báo" },
  {
    to: "/admin/permissions",
    icon: ShieldCheck,
    label: "Phân quyền",
    roles: ["admin"],
  },
  { to: "/admin/checkin", icon: ScanLine, label: "Check-in" },
];

export default function Sidebar() {
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [pendingTrialCount, setPendingTrialCount] = useState(0);
  const [pendingPtCount, setPendingPtCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [file, setFile] = useState(null);

  const handleAvatarError = () => {
    setImgError(true);
    if (user?.avatar) {
      updateUser({ avatar: null });
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
        avatar: res.data.avatar || (imgError ? null : user.avatar),
      });
      toast.success("Cập nhật hồ sơ thành công!");
      setProfileModal(false);
      setImgError(false);
      setFile(null);
    } catch (err) {
      toast.error("Lỗi khi cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const visibleLinks = links.filter(
    (l) => !l.roles || l.roles.includes(user?.role),
  );

  const handleNavClick = (to) => {
    if (to === "/admin/orders") {
      setHasNewOrders(false);
      api.patch("/orders/mark-seen").catch(() => {});
    }
    if (to === "/admin/trial-requests") {
      setPendingTrialCount(0);
    }
    if (to === "/admin/subscriptions") {
      setPendingPtCount(0);
    }
    if (to === "/admin/notifications") {
      setUnreadNotifications(0);
      api.patch("/notifications/read-all").catch(() => {});
    }
  };

  useEffect(() => {
    const refreshIndicators = async () => {
      try {
        const [orders, trials, ptRequests, notifications] =
          await Promise.allSettled([
            api.get("/orders/has-new"),
            api.get("/trial-requests/has-new"),
            api.get("/subscriptions/pending-pt-count"),
            api.get("/notifications/unread-count"),
          ]);

        if (orders.status === "fulfilled") {
          setHasNewOrders(orders.value.data.hasNew);
        }
        if (trials.status === "fulfilled") {
          setPendingTrialCount(
            window.location.pathname.startsWith("/admin/trial-requests")
              ? 0
              : trials.value.data.count || 0,
          );
        }
        if (ptRequests.status === "fulfilled") {
          setPendingPtCount(
            window.location.pathname.startsWith("/admin/subscriptions")
              ? 0
              : ptRequests.value.data.count || 0,
          );
        }
        if (notifications.status === "fulfilled") {
          setUnreadNotifications(
            window.location.pathname.startsWith("/admin/notifications")
              ? 0
              : notifications.value.data.count || 0,
          );
        }
      } catch (err) {
        console.log(
          "Check admin indicators error:",
          err.response?.data || err.message,
        );
      }
    };

    refreshIndicators();

    const socket = io("/", {
      path: "/socket.io",
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("new-order", () => {
      setHasNewOrders(true);
    });
    socket.on("new-notification", refreshIndicators);

    socket.on("new-trial-request", refreshIndicators);
    socket.on("trial-request-updated", refreshIndicators);
    socket.on("new-pt-request", refreshIndicators);
    socket.on("pt-request-updated", refreshIndicators);

    const interval = setInterval(refreshIndicators, 30000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  return (
    <aside
      className="w-64 shrink-0 flex flex-col bg-white text-slate-900 shadow-xl shadow-slate-200/60"
      style={{
        borderRight: "1px solid #e5e7eb",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Logo */}
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
          <div className="text-[10px] font-black text-red-600 tracking-[0.2em] -mt-1 uppercase">
            Evolution
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 bg-white">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Quản Trị Hệ Thống
        </div>

        {visibleLinks.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => handleNavClick(to)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border duration-200 group ${
                isActive
                  ? "bg-red-50 text-red-600 border-red-200 shadow-sm"
                  : "border-transparent text-slate-600 hover:text-red-600 hover:bg-red-50"
              }`
            }
          >
            <Icon
              size={17}
              className="group-hover:scale-110 transition-transform"
            />

            <div className="flex items-center w-full">
              <span>{label}</span>

              {to === "/admin/orders" && hasNewOrders && (
                <span className="ml-auto h-2 w-2 bg-red-500 rounded-full"></span>
              )}
              {to === "/admin/trial-requests" && pendingTrialCount > 0 && (
                <span className="ml-auto h-2 w-2 bg-red-500 rounded-full"></span>
              )}
              {to === "/admin/subscriptions" && pendingPtCount > 0 && (
                <span className="ml-auto h-2 w-2 bg-red-500 rounded-full"></span>
              )}
              {to === "/admin/notifications" && unreadNotifications > 0 && (
                <span className="ml-auto h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </div>
          </NavLink>
        ))}
      </nav>

      {/* User info */}
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
              {user?.avatar && !imgError ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="block h-full w-full object-cover object-center"
                  onError={handleAvatarError}
                />
              ) : (
                user?.name?.[0]
              )}
            </div>

            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">
                {user?.name}
              </div>
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                {user?.role}
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

      {profileModal &&
        createPortal(
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
                <div className="mb-6 flex flex-col items-center">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="mx-auto mb-4 flex h-24 w-24 aspect-square shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white text-3xl font-black text-red-600 shadow-inner">
                      {file ? (
                        <img
                          src={URL.createObjectURL(file)}
                          className="block h-full w-full object-cover object-center"
                        />
                      ) : user?.avatar && !imgError ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="block h-full w-full object-cover object-center"
                          onError={handleAvatarError}
                        />
                      ) : (
                        user?.name?.[0]
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
                      {file && (
                        <span className="mt-2 block max-w-[220px] truncate text-[10px] font-bold text-slate-600">
                          Đã chọn: {file.name}
                        </span>
                      )}

                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase text-slate-500">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase text-slate-500">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500"
                    placeholder="0901xxxxxx"
                  />
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
          </div>,
          document.body,
        )}
    </aside>
  );
}
