import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { User, Award, CheckCircle, CreditCard, X, ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const BANK_INFO = {
    ID: 'mbbank',
    ACCOUNT_NO: '003629022004',
    ACCOUNT_NAME: 'BUI HUU NAM'
}

export default function HirePT() {
    const { user } = useAuth()
    const [trainers, setTrainers] = useState([])
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTrainer, setSelectedTrainer] = useState(null)
    const [selectedPackage, setSelectedPackage] = useState(null)
    const [modal, setModal] = useState(false)
    const [step, setStep] = useState(0) // 0: selection, 1: payment
    const [renting, setRenting] = useState(false)

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
                    <div key={t.id} className="card-glass group p-6 hover:border-yellow-500/30 transition-all duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full p-0.5 border border-zinc-800 group-hover:border-yellow-500/50 transition-all duration-500 mb-4 overflow-hidden bg-zinc-900">
                                {t.avatar ? <img src={t.avatar} alt={t.name} className="w-full h-full object-cover rounded-full" /> : 
                                <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={40} /></div>}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{t.name}</h3>
                            <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-4 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                                {t.specialty || 'General Training'}
                            </div>
                            <div className="w-full space-y-3 mb-6 font-medium">
                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <Award size={14} className="text-yellow-500" />
                                    <span>7+ năm kinh nghiệm</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <CheckCircle size={14} className="text-yellow-500" />
                                    <span>Chứng chỉ Quốc tế NASM</span>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed mb-6 italic">
                                "{t.bio || 'Luôn đồng hành cùng bạn trên con đường chinh phục vóc dáng...'}"
                            </p>
                            <button onClick={() => openRent(t)} className="w-full btn-gold py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                                Thuê huấn luyện viên
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modal && (
                <div className="modal-overlay z-[100]" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal-box !max-w-[900px] p-0 overflow-hidden bg-[#0a0a0a] border border-zinc-800">
                        <div className="flex flex-col md:flex-row min-h-[500px]">
                            <div className="w-full md:w-1/3 bg-zinc-900/50 p-8 border-r border-zinc-800">
                                <div className="w-20 h-20 rounded-xl overflow-hidden mb-4 border border-zinc-800 shadow-lg">
                                    {selectedTrainer.avatar ? <img src={selectedTrainer.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600"><User size={30} /></div>}
                                </div>
                                <h4 className="font-bold text-white text-lg">{selectedTrainer.name}</h4>
                                <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-6">{selectedTrainer.specialty || 'BOXING, CROSSFIT, STRENGTH'}</div>
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
                </div>
            )}
        </div>
    )
}
