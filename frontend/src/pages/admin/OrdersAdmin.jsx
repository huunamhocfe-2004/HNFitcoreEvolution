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
    pending: <span className="badge badge-yellow">Chờ xử lý</span>,
    confirmed: <span className="badge badge-blue">Đã xác nhận</span>,
    processing: <span className="badge badge-gray">Đang giao</span>,
    delivered: <span className="badge badge-green">Hoàn tất</span>,
    cancelled: <span className="badge badge-red">Đã hủy</span>,
  })[s];

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Đơn Hàng</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} đơn hàng</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                : "border-gray-700 text-gray-400 hover:border-gray-500"
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

      <div className="space-y-2">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))
          : filtered.map((o) => (
              <div key={o.id} className="card">
                {/* Order header */}
                <div
                  className="flex flex-wrap items-center gap-3 cursor-pointer"
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(234,179,8,0.1)",
                      border: "1px solid rgba(234,179,8,0.2)",
                    }}
                  >
                    <Package size={16} color="#eab308" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        #{o.id} – {o.member_name}
                      </span>
                      {statusBadge(o.status)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(o.created_at).toLocaleString("vi-VN")} ·{" "}
                      {o.payment_method === "cash"
                        ? "💵 Tại quầy"
                        : o.payment_method === "cod"
                          ? "🚚 Ship COD"
                          : "🏦 Chuyển khoản"}
                      {o.shipping_fee > 0 &&
                        ` (+${Number(o.shipping_fee).toLocaleString("vi-VN")}₫ ship)`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-400">
                      {Number(o.total_amount).toLocaleString("vi-VN")}₫
                    </div>
                    <div className="text-xs text-gray-500">
                      {o.items?.length} sản phẩm
                    </div>
                  </div>
                </div>

                {/* Expanded items */}
                {expanded === o.id && (
                  <div
                    className="mt-3 pt-3"
                    style={{ borderTop: "1px solid #1f1f1f" }}
                  >
                    {o.shipping_address && (
                      <div className="mb-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800 text-xs text-zinc-400">
                        <div className="font-bold text-zinc-500 uppercase text-[9px] mb-1">
                          Địa chỉ giao hàng
                        </div>
                        {o.shipping_address}
                      </div>
                    )}
                    <div className="space-y-2 mb-3">
                      {o.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-300">
                            {item.product_name}
                          </span>
                          <span className="text-gray-500">
                            x{item.quantity} ×{" "}
                            {Number(item.unit_price).toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Status actions */}
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.filter((s) => s !== o.status).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(o.id, s)}
                          className="btn-ghost py-1 px-3 text-xs"
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
          <div className="text-center py-16 text-gray-600">
            Không có đơn hàng
          </div>
        )}
      </div>
    </div>
  );
}
