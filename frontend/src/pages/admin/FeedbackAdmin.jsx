import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Star, User, MessageSquare } from 'lucide-react'

export default function FeedbackAdmin() {
    const [feedbacks, setFeedbacks] = useState([])
    const [loading, setLoading] = useState(true)

    const load = async () => {
        setLoading(true)
        try {
            const r = await api.get('/feedback')
            setFeedbacks(r.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const avgRating = feedbacks.length > 0 
        ? (feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1)
        : 0

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-white">Đánh giá & Phản hồi</h1>
                    <p className="text-sm text-zinc-500 mt-1">Ghi nhận ý kiến từ hội viên để cải thiện chất lượng dịch vụ</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />) :
                    feedbacks.map(f => (
                        <div key={f.id} className="card p-5 group">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                                    {f.avatar ? <img src={f.avatar} alt={f.member_name} className="w-full h-full object-cover" /> : 
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={18} /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-white text-sm">{f.member_name}</h3>
                                            <div className="flex gap-0.5 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} fill={i < f.rating ? "#eab308" : "transparent"} 
                                                        className={i < f.rating ? "text-yellow-500" : "text-zinc-800"} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-zinc-600 font-medium">
                                            {new Date(f.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                    <div className="mt-3 text-sm text-zinc-400 leading-relaxed relative">
                                        <MessageSquare size={12} className="absolute -left-5 top-1 opacity-10 group-hover:opacity-30 transition-opacity" />
                                        {f.comment || <span className="italic text-zinc-600">Hội viên không để lại bình luận...</span>}
                                    </div>
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
