import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { QRCodeCanvas } from 'qrcode.react'
import { ArrowLeft, User, Calendar, Phone, Mail, CreditCard, Download } from 'lucide-react'

const statusBadge = s => ({
    active: (
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
            Đang tập
        </span>
    ),
    expired: (
        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
            Hết hạn
        </span>
    ),
    paused: (
        <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
            Tạm dừng
        </span>
    ),
}[s])

export default function MemberDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [member, setMember] = useState(null)
    const [tab, setTab] = useState('info')
    const qrRef = useRef(null)

    useEffect(() => {
        api.get(`/members/${id}`).then(r => setMember(r.data))
    }, [id])

    if (!member) {
        return (
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
        )
    }

    const tabs = ['info', 'subscriptions', 'checkins']

    const downloadQr = () => {
        const qrCanvas = qrRef.current
        if (!qrCanvas) return

        const canvas = document.createElement('canvas')
        canvas.width = 640
        canvas.height = 640
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(qrCanvas, 40, 40, 560, 560)

        const link = document.createElement('a')
        link.download = `${member.qr_code || `FC-${id}`}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
    }

    const tabLabels = {
        info: 'Thông tin',
        subscriptions: 'Gói tập',
        checkins: 'Check-in',
    }

    return (
        <div className="space-y-5 text-slate-900">
            <button
                onClick={() => navigate('/admin/members')}
                className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-red-600"
            >
                <ArrowLeft size={15} /> Quay lại danh sách
            </button>

            {/* Header card */}
            <div className="flex flex-col items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 md:flex-row md:items-center">
                <div className="flex h-16 w-16 aspect-square shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-2xl font-black">
                    {member.avatar ? (
                        <img
                            src={member.avatar}
                            alt={member.name}
                            className="block h-full w-full object-cover object-center"
                        />
                    ) : (
                        <span className="text-red-600">{member.name?.[0]}</span>
                    )}
                </div>

                <div className="flex-1">
                    <h1 className="text-xl font-black text-slate-900">
                        {member.name}
                    </h1>

                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                            <Mail size={13} />
                            {member.email}
                        </span>
                        <span className="flex items-center gap-1">
                            <Phone size={13} />
                            {member.phone || '—'}
                        </span>
                    </div>

                    <div className="mt-3">{statusBadge(member.status)}</div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <QRCodeCanvas
                            ref={qrRef}
                            value={member.qr_code || `FC-${id}`}
                            size={96}
                        />
                    </div>

                    <span className="text-xs font-mono text-slate-500">
                        {member.qr_code}
                    </span>

                    <button
                        type="button"
                        onClick={downloadQr}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-red-200 transition hover:bg-red-500"
                    >
                        <Download size={12} /> Tải QR
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                {tabs.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-colors ${
                            tab === t
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                    >
                        {tabLabels[t]}
                    </button>
                ))}
            </div>

            {/* Info tab */}
            {tab === 'info' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                    <div className="grid gap-4 text-sm sm:grid-cols-2">
                        {[
                            {
                                label: 'Họ tên',
                                value: member.name,
                                icon: User,
                            },
                            {
                                label: 'Ngày sinh',
                                value: member.birth_date
                                    ? new Date(member.birth_date).toLocaleDateString('vi-VN')
                                    : '—',
                                icon: Calendar,
                            },
                            {
                                label: 'CCCD',
                                value: member.id_card || '—',
                                icon: CreditCard,
                            },
                            {
                                label: 'Ngày tham gia',
                                value: member.joined_date
                                    ? new Date(member.joined_date).toLocaleDateString('vi-VN')
                                    : '—',
                                icon: Calendar,
                            },
                        ].map(({ label, value, icon: Icon }) => (
                            <div
                                key={label}
                                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                            >
                                <Icon
                                    size={15}
                                    className="mt-0.5 shrink-0 text-red-600"
                                />
                                <div>
                                    <div className="text-xs font-semibold text-slate-500">
                                        {label}
                                    </div>
                                    <div className="mt-0.5 font-bold text-slate-900">
                                        {value}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {member.notes && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">
                                Ghi chú:
                            </span>
                            {member.notes}
                        </div>
                    )}
                </div>
            )}

            {/* Subscriptions tab */}
            {tab === 'subscriptions' && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Gói tập
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Bắt đầu
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Kết thúc
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Thanh toán
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Số tiền
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {member.subscriptions?.length ? (
                                    member.subscriptions.map(s => (
                                        <tr
                                            key={s.id}
                                            className="transition-colors hover:bg-red-50/40"
                                        >
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {s.title}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(s.start_date).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(s.end_date).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {s.is_paid ? (
                                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                                                        Đã trả
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                                                        Chưa trả
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-red-600">
                                                {Number(s.amount_paid).toLocaleString('vi-VN')}₫
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-8 text-center text-slate-500"
                                        >
                                            Chưa có gói tập
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Checkins tab */}
            {tab === 'checkins' && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Thời gian check-in
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Phương thức
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {member.checkins?.length ? (
                                    member.checkins.map(c => (
                                        <tr
                                            key={c.id}
                                            className="transition-colors hover:bg-red-50/40"
                                        >
                                            <td className="px-6 py-4 text-slate-700">
                                                {new Date(c.checked_in_at).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                                                    {c.method}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={2}
                                            className="px-6 py-8 text-center text-slate-500"
                                        >
                                            Chưa có lịch sử check-in
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