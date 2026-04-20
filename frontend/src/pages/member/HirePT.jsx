import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { User, Award, CheckCircle, CreditCard, X, ArrowLeft, Check, Eye, MapPin, Briefcase, BookOpen, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { createPortal } from "react-dom";


const BANK_INFO = {
    ID: 'mbbank',
    ACCOUNT_NO: '003629022004',
    ACCOUNT_NAME: 'BUI HUU NAM'
}

// Hàm hỗ trợ parse JSON an toàn khi hiển thị chi tiết
const parseArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try { return JSON.parse(data); } catch (e) { return []; }
}

export default function HirePT() {
    const { user } = useAuth()
    const [trainers, setTrainers] = useState([])
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    
    // States cho luồng thuê PT
    const [selectedTrainer, setSelectedTrainer] = useState(null)
    const [selectedPackage, setSelectedPackage] = useState(null)
    const [modal, setModal] = useState(false)
    const [step, setStep] = useState(0) // 0: selection, 1: payment
    const [renting, setRenting] = useState(false)

    // State cho luồng xem chi tiết HLV
    const [viewingTrainer, setViewingTrainer] = useState(null)

    useEffect(() => {
        const loadRows = async () => {
            try {
                const [r1, r2] = await Promise.all([
                    api.get('/trainers'),
                    api.get('/packages')
                ])
                setTrainers(r1.data)
                setPackages(r2.data.filter(p => p.title.toLowerCase().includes('pt')))
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadRows()
    }, [])

    const openRent = (trainer) => {
        setSelectedTrainer(trainer)
        setStep(0)
        setModal(true)
    }

    const confirmRent = async () => {
        if (!selectedPackage) return toast.error('Vui lòng chọn gói tập PT')
        setRenting(true)
        try {
            if (!user?.member_id) return toast.error('Không tìm thấy thông tin hội viên. Vui lòng thử đăng nhập lại.')
            
            await api.post('/subscriptions', {
                member_id: user.member_id,
                package_id: selectedPackage.id,
                trainer_id: selectedTrainer.id,
                is_paid: false
            })
            
            toast.success('Đã gửi yêu cầu thuê PT thành công! Vui lòng đợi quản trị viên xác nhận thanh toán.')
            setModal(false); setSelectedPackage(null); setSelectedTrainer(null); setStep(0)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
        } finally {
            setRenting(false)
        }
    }

    if (loading) return <div className="p-8"><div className="skeleton h-64 w-full rounded-xl" /></div>

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Chọn huấn luyện viên cá nhân</h1>
                <p className="text-sm text-zinc-500 mt-1">Đội ngũ PT chuyên nghiệp sẵn sàng đồng hành cùng mục tiêu của bạn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainers.map(t => (
                    <div key={t.id} className="card-glass group p-6 hover:border-yellow-500/30 transition-all duration-300 flex flex-col justify-between">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full p-0.5 border border-zinc-800 group-hover:border-yellow-500/50 transition-all duration-500 mb-4 overflow-hidden bg-zinc-900 relative">
                                {t.avatar ? <img src={t.avatar} alt={t.name} className="w-full h-full object-cover rounded-full" /> : 
                                <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={40} /></div>}
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-1 flex items-center justify-center gap-2">
                                {t.name}
                                {t.badge && <span className="px-1.5 py-0.5 text-[8px] bg-yellow-500 text-black rounded-sm uppercase tracking-widest">{t.badge}</span>}
                            </h3>
                            
                            <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-4 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                                {t.title || t.specialty || t.specialization || 'General Training'}
                            </div>
                            
                            <div className="w-full space-y-3 mb-4 font-medium">
                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <Award size={14} className="text-yellow-500" />
                                    <span>{t.experience_years || 0} năm kinh nghiệm</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <CheckCircle size={14} className="text-yellow-500 shrink-0" />
                                    <span className="truncate">{parseArray(t.certifications)[0] || 'Chứng chỉ chuyên môn PT'}</span>
                                </div>
                            </div>
                            
                            {/* Dòng Bio đã được thêm line-clamp-2 */}
                            <p className="text-xs text-zinc-500 leading-relaxed mb-6 italic line-clamp-2 w-full text-center">
                                "{t.bio || 'Luôn đồng hành cùng bạn trên con đường chinh phục vóc dáng...'}"
                            </p>
                        </div>
                        
                        <div className="flex gap-2 w-full mt-auto">
                            <button onClick={() => setViewingTrainer(t)} className="flex-1 btn-ghost py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-600 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">
                                <Eye size={14} /> Xem
                            </button>
                            <button onClick={() => openRent(t)} className="flex-[1.5] btn-gold py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                                Thuê PT
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* POPUP XEM CHI TIẾT HLV */}
            {viewingTrainer && createPortal(
                <div className="modal-overlay z-100" onClick={e => e.target === e.currentTarget && setViewingTrainer(null)}>
                    <div className="modal-box max-w-2xl! p-0 overflow-hidden bg-zinc-950 border border-zinc-800">
                        {/* Header Chi tiết */}
                        <div className="p-8 border-b border-zinc-800 bg-zinc-900/50 flex gap-6 items-center relative">
                            <button onClick={() => setViewingTrainer(null)} className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-500/20 shrink-0">
                                {viewingTrainer.avatar ? <img src={viewingTrainer.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700"><User size={40}/></div>}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                    {viewingTrainer.name}
                                    {viewingTrainer.badge && <span className="px-2 py-0.5 text-[10px] bg-yellow-500 text-black rounded-sm uppercase tracking-widest font-bold">{viewingTrainer.badge}</span>}
                                </h2>
                                <p className="text-yellow-500 font-bold text-sm mt-1">{viewingTrainer.title || viewingTrainer.specialization}</p>
                                <div className="flex gap-4 mt-3 text-xs text-zinc-400 font-medium">
                                    <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-zinc-500"/> {viewingTrainer.experience_years} năm kinh nghiệm</span>
                                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-zinc-500"/> {viewingTrainer.work_address || 'Hệ thống HN Fitcore'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Body Chi tiết */}
                        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div>
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Thông điệp từ HLV</h3>
                                <p className="text-sm text-zinc-300 leading-relaxed italic border-l-2 border-yellow-500/50 pl-4">
                                    "{viewingTrainer.bio || 'Chưa cập nhật thông điệp'}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Award size={14} className="text-yellow-500"/> Bằng cấp & Chứng chỉ</h3>
                                    <ul className="space-y-3">
                                        {parseArray(viewingTrainer.certifications).length > 0 ? parseArray(viewingTrainer.certifications).map((item, idx) => (
                                            <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                                                <CheckCircle2 size={14} className="text-yellow-500 shrink-0 mt-0.5"/> {item}
                                            </li>
                                        )) : <li className="text-xs text-zinc-600">Đang cập nhật...</li>}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><BookOpen size={14} className="text-yellow-500"/> Chuyên môn giảng dạy</h3>
                                    <ul className="space-y-3">
                                        {parseArray(viewingTrainer.teaching).length > 0 ? parseArray(viewingTrainer.teaching).map((item, idx) => (
                                            <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                                                <CheckCircle2 size={14} className="text-yellow-500 shrink-0 mt-0.5"/> {item}
                                            </li>
                                        )) : <li className="text-xs text-zinc-600">Đang cập nhật...</li>}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Kỹ năng nổi bật</h3>
                                <div className="flex flex-wrap gap-2">
                                    {parseArray(viewingTrainer.skills).length > 0 ? parseArray(viewingTrainer.skills).map((skill, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-zinc-900 text-zinc-300 text-[11px] font-bold rounded-lg border border-zinc-800">
                                            {skill}
                                        </span>
                                    )) : <span className="text-xs text-zinc-600">Đang cập nhật...</span>}
                                </div>
                            </div>
                        </div>

                        {/* Footer Chi tiết */}
                        <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
                            <button onClick={() => setViewingTrainer(null)} className="btn-ghost text-xs font-bold uppercase tracking-widest px-6">Đóng</button>
                            <button 
                                onClick={() => { 
                                    const t = viewingTrainer; 
                                    setViewingTrainer(null); 
                                    openRent(t); 
                                }} 
                                className="btn-gold py-2.5 px-8 rounded-xl text-xs font-black uppercase tracking-widest"
                            >
                                Bắt đầu tập với HLV này
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* POPUP THUÊ PT & THANH TOÁN (Giữ nguyên như cũ) */}
            {modal && createPortal(
                <div className="modal-overlay z-100" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    {/* ... (Đoạn code popup thanh toán của bạn giữ nguyên không đổi) ... */}
                    <div className="modal-box max-w-225! p-0 overflow-hidden bg-[#0a0a0a] border border-zinc-800">
                        <div className="flex flex-col md:flex-row min-h-125">
                            <div className="w-full md:w-1/3 bg-zinc-900/50 p-8 border-r border-zinc-800">
                                <div className="w-20 h-20 rounded-xl overflow-hidden mb-4 border border-zinc-800 shadow-lg">
                                    {selectedTrainer.avatar ? <img src={selectedTrainer.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600"><User size={30} /></div>}
                                </div>
                                <h4 className="font-bold text-white text-lg">{selectedTrainer.name}</h4>
                                <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-6">{selectedTrainer.title || selectedTrainer.specialty || selectedTrainer.specialization}</div>
                                <div className="space-y-4 pt-6 border-t border-zinc-800/50 font-medium">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle size={14} className="text-yellow-500 mt-0.5" />
                                        <p className="text-[11px] text-zinc-400 leading-relaxed">Lộ trình tập luyện cá nhân hóa theo mục tiêu</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle size={14} className="text-yellow-500 mt-0.5" />
                                        <p className="text-[11px] text-zinc-400 leading-relaxed">Hướng dẫn dinh dưỡng bài bản</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle size={14} className="text-yellow-500 mt-0.5" />
                                        <p className="text-[11px] text-zinc-400 leading-relaxed">Theo dõi chỉ số cơ thể hàng tuần</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-8 relative">
                                <button onClick={() => setModal(false)} className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                                {step === 0 ? (
                                    <>
                                        <h3 className="text-xl font-black text-white mb-1">Chọn gói tập PT</h3>
                                        <p className="text-xs text-zinc-500 mb-6 font-medium">Các gói thuê PT tính theo ngày (bao gồm phí phòng & phí PT)</p>
                                        <div className="space-y-3">
                                            {packages.map(p => (
                                                <div key={p.id} onClick={() => setSelectedPackage(p)}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedPackage?.id === p.id ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'}`}>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{p.title}</div>
                                                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{p.duration_days} Ngày huấn luyện</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-yellow-500">{Number(p.price).toLocaleString('vi-VN')}₫</div>
                                                        <div className="text-[10px] text-zinc-600 font-medium">Trọn gói</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedPackage && (
                                            <div className="mt-8 p-4 rounded-xl bg-zinc-900 border border-zinc-800 animate-in slide-in-from-bottom-2 duration-300">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="text-xs text-zinc-500 font-bold uppercase">Tổng cộng</div>
                                                    <div className="text-lg font-black text-white">{Number(selectedPackage.price).toLocaleString('vi-VN')}₫</div>
                                                </div>
                                                <button onClick={() => setStep(1)} className="w-full btn-gold py-3 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs">
                                                    <CreditCard size={16} /> Tiếp tục thanh toán
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col h-full">
                                        <button onClick={() => setStep(0)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold mb-6 uppercase tracking-widest">
                                            <ArrowLeft size={14} /> Quay lại chọn gói
                                        </button>
                                        <div className="flex flex-col md:flex-row gap-8 flex-1">
                                            <div className="flex-1 space-y-6">
                                                <div>
                                                    <h3 className="text-xl font-black text-white mb-1 uppercase italic tracking-tighter">Thanh toán chuyển khoản</h3>
                                                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Vui lòng quét mã QR hoặc chuyển khoản thủ công</p>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
                                                        <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Gói huấn luyện</div>
                                                        <div className="text-white font-bold">{selectedPackage.title}</div>
                                                        <div className="text-yellow-500 font-black text-xl italic tracking-tighter mt-1">{Number(selectedPackage.price).toLocaleString('vi-VN')}₫</div>
                                                    </div>
                                                    <div className="space-y-3 font-medium">
                                                        <div className="flex justify-between items-center text-[11px]">
                                                            <span className="text-zinc-500 font-bold uppercase">Ngân hàng</span>
                                                            <span className="text-white font-bold uppercase">{BANK_INFO.ID}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[11px]">
                                                            <span className="text-zinc-500 font-bold uppercase">Số tài khoản</span>
                                                            <span className="text-white font-mono font-bold tracking-wider">{BANK_INFO.ACCOUNT_NO}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[11px]">
                                                            <span className="text-zinc-500 font-bold uppercase">Nội dung</span>
                                                            <span className="text-yellow-500 font-bold">FC {user.member_id} {selectedPackage.id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pt-4 mt-auto">
                                                    <button onClick={confirmRent} disabled={renting} 
                                                        className="w-full btn-gold py-4 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 shadow-xl shadow-yellow-900/10">
                                                        {renting ? 'ĐANG XỬ LÝ...' : <><Check size={18} /> TÔI ĐÃ THANH TOÁN</>}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-64 flex flex-col items-center justify-center gap-4">
                                                <div className="p-4 bg-white rounded-xl shadow-2xl flex items-center justify-center">
                                                    <img 
                                                        src={`https://img.vietqr.io/image/${BANK_INFO.ID}-${BANK_INFO.ACCOUNT_NO}-compact2.png?amount=${selectedPackage.price}&addInfo=FC%20${user.member_id}%20${selectedPackage.id}&accountName=${encodeURIComponent(BANK_INFO.ACCOUNT_NAME)}`} 
                                                        alt="VietQR"
                                                        className="w-full aspect-square object-contain"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-zinc-500 italic">QR tự động cập nhật số tiền</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}