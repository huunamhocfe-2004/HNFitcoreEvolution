import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import SearchInput from "../../components/layout/searchInput";
import { Plus, Search, Eye, Edit2, Trash2, QrCode } from "lucide-react";

const statusBadge = (s) =>
  ({
    active: <span className="badge badge-green">Hoạt động</span>,
    expired: <span className="badge badge-red">Hết hạn</span>,
    paused: <span className="badge badge-yellow">Tạm dừng</span>,
  })[s] || <span className="badge badge-gray">{s}</span>;

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
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api
      .get("/members")
      .then((r) => setMembers(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };

  const openEdit = (m) => {
    setEditing(m.id);
    setForm({
      name: m.name || "",
      email: m.email || "",
      phone: m.phone || "",
      password: "", // Don't show password
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
    setSaving(true);
    const data = new FormData();
    Object.keys(form).forEach((k) => {
      if (form[k] !== undefined && form[k] !== null) {
        // Skip password if empty on edit
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
    if (!confirm(`Xóa hội viên "${name}"?`)) return;
    await api.delete(`/members/${id}`);
    toast.success("Đã xóa hội viên");
    load();
  };

  const filtered = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search) ||
      m.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Quản lý Hội viên</h1>
          <p className="text-sm text-gray-500 mt-1">
            {members.length} hội viên trong hệ thống
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-gold flex items-center gap-2 text-sm"
        >
          <Plus size={15} /> Thêm hội viên
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
                {/* <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input className="input-dark pl-9 text-sm" placeholder="Tìm theo tên, SĐT, email..."
                    value={search} onChange={e => setSearch(e.target.value)} /> */}
                    <SearchInput onSearch={setSearch} />
            </div>


      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Hội viên</th>
                <th>Liên hệ</th>
                <th>Ngày tham gia</th>
                <th>Gói hiện tại</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7}>
                        <div className="skeleton h-4 w-full" />
                      </td>
                    </tr>
                  ))
                : filtered.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm shrink-0 bg-zinc-900 border border-zinc-800">
                            {m.avatar ? (
                              <img
                                src={m.avatar}
                                alt={m.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "";
                                }}
                              />
                            ) : (
                              <span className="text-yellow-500">
                                {m.name?.[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">
                              {m.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {m.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-400 text-sm">{m.phone}</td>
                      <td className="text-gray-400 text-sm">
                        {m.joined_date
                          ? new Date(m.joined_date).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="text-sm text-gray-300">
                        {m.current_package || (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="text-sm text-gray-400">
                        {m.package_expires ? (
                          <>
                            {new Date(m.package_expires).toLocaleDateString(
                              "vi-VN",
                            )}
                            {m.days_remaining != null && (
                              <span
                                className={`ml-1 text-xs ${m.days_remaining < 7 ? "text-red-400" : "text-gray-600"}`}
                              >
                                ({m.days_remaining}d)
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td>{statusBadge(m.status)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/members/${m.id}`)}
                            className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEdit(m)}
                            className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => deleteMember(m.id, m.name)}
                            className="p-1.5 rounded hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-600">
                    Không tìm thấy hội viên
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {modal &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setModal(false)}
          >
            <div className="modal-box p-6">
              <h2 className="text-lg font-bold text-white mb-5">
                {editing ? "Cập Nhật Hội Viên" : "Thêm Hội Viên Mới"}
              </h2>
              <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Họ tên *
                    </label>
                    <input
                      name="name"
                      required
                      className="input-dark text-sm"
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={handle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      name="phone"
                      className="input-dark text-sm"
                      placeholder="0901..."
                      value={form.phone}
                      onChange={handle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="input-dark text-sm"
                      value={form.email}
                      onChange={handle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Mật khẩu {editing ? "(để trống nếu không đổi)" : "*"}
                    </label>
                    <input
                      name="password"
                      type="password"
                      required={!editing}
                      className="input-dark text-sm"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      name="birth_date"
                      type="date"
                      className="input-dark text-sm"
                      value={form.birth_date}
                      onChange={handle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Số CCCD
                    </label>
                    <input
                      name="id_card"
                      className="input-dark text-sm"
                      value={form.id_card}
                      onChange={handle}
                    />
                  </div>
                  {editing && (
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">
                        Trạng thái
                      </label>
                      <select
                        name="status"
                        className="input-dark text-sm"
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
                  <label className="block text-xs text-zinc-500 mb-1">
                    Ảnh đại diện
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    name="notes"
                    className="input-dark text-sm"
                    rows={2}
                    value={form.notes}
                    onChange={handle}
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setModal(false)}
                    className="btn-ghost text-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-gold text-sm"
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
