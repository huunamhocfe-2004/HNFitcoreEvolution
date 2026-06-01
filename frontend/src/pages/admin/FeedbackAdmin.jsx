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
        <div className="space-y-6 text-slate-900 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Đánh giá & Phản hồi
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Quản lý ý kiến hội viên và trả lời trực tiếp
                    </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm shadow-slate-200/70">
                    <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Đánh giá TB
                        </div>
                        <div className="text-2xl font-black text-red-600">
                            {avgRating}/5.0
                        </div>
                    </div>

                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                fill={i < Math.round(avgRating) ? "#ef4444" : "transparent"}
                                className={i < Math.round(avgRating) ? "text-red-500" : "text-slate-300"}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {loading ? [...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-56 animate-pulse rounded-2xl bg-slate-200"
                    />
                )) :
                    feedbacks.map(f => (
                        <div
                            key={f.id}
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 transition-all duration-300 hover:border-red-200 hover:shadow-lg"
                        >
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                                    {f.avatar ? (
                                        <img
                                            src={f.avatar}
                                            alt={f.member_name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                                            <User size={18} />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                {f.member_name}
                                            </h3>

                                            <div className="mt-1 flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={10}
                                                        fill={i < f.rating ? "#ef4444" : "transparent"}
                                                        className={i < f.rating ? "text-red-500" : "text-slate-300"}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="whitespace-nowrap text-[10px] font-medium text-slate-400">
                                            {new Date(f.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>

                                    <div className="relative mt-3 text-sm leading-relaxed text-slate-600">
                                        <MessageSquare
                                            size={12}
                                            className="absolute -left-5 top-1 text-red-500 opacity-10 transition-opacity group-hover:opacity-30"
                                        />
                                        {f.comment || (
                                            <span className="italic text-slate-400">
                                                Hội viên không để lại bình luận...
                                            </span>
                                        )}
                                    </div>

                                    {f.admin_reply && (
                                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                                            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-red-600">
                                                Đã trả lời {f.replied_by_name ? `bởi ${f.replied_by_name}` : ''}
                                            </div>
                                            <div className="whitespace-pre-wrap text-sm text-slate-700">
                                                {f.admin_reply}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={() => toggleReply(f.id)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Reply size={14} />
                                            {openReplies[f.id] ? 'Ẩn trả lời' : f.admin_reply ? 'Sửa phản hồi' : 'Trả lời'}
                                        </button>
                                    </div>

                                    {openReplies[f.id] && (
                                        <div className="mt-4 space-y-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                Nội dung phản hồi
                                            </label>

                                            <textarea
                                                value={replyDrafts[f.id] || ''}
                                                onChange={e => setReplyDrafts(p => ({ ...p, [f.id]: e.target.value }))}
                                                className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                                placeholder="Nhập nội dung trả lời hội viên..."
                                            />

                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => saveReply(f.id)}
                                                    disabled={savingId === f.id}
                                                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <Send size={14} />
                                                    {savingId === f.id ? 'Đang lưu...' : 'Lưu phản hồi'}
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
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center shadow-sm">
                        <MessageSquare size={40} className="mx-auto mb-4 text-slate-300" />
                        <p className="italic text-slate-500">
                            Chưa có phản hồi nào từ hội viên.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}