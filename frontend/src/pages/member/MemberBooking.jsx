import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { CalendarDays, User, Clock, CheckCircle, XCircle, Info } from 'lucide-react'

export default function MemberBooking() {
    const { user } = useAuth()
    const [classes, setClasses] = useState([])
    const [trainers, setTrainers] = useState([])
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('classes')

    const loadData = async () => {
        if (!user?.member_id) return
        try {
            const [c, t, b] = await Promise.all([
                api.get('/bookings/classes'),
                api.get('/bookings/trainers'),
                api.get(`/bookings?member_id=${user.member_id}`)
            ])
            setClasses(c.data)
            setTrainers(t.data)
            setBookings(b.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [user])

    const bookClass = async (cls) => {
        const localDate = new Date();
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        try {
            await api.post('/bookings', {
                member_id: user.member_id,
                booking_type: 'class',
                class_id: cls.id,
                booking_date: dateStr,
            })
            toast.success(`Đã đăng ký lớp ${cls.title}!`)
            loadData()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi đặt lớp')
        }
    }

    const cancelBooking = async (id) => {
        if (!confirm('Hủy đặt lịch này?')) return
        try {
            await api.patch(`/bookings/${id}/status`, { status: 'cancelled' })
            toast.success('Đã hủy lịch đặt')
            loadData()
        } catch (err) {
            toast.error('Lỗi khi hủy')
        }
    }

    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    const statusBadge = s => ({
        pending: <span className="badge badge-yellow">Chờ xác nhận</span>,
        confirmed: <span className="badge badge-blue">Đã xác nhận</span>,
        cancelled: <span className="badge badge-red">Đã hủy</span>,
        completed: <span className="badge badge-green">Hoàn thành</span>,
    }[s])

    if (loading) return <div className="skeleton h-96 rounded-2xl" />

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Đặt Lịch Tập</h1>
                    <p className="text-sm text-gray-500 mt-1">Sắp xếp thời gian tập luyện của bạn</p>
                </div>
            </div>

            <div className="flex gap-1 p-1 rounded-lg w-fit bg-zinc-900 border border-zinc-800">
                <button onClick={() => setTab('classes')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${tab === 'classes' ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white'}`}>LỚP HỌC HÔM NAY</button>
                <button onClick={() => setTab('my-bookings')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${tab === 'my-bookings' ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white'}`}>LỊCH CỦA TÔI</button>
            </div>

            {tab === 'classes' && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map(cls => (
                        <div key={cls.id} className="card bg-zinc-900/50 border-zinc-800 p-6 hover:border-yellow-500/30 transition-all flex flex-col group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="badge badge-yellow uppercase text-[10px]! font-bold">{cls.class_type}</span>
                                <span className="text-[10px] font-bold text-zinc-600">{dayNames[cls.day_of_week]}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-yellow-500 transition-colors">{cls.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                                <User size={12} className="text-zinc-700" /> {cls.trainer_name || 'Huấn luyện viên'}
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <Clock size={14} className="text-yellow-500" /> {cls.start_time} - {cls.duration_min} phút
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <Info size={14} className="text-yellow-500" /> {cls.today_bookings}/{cls.max_capacity} chỗ đã đặt
                                </div>
                            </div>

                            <button
                                onClick={() => bookClass(cls)}
                                disabled={cls.today_bookings >= cls.max_capacity || bookings.some(b => b.class_id === cls.id && b.status !== 'cancelled' && new Date(b.booking_date).toLocaleDateString() === new Date().toLocaleDateString())}
                                className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all ${cls.today_bookings < cls.max_capacity && !bookings.some(b => b.class_id === cls.id && b.status !== 'cancelled' && new Date(b.booking_date).toLocaleDateString() === new Date().toLocaleDateString())
                                    ? 'bg-yellow-500 text-black hover:bg-yellow-600 active:scale-95'
                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                    }`}
                            >
                                {bookings.some(b => b.class_id === cls.id && b.status !== 'cancelled' && new Date(b.booking_date).toLocaleDateString() === new Date().toLocaleDateString())
                                    ? 'BẠN ĐÃ ĐẶT CHỖ'
                                    : cls.today_bookings >= cls.max_capacity ? 'ĐÃ HẾT CHỖ' : 'ĐẶT CHỖ NGAY'}
                            </button>
                        </div>
                    ))}
                </div>
            )}


            {tab === 'my-bookings' && (
                <div className="card p-0 overflow-hidden border-zinc-800 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="tbl">
                            <thead>
                                <tr className="bg-zinc-900/80">
                                    <th className="text-[10px]! font-bold!uppercase tracking-widest">Loại lịch</th>
                                    <th className="text-[10px]! font-black! uppercase tracking-widest">Chi tiết</th>
                                    <th className="text-[10px]! font-black! uppercase tracking-widest">Ngày/Giờ</th>
                                    <th className="text-[10px]! font-black! uppercase tracking-widest">Trạng thái</th>
                                    <th className="text-[10px]! font-black! uppercase tracking-widest">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length > 0 ? bookings.map(b => (
                                    <tr key={b.id} className="border-zinc-900 hover:bg-zinc-900/20 transition-colors">
                                        <td>
                                            <span className={`badge ${b.booking_type === 'pt' ? 'badge-yellow' : 'badge-blue'} text-[10px]! font-bold uppercase`}>
                                                {b.booking_type}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="font-bold text-white text-sm">{b.class_title || b.trainer_name || '—'}</div>
                                            <div className="text-[10px] text-zinc-600 font-bold uppercase">{b.booking_type === 'class' ? b.class_type : b.trainer_specialization}</div>
                                        </td>
                                        <td>
                                            <div className="text-sm text-zinc-300 font-medium">{new Date(b.booking_date).toLocaleDateString('vi-VN')}</div>
                                            <div className="text-[10px] text-zinc-600 font-bold">{b.time_slot || b.start_time}</div>
                                        </td>
                                        <td>{statusBadge(b.status)}</td>
                                        <td>
                                            {b.status === 'pending' || b.status === 'confirmed' ? (
                                                <button
                                                    onClick={() => cancelBooking(b.id)}
                                                    className="p-2 rounded-lg bg-red-950/20 text-red-700 hover:text-red-500 hover:bg-red-950/40 transition-all border border-red-900/10"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            ) : (
                                                <CheckCircle size={18} className="text-zinc-800" />
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-20 text-zinc-600">
                                            <CalendarDays size={48} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-bold uppercase tracking-widest text-xs">Bạn chưa có lịch tập nào</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
