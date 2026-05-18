import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Star, User, MessageSquare, Send, Reply } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FeedbackAdmin() {
    const [feedbacks, setFeedbacks] = useState([])
    const [loading, setLoading] = useState(true)
    const [replyDrafts, setReplyDrafts] = useState({})
    const [openReplies, setOpenReplies] = useState({})
    const [savingId, setSavingId] = useState(null)

    const load = async () => {
        setLoading(true)
        try {
            const r = await api.get('/feedback')
            setFeedbacks(r.data)
            setReplyDrafts(Object.fromEntries(r.data.map(f => [f.id, f.admin_reply || ''])))
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const toggleReply = (feedbackId) => {
        setOpenReplies(prev => ({ ...prev, [feedbackId]: !prev[feedbackId] }))
    }

    const saveReply = async (feedbackId) => {
        const reply = (replyDrafts[feedbackId] || '').trim()
        if (!reply) return toast.error('Vui lòng nhập nội dung phản hồi')

        setSavingId(feedbackId)
        try {
            const res = await api.put(`/feedback/${feedbackId}/reply`, { reply })
            setFeedbacks(items => items.map(item => item.id === feedbackId ? {
                ...item,
                admin_reply: res.data.reply,
                replied_by_name: res.data.replied_by_name,
                replied_by_role: res.data.replied_by_role,
                replied_at: res.data.replied_at,
            } : item))
            setOpenReplies(prev => ({ ...prev, [feedbackId]: false }))
            toast.success('Đã lưu phản hồi')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không lưu được phản hồi')
        } finally {
            setSavingId(null)
        }
    }

    const avgRating = feedbacks.length > 0
        ? (feedbacks.reduce((a, b) => a + Number(b.rating || 0), 0) / feedbacks.length).toFixed(1)
        : 0

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-white">Đánh giá & Phản hồi</h1>
                    <p className="text-sm text-zinc-500 mt-1">Quản lý ý kiến hội viên và trả lời trực tiếp</p>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-xl">
                    <div className="text-right">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Đánh giá TB</div>
                        <div className="text-2xl font-black text-yellow-500">{avgRating}/5.0</div>
                    </div>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill={i < Math.round(avgRating) ? "#eab308" : "transparent"}
                                className={i < Math.round(avgRating) ? "text-yellow-500" : "text-zinc-700"} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-56 rounded-xl" />) :
                    feedbacks.map(f => (
                        <div key={f.id} className="card p-5 group">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                                    {f.avatar ? <img src={f.avatar} alt={f.member_name} className="w-full h-full object-cover" /> :
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={18} /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-white text-sm">{f.member_name}</h3>
                                            <div className="flex gap-0.5 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} fill={i < f.rating ? "#eab308" : "transparent"}
                                                        className={i < f.rating ? "text-yellow-500" : "text-zinc-800"} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-zinc-600 font-medium whitespace-nowrap">
                                            {new Date(f.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>

                                    <div className="mt-3 text-sm text-zinc-400 leading-relaxed relative">
                                        <MessageSquare size={12} className="absolute -left-5 top-1 opacity-10 group-hover:opacity-30 transition-opacity" />
                                        {f.comment || <span className="italic text-zinc-600">Hội viên không để lại bình luận...</span>}
                                    </div>

                                    {f.admin_reply && (
                                        <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-1">
                                                Đã trả lời {f.replied_by_name ? `bởi ${f.replied_by_name}` : ''}
                                            </div>
                                            <div className="text-sm text-zinc-300 whitespace-pre-wrap">{f.admin_reply}</div>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={() => toggleReply(f.id)}
                                            className="btn-ghost px-4 py-2 text-xs font-black uppercase tracking-widest inline-flex items-center gap-2"
                                        >
                                            <Reply size={14} /> {openReplies[f.id] ? 'Ẩn trả lời' : f.admin_reply ? 'Sửa phản hồi' : 'Trả lời'}
                                        </button>
                                    </div>

                                    {openReplies[f.id] && (
                                        <div className="mt-4 space-y-2">
                                            <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                                Nội dung phản hồi
                                            </label>
                                            <textarea
                                                value={replyDrafts[f.id] || ''}
                                                onChange={e => setReplyDrafts(p => ({ ...p, [f.id]: e.target.value }))}
                                                className="input-dark w-full min-h-22.5 p-3 text-sm"
                                                placeholder="Nhập nội dung trả lời hội viên..."
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => saveReply(f.id)}
                                                    disabled={savingId === f.id}
                                                    className="btn-gold px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2"
                                                >
                                                    <Send size={14} /> {savingId === f.id ? 'Đang lưu...' : 'Lưu phản hồi'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                }
                {!loading && feedbacks.length === 0 && (
                    <div className="col-span-full text-center py-20 card border-dashed">
                        <MessageSquare size={40} className="mx-auto text-zinc-800 mb-4" />
                        <p className="text-zinc-600 italic">Chưa có phản hồi nào từ hội viên.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
