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
            setItems(prev => prev.map(item => item.id === id ? { ...item, is_read: 1, read_at: new Date().toISOString() } : item))
        } catch (err) {
            toast.error('Không cập nhật được thông báo')
        }
    }

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all')
            setItems(prev => prev.map(item => ({ ...item, is_read: 1, read_at: item.read_at || new Date().toISOString() })))
            toast.success('Đã đọc tất cả thông báo')
        } catch (err) {
            toast.error('Không cập nhật được thông báo')
        }
    }

    const unreadCount = items.filter(item => !item.is_read).length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white">Thông báo</h1>
                    <p className="text-sm text-zinc-500 mt-1">{unreadCount} thông báo chưa đọc</p>
                </div>
                <button
                    type="button"
                    onClick={markAllRead}
                    disabled={!unreadCount}
                    className="btn-gold px-4 py-2 text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 disabled:opacity-50"
                >
                    <CheckCheck size={16} /> Đọc tất cả
                </button>
            </div>

            <div className="card p-0 overflow-hidden">
                {loading ? [...Array(5)].map((_, i) => (
                    <div key={i} className="p-5 border-b border-zinc-900">
                        <div className="skeleton h-5 w-full" />
                    </div>
                )) : items.length ? items.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => !item.is_read && markRead(item.id)}
                        className={`w-full text-left p-5 border-b border-zinc-900 last:border-b-0 transition-colors ${
                            item.is_read ? 'bg-transparent hover:bg-zinc-900/30' : 'bg-yellow-500/5 hover:bg-yellow-500/10'
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center border ${
                                item.is_read ? 'text-zinc-600 border-zinc-800 bg-zinc-900' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10'
                            }`}>
                                <Bell size={17} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-sm font-bold text-white">{item.title}</h2>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        {typeLabel[item.type] || item.type}
                                    </span>
                                </div>
                                {item.message && <p className="text-sm text-zinc-400 mt-1">{item.message}</p>}
                                <div className="text-[10px] text-zinc-600 font-bold mt-2">
                                    {new Date(item.created_at).toLocaleString('vi-VN')}
                                </div>
                            </div>
                            {!item.is_read && <span className="mt-2 h-2 w-2 rounded-full bg-yellow-500" />}
                        </div>
                    </button>
                )) : (
                    <div className="text-center py-16">
                        <Bell size={36} className="mx-auto text-zinc-800 mb-3" />
                        <p className="text-sm text-zinc-600">Chưa có thông báo nào.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
