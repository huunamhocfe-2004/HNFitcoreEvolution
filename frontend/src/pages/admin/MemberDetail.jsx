import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { QRCodeCanvas } from 'qrcode.react'
import { ArrowLeft, User, Calendar, Phone, Mail, CreditCard, Download } from 'lucide-react'

const statusBadge = s => ({
    active: <span className="badge badge-green">Đang tập</span>,
    expired: <span className="badge badge-red">Hết hạn</span>,
    paused: <span className="badge badge-yellow">Tạm dừng</span>,
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

    if (!member) return <div className="skeleton h-96 rounded-xl" />

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
    const tabLabels = { info: 'Thông tin', subscriptions: 'Gói tập', checkins: 'Check-in' }

    return (
        <div>
            <button onClick={() => navigate('/admin/members')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-4 transition-colors">
                <ArrowLeft size={15} /> Quay lại danh sách
            </button>

            {/* Header card */}
            <div className="card mb-4 flex flex-col md:flex-row items-start md:items-center gap-5">
                <div className="h-16 w-16 aspect-square rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black shrink-0 bg-zinc-900 border border-zinc-800">
                    {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="block h-full w-full object-cover object-center" />
                    ) : (
                        <span className="text-yellow-500">{member.name?.[0]}</span>
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-white">{member.name}</h1>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><Mail size={13} />{member.email}</span>
                        <span className="flex items-center gap-1"><Phone size={13} />{member.phone || '—'}</span>
                    </div>
                    <div className="mt-2">{statusBadge(member.status)}</div>
                </div>
                {/* QR Code */}
                <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-xl" style={{ background: '#fff' }}>
                        <QRCodeCanvas ref={qrRef} value={member.qr_code || `FC-${id}`} size={96} />
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{member.qr_code}</span>
                    <button
                        type="button"
                        onClick={downloadQr}
                        className="btn-gold px-3 py-1.5 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5"
                    >
                        <Download size={12} /> Tải QR
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                {tabs.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
                            }`}>
                        {tabLabels[t]}
                    </button>
                ))}
            </div>

            {/* Info tab */}
            {tab === 'info' && (
                <div className="card">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        {[
                            { label: 'Họ tên', value: member.name, icon: User },
                            { label: 'Ngày sinh', value: member.birth_date ? new Date(member.birth_date).toLocaleDateString('vi-VN') : '—', icon: Calendar },
                            { label: 'CCCD', value: member.id_card || '—', icon: CreditCard },
                            { label: 'Ngày tham gia', value: member.joined_date ? new Date(member.joined_date).toLocaleDateString('vi-VN') : '—', icon: Calendar },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#111' }}>
                                <Icon size={15} className="mt-0.5 shrink-0" style={{ color: '#eab308' }} />
                                <div>
                                    <div className="text-xs text-gray-500">{label}</div>
                                    <div className="font-medium text-white mt-0.5">{value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {member.notes && (
                        <div className="mt-4 p-3 rounded-lg text-sm text-gray-400" style={{ background: '#111' }}>
                            <span className="text-gray-600 text-xs block mb-1">Ghi chú:</span>
                            {member.notes}
                        </div>
                    )}
                </div>
            )}

            {/* Subscriptions tab */}
            {tab === 'subscriptions' && (
                <div className="card p-0 overflow-hidden">
                    <table className="tbl">
                        <thead><tr><th>Gói tập</th><th>Bắt đầu</th><th>Kết thúc</th><th>Thanh toán</th><th>Số tiền</th></tr></thead>
                        <tbody>
                            {member.subscriptions?.length ? member.subscriptions.map(s => (
                                <tr key={s.id}>
                                    <td className="font-medium text-white">{s.title}</td>
                                    <td className="text-gray-400">{new Date(s.start_date).toLocaleDateString('vi-VN')}</td>
                                    <td className="text-gray-400">{new Date(s.end_date).toLocaleDateString('vi-VN')}</td>
                                    <td>{s.is_paid ? <span className="badge badge-green">Đã trả</span> : <span className="badge badge-red">Chưa trả</span>}</td>
                                    <td className="text-yellow-400 font-semibold">{Number(s.amount_paid).toLocaleString('vi-VN')}₫</td>
                                </tr>
                            )) : <tr><td colSpan={5} className="text-center py-8 text-gray-600">Chưa có gói tập</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Checkins tab */}
            {tab === 'checkins' && (
                <div className="card p-0 overflow-hidden">
                    <table className="tbl">
                        <thead><tr><th>Thời gian check-in</th><th>Phương thức</th></tr></thead>
                        <tbody>
                            {member.checkins?.length ? member.checkins.map(c => (
                                <tr key={c.id}>
                                    <td className="text-gray-300">{new Date(c.checked_in_at).toLocaleString('vi-VN')}</td>
                                    <td><span className="badge badge-blue">{c.method}</span></td>
                                </tr>
                            )) : <tr><td colSpan={2} className="text-center py-8 text-gray-600">Chưa có lịch sử check-in</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
