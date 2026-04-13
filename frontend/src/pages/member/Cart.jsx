import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, Package, Tag, Minus, Plus } from 'lucide-react'

export default function Cart() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { cart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart()
    const [submitting, setSubmitting] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('cash') // 'cash' or 'cod'
    const [shippingAddress, setShippingAddress] = useState('')

    const checkout = async () => {
        if (!user?.member_id) return toast.error('Lỗi định danh hội viên')
        if (paymentMethod === 'cod' && !shippingAddress.trim()) {
            return toast.error('Vui lòng nhập địa chỉ giao hàng')
        }
        setSubmitting(true)
        try {
            const fee = paymentMethod === 'cod' ? 30000 : 0
            await api.post('/orders', {
                member_id: user.member_id,
                items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
                payment_method: paymentMethod,
                shipping_fee: fee,
                shipping_address: paymentMethod === 'cod' ? shippingAddress : null
            })
            toast.success(paymentMethod === 'cod' ? 'Đặt hàng thành công! Đơn hàng sẽ được giao đến bạn.' : 'Đặt hàng thành công! Vui lòng thanh toán tại quầy.')
            clearCart()
            navigate('/member/member-orders')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi đặt hàng')
        } finally {
            setSubmitting(false)
        }
    }

    if (cart.length === 0) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-zinc-600">
                <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800">
                    <ShoppingCart size={40} className="text-zinc-700" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Giỏ hàng đang trống</h2>
                <p className="text-sm mb-8 text-zinc-500">Hãy dạo quanh cửa hàng và chọn những món đồ bạn cần.</p>
                <button onClick={() => navigate('/member/store')} className="btn-gold px-8 py-3 flex items-center gap-2">
                    <ArrowLeft size={18} /> QUAY LẠI CỬA HÀNG
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/member/store')} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Giỏ Hàng Của Bạn</h1>
                    <p className="text-sm text-zinc-500">{cart.length} mặt hàng đã chọn</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="card p-4 flex flex-col sm:flex-row items-center gap-6 bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-colors">
                            <div className="w-24 h-24 rounded-2xl bg-zinc-950 flex items-center justify-center border border-zinc-800 overflow-hidden shrink-0">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Package size={32} className="text-zinc-800" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 text-center sm:text-left">
                                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-500 text-sm mb-2">
                                    <Tag size={14} /> {item.category}
                                </div>
                                <div className="text-yellow-500 font-bold text-lg">
                                    {Number(item.price).toLocaleString('vi-VN')}₫
                                </div>
                            </div>

                            <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                                <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="w-10 h-10 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors flex items-center justify-center"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-10 text-center text-sm font-bold text-white">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="w-10 h-10 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors flex items-center justify-center"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors flex items-center gap-1.5"
                                >
                                    <Trash2 size={13} /> Xóa khỏi giỏ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="card bg-zinc-900 border-zinc-800 p-6 sticky top-6">
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Tóm tắt đơn hàng</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm text-zinc-400 font-medium">
                                <span>Tạm tính</span>
                                <span>{totalAmount.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="flex justify-between text-sm text-zinc-400 font-medium">
                                <span>Phí giao hàng</span>
                                <span>{paymentMethod === 'cod' ? '30.000₫' : 'Miễn phí'}</span>
                            </div>
                            <div className="h-px bg-zinc-800 my-2" />
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-bold text-yellow-500">
                                    {(totalAmount + (paymentMethod === 'cod' ? 30000 : 0)).toLocaleString('vi-VN')}₫
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Phương thức thanh toán</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`p-3 rounded-xl border text-left transition-all ${paymentMethod === 'cash' ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${paymentMethod === 'cash' ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                            <CreditCard size={14} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">Tại quầy</div>
                                            <div className="text-[9px] text-zinc-500">Miễn phí ship</div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-3 rounded-xl border text-left transition-all ${paymentMethod === 'cod' ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${paymentMethod === 'cod' ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                            <Package size={14} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">Ship COD</div>
                                            <div className="text-[9px] text-zinc-500">+30.000₫ phí ship</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {paymentMethod === 'cod' && (
                            <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Địa chỉ giao hàng</label>
                                <textarea
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    placeholder="Nhập địa chỉ nhận hàng..."
                                    className="input-dark text-xs min-h-[80px] resize-none"
                                />
                            </div>
                        )}

                        <button
                            onClick={checkout}
                            disabled={submitting}
                            className="btn-gold w-full py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/10"
                        >
                            {submitting ? 'ĐANG XỬ LÝ...' : <><CreditCard size={20} /> XÁC NHẬN ĐẶT HÀNG</>}
                        </button>

                        <div className="mt-4 text-center">
                            <button
                                onClick={clearCart}
                                className="text-[10px] font-black text-zinc-600 hover:text-zinc-400 uppercase tracking-widest"
                            >
                                Làm trống giỏ hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
