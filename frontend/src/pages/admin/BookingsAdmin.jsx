import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { CheckSquare, XCircle, Calendar } from 'lucide-react'

const statusBadge = s => ({
    pending: <span className="badge badge-yellow">Chờ</span>,
    confirmed: <span className="badge badge-blue">Xác nhận</span>,
    cancelled: <span className="badge badge-red">Hủy</span>,
    completed: <span className="badge badge-green">Hoàn thành</span>,
}[s] || <span className="badge badge-gray">{s}</span>)

export default function BookingsAdmin() {
    const [bookings, setBookings] = useState([])
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('bookings')

    const load = () => {
        setLoading(true)
        Promise.all([api.get('/bookings'), api.get('/bookings/classes')])
            .then(([b, c]) => { setBookings(b.data); setClasses(c.data) })
            .finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const updateStatus = async (id, status) => {
        await api.patch(`/bookings/${id}/status`, { status })
        toast.success('Đã cập nhật trạng thái'); load()
    }

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    const typeColors = { yoga: 'badge-green', zumba: 'badge-blue', boxing: 'badge-red', crossfit: 'badge-yellow', cycling: 'badge-gray', other: 'badge-gray' }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-black text-white">Đặt Lịch Tập</h1>
                <p className="text-sm text-gray-500 mt-1">Quản lý lịch lớp học của hội viên</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                {['bookings', 'classes'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}>
                        {t === 'bookings' ? 'Lịch đặt' : 'Lịch lớp học'}
                    </button>
                ))}
            </div>

            {tab === 'bookings' && (
                <div className="card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="tbl">
                            <thead><tr><th>Hội viên</th><th>Chi tiết lớp</th><th>Ngày</th><th>Giờ</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                            <tbody>
                                {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton h-4 w-full" /></td></tr>)
                                    : bookings.map(b => (
                                        <tr key={b.id}>
                                            <td>
                                                <div className="font-medium text-white text-sm">{b.member_name}</div>
                                                <div className="text-xs text-gray-500">{b.member_phone}</div>
                                            </td>
                                            <td className="text-sm text-gray-300">{b.class_title || '—'}</td>
                                            <td className="text-sm text-gray-400">{new Date(b.booking_date).toLocaleDateString('vi-VN')}</td>
                                            <td className="text-sm text-gray-400">{b.time_slot || '—'}</td>
                                            <td>{statusBadge(b.status)}</td>
                                            <td>
                                                <div className="flex gap-1">
                                                    {b.status === 'pending' && <>
                                                        <button onClick={() => updateStatus(b.id, 'confirmed')}
                                                            className="p-1.5 rounded hover:bg-green-900/20 text-gray-400 hover:text-green-400" title="Xác nhận">
                                                            <CheckSquare size={14} />
                                                        </button>
                                                        <button onClick={() => updateStatus(b.id, 'cancelled')}
                                                            className="p-1.5 rounded hover:bg-red-900/20 text-gray-400 hover:text-red-400" title="Hủy">
                                                            <XCircle size={14} />
                                                        </button>
                                                    </>}
                                                    {b.status === 'confirmed' && (
                                                        <button onClick={() => updateStatus(b.id, 'completed')}
                                                            className="p-1.5 rounded hover:bg-blue-900/20 text-gray-400 hover:text-blue-400" title="Hoàn thành">
                                                            <Calendar size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                {!loading && bookings.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-600">Chưa có lịch đặt</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'classes' && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map(c => (
                        <div key={c.id} className="card hover:border-yellow-600/40 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`badge ${typeColors[c.class_type] || 'badge-gray'} uppercase text-xs`}>{c.class_type}</span>
                                <span className="text-xs text-gray-500">{dayNames[c.day_of_week]}</span>
                            </div>
                            <div className="font-bold text-white">{c.title}</div>
                            <div className="text-sm text-gray-400 mt-1">{c.trainer_name || 'Chưa phân công'}</div>
                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                <span>🕐 {c.start_time} ({c.duration_min}p)</span>
                                <span className={`font-medium ${c.today_bookings >= c.max_capacity ? 'text-red-400' : 'text-green-400'}`}>
                                    {c.today_bookings}/{c.max_capacity} chỗ
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
