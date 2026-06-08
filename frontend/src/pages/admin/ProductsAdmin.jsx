import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import AppDropdown from "../../components/common/AppDropdown";

const EMPTY = {
  name: "",
  description: "",
  category: "supplement",
  price: "",
  stock_qty: "",
  image_url: "",
};

const CATS = ["supplement", "equipment", "accessory", "apparel", "other"];

const CAT_LABELS = {
  supplement: "Thực phẩm",
  equipment: "Dụng cụ",
  accessory: "Phụ kiện",
  apparel: "Trang phục",
  other: "Khác",
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [cat, setCat] = useState("");
  const [file, setFile] = useState(null);

  const load = () => {
    api
      .get(`/products${cat ? `?category=${cat}` : ""}`)
      .then((r) => setProducts(r.data));
  };

  useEffect(() => {
    load();
  }, [cat]);

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const categoryOptions = Object.entries(CAT_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({ ...p });
    setModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(form).forEach((k) => {
      if (form[k] !== null && form[k] !== undefined) data.append(k, form[k]);
    });

    if (file) data.append("image", file);

    try {
      if (editing) {
        await api.put(`/products/${editing}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Đã cập nhật sản phẩm");
      } else {
        await api.post("/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Đã thêm sản phẩm");
      }
      setModal(false);
      setFile(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const del = async (id) => {
    if (!confirm("Ẩn sản phẩm này?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Đã ẩn");
    load();
  };

  const categoryBadge = (category) => {
    const styles = {
      supplement: "border border-emerald-200 bg-emerald-50 text-emerald-600",
      equipment: "border border-blue-200 bg-blue-50 text-blue-600",
      accessory: "border border-orange-200 bg-orange-50 text-orange-600",
      apparel: "border border-purple-200 bg-purple-50 text-purple-600",
      other: "border border-slate-200 bg-slate-50 text-slate-600",
    };

    return styles[category] || styles.other;
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Quản lý Sản Phẩm
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {products.length} sản phẩm
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
        >
          <Plus size={15} /> Thêm sản phẩm
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {["", ...CATS].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
              cat === c
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            {c ? CAT_LABELS[c] : "Tất cả"}
          </button>
        ))}
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="max-h-[70vh] overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Sản phẩm
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Danh mục
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Giá
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Tồn kho
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-red-50/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <Tag size={18} className="text-red-600" />
                        )}
                      </div>

                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {p.name}
                        </div>
                        <div className="line-clamp-1 text-xs text-slate-500">
                          {p.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${categoryBadge(
                        p.category,
                      )}`}
                    >
                      {CAT_LABELS[p.category]}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-bold text-red-600">
                    {Number(p.price).toLocaleString("vi-VN")}₫
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center whitespace-nowrap font-bold ${
                        p.stock_qty < 5 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {p.stock_qty} cái
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Sửa sản phẩm"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => del(p.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Ẩn sản phẩm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Chưa có sản phẩm
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                    {editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {editing
                      ? "Chỉnh sửa thông tin sản phẩm trong cửa hàng"
                      : "Nhập thông tin để tạo sản phẩm mới"}
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
                    Tên sản phẩm *
                  </label>
                  <input
                    name="name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                    placeholder="Nhập tên sản phẩm"
                    value={form.name}
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
                    placeholder="Nhập mô tả sản phẩm"
                    value={form.description}
                    onChange={handle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <AppDropdown
                    label="Chọn danh mục"
                    name="category"
                    value={form.category}
                    onChange={handle}
                    options={categoryOptions}
                    required
                  />
                  {/* <div>
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Danh mục
                                        </label>
                                        <select
                                            name="category"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                            value={form.category}
                                            onChange={handle}
                                        >
                                            {CATS.map(c => (
                                                <option key={c} value={c}>
                                                    {CAT_LABELS[c]}
                                                </option>
                                            ))}
                                        </select>
                                    </div> */}

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

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Tồn kho
                    </label>
                    <input
                      name="stock_qty"
                      type="number"
                      min={0}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                      placeholder="0"
                      value={form.stock_qty}
                      onChange={handle}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Ảnh sản phẩm
                    </label>

                    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                      <input
                        type="file"
                        accept="image/*"
                        className="cursor-pointer text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-red-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-red-600 hover:file:bg-red-100"
                        onChange={(e) => setFile(e.target.files[0])}
                      />

                      {form.image_url && !file && (
                        <div className="truncate text-[10px] text-slate-500">
                          Hiện tại: {form.image_url}
                        </div>
                      )}

                      {file && (
                        <div className="text-[10px] font-bold text-red-600">
                          Sẽ thay thế bằng: {file.name}
                        </div>
                      )}
                    </div>
                  </div>
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
                    {editing ? "Lưu thay đổi" : "Thêm sản phẩm"}
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
