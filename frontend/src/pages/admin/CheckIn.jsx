import { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'
import { AlertTriangle, Camera, CameraOff, RefreshCw, ScanLine, Search, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import jsQR from 'jsqr'

const normalizeQrCode = code => {
    const value = String(code || '').trim()
    if (!value) return ''

    const match = value.match(/FC-\d{6,}/i)
    return match ? match[0].toUpperCase() : value
}

const formatDateTime = value => {
    if (!value) return '-'
    return new Date(value).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false,
    })
}

export default function CheckIn() {
    const [qrInput, setQrInput] = useState('')
    const [manualInput, setManualInput] = useState('')
    const [activeMembers, setActiveMembers] = useState([])
    const [checkinHistory, setCheckinHistory] = useState([])
    const [lastCheckin, setLastCheckin] = useState(null)
    const [blockedCheckin, setBlockedCheckin] = useState(null)
    const [loading, setLoading] = useState(false)
    const [renewing, setRenewing] = useState(false)
    const [scannerActive, setScannerActive] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const [scannerMessage, setScannerMessage] = useState('Bật camera để quét mã QR trên thẻ hội viên')
    const [uploadedQrName, setUploadedQrName] = useState('')

    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const uploadInputRef = useRef(null)
    const streamRef = useRef(null)
    const detectorRef = useRef(null)
    const scanTimerRef = useRef(null)
    const scanningRef = useRef(false)
    const checkingRef = useRef(false)

    const loadActiveMembers = () => {
        api.get('/members').then(r => {
            setActiveMembers(r.data.filter(m => m.status === 'active').slice(0, 15))
        })
    }

    const loadCheckinHistory = () => {
        api.get('/members/checkins/recent?limit=20').then(r => {
            setCheckinHistory(r.data)
        })
    }

    useEffect(() => {
        loadActiveMembers()
        loadCheckinHistory()
    }, [])

    const releaseScannerResources = () => {
        scanningRef.current = false

        if (scanTimerRef.current) {
            window.clearTimeout(scanTimerRef.current)
            scanTimerRef.current = null
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
    }

    const stopScanner = () => {
        releaseScannerResources()

        setScannerActive(false)
        setCameraReady(false)
    }

    useEffect(() => releaseScannerResources, [])

    const doCheckin = async (code, method = 'qr') => {
        const normalizedCode = normalizeQrCode(code)
        if (!normalizedCode || checkingRef.current) return

        checkingRef.current = true
        setLoading(true)

        try {
            const res = await api.post('/members/checkin', { qr_code: normalizedCode, method })
            const checkin = res.data.checkin || {
                member_id: res.data.member_id,
                checked_in_at: new Date().toISOString(),
                method,
                qr_code: normalizedCode,
                ...res.data.member,
            }

            setBlockedCheckin(null)
            setLastCheckin(checkin)
            setCheckinHistory(prev => [checkin, ...prev.filter(item => item.id !== checkin.id)].slice(0, 20))
            setScannerMessage(`Đã check-in ${checkin.name || 'hội viên'} (${normalizedCode})`)
            toast.success(`Check-in thành công: ${checkin.name || normalizedCode}`)
            setQrInput(normalizedCode)
            setManualInput('')
            loadActiveMembers()
        } catch (err) {
            const data = err.response?.data
            if (data?.cancelled || data?.member) {
                const blocked = {
                    code: data.code,
                    message: data.message || 'Check-in đã bị hủy',
                    member: data.member || { qr_code: normalizedCode },
                    qr_code: normalizedCode,
                }

                setBlockedCheckin(blocked)
                setLastCheckin(null)
                setQrInput(normalizedCode)
                setScannerMessage(`${blocked.message}: ${blocked.member.name || normalizedCode}`)
                toast.error(blocked.message)
            } else {
                setBlockedCheckin(null)
                setLastCheckin(null)
                toast.error(data?.message || 'Không tìm thấy hội viên')
            }
        } finally {
            checkingRef.current = false
            setLoading(false)
        }
    }

    const requestRenewal = async () => {
        if (!blockedCheckin?.member?.id || renewing) return

        setRenewing(true)
        try {
            const payload = blockedCheckin.member.latest_package_id
                ? { package_id: blockedCheckin.member.latest_package_id }
                : {}
            const res = await api.post(`/members/${blockedCheckin.member.id}/renewal-request`, payload)

            toast.success(res.data.message || 'Đã gửi yêu cầu gia hạn')
            setBlockedCheckin(prev => prev ? { ...prev, renewalRequested: true, renewalRequest: res.data.request } : prev)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không gửi được yêu cầu gia hạn')
        } finally {
            setRenewing(false)
        }
    }

    const scanFrame = async () => {
        if (!scanningRef.current || !videoRef.current) return

        try {
            const video = videoRef.current
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                let rawValue = ''

                if (detectorRef.current) {
                    try {
                        const codes = await detectorRef.current.detect(video)
                        rawValue = codes?.[0]?.rawValue || ''
                    } catch (err) {
                        detectorRef.current = null
                    }
                }

                if (!rawValue && canvasRef.current && video.videoWidth && video.videoHeight) {
                    const canvas = canvasRef.current
                    const context = canvas.getContext('2d', { willReadFrequently: true })

                    canvas.width = video.videoWidth
                    canvas.height = video.videoHeight
                    context.drawImage(video, 0, 0, canvas.width, canvas.height)

                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
                    const result = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'attemptBoth',
                    })

                    rawValue = result?.data || ''
                }

                if (rawValue) {
                    const detectedCode = normalizeQrCode(rawValue)
                    setQrInput(detectedCode)
                    setScannerMessage(`Đã quét được mã ${detectedCode}, đang kiểm tra gói tập...`)
                    stopScanner()
                    await doCheckin(detectedCode, 'qr')
                    return
                }
            }

            scanTimerRef.current = window.setTimeout(scanFrame, 350)
        } catch (err) {
            console.error(err)
            setScannerMessage('Không đọc được QR, hãy đưa mã vào giữa khung quét')
            scanTimerRef.current = window.setTimeout(scanFrame, 600)
        }
    }

    const decodeQrFromImage = async file => {
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh QR')
            return
        }

        let objectUrl = ''

        try {
            objectUrl = URL.createObjectURL(file)

            const image = await new Promise((resolve, reject) => {
                const img = new Image()
                img.onload = () => resolve(img)
                img.onerror = () => reject(new Error('Không đọc được file ảnh QR'))
                img.src = objectUrl
            })

            const canvas = canvasRef.current || document.createElement('canvas')
            const context = canvas.getContext('2d', { willReadFrequently: true })

            canvas.width = image.naturalWidth
            canvas.height = image.naturalHeight
            context.drawImage(image, 0, 0, canvas.width, canvas.height)

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            const result = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth',
            })

            if (!result?.data) {
                setUploadedQrName(file.name)
                setScannerMessage('Không đọc được QR từ ảnh này, hãy thử ảnh rõ hơn hoặc crop sát mã QR')
                toast.error('Không đọc được QR từ ảnh')
                return
            }

            const detectedCode = normalizeQrCode(result.data)
            setQrInput(detectedCode)
            setUploadedQrName(file.name)
            setScannerMessage(`Đã đọc được mã ${detectedCode} từ ảnh ${file.name}, đang check-in...`)
            toast.success(`Đã đọc được mã ${detectedCode}`)
            await doCheckin(detectedCode, 'qr')
        } catch (err) {
            console.error(err)
            setScannerMessage('Không xử lý được file ảnh QR')
            toast.error('Không xử lý được file ảnh QR')
        } finally {
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }

    const handleQrUpload = async event => {
        const file = event.target.files?.[0]
        await decodeQrFromImage(file)
        event.target.value = ''
    }

    const startScanner = async () => {
        if (loading) return

        if (!navigator.mediaDevices?.getUserMedia) {
            setScannerMessage('Trình duyệt không hỗ trợ truy cập camera')
            toast.error('Trình duyệt không hỗ trợ camera')
            return
        }

        try {
            let nativeDetector = null

            if ('BarcodeDetector' in window) {
                try {
                    if (typeof window.BarcodeDetector.getSupportedFormats === 'function') {
                        const formats = await window.BarcodeDetector.getSupportedFormats()
                        if (formats.includes('qr_code')) {
                            nativeDetector = new window.BarcodeDetector({ formats: ['qr_code'] })
                        }
                    } else {
                        nativeDetector = new window.BarcodeDetector({ formats: ['qr_code'] })
                    }
                } catch (err) {
                    nativeDetector = null
                }
            }

            stopScanner()
            setScannerActive(true)
            setScannerMessage('Đang mở camera...')

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            })

            streamRef.current = stream
            detectorRef.current = nativeDetector

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            }

            scanningRef.current = true
            setCameraReady(true)
            setScannerMessage('Đưa mã QR vào giữa khung để check-in tự động')
            scanFrame()
        } catch (err) {
            console.error(err)
            stopScanner()

            const denied = err.name === 'NotAllowedError' || err.name === 'SecurityError'
            const message = denied
                ? 'Bạn cần cấp quyền camera cho trình duyệt để quét QR'
                : 'Không mở được camera trên thiết bị này'

            setScannerMessage(message)
            toast.error(message)
        }
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-black text-white">Check-in Hội Viên</h1>
                <p className="text-sm text-gray-500 mt-1">Quét QR bằng camera hoặc nhập mã thủ công</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="card">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}
                            >
                                <ScanLine size={22} color="#eab308" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Quét QR Code</h3>
                                <p className="text-xs text-gray-500">Camera sẽ tự check-in khi đọc được mã</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative aspect-video overflow-hidden rounded-xl bg-black mb-3" style={{ border: '1px solid #27272a' }}>
                        <video
                            ref={videoRef}
                            className={`h-full w-full object-cover ${scannerActive ? 'block' : 'hidden'}`}
                            muted
                            playsInline
                        />
                        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

                        {!scannerActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-4">
                                <Camera size={36} className="text-gray-600" />
                                <div className="text-sm font-semibold text-gray-300">Camera chưa bật</div>
                                <div className="text-xs text-gray-600 max-w-xs">{scannerMessage}</div>
                            </div>
                        )}

                        {scannerActive && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-6 rounded-xl" style={{ border: '2px solid rgba(234,179,8,0.8)' }} />
                                <div
                                    className="absolute left-8 right-8 h-0.5"
                                    style={{
                                        top: cameraReady ? '50%' : '45%',
                                        background: '#eab308',
                                        boxShadow: '0 0 18px rgba(234,179,8,0.8)',
                                    }}
                                />
                                {!cameraReady && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold text-yellow-500">
                                        Đang khởi động camera...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-gray-500 min-h-4 mb-3">{scannerMessage}</div>
                    {uploadedQrName && (
                        <div className="text-[11px] text-gray-600 mb-3 truncate">
                            Ảnh QR vừa chọn: <span className="font-mono text-gray-400">{uploadedQrName}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                            type="button"
                            onClick={startScanner}
                            disabled={loading || scannerActive}
                            className="btn-gold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Camera size={16} />
                            Bật camera
                        </button>
                        <button
                            type="button"
                            onClick={stopScanner}
                            disabled={!scannerActive}
                            className="btn-ghost text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <CameraOff size={16} />
                            Tắt
                        </button>
                    </div>
                    <input
                        ref={uploadInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleQrUpload}
                    />
                    <button
                        type="button"
                        onClick={() => uploadInputRef.current?.click()}
                        disabled={loading}
                        className="btn-ghost w-full text-sm flex items-center justify-center gap-2 mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <Upload size={16} />
                        Upload ảnh QR
                    </button>

                    <input
                        className="input-dark text-sm text-center mb-3"
                        placeholder="Mã QR sau khi quét hoặc nhập nhanh..."
                        value={qrInput}
                        onChange={e => setQrInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && doCheckin(qrInput, 'qr')}
                    />
                    <button
                        type="button"
                        onClick={() => doCheckin(qrInput, 'qr')}
                        disabled={loading || !qrInput}
                        className="btn-gold w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang xử lý...' : 'Check-in lại mã QR'}
                    </button>
                </div>

                <div className="card">
                    <h3 className="font-bold text-white mb-3">Check-in Thủ Công</h3>
                    <div className="relative mb-3">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            className="input-dark text-sm pl-9"
                            placeholder="Nhập mã QR hội viên... (vd: FC-000001)"
                            value={manualInput}
                            onChange={e => setManualInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && doCheckin(manualInput, 'manual')}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => doCheckin(manualInput, 'manual')}
                        disabled={loading || !manualInput}
                        className="btn-gold w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang xử lý...' : 'Check-in thủ công'}
                    </button>

                    {blockedCheckin && (
                        <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.35)' }}>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(220,38,38,0.15)' }}>
                                    <AlertTriangle size={20} className="text-red-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">
                                        Check-in bị hủy
                                    </div>
                                    <div className="font-bold text-white truncate">
                                        {blockedCheckin.member?.name || 'Hội viên'}
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">
                                        {blockedCheckin.member?.qr_code || blockedCheckin.qr_code}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 text-sm text-red-200">{blockedCheckin.message}</div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <div className="text-gray-600">Gói gần nhất</div>
                                    <div className="text-gray-300">{blockedCheckin.member?.current_package || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Hết hạn</div>
                                    <div className="text-gray-300">
                                        {blockedCheckin.member?.package_expires
                                            ? new Date(blockedCheckin.member.package_expires).toLocaleDateString('vi-VN')
                                            : '-'}
                                    </div>
                                </div>
                            </div>

                            {blockedCheckin.renewalRequested ? (
                                <div className="mt-3 text-xs text-yellow-500">
                                    Đã gửi đề xuất gia hạn cho hội viên, chờ hội viên phản hồi.
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={requestRenewal}
                                    disabled={renewing || !blockedCheckin.member?.latest_package_id}
                                    className="btn-gold w-full text-sm mt-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw size={16} />
                                    {renewing ? 'Đang gửi...' : 'Gửi đề xuất gia hạn'}
                                </button>
                            )}
                        </div>
                    )}

                    {lastCheckin && (
                        <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
                            <div className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-2">Vừa check-in</div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black text-black"
                                    style={{ background: 'linear-gradient(135deg,#eab308,#ca8a04)' }}>
                                    {lastCheckin.name?.[0] || '?'}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-white truncate">{lastCheckin.name || 'Hội viên'}</div>
                                    <div className="text-xs text-gray-500 font-mono">{lastCheckin.qr_code}</div>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <div className="text-gray-600">Thời gian</div>
                                    <div className="text-gray-300">{formatDateTime(lastCheckin.checked_in_at)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Phương thức</div>
                                    <div className="text-gray-300 uppercase">{lastCheckin.method}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 p-3 rounded-lg text-center" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
                        <div className="text-xs text-gray-600 mb-2">Ví dụ QR hội viên:</div>
                        <div className="inline-block p-2 rounded-lg bg-white">
                            <QRCodeSVG value="FC-000001" size={80} />
                        </div>
                        <div className="text-xs text-gray-500 mt-2 font-mono">FC-000001</div>
                        <button
                            type="button"
                            onClick={() => doCheckin('FC-000001', 'manual')}
                            className="btn-ghost text-xs mt-2 py-1 px-3"
                        >
                            Dùng mã demo này
                        </button>
                    </div>
                </div>
            </div>

            <div className="card mb-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="font-bold text-white">Lịch sử check-in</h3>
                    <button
                        type="button"
                        onClick={loadCheckinHistory}
                        className="btn-ghost text-xs py-1.5 px-3"
                    >
                        Làm mới
                    </button>
                </div>
                <div className="space-y-2">
                    {checkinHistory.length === 0 ? (
                        <div className="text-sm text-gray-500 py-6 text-center rounded-lg" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
                            Chưa có lịch sử check-in
                        </div>
                    ) : checkinHistory.map(item => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg"
                            style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}
                        >
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                                style={{ background: '#1f1f1f', color: '#eab308' }}
                            >
                                {item.name?.[0] || '?'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-white truncate">{item.name || 'Hội viên'}</div>
                                <div className="text-xs text-gray-500">
                                    <span className="font-mono">{item.qr_code}</span>
                                    {item.phone ? <span> · {item.phone}</span> : null}
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-xs text-gray-300">{formatDateTime(item.checked_in_at)}</div>
                                <div className="text-[10px] text-gray-600 uppercase">{item.method}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <h3 className="font-bold text-white mb-4">Hội viên đang hoạt động</h3>
                <div className="overflow-x-auto">
                    <table className="tbl">
                        <thead><tr><th>Hội viên</th><th>QR Code</th><th>Gói tập</th><th>Hết hạn</th><th></th></tr></thead>
                        <tbody>
                            {activeMembers.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                                style={{ background: '#1f1f1f', color: '#eab308' }}
                                            >
                                                {m.name?.[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{m.name}</div>
                                                <div className="text-xs text-gray-500">{m.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="font-mono text-xs text-gray-400">{m.qr_code}</span></td>
                                    <td className="text-xs text-gray-400">{m.current_package || '-'}</td>
                                    <td className="text-xs text-gray-400">
                                        {m.package_expires ? new Date(m.package_expires).toLocaleDateString('vi-VN') : '-'}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => doCheckin(m.qr_code, 'manual')}
                                            className="btn-gold py-1 px-3 text-xs"
                                        >
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
