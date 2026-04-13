import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { ScanLine, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import SearchInput from '../../components/layout/searchInput'
import { QRCodeSVG } from 'qrcode.react'

export default function CheckIn() {
    const [qrInput, setQrInput] = useState('')
    const [manualInput, setManualInput] = useState('')
    const [recentCheckins, setRecentCheckins] = useState([])
    const [loading, setLoading] = useState(false)

    // Load today's checkins from members list
    const loadRecent = () => {
        api.get('/members').then(r => {
            // Filter active ones as recent proxy – real implementation would use GET /checkins
            setRecentCheckins(r.data.filter(m => m.status === 'active').slice(0, 15))
        })
    }
    useEffect(() => { loadRecent() }, [])

    const doCheckin = async code => {
        if (!code.trim()) return
        setLoading(true)
        try {
            await api.post('/members/checkin', { qr_code: code.trim(), method: 'qr' })
            toast.success('✅ Check-in thành công!')
            setQrInput(''); setManualInput(''); loadRecent()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không tìm thấy hội viên')
        } finally { setLoading(false) }
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-black text-white">Check-in Hội Viên</h1>
                <p className="text-sm text-gray-500 mt-1">Quét QR hoặc nhập mã thủ công</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* QR Scanner simulation */}
                <div className="card text-center">
                    <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
                        <ScanLine size={22} color="#eab308" />
                    </div>
                    <h3 className="font-bold text-white mb-2">Quét QR Code</h3>
                    <p className="text-xs text-gray-500 mb-4">Nhập mã QR từ thẻ hội viên</p>
                    <input
                        className="input-dark text-sm text-center mb-3"
                        placeholder="Quét hoặc nhập mã QR... (vd: FC-000001)"
                        value={qrInput}
                        onChange={e => setQrInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && doCheckin(qrInput)}
                        autoFocus
                    />
                    <button onClick={() => doCheckin(qrInput)} disabled={loading || !qrInput}
                        className="btn-gold w-full text-sm">
                        {loading ? 'Đang xử lý...' : 'Check-in'}
                    </button>
                </div>

                {/* Manual search */}
                <div className="card">
                    <h3 className="font-bold text-white mb-3">Check-in Thủ Công</h3>
                    <div className="relative mb-3">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            className="input-dark text-sm pl-9"
                            placeholder="Nhập tên, SĐT hoặc mã QR..."
                            value={manualInput}
                            onChange={e => setManualInput(e.target.value)}
                        />
                    </div>
                    {/* Sample QR for demo */}
                    <div className="mt-4 p-3 rounded-lg text-center" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
                        <div className="text-xs text-gray-600 mb-2">Ví dụ QR hội viên:</div>
                        <div className="inline-block p-2 rounded-lg bg-white">
                            <QRCodeSVG value="FC-000001" size={80} />
                        </div>
                        <div className="text-xs text-gray-500 mt-2 font-mono">FC-000001</div>
                        <button onClick={() => doCheckin('FC-000001')} className="btn-ghost text-xs mt-2 py-1 px-3">
                            Dùng mã demo này
                        </button>
                    </div>
                </div>
            </div>

            {/* Active members quick list */}
            <div className="card">
                <h3 className="font-bold text-white mb-4">Hội viên đang hoạt động</h3>
                <div className="overflow-x-auto">
                    <table className="tbl">
                        <thead><tr><th>Hội viên</th><th>QR Code</th><th>Gói tập</th><th>Hết hạn</th><th></th></tr></thead>
                        <tbody>
                            {recentCheckins.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                                style={{ background: '#1f1f1f', color: '#eab308' }}>{m.name?.[0]}</div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{m.name}</div>
                                                <div className="text-xs text-gray-500">{m.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="font-mono text-xs text-gray-400">{m.qr_code}</span></td>
                                    <td className="text-xs text-gray-400">{m.current_package || '—'}</td>
                                    <td className="text-xs text-gray-400">
                                        {m.package_expires ? new Date(m.package_expires).toLocaleDateString('vi-VN') : '—'}
                                    </td>
                                    <td>
                                        <button onClick={() => doCheckin(m.qr_code)} className="btn-gold py-1 px-3 text-xs">
                                            Check-in
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
