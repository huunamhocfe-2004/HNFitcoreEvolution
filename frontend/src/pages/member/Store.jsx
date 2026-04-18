import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'
import { ShoppingCart, Package } from 'lucide-react'

const CAT_LABELS = { supplement: 'Thực phẩm', equipment: 'Dụng cụ', accessory: 'Phụ kiện', apparel: 'Trang phục', other: 'Khác' }

export default function Store() {
    const navigate = useNavigate()
    const { addToCart, totalCount } = useCart()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/products').then(r => setProducts(r.data)).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="skeleton h-96 rounded-2xl" />

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-white">Cửa Hàng HN Fitcore</h1>
                    <p className="text-sm text-gray-500 mt-1">Sản phẩm bổ sung & Phụ kiện chính hãng</p>
                </div>
                <button
                    onClick={() => navigate('/member/cart')}
                    className="relative p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-yellow-500 hover:bg-zinc-800 transition-colors"
                >
                    <ShoppingCart size={24} />
                    {totalCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                            {totalCount}
                        </span>
                    )}
                </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(p => (
                    <div key={p.id} className="card bg-zinc-900/50 border-zinc-800 p-0 overflow-hidden flex flex-col group hover:border-yellow-500/30 transition-all">
                        <div className="aspect-square bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                            {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <Package size={48} className="text-zinc-800" />
                            )}
                            <div className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-zinc-400 border border-zinc-800">
                                {CAT_LABELS[p.category]}
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-white text-lg mb-1 leading-tight">{p.name}</h3>
                            <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{p.description}</p>

                            <div className="mt-auto flex items-end justify-between">
                                <div>
                                    <div className="text-xs text-zinc-600 font-bold uppercase tracking-tight">Giá bán</div>
                                    <div className="text-xl font-bold text-yellow-500">{Number(p.price).toLocaleString('vi-VN')}₫</div>
                                </div>
                                <button
                                    onClick={() => addToCart(p)}
                                    className="btn-gold !p-2 rounded-lg"
                                >
                                    <ShoppingCart size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}
