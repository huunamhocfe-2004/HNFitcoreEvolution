import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Package } from "lucide-react";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "delivered",
  "cancelled",
];

const statusBadge = (s) =>
  ({
    pending: (
      <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
        Chờ xử lý
      </span>
    ),
    confirmed: (
      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
        Đã xác nhận
      </span>
    ),
    processing: (
      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
        Đang giao
      </span>
    ),
    delivered: (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
        Hoàn tất
      </span>
    ),
    cancelled: (
      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Đã hủy
      </span>
    ),
  })[s] || (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
      {s}
    </span>
  );

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    api.patch("/orders/mark-seen").catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    api
      .get("/orders")
      .then((r) => setOrders(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    toast.success("Đã cập nhật trạng thái đơn hàng");
    load();
  };

  const filtered = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Quản lý Đơn Hàng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {orders.length} đơn hàng
          </p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {["", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
              statusFilter === s
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            {s
              ? {
                  pending: "Chờ xử lý",
                  confirmed: "Xác nhận",
                  processing: "Đang giao",
                  delivered: "Hoàn tất",
                  cancelled: "Đã hủy",
                }[s]
              : "Tất cả"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-2xl bg-slate-200"
              />
            ))
          : filtered.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 transition-all hover:border-red-200 hover:shadow-md"
              >
                {/* Order header */}
                <div
                  className="flex cursor-pointer flex-wrap items-center gap-3"
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50">
                    <Package size={16} className="text-red-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        #{o.id} – {o.member_name}
                      </span>
                      {statusBadge(o.status)}
                    </div>

                    <div className="mt-0.5 text-xs text-slate-500">
                      {new Date(o.created_at).toLocaleString("vi-VN")} ·{" "}
                      {o.payment_method === "cash"
                        ? "💵 Tại quầy"
                        : o.payment_method === "cod"
                          ? "🚚 Ship COD"
                          : "🏦 Chuyển khoản"}
                      {o.shipping_fee > 0 &&
                        ` (+${Number(o.shipping_fee).toLocaleString(
                          "vi-VN",
                        )}₫ ship)`}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-red-600">
                      {Number(o.total_amount).toLocaleString("vi-VN")}₫
                    </div>
                    <div className="text-xs text-slate-500">
                      {o.items?.length} sản phẩm
                    </div>
                  </div>
                </div>

                {/* Expanded items */}
                {expanded === o.id && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    {o.shipping_address && (
                      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                        <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Địa chỉ giao hàng
                        </div>
                        {o.shipping_address}
                      </div>
                    )}

                    <div className="mb-3 space-y-2">
                      {o.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="h-12 w-12 aspect-square shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.product_name}
                                  className="block h-full w-full object-cover object-center"
                                />
                              ) : (
                                <Package className="h-full w-full p-3 text-slate-400" />
                              )}
                            </div>

                            <span className="truncate font-semibold text-slate-700">
                              {item.product_name}
                            </span>
                          </div>

                          <span className="shrink-0 text-slate-500">
                            x{item.quantity} ×{" "}
                            {Number(item.unit_price).toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Status actions */}
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.filter((s) => s !== o.status).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(o.id, s)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          →{" "}
                          {
                            {
                              pending: "Chờ xử lý",
                              confirmed: "Xác nhận",
                              processing: "Đang giao",
                              delivered: "Hoàn tất",
                              cancelled: "Hủy",
                            }[s]
                          }
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-500 shadow-sm">
            Không có đơn hàng
          </div>
        )}
      </div>
    </div>
  );
}