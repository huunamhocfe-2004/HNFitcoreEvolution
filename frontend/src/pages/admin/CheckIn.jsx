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
        <div className="space-y-6 text-slate-900">
            <div>
                <h1 className="text-2xl font-black text-slate-900">
                    Check-in Hội Viên
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Quét QR bằng camera hoặc nhập mã thủ công
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-200 bg-red-50">
                                <ScanLine size={22} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">
                                    Quét QR Code
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Camera sẽ tự check-in khi đọc được mã
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative mb-3 aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
                        <video
                            ref={videoRef}
                            className={`h-full w-full object-cover ${scannerActive ? 'block' : 'hidden'}`}
                            muted
                            playsInline
                        />
                        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

                        {!scannerActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                                <Camera size={36} className="text-slate-500" />
                                <div className="text-sm font-semibold text-slate-200">
                                    Camera chưa bật
                                </div>
                                <div className="max-w-xs text-xs text-slate-400">
                                    {scannerMessage}
                                </div>
                            </div>
                        )}

                        {scannerActive && (
                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute inset-6 rounded-xl border-2 border-red-500" />
                                <div
                                    className="absolute left-8 right-8 h-0.5 bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.8)]"
                                    style={{
                                        top: cameraReady ? '50%' : '45%',
                                    }}
                                />
                                {!cameraReady && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-xs font-semibold text-red-400">
                                        Đang khởi động camera...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mb-3 min-h-4 text-xs text-slate-500">
                        {scannerMessage}
                    </div>

                    {uploadedQrName && (
                        <div className="mb-3 truncate text-[11px] text-slate-500">
                            Ảnh QR vừa chọn:{' '}
                            <span className="font-mono text-slate-700">
                                {uploadedQrName}
                            </span>
                        </div>
                    )}

                    <div className="mb-3 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={startScanner}
                            disabled={loading || scannerActive}
                            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Camera size={16} />
                            Bật camera
                        </button>

                        <button
                            type="button"
                            onClick={stopScanner}
                            disabled={!scannerActive}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
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
                        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Upload size={16} />
                        Upload ảnh QR
                    </button>

                    <input
                        className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                        placeholder="Mã QR sau khi quét"
                        value={qrInput}
                        onChange={e => setQrInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && doCheckin(qrInput, 'qr')}
                    />

                    <button
                        type="button"
                        onClick={() => doCheckin(qrInput, 'qr')}
                        disabled={loading || !qrInput}
                        className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Đang xử lý...' : 'Check-in lại mã QR'}
                    </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                    <h3 className="mb-3 font-bold text-slate-900">
                        Check-in Thủ Công
                    </h3>

                    <div className="relative mb-3">
                        <input
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                            placeholder="Nhập mã QR hội viên... (vd: FC-000001)"
                            value={manualInput}
                            onChange={e => setManualInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && doCheckin(manualInput, 'manual')}
                        />
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => doCheckin(manualInput, 'manual')}
                        disabled={loading || !manualInput}
                        className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Đang xử lý...' : 'Check-in thủ công'}
                    </button>

                    {blockedCheckin && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                                    <AlertTriangle size={20} className="text-red-600" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-red-600">
                                        Check-in bị hủy
                                    </div>
                                    <div className="truncate font-bold text-slate-900">
                                        {blockedCheckin.member?.name || 'Hội viên'}
                                    </div>
                                    <div className="font-mono text-xs text-slate-500">
                                        {blockedCheckin.member?.qr_code || blockedCheckin.qr_code}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 text-sm text-red-700">
                                {blockedCheckin.message}
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <div className="text-slate-500">Gói gần nhất</div>
                                    <div className="font-semibold text-slate-700">
                                        {blockedCheckin.member?.current_package || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-500">Hết hạn</div>
                                    <div className="font-semibold text-slate-700">
                                        {blockedCheckin.member?.package_expires
                                            ? new Date(blockedCheckin.member.package_expires).toLocaleDateString('vi-VN')
                                            : '-'}
                                    </div>
                                </div>
                            </div>

                            {blockedCheckin.renewalRequested ? (
                                <div className="mt-3 text-xs font-semibold text-orange-600">
                                    Đã gửi đề xuất gia hạn cho hội viên, chờ hội viên phản hồi.
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={requestRenewal}
                                    disabled={renewing || !blockedCheckin.member?.latest_package_id}
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <RefreshCw size={16} />
                                    {renewing ? 'Đang gửi...' : 'Gửi đề xuất gia hạn'}
                                </button>
                            )}
                        </div>
                    )}

                    {lastCheckin && (
                        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                Vừa check-in
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white">
                                    {lastCheckin.name?.[0] || '?'}
                                </div>

                                <div className="min-w-0">
                                    <div className="truncate font-bold text-slate-900">
                                        {lastCheckin.name || 'Hội viên'}
                                    </div>
                                    <div className="font-mono text-xs text-slate-500">
                                        {lastCheckin.qr_code}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <div className="text-slate-500">Thời gian</div>
                                    <div className="font-semibold text-slate-700">
                                        {formatDateTime(lastCheckin.checked_in_at)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-500">Phương thức</div>
                                    <div className="font-semibold uppercase text-slate-700">
                                        {lastCheckin.method}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-bold text-slate-900">
                        Lịch sử check-in
                    </h3>

                    <button
                        type="button"
                        onClick={loadCheckinHistory}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                    >
                        Làm mới
                    </button>
                </div>

                <div className="space-y-2">
                    {checkinHistory.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
                            Chưa có lịch sử check-in
                        </div>
                    ) : checkinHistory.map(item => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-black text-red-600">
                                {item.name?.[0] || '?'}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-slate-900">
                                    {item.name || 'Hội viên'}
                                </div>
                                <div className="text-xs text-slate-500">
                                    <span className="font-mono">{item.qr_code}</span>
                                    {item.phone ? <span> · {item.phone}</span> : null}
                                </div>
                            </div>

                            <div className="shrink-0 text-right">
                                <div className="text-xs text-slate-700">
                                    {formatDateTime(item.checked_in_at)}
                                </div>
                                <div className="text-[10px] uppercase text-slate-400">
                                    {item.method}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                <h3 className="mb-4 font-bold text-slate-900">
                    Hội viên đang hoạt động
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Hội viên
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    QR Code
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Gói tập
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Hết hạn
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500"></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {activeMembers.map(m => (
                                <tr
                                    key={m.id}
                                    className="transition-colors hover:bg-red-50/40"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-600">
                                                {m.name?.[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">
                                                    {m.name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {m.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-slate-500">
                                            {m.qr_code}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-xs text-slate-600">
                                        {m.current_package || '-'}
                                    </td>

                                    <td className="px-6 py-4 text-xs text-slate-600">
                                        {m.package_expires ? new Date(m.package_expires).toLocaleDateString('vi-VN') : '-'}
                                    </td>

                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => doCheckin(m.qr_code, 'manual')}
                                            className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-red-200 transition hover:bg-red-500"
                                        >
                                            Check-in
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {activeMembers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-slate-500"
                                    >
                                        Chưa có hội viên đang hoạt động
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}