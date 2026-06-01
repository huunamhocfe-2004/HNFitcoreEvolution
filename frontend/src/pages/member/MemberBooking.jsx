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
        const localDate = new Date()
        const year = localDate.getFullYear()
        const month = String(localDate.getMonth() + 1).padStart(2, '0')
        const day = String(localDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`

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
        pending: (
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                Chờ xác nhận
            </span>
        ),
        confirmed: (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                Đã xác nhận
            </span>
        ),
        cancelled: (
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                Đã hủy
            </span>
        ),
        completed: (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                Hoàn thành
            </span>
        ),
    }[s] || (
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
            {s}
        </span>
    ))

    if (loading) {
        return (
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
        )
    }

    return (
        <div className="space-y-6 text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Đặt Lịch Tập
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Sắp xếp thời gian tập luyện của bạn
                    </p>
                </div>
            </div>

            <div className="flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm shadow-slate-200/70">
                <button
                    onClick={() => setTab('classes')}
                    className={`rounded-lg px-4 py-2 text-xs font-black transition-all ${
                        tab === 'classes'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                    }`}
                >
                    LỚP HỌC HÔM NAY
                </button>

                <button
                    onClick={() => setTab('my-bookings')}
                    className={`rounded-lg px-4 py-2 text-xs font-black transition-all ${
                        tab === 'my-bookings'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                    }`}
                >
                    LỊCH CỦA TÔI
                </button>
            </div>

            {tab === 'classes' && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {classes.map(cls => {
                        const alreadyBooked = bookings.some(
                            b =>
                                b.class_id === cls.id &&
                                b.status !== 'cancelled' &&
                                new Date(b.booking_date).toLocaleDateString() === new Date().toLocaleDateString()
                        )

                        const isFull = cls.today_bookings >= cls.max_capacity
                        const canBook = !isFull && !alreadyBooked

                        return (
                            <div
                                key={cls.id}
                                className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 transition-all duration-300 hover:border-red-200 hover:shadow-lg"
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-black uppercase text-red-600">
                                        {cls.class_type}
                                    </span>

                                    <span className="text-[10px] font-bold text-slate-400">
                                        {dayNames[cls.day_of_week]}
                                    </span>
                                </div>

                                <h3 className="mb-1 text-lg font-black text-slate-900 transition-colors group-hover:text-red-600">
                                    {cls.title}
                                </h3>

                                <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
                                    <User size={12} className="text-slate-400" />
                                    {cls.trainer_name || 'Huấn luyện viên'}
                                </div>

                                <div className="mb-6 space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <Clock size={14} className="text-red-600" />
                                        {cls.start_time} - {cls.duration_min} phút
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <Info size={14} className="text-red-600" />
                                        {cls.today_bookings}/{cls.max_capacity} chỗ đã đặt
                                    </div>
                                </div>

                                <button
                                    onClick={() => bookClass(cls)}
                                    disabled={!canBook}
                                    className={`mt-auto w-full rounded-xl py-2.5 text-xs font-black transition-all ${
                                        canBook
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-200 hover:bg-red-500 active:scale-95'
                                            : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    {alreadyBooked
                                        ? 'BẠN ĐÃ ĐẶT CHỖ'
                                        : isFull
                                            ? 'ĐÃ HẾT CHỖ'
                                            : 'ĐẶT CHỖ NGAY'}
                                </button>
                            </div>
                        )
                    })}

                    {classes.length === 0 && (
                        <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm shadow-slate-200/70">
                            <CalendarDays size={44} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-sm text-slate-500">
                                Hôm nay chưa có lớp học nào.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {tab === 'my-bookings' && (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Loại lịch
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Chi tiết
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Ngày/Giờ
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {bookings.length > 0 ? bookings.map(b => (
                                    <tr
                                        key={b.id}
                                        className="transition-colors hover:bg-red-50/40"
                                    >
                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${
                                                    b.booking_type === 'pt'
                                                        ? 'border-orange-200 bg-orange-50 text-orange-600'
                                                        : 'border-blue-200 bg-blue-50 text-blue-600'
                                                }`}
                                            >
                                                {b.booking_type}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-900">
                                                {b.class_title || b.trainer_name || '—'}
                                            </div>
                                            <div className="text-[10px] font-bold uppercase text-slate-400">
                                                {b.booking_type === 'class'
                                                    ? b.class_type
                                                    : b.trainer_specialization}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-700">
                                                {new Date(b.booking_date).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400">
                                                {b.time_slot || b.start_time}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {statusBadge(b.status)}
                                        </td>

                                        <td className="px-6 py-4">
                                            {b.status === 'pending' || b.status === 'confirmed' ? (
                                                <button
                                                    onClick={() => cancelBooking(b.id)}
                                                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100 hover:text-red-700"
                                                    title="Hủy lịch"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            ) : (
                                                <CheckCircle size={18} className="text-slate-300" />
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-slate-500">
                                            <CalendarDays size={48} className="mx-auto mb-4 text-slate-300" />
                                            <p className="text-xs font-black uppercase tracking-widest">
                                                Bạn chưa có lịch tập nào
                                            </p>
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