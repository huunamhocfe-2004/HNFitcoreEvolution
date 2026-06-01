import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const typeLabel = {
    system: 'Hệ thống',
    subscription: 'Gói tập',
    payment: 'Thanh toán',
    booking: 'Đặt lịch',
    feedback: 'Phản hồi',
    order: 'Đơn hàng',
    trial_request: 'Tập thử',
    checkin: 'Check-in',
}

export default function Notifications() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    const load = () => {
        setLoading(true)
        api.get('/notifications')
            .then(res => setItems(res.data))
            .catch(() => toast.error('Không tải được thông báo'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`)
            setItems(prev =>
                prev.map(item =>
                    item.id === id
                        ? { ...item, is_read: 1, read_at: new Date().toISOString() }
                        : item
                )
            )
        } catch (err) {
            toast.error('Không cập nhật được thông báo')
        }
    }

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all')
            setItems(prev =>
                prev.map(item => ({
                    ...item,
                    is_read: 1,
                    read_at: item.read_at || new Date().toISOString(),
                }))
            )
            toast.success('Đã đọc tất cả thông báo')
        } catch (err) {
            toast.error('Không cập nhật được thông báo')
        }
    }

    const unreadCount = items.filter(item => !item.is_read).length

    return (
        <div className="space-y-6 text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Thông báo
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {unreadCount} thông báo chưa đọc
                    </p>
                </div>

                <button
                    type="button"
                    onClick={markAllRead}
                    disabled={!unreadCount}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <CheckCheck size={16} /> Đọc tất cả
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="border-b border-slate-100 p-5">
                            <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
                        </div>
                    ))
                ) : items.length ? (
                    items.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => !item.is_read && markRead(item.id)}
                            className={`w-full border-b border-slate-100 p-5 text-left transition-colors last:border-b-0 ${
                                item.is_read
                                    ? 'bg-white hover:bg-slate-50'
                                    : 'bg-red-50/60 hover:bg-red-50'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border ${
                                        item.is_read
                                            ? 'border-slate-200 bg-slate-50 text-slate-400'
                                            : 'border-red-200 bg-red-50 text-red-600'
                                    }`}
                                >
                                    <Bell size={17} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-sm font-bold text-slate-900">
                                            {item.title}
                                        </h2>

                                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            {typeLabel[item.type] || item.type}
                                        </span>
                                    </div>

                                    {item.message && (
                                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                            {item.message}
                                        </p>
                                    )}

                                    <div className="mt-2 text-[10px] font-bold text-slate-400">
                                        {new Date(item.created_at).toLocaleString('vi-VN')}
                                    </div>
                                </div>

                                {!item.is_read && (
                                    <span className="mt-2 h-2 w-2 rounded-full bg-red-500" />
                                )}
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="py-16 text-center">
                        <Bell size={36} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-sm text-slate-500">
                            Chưa có thông báo nào.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}