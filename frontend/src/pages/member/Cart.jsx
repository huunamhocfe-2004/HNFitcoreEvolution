import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  CreditCard,
  Package,
  Tag,
  Minus,
  Plus,
} from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount } =
    useCart();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [shippingAddress, setShippingAddress] = useState("");

  const checkout = async () => {
    if (!user) return toast.error("Bạn chưa đăng nhập");

    if (paymentMethod === "cod" && !shippingAddress.trim()) {
      return toast.error("Vui lòng nhập địa chỉ giao hàng");
    }

    setSubmitting(true);
    try {
      const fee = paymentMethod === "cod" ? 30000 : 0;

      await api.post("/orders", {
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        payment_method: paymentMethod,
        shipping_fee: fee,
        shipping_address: paymentMethod === "cod" ? shippingAddress : null,
      });

      toast.success("Đặt hàng thành công!");
      clearCart();
      navigate("/member/member-orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center text-slate-500">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
          <ShoppingCart size={40} className="text-slate-300" />
        </div>

        <h2 className="mb-2 text-xl font-black text-slate-900">
          Giỏ hàng đang trống
        </h2>

        <p className="mb-8 text-sm text-slate-500">
          Hãy dạo quanh cửa hàng và chọn những món đồ bạn cần.
        </p>

        <button
          onClick={() => navigate("/member/store")}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
        >
          <ArrowLeft size={18} /> QUAY LẠI CỬA HÀNG
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl text-slate-900">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate("/member/store")}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            Giỏ Hàng Của Bạn
          </h1>
          <p className="text-sm text-slate-500">
            {cart.length} mặt hàng đã chọn
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 transition-colors hover:border-red-200 hover:shadow-lg sm:flex-row"
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package size={32} className="text-slate-300" />
                )}
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h3 className="mb-1 text-lg font-black text-slate-900">
                  {item.name}
                </h3>

                <div className="mb-2 flex items-center justify-center gap-2 text-sm text-slate-500 sm:justify-start">
                  <Tag size={14} /> {item.category}
                </div>

                <div className="text-lg font-black text-red-600">
                  {Number(item.price).toLocaleString("vi-VN")}₫
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-center gap-3 sm:items-end">
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-red-600"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-10 text-center text-sm font-black text-slate-900">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-red-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-red-600"
                >
                  <Trash2 size={13} /> Xóa khỏi giỏ
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
            <h2 className="mb-6 border-b border-slate-200 pb-4 text-sm font-black uppercase tracking-widest text-slate-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="mb-6 space-y-4">
              <div className="flex justify-between text-sm font-medium text-slate-500">
                <span>Tạm tính</span>
                <span>{totalAmount.toLocaleString("vi-VN")}₫</span>
              </div>

              <div className="flex justify-between text-sm font-medium text-slate-500">
                <span>Phí giao hàng</span>
                <span>{paymentMethod === "cod" ? "30.000₫" : "Miễn phí"}</span>
              </div>

              <div className="my-2 h-px bg-slate-200" />

              <div>
                <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Tổng thanh toán
                </div>
                <span className="text-3xl font-black text-red-600">
                  {(
                    totalAmount + (paymentMethod === "cod" ? 30000 : 0)
                  ).toLocaleString("vi-VN")}
                  ₫
                </span>
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <h3 className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Phương thức thanh toán
              </h3>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    paymentMethod === "cash"
                      ? "border-red-200 bg-red-50"
                      : "border-slate-200 bg-slate-50 hover:border-red-200 hover:bg-red-50/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-1.5 ${
                        paymentMethod === "cash"
                          ? "bg-red-600 text-white"
                          : "bg-white text-slate-500"
                      }`}
                    >
                      <CreditCard size={14} />
                    </div>

                    <div>
                      <div className="text-xs font-black text-slate-900">
                        Tại quầy
                      </div>
                      <div className="text-[9px] text-slate-500">
                        Miễn phí ship
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    paymentMethod === "cod"
                      ? "border-red-200 bg-red-50"
                      : "border-slate-200 bg-slate-50 hover:border-red-200 hover:bg-red-50/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-1.5 ${
                        paymentMethod === "cod"
                          ? "bg-red-600 text-white"
                          : "bg-white text-slate-500"
                      }`}
                    >
                      <Package size={14} />
                    </div>

                    <div>
                      <div className="text-xs font-black text-slate-900">
                        Ship COD
                      </div>
                      <div className="text-[9px] text-slate-500">
                        +30.000₫ phí ship
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {paymentMethod === "cod" && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="mb-2 block px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Địa chỉ giao hàng
                </label>

                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Nhập địa chỉ nhận hàng..."
                  className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                />
              </div>
            )}

            <button
              onClick={checkout}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                "ĐANG XỬ LÝ..."
              ) : (
                <>
                  <CreditCard size={20} /> XÁC NHẬN ĐẶT HÀNG
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={clearCart}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-red-600"
              >
                Làm trống giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
