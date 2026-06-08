import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import AppDatePicker from "../../components/common/AppDatePicker";
import {
  Plus,
  Edit2,
  Trash2,
  TicketPercent,
  CalendarDays,
  Hash,
  X,
  Save,
} from "lucide-react";

const EMPTY = {
  code: "",
  description: "",
  discount_pct: "",
  discount_amt: "",
  valid_from: "",
  valid_to: "",
  max_uses: "",
  is_active: 1,
};

const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN") + "₫";

const formatDate = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const toLocalDate = (value) => {
  const dateStr = formatDate(value);
  if (!dateStr) return null;

  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getRemainDays = (validTo) => {
  const endDate = toLocalDate(validTo);
  if (!endDate) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = endDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const getTimeLabel = (promo) => {
  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const startDate = toLocalDate(promo.valid_from);
  const remainDays = getRemainDays(promo.valid_to);

  if (startDate && startDate > todayDate) {
    const diffMs = startDate.getTime() - todayDate.getTime();
    const daysToStart = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      label: `${daysToStart} ngày nữa bắt đầu`,
      sub: `${formatDate(promo.valid_from)} → ${formatDate(promo.valid_to)}`,
      className: "text-blue-600",
    };
  }

  if (remainDays === null) {
    return {
      label: "Không xác định",
      sub: "",
      className: "text-slate-500",
    };
  }

  if (remainDays < 0) {
    return {
      label: "Đã hết hạn",
      sub: `${formatDate(promo.valid_from)} → ${formatDate(promo.valid_to)}`,
      className: "text-red-600",
    };
  }

  if (remainDays === 0) {
    return {
      label: "Còn hôm nay",
      sub: `${formatDate(promo.valid_from)} → ${formatDate(promo.valid_to)}`,
      className: "text-orange-600",
    };
  }

  return {
    label: `Còn ${remainDays} ngày`,
    sub: `${formatDate(promo.valid_from)} → ${formatDate(promo.valid_to)}`,
    className: remainDays <= 7 ? "text-orange-600" : "text-emerald-600",
  };
};

const getStatus = (promo) => {
  const today = new Date().toISOString().slice(0, 10);

  if (!promo.is_active) {
    return {
      label: "Đã ẩn",
      className: "border-slate-200 bg-slate-50 text-slate-500",
    };
  }

  if (promo.valid_to && formatDate(promo.valid_to) < today) {
    return {
      label: "Hết hạn",
      className: "border-red-200 bg-red-50 text-red-600",
    };
  }

  if (promo.max_uses && Number(promo.used_count) >= Number(promo.max_uses)) {
    return {
      label: "Hết lượt",
      className: "border-orange-200 bg-orange-50 text-orange-600",
    };
  }

  return {
    label: "Đang dùng",
    className: "border-emerald-200 bg-emerald-50 text-emerald-600",
  };
};

export default function PromotionsAdmin() {
  const [promos, setPromos] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .get("/subscriptions/promos")
      .then((res) => setPromos(res.data))
      .catch(() => toast.error("Không tải được danh sách mã giảm giá"));
  };

  useEffect(() => {
    load();
  }, []);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };

  const openEdit = (promo) => {
    setEditing(promo.id);
    setForm({
      code: promo.code || "",
      description: promo.description || "",
      discount_pct: promo.discount_pct || "",
      discount_amt: promo.discount_amt || "",
      valid_from: formatDate(promo.valid_from),
      valid_to: formatDate(promo.valid_to),
      max_uses: promo.max_uses || "",
      is_active: promo.is_active ? 1 : 0,
    });
    setModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();

    const discountPct = Number(form.discount_pct || 0);
    const discountAmt = Number(form.discount_amt || 0);

    if (!form.code.trim()) {
      return toast.error("Vui lòng nhập mã giảm giá");
    }

    if (!form.valid_from || !form.valid_to) {
      return toast.error("Vui lòng nhập thời gian hiệu lực");
    }

    if (discountPct <= 0 && discountAmt <= 0) {
      return toast.error("Vui lòng nhập % giảm hoặc số tiền giảm");
    }

    if (discountPct > 0 && discountAmt > 0) {
      return toast.error("Chỉ nên chọn 1 kiểu giảm: phần trăm hoặc số tiền");
    }

    if (discountPct > 100) {
      return toast.error("Phần trăm giảm không được vượt quá 100%");
    }

    setSaving(true);

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      discount_pct: discountPct,
      discount_amt: discountAmt,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: Number(form.is_active),
    };

    try {
      if (editing) {
        await api.put(`/subscriptions/promos/${editing}`, payload);
        toast.success("Đã cập nhật mã giảm giá");
      } else {
        await api.post("/subscriptions/promos", payload);
        toast.success("Đã thêm mã giảm giá");
      }

      setModal(false);
      setForm(EMPTY);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Xóa hẳn mã giảm giá này? Thao tác này không thể hoàn tác."))
      return;

    try {
      await api.delete(`/subscriptions/promos/${id}`);
      toast.success("Đã xóa mã giảm giá");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không xóa được mã giảm giá");
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Quản lý Mã Giảm Giá
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tạo và quản lý mã khuyến mãi áp dụng cho gói tập
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
        >
          <Plus size={15} /> Thêm mã
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Mã giảm giá
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Giá trị giảm
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Thời hạn
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Lượt dùng
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {promos.map((promo) => {
                const status = getStatus(promo);

                return (
                  <tr key={promo.id} className="transition hover:bg-red-50/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
                          <TicketPercent size={18} />
                        </div>

                        <div>
                          <div className="font-black uppercase tracking-widest text-slate-900">
                            {promo.code}
                          </div>
                          <div className="line-clamp-1 text-xs text-slate-500">
                            {promo.description || "Không có mô tả"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {Number(promo.discount_pct) > 0 ? (
                        <span className="font-black text-red-600">
                          -{Number(promo.discount_pct)}%
                        </span>
                      ) : (
                        <span className="font-black text-red-600">
                          -{formatMoney(promo.discount_amt)}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {(() => {
                        const time = getTimeLabel(promo);

                        return (
                          <div className="flex items-start gap-2">
                            <CalendarDays
                              size={14}
                              className="mt-0.5 text-slate-400"
                            />

                            <div>
                              <div
                                className={`text-xs font-black ${time.className}`}
                              >
                                {time.label}
                              </div>

                              <div className="mt-0.5 text-[10px] font-bold text-slate-400">
                                {time.sub}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Hash size={14} className="text-slate-400" />
                        {promo.used_count || 0}
                        {promo.max_uses
                          ? ` / ${promo.max_uses}`
                          : " / Không giới hạn"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(promo)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Sửa"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => remove(promo.id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Xóa hẳn"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {promos.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-sm text-slate-500"
                  >
                    Chưa có mã giảm giá nào.
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
            <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-black uppercase italic tracking-tight">
                    {editing ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Mã này sẽ áp dụng khi hội viên đăng ký gói tập
                  </p>
                </div>

                <button
                  onClick={() => setModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Mã giảm giá *
                  </label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handle}
                    placeholder="VD: FITCORE10"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black uppercase tracking-widest text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handle}
                    rows={3}
                    placeholder="VD: Giảm giá khai trương tháng 6"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Giảm theo %
                    </label>
                    <input
                      name="discount_pct"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.discount_pct}
                      onChange={handle}
                      placeholder="VD: 10"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Giảm theo tiền
                    </label>
                    <input
                      name="discount_amt"
                      type="number"
                      min="0"
                      step="1000"
                      value={form.discount_amt}
                      onChange={handle}
                      placeholder="VD: 50000"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <AppDatePicker
                    label="Ngày bắt đầu"
                    name="valid_from"
                    value={form.valid_from}
                    onChange={handle}
                    placeholder="Chọn ngày bắt đầu"
                    required
                  />
                  <AppDatePicker
                    label="Ngày kết thúc"
                    name="valid_to"
                    value={form.valid_to}
                    onChange={handle}
                    placeholder="Chọn ngày kết thúc"
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Giới hạn lượt dùng
                    </label>
                    <input
                      name="max_uses"
                      type="number"
                      min="0"
                      value={form.max_uses}
                      onChange={handle}
                      placeholder="Bỏ trống nếu không giới hạn"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                    />
                  </div>

                  {editing && (
                    <label className="flex items-center gap-3 mt-auto cursor-pointer select-none py-3">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={Boolean(Number(form.is_active))}
                        onChange={handle}
                        className="sr-only"
                      />

                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                          Boolean(Number(form.is_active))
                            ? "border-blue-600"
                            : "border-slate-300"
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full bg-blue-600 transition ${
                            Boolean(Number(form.is_active))
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-0"
                          }`}
                        />
                      </span>

                      <div>
                        <div className="text-sm font-bold text-slate-700">
                          Hiển thị voucher
                        </div>
                      </div>
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Đang lưu..." : "Lưu mã giảm giá"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
