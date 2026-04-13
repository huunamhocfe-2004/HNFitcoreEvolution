import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { QRCodeSVG } from 'qrcode.react'
import { User, Phone, Mail, Calendar, CreditCard, ShieldCheck, AlertCircle, ArrowLeft, Check, Copy, Star, MessageSquare, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const BANK_INFO = {
    ID: 'mbbank',
    ACCOUNT_NO: '003629022004',
    ACCOUNT_NAME: 'BUI HUU NAM'
}

const statusBadge = s => ({
    active: <span className="badge badge-green">Đang hoạt động</span>,
    expired: <span className="badge badge-red">Hết hạn</span>,
    paused: <span className="badge badge-yellow">Tạm dừng</span>,
}[s] || <span className="badge badge-gray">{s}</span>)

export default function MemberProfile() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [packages, setPackages] = useState([])
    const [purchaseModal, setPurchaseModal] = useState(false)
    const [purchaseStep, setPurchaseStep] = useState(0) // 0: select, 1: pay
    const [selectedPkg, setSelectedPkg] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [feedback, setFeedback] = useState({ rating: 5, comment: '' })
    const [sendingFeedback, setSendingFeedback] = useState(false)

    const loadProfile = () => {
        if (user?.member_id) {
            setLoading(true)
            api.get(`/members/${user.member_id}`)
                .then(r => setProfile(r.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false))
        }
    }

    useEffect(() => {
        loadProfile()
        api.get('/packages').then(r => setPackages(r.data))
    }, [user])

    const submitFeedback = async (e) => {
        e.preventDefault()
        if (!feedback.comment.trim()) return toast.error('Vui lòng nhập ý kiến của bạn')
        setSendingFeedback(true)
        try {
            await api.post('/feedback', feedback)
            toast.success('Cảm ơn bạn đã gửi phản hồi cho Fitcore!')
            setFeedback({ rating: 5, comment: '' })
        } catch (err) {
            toast.error('Lỗi khi gửi phản hồi')
        } finally {
            setSendingFeedback(false)
        }
    }

    const startPurchase = (pkg) => {
        setSelectedPkg(pkg)
        setPurchaseStep(1)
    }

    const confirmPurchase = async () => {
        setSubmitting(true)
        try {
            await api.post('/subscriptions', {
                member_id: profile.id,
                package_id: selectedPkg.id,
                is_paid: 0 // Bank transfer pending
            })
            toast.success('Gửi yêu cầu thành công! Vui lòng đợi quản trị viên xác nhận.')
            setPurchaseModal(false)
            setPurchaseStep(0)
            setSelectedPkg(null)
            loadProfile()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi đăng ký gói')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div className="space-y-4">
            <div className="skeleton h-32 w-full rounded-2xl" />
            <div className="skeleton h-64 w-full rounded-2xl" />
        </div>
    )

    if (!profile) return <div className="text-center py-12 text-gray-500">Không tìm thấy thông tin hội viên</div>

    const subscriptions = profile.subscriptions || []
    
    // Gym sub is the latest one without a trainer
    const gymSub = subscriptions.find(s => !s.trainer_id)
    const isGymPending = gymSub && !gymSub.is_paid
    const isGymExpired = gymSub && gymSub.is_paid && new Date(gymSub.end_date) < new Date()
    const isGymActive = gymSub && gymSub.is_paid && !isGymExpired

    // PT sub is the latest one with a trainer
    const ptSub = subscriptions.find(s => s.trainer_id)
    const isPtPending = ptSub && !ptSub.is_paid
    const isPtActive = ptSub && ptSub.is_paid && new Date(ptSub.end_date) >= new Date()

    // For backward compatibility in existing components if needed
    const currentSub = gymSub || ptSub

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Main Header Card */}
            <div className="relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="card relative bg-[#111] border-[#1f1f1f] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-red-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                        <div className="relative p-5 bg-white rounded-2xl shadow-2xl shadow-black">
                            <QRCodeSVG
                                value={profile.qr_code || `FC-${profile.id}`}
                                size={160}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <div className="mt-4 text-center">
                            <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">THẺ HỘI VIÊN</div>
                            <div className="text-sm font-mono text-zinc-400 font-bold">{profile.qr_code}</div>
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                            {statusBadge(profile.status)}
                            {isGymPending && (
                                <span className="badge badge-yellow uppercase !text-[9px] font-bold animate-pulse">Gói tập chờ duyệt</span>
                            )}
                            {isPtPending && (
                                <span className="badge badge-yellow uppercase !text-[9px] font-bold animate-pulse">Yêu cầu PT chờ duyệt</span>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                             {profile.avatar && (
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500 shadow-lg shadow-red-900/20">
                                    <img src={profile.avatar} className="w-full h-full object-cover" alt={profile.name} />
                                </div>
                             )}
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter uppercase leading-none italic">
                                {profile.name}
                            </h1>
                        </div>
                        <p className="text-zinc-500 font-medium mb-8 max-w-md">Chào mừng bạn trở lại! Hãy sử dụng mã QR bên cạnh để check-in nhanh tại quầy lễ tân.</p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-900">
                            <div>
                                <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">Mã Số</div>
                                <div className="text-white font-bold">{profile.qr_code}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">Tham Gia</div>
                                <div className="text-white font-bold">{new Date(profile.joined_date).toLocaleDateString('vi-VN')}</div>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Xếp Hạng</div>
                                <div className="text-red-500 font-bold italic">ELITE MEMBER</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Subscriptions Middle Part */}
                <div className="md:col-span-2 space-y-6">
                    {/* Gym Card */}
                    <div className="card bg-[#0d0d0d] border-[#1a1a1a] p-6 lg:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <CreditCard size={48} className="text-white/5 -rotate-12" />
                        </div>

                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> THÔNG TIN GÓI TẬP
                        </h3>

                        {gymSub ? (
                            <div className="space-y-8">
                                <div>
                                    <div className="text-3xl font-bold text-white italic tracking-tight">{gymSub.title}</div>
                                    <div className="text-zinc-500 text-sm mt-1">{gymSub.description || 'Gói tập tiêu chuẩn tại Fitcore'}</div>
                                    {!gymSub.is_paid && (
                                        <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                                            <AlertCircle className="text-yellow-500" size={20} />
                                            <div className="text-xs text-yellow-500/80 font-bold uppercase tracking-widest">
                                                Vui lòng đợi quản trị viên xác nhận thanh toán
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900">
                                        <div className="text-[10px] font-black text-zinc-600 uppercase mb-2 flex items-center gap-1.5">
                                            <Calendar size={12} /> NGÀY HIỆU LỰC
                                        </div>
                                        <div className="text-white font-bold">
                                            {gymSub.is_paid ? new Date(gymSub.start_date).toLocaleDateString('vi-VN') : '—'}
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900 border-l-red-500/20">
                                        <div className="text-[10px] font-bold text-zinc-600 uppercase mb-2 flex items-center gap-1.5">
                                            <Calendar size={12} className="text-red-500" /> NGÀY HẾT HẠN
                                        </div>
                                        <div className="text-red-500 font-bold">
                                            {gymSub.is_paid ? new Date(gymSub.end_date).toLocaleDateString('vi-VN') : '—'}
                                        </div>
                                    </div>
                                </div>
                                
                                {isGymExpired && !isGymPending && (
                                    <button onClick={() => setPurchaseModal(true)} className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black italic tracking-widest uppercase transition-all">
                                        GIA HẠN GÓI TẬP NGAY
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-zinc-600 font-medium mb-6">Bạn chưa đăng ký gói tập nào.</p>
                                <button
                                    onClick={() => setPurchaseModal(true)}
                                    className="px-10 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black italic tracking-widest uppercase transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-900/40"
                                >
                                    MUA GÓI TẬP NGAY
                                </button>
                            </div>
                        )}
                    </div>

                    {/* PT Card if exists */}
                    {ptSub && (
                        <div className="card bg-[#0d0d0d] border-[#1a1a1a] p-6 lg:p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <User size={48} className="text-yellow-500/5 -rotate-12" />
                            </div>

                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> HUẤN LUYỆN VIÊN RIÊNG
                            </h3>

                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">PT ĐANG THEO DÕI</div>
                                        <div className="text-2xl font-bold text-white italic">{ptSub.trainer_name}</div>
                                        <div className="text-yellow-500 text-xs font-bold uppercase tracking-widest mt-1">{ptSub.title}</div>
                                    </div>

                                    {!ptSub.is_paid ? (
                                        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                                            <AlertCircle className="text-yellow-500" size={18} />
                                            <div className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Đang chờ admin duyệt yêu cầu</div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900">
                                                <div className="text-[9px] font-bold text-zinc-600 uppercase mb-1">BẮT ĐẦU</div>
                                                <div className="text-white text-xs font-bold">{new Date(ptSub.start_date).toLocaleDateString('vi-VN')}</div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900">
                                                <div className="text-[9px] font-bold text-zinc-600 uppercase mb-1">KẾT THÚC</div>
                                                <div className="text-white text-xs font-bold">{new Date(ptSub.end_date).toLocaleDateString('vi-VN')}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 self-center md:self-start">
                                    {ptSub.trainer_avatar ? <img src={ptSub.trainer_avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={40} /></div>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Personal Details Side */}
                <div className="card bg-[#0d0d0d] border-[#1a1a1a] p-6">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> CÁ NHÂN
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-500"><Mail size={16} /></div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-zinc-700 uppercase">Email liên hệ</div>
                                <div className="text-sm text-zinc-300 truncate font-medium">{profile.email}</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-500"><Phone size={16} /></div>
                            <div>
                                <div className="text-[10px] font-black text-zinc-700 uppercase">Số điện thoại</div>
                                <div className="text-sm text-zinc-300 font-medium">{profile.phone || '—'}</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-500"><Calendar size={16} /></div>
                            <div>
                                <div className="text-[10px] font-black text-zinc-700 uppercase">Ngày sinh</div>
                                <div className="text-sm text-zinc-300 font-medium">
                                    {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('vi-VN') : '—'}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-500"><ShieldCheck size={16} /></div>
                            <div>
                                <div className="text-[10px] font-black text-zinc-700 uppercase">Định danh</div>
                                <div className="text-sm text-zinc-300 font-medium font-mono tracking-tighter">{profile.id_card || '—'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Section */}
            <div className="card bg-[#0d0d0d] border-[#1a1a1a] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                    <MessageSquare size={120} />
                </div>
                
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" /> ĐÁNH GIÁ TRẢI NGHIỆM
                </h3>

                <form onSubmit={submitFeedback} className="relative z-10 max-w-2xl">
                    <div className="mb-6">
                        <label className="block text-xs font-black text-zinc-600 uppercase mb-4 tracking-widest">Mức độ hài lòng của bạn?</label>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFeedback(p => ({ ...p, rating: star }))}
                                    className={`p-3 rounded-xl border transition-all ${
                                        feedback.rating >= star 
                                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-700 hover:border-zinc-700'
                                    }`}
                                >
                                    <Star size={24} className={feedback.rating >= star ? 'fill-yellow-500' : ''} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-black text-zinc-600 uppercase mb-3 tracking-widest">Ý kiến đóng góp</label>
                        <textarea
                            value={feedback.comment}
                            onChange={e => setFeedback(p => ({ ...p, comment: e.target.value }))}
                            className="input-dark w-full min-h-[120px] p-4 text-sm"
                            placeholder="Hãy để lại ý kiến của bạn để giúp HN Fitcore ngày càng hoàn thiện hơn..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={sendingFeedback}
                        className="btn-gold px-10 py-3 uppercase text-xs font-black tracking-widest flex items-center gap-2 group"
                    >
                        {sendingFeedback ? 'ĐANG GỬI...' : <><Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> GỬI PHẢN HỒI</>}
                    </button>
                </form>
            </div>

            {/* History Table */}
            <div className="card bg-[#0d0d0d] border-[#1a1a1a] p-0 overflow-hidden">
                <div className="p-8 border-b border-zinc-900">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                        <CreditCard size={16} className="text-zinc-700" /> LỊCH SỬ ĐĂNG KÝ & THANH TOÁN
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="tbl">
                        <thead>
                            <tr className="bg-zinc-950/50">
                                <th className="!text-[10px] font-black uppercase tracking-widest">Gói tập / Loại</th>
                                <th className="!text-[10px] font-black uppercase tracking-widest">Chi phí</th>
                                <th className="!text-[10px] font-black uppercase tracking-widest">Thời hạn</th>
                                <th className="!text-[10px] font-black uppercase tracking-widest text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((s, i) => (
                                <tr key={i} className="hover:bg-zinc-900/10">
                                    <td>
                                        <div className="font-bold text-white text-sm">{s.title}</div>
                                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                                            {s.trainer_id ? `PT: ${s.trainer_name}` : 'GÓI CƠ BẢN'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-white font-bold text-xs">{Number(s.amount_paid || s.price).toLocaleString('vi-VN')}₫</div>
                                    </td>
                                    <td>
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase">
                                            {new Date(s.start_date).toLocaleDateString('vi-VN')} - {new Date(s.end_date).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        {s.is_paid ? (
                                            <span className="text-[9px] font-black bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full border border-green-500/20 uppercase">Thành công</span>
                                        ) : (
                                            <span className="text-[9px] font-black bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-full border border-yellow-500/20 uppercase">Chờ duyệt</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {subscriptions.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-zinc-600 italic text-sm">Chưa có lịch sử giao dịch nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {purchaseModal && (
                <div className="modal-overlay z-[100]" onClick={e => e.target === e.currentTarget && setPurchaseModal(false)}>
                    <div className="modal-box bg-[#0a0a0a] border border-zinc-800 !max-w-[1100px] overflow-hidden p-0" style={{ maxWidth: '1100px' }}>
                        {purchaseStep === 0 ? (
                            <div className="p-8">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Chọn Gói Tập</h2>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Nâng cấp sức mạnh cùng HN Fitcore evolution</p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {packages.map(p => (
                                        <div key={p.id} className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-red-500/30 transition-all cursor-pointer group flex flex-col"
                                            onClick={() => startPurchase(p)}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><CreditCard size={20} /></div>
                                                <div className="text-xs font-black text-zinc-600 group-hover:text-red-500 transition-colors uppercase">{p.duration_days} ngày</div>
                                            </div>
                                            <div className="font-bold text-white text-lg mb-1 group-hover:text-red-500 transition-colors">{p.title}</div>
                                            <p className="text-xs text-zinc-500 mb-6 flex-1">{p.description}</p>
                                            <div className="text-2xl font-black text-white italic tracking-tighter">
                                                {Number(p.price).toLocaleString('vi-VN')}₫
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-8">
                                    <button onClick={() => setPurchaseModal(false)} className="px-6 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:text-white transition-colors">ĐÓNG</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row">
                                <div className="p-8 flex-1">
                                    <button onClick={() => setPurchaseStep(0)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold mb-6">
                                        <ArrowLeft size={14} /> QUAY LẠI
                                    </button>
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Thanh Toán</h2>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-8">Chuyển khoản QR để kích hoạt nhanh</p>

                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
                                            <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Gói đã chọn</div>
                                            <div className="text-white font-bold">{selectedPkg.title}</div>
                                            <div className="text-red-500 font-black text-xl italic tracking-tighter mt-1">{Number(selectedPkg.price).toLocaleString('vi-VN')}₫</div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-zinc-500 font-bold uppercase">Ngân hàng</span>
                                                <span className="text-white font-bold uppercase">{BANK_INFO.ID}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-zinc-500 font-bold uppercase">Số tài khoản</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-mono font-bold tracking-wider">{BANK_INFO.ACCOUNT_NO}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-zinc-500 font-bold uppercase">Nội dung</span>
                                                <span className="text-red-500 font-bold">FC {profile.qr_code} {selectedPkg.id}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-zinc-900">
                                            <button 
                                                onClick={confirmPurchase}
                                                disabled={submitting}
                                                className="w-full btn-red py-4 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 group shadow-xl shadow-red-900/20"
                                            >
                                                {submitting ? 'ĐANG XỬ LÝ...' : <><Check size={18} /> TÔI ĐÃ CHUYỂN KHOẢN</>}
                                            </button>
                                            <p className="text-[10px] text-zinc-600 text-center mt-4 font-bold uppercase tracking-widest italic">
                                                *Gói tập sẽ được kích hoạt ngay sau khi admin xác nhận giao dịch
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-[380px] bg-white p-12 flex flex-col items-center justify-center gap-6">
                                    <div className="text-[11px] font-black text-black uppercase tracking-[0.2em] opacity-50">Quét mã VietQR</div>
                                    <div className="relative p-4 bg-white border border-zinc-100 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                                        <img 
                                            src={`https://img.vietqr.io/image/${BANK_INFO.ID}-${BANK_INFO.ACCOUNT_NO}-compact2.png?amount=${selectedPkg.price}&addInfo=FC%20${profile.qr_code}%20${selectedPkg.id}&accountName=${encodeURIComponent(BANK_INFO.ACCOUNT_NAME)}`} 
                                            alt="VietQR"
                                            className="w-full aspect-square object-contain"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-zinc-900 italic">Mã QR tự động cập nhật số tiền</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
