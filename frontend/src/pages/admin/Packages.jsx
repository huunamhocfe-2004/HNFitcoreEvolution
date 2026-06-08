import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { Plus, Edit2, Trash2, Package } from "lucide-react";
import AppDropdown from "../../components/common/AppDropdown";

const EMPTY = {
  title: "",
  description: "",
  duration_days: 30,
  price: "",
  package_type: "standard",
};

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/packages").then((r) => setPackages(r.data));

  useEffect(() => {
    load();
  }, []);

  const typeLabels = {
    standard: "Tiêu chuẩn",
    vip: "VIP",
  };

  const handle = (e) =>
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));

  const typeLabelsOpt = Object.entries(typeLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const openEdit = (pkg) => {
    setEditing(pkg.id);
    setForm({ ...pkg });
    setModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/packages/${editing}`, form);
        toast.success("Đã cập nhật gói tập");
      } else {
        await api.post("/packages", form);
        toast.success("Đã thêm gói tập");
      }
      setModal(false);
      load();
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const del = async (id) => {
    if (!confirm("Ẩn gói tập này?")) return;
    await api.delete(`/packages/${id}`);
    toast.success("Đã ẩn gói tập");
    load();
  };

  const typeBadge = (t) =>
    ({
      standard: "border border-blue-200 bg-blue-50 text-blue-600",
      vip: "border border-orange-200 bg-orange-50 text-orange-600",
    })[t] || "border border-slate-200 bg-slate-50 text-slate-600";

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Gói Tập & Dịch Vụ
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {packages.length} gói tập đang hoạt động
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
        >
          <Plus size={15} /> Thêm gói tập
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <div
            key={p.id}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 transition-all duration-300 hover:border-red-200 hover:shadow-lg"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50">
                <Package size={18} className="text-red-600" />
              </div>

              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEdit(p)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Sửa gói tập"
                >
                  <Edit2 size={13} />
                </button>

                <button
                  onClick={() => del(p.id)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Ẩn gói tập"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="mb-1 font-bold text-slate-900">{p.title}</div>

            <div className="mb-3 line-clamp-2 text-xs text-slate-500">
              {p.description}
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-2xl font-black text-red-600">
                  {Number(p.price).toLocaleString("vi-VN")}₫
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  {p.duration_days} ngày
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${typeBadge(
                  p.package_type,
                )}`}
              >
                {typeLabels[p.package_type]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {modal &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setModal(false)}
          >
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    {editing ? "Cập nhật gói tập" : "Thêm gói tập mới"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {editing
                      ? "Chỉnh sửa thông tin gói tập"
                      : "Nhập thông tin để tạo gói tập mới"}
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
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Tên gói *
                  </label>
                  <input
                    name="title"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                    placeholder="Nhập tên gói tập"
                    value={form.title}
                    onChange={handle}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                    rows={3}
                    placeholder="Nhập mô tả gói tập"
                    value={form.description}
                    onChange={handle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Thời hạn ngày *
                    </label>
                    <input
                      name="duration_days"
                      type="number"
                      required
                      min={1}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                      value={form.duration_days}
                      onChange={handle}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Giá ₫ *
                    </label>
                    <input
                      name="price"
                      type="number"
                      required
                      min={0}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                      placeholder="0"
                      value={form.price}
                      onChange={handle}
                    />
                  </div>
                </div>

                <div>
                  <AppDropdown
                    label="Loại gói"
                    name="package_type"
                    value={form.package_type}
                    onChange={handle}
                    options={typeLabelsOpt}
                    required
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
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                  >
                    {editing ? "Lưu thay đổi" : "Thêm gói"}
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
