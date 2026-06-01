import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { Package, Truck, CheckCircle, Clock, ShoppingBag, MapPin, CreditCard } from 'lucide-react'

const STATUS_MAP = {
    pending: {
        label: 'Chờ xử lý',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: Clock,
    },
    confirmed: {
        label: 'Đã xác nhận',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: CheckCircle,
    },
    processing: {
        label: 'Đang được giao',
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        icon: Truck,
    },
    delivered: {
        label: 'Hoàn thành',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: CheckCircle,
    },
    cancelled: {
        label: 'Đã hủy',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: Package,
    },
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

    if (loading) {
        return (
            <div className="space-y-4 p-8">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-48 animate-pulse rounded-2xl bg-slate-200"
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6 text-slate-900">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                    Lịch sử đơn hàng
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Theo dõi các sản phẩm bạn đã đặt mua
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm shadow-slate-200/70">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                        <ShoppingBag size={36} className="text-slate-400" />
                    </div>

                    <h3 className="mb-2 text-lg font-black text-slate-900">
                        Bạn chưa có đơn hàng nào
                    </h3>

                    <p className="mb-6 text-sm text-slate-500">
                        Hãy ghé thăm cửa hàng để chọn phụ kiện luyện tập!
                    </p>

                    <button
                        className="rounded-xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                        onClick={() => window.location.href = '/member/store'}
                    >
                        Đến cửa hàng
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => {
                        const S = STATUS_MAP[order.status] || STATUS_MAP.pending
                        const Icon = S.icon

                        return (
                            <div
                                key={order.id}
                                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70 transition-all hover:border-red-200 hover:shadow-lg"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-slate-500">
                                                Mã đơn hàng
                                            </div>
                                            <div className="text-sm font-black uppercase tracking-widest text-slate-900">
                                                #{order.id.toString().padStart(5, '0')}
                                            </div>
                                        </div>

                                        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                                        <div>
                                            <div className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-slate-500">
                                                Ngày đặt
                                            </div>
                                            <div className="text-sm font-bold text-slate-700">
                                                {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${S.bg} ${S.color} ${S.border}`}
                                    >
                                        <Icon size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {S.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-6 space-y-4">
                                        {order.items?.map(item => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                                            >
                                                <div className="h-16 w-16 aspect-square shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                                    {item.image_url ? (
                                                        <img
                                                            src={item.image_url}
                                                            className="block h-full w-full object-cover object-center"
                                                            alt={item.product_name}
                                                        />
                                                    ) : (
                                                        <Package className="h-full w-full p-4 text-slate-400" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-bold text-slate-900">
                                                        {item.product_name}
                                                    </div>
                                                    <div className="mt-1 text-xs text-slate-500">
                                                        Số lượng: {item.quantity} x {Number(item.unit_price).toLocaleString('vi-VN')}đ
                                                    </div>
                                                </div>

                                                <div className="whitespace-nowrap text-sm font-black text-red-600">
                                                    {(item.quantity * item.unit_price).toLocaleString('vi-VN')}đ
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid gap-6 border-t border-slate-200 pt-6 font-bold uppercase tracking-widest sm:grid-cols-3">
                                        <div>
                                            <div className="mb-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                                                <MapPin size={12} /> Địa chỉ nhận hàng
                                            </div>
                                            <div className="text-[11px] font-medium normal-case text-slate-700">
                                                {order.shipping_address || 'Nhận tại quầy'}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="mb-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                                                <CreditCard size={12} /> Phương thức
                                            </div>
                                            <div className="text-[11px] text-slate-700">
                                                {order.payment_method === 'cash' ? 'Tại quầy' :
                                                    order.payment_method === 'cod' ? 'Ship COD' : 'Chuyển khoản'}
                                            </div>
                                        </div>

                                        <div className="sm:text-right">
                                            <div className="mb-1 text-[10px] leading-none text-slate-500">
                                                {order.shipping_fee > 0 && (
                                                    <span>
                                                        Gồm {Number(order.shipping_fee).toLocaleString('vi-VN')}đ ship -{' '}
                                                    </span>
                                                )}
                                                Tổng thanh toán
                                            </div>
                                            <div className="text-xl font-black text-red-600">
                                                {Number(order.total_amount).toLocaleString('vi-VN')}đ
                                            </div>
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