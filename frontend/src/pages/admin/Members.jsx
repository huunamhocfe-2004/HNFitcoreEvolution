import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import SearchInput from "../../components/layout/searchInput";
import { Plus, Eye, Edit2, Trash2, Download } from "lucide-react";
import AppDatePicker from "../../components/common/AppDatePicker";

const statusBadge = (s) =>
  ({
    active: (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
        Hoạt động
      </span>
    ),
    expired: (
      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Hết hạn
      </span>
    ),
    paused: (
      <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
        Tạm dừng
      </span>
    ),
  })[s] || (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
      {s}
    </span>
  );

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  password: "",
  birth_date: "",
  id_card: "",
  notes: "",
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [memberPermissions, setMemberPermissions] = useState({
    view: true,
    create: false,
    edit: false,
    delete: false,
    assign: false,
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreate = Boolean(memberPermissions.create);
  const canEdit = Boolean(memberPermissions.edit);
  const canDelete = Boolean(memberPermissions.delete);

  const load = () => {
    setLoading(true);
    api
      .get("/members")
      .then((r) => setMembers(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api
      .get("/permissions")
      .then((r) => {
        const membersArea = r.data.find((item) => item.id === "members");
        setMemberPermissions(membersArea?.roles?.[user?.role] || {});
      })
      .catch(() => {
        setMemberPermissions(
          user?.role === "admin"
            ? {
                view: true,
                create: true,
                edit: true,
                delete: true,
                assign: true,
              }
            : {
                view: true,
                create: false,
                edit: true,
                delete: false,
                assign: true,
              },
        );
      });
  }, [user?.role]);

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => {
    if (!canCreate) return toast.error("Bạn không có quyền thêm hội viên");
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };

  const openEdit = (m) => {
    if (!canEdit) return toast.error("Bạn không có quyền sửa hội viên");
    setEditing(m.id);
    setForm({
      name: m.name || "",
      email: m.email || "",
      phone: m.phone || "",
      password: "",
      birth_date: m.birth_date
        ? new Date(m.birth_date).toISOString().split("T")[0]
        : "",
      id_card: m.id_card || "",
      notes: m.notes || "",
      status: m.status || "active",
    });
    setModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (editing && !canEdit) {
      return toast.error("Bạn không có quyền sửa hội viên");
    }

    if (!editing && !canCreate) {
      return toast.error("Bạn không có quyền thêm hội viên");
    }

    setSaving(true);
    const data = new FormData();

    Object.keys(form).forEach((k) => {
      if (form[k] !== undefined && form[k] !== null) {
        if (k === "password" && editing && !form[k]) return;
        data.append(k, form[k]);
      }
    });

    if (file) data.append("avatar", file);

    try {
      if (editing) {
        await api.put(`/members/${editing}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/members", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm hội viên thành công!");
      }

      setModal(false);
      setForm(EMPTY);
      setFile(null);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (id, name) => {
    if (!canDelete) return toast.error("Bạn không có quyền xóa hội viên");
    if (!confirm(`Xóa hội viên "${name}"?`)) return;

    await api.delete(`/members/${id}`);
    toast.success("Đã xóa hội viên");
    load();
  };

  const downloadMemberQr = async (member) => {
    try {
      const res = await api.get(`/members/${member.id}/qr`);
      const link = document.createElement("a");
      link.href = res.data.qr_image;
      link.download = `${
        res.data.qr_code || member.qr_code || `FC-${member.id}`
      }.png`;
      link.click();
      toast.success("Đã tải mã QR check-in");
    } catch (err) {
      toast.error(err.response?.data?.message || "Không tải được mã QR");
    }
  };

  const filtered = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search) ||
      m.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Quản lý Hội viên
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {members.length} hội viên trong hệ thống
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
          >
            <Plus size={15} /> Thêm hội viên
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <SearchInput onSearch={setSearch} />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Hội viên
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Liên hệ
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Ngày tham gia
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Gói hiện tại
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Hết hạn
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))
                : filtered.map((m) => (
                    <tr
                      key={m.id}
                      className="transition-colors hover:bg-red-50/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-sm font-bold">
                            {m.avatar ? (
                              <img
                                src={m.avatar}
                                alt={m.name}
                                className="block h-full w-full object-cover object-center"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "";
                                }}
                              />
                            ) : (
                              <span className="text-red-600">
                                {m.name?.[0]}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {m.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {m.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {m.phone}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {m.joined_date
                          ? new Date(m.joined_date).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {m.current_package || (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {m.package_expires ? (
                          <>
                            {new Date(m.package_expires).toLocaleDateString(
                              "vi-VN",
                            )}
                            {m.days_remaining != null && (
                              <span
                                className={`ml-1 text-xs ${
                                  m.days_remaining < 7
                                    ? "text-red-500"
                                    : "text-slate-400"
                                }`}
                              >
                                ({m.days_remaining}d)
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">{statusBadge(m.status)}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/admin/members/${m.id}`)}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Xem chi tiết"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => openEdit(m)}
                            disabled={!canEdit}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => downloadMemberQr(m)}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-orange-50 hover:text-orange-500"
                            title="Tải QR check-in"
                          >
                            <Download size={15} />
                          </button>

                          {canDelete && (
                            <button
                              onClick={() => deleteMember(m.id, m.name)}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Xóa"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Không tìm thấy hội viên
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {/* Add Modal */}
      {modal &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setModal(false)}
          >
            <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    {editing ? "Cập Nhật Hội Viên" : "Thêm Hội Viên Mới"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {editing
                      ? "Chỉnh sửa thông tin hội viên trong hệ thống"
                      : "Nhập thông tin để tạo hội viên mới"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Họ tên *
                    </label>
                    <input
                      name="name"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={handle}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Số điện thoại
                    </label>
                    <input
                      name="phone"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                      placeholder="0901..."
                      value={form.phone}
                      onChange={handle}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={handle}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Mật khẩu {editing ? "(để trống nếu không đổi)" : "*"}
                    </label>
                    <input
                      name="password"
                      type="password"
                      required={!editing}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handle}
                    />
                  </div>

                  <div>
                    {/* <AppDatePicker
                      label="Ngày sinh"
                      name="birth_date"
                      value={form.birth_date}
                      onChange={handle}
                      placeholder="Chọn ngày sinh"
                      required
                    /> */}
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Ngày sinh
                    </label>
                    <input
                      name="birth_date"
                      type="date"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                      value={form.birth_date}
                      onChange={handle}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Số CCCD
                    </label>
                    <input
                      name="id_card"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                      placeholder="Nhập số CCCD"
                      value={form.id_card}
                      onChange={handle}
                    />
                  </div>

                  {editing && (
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Trạng thái
                      </label>
                      <select
                        name="status"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                        value={form.status}
                        onChange={handle}
                      >
                        <option value="active">Hoạt động</option>
                        <option value="paused">Tạm dừng</option>
                        <option value="expired">Hết hạn</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Ảnh đại diện
                  </label>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <input
                      type="file"
                      accept="image/*"
                      className="cursor-pointer text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-red-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-red-600 hover:file:bg-red-100"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Ghi chú
                  </label>
                  <textarea
                    name="notes"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                    rows={3}
                    placeholder="Nhập ghi chú nếu có..."
                    value={form.notes}
                    onChange={handle}
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                  <button
                    type="button"
                    onClick={() => setModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Đang lưu..."
                      : editing
                        ? "Lưu thay đổi"
                        : "Thêm hội viên"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
