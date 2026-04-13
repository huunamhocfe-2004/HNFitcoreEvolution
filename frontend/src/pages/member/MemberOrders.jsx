import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { Package, Truck, CheckCircle, Clock, ShoppingBag, MapPin, CreditCard } from 'lucide-react'

const STATUS_MAP = {
    pending: { label: 'Chờ xử lý', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock },
    confirmed: { label: 'Đã xác nhận', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle },
    shipped: { label: 'Đang giao', color: 'text-zinc-400', bg: 'bg-zinc-800/50', icon: Truck },
    completed: { label: 'Hoàn tất', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle },
    cancelled: { label: 'Đã hủy', color: 'text-red-500', bg: 'bg-red-900/10', icon: Package },
}

export default function MemberOrders() {
    const { user } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user?.member_id) {
            api.get(`/orders?member_id=${user.member_id}`)
                .then(r => setOrders(r.data))
                .finally(() => setLoading(false))
        }
    }, [user])

    if (loading) return <div className="p-8 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Lịch sử Đơn Hàng</h1>
                <p className="text-sm text-zinc-500 mt-1">Theo dõi các sản phẩm bạn đã đặt mua</p>
            </div>

            {orders.length === 0 ? (
                <div className="card bg-zinc-900/50 border-dashed border-zinc-800 p-12 text-center">
                    <ShoppingBag size={48} className="mx-auto text-zinc-700 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Bạn chưa có đơn hàng nào</h3>
                    <p className="text-sm text-zinc-500 mb-6">Hãy ghé thăm cửa hàng để chọn phụ kiện luyện tập!</p>
                    <button className="btn-gold px-8" onClick={() => window.location.href = '/member/store'}>Đến Cửa Hàng</button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => {
                        const S = STATUS_MAP[order.status] || STATUS_MAP.pending
                        const Icon = S.icon
                        return (
                            <div key={order.id} className="card border-zinc-800 overflow-hidden group hover:border-zinc-700 transition-all">
                                <div className="bg-zinc-900/30 px-6 py-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Mã đơn hàng</div>
                                            <div className="text-sm font-bold text-white uppercase tracking-widest">#{order.id.toString().padStart(5, '0')}</div>
                                        </div>
                                        <div className="w-px h-8 bg-zinc-800 hidden sm:block" />
                                        <div>
                                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Ngày đặt</div>
                                            <div className="text-sm font-bold text-zinc-300">{new Date(order.created_at).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${S.bg} ${S.color}`}>
                                        <Icon size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{S.label}</span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4 mb-6">
                                        {order.items?.map(item => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0">
                                                    {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-4 text-zinc-600" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-white truncate">{item.product_name}</div>
                                                    <div className="text-xs text-zinc-500 mt-1">Số lượng: {item.quantity} × {Number(item.unit_price).toLocaleString('vi-VN')}₫</div>
                                                </div>
                                                <div className="text-sm font-bold text-white whitespace-nowrap">
                                                    {(item.quantity * item.unit_price).toLocaleString('vi-VN')}₫
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-800/50 uppercase font-bold tracking-widest">
                                        <div>
                                            <div className="text-[10px] text-zinc-500 mb-2 flex items-center gap-1.5"><MapPin size={12} /> Địa chỉ nhận hàng</div>
                                            <div className="text-[11px] text-zinc-300 normal-case font-medium">{order.shipping_address || 'Nhận tại quầy'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-zinc-500 mb-2 flex items-center gap-1.5"><CreditCard size={12} /> Phương thức</div>
                                            <div className="text-[11px] text-zinc-300">
                                                {order.payment_method === 'cash' ? 'Tại quầy' : 
                                                 order.payment_method === 'cod' ? 'Ship COD' : 'Chuyển khoản'}
                                            </div>
                                        </div>
                                        <div className="sm:text-right">
                                            <div className="text-[10px] text-zinc-500 mb-1 leading-none">
                                                {order.shipping_fee > 0 && <span>Gồm {Number(order.shipping_fee).toLocaleString('vi-VN')}₫ ship · </span>}
                                                Tổng thanh toán
                                            </div>
                                            <div className="text-xl text-yellow-500">{Number(order.total_amount).toLocaleString('vi-VN')}₫</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
