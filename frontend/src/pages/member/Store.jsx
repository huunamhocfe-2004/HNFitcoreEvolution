import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'
import { ShoppingCart, Package } from 'lucide-react'

const CAT_LABELS = {
    supplement: 'Thực phẩm',
    equipment: 'Dụng cụ',
    accessory: 'Phụ kiện',
    apparel: 'Trang phục',
    other: 'Khác'
}

export default function Store() {
    const navigate = useNavigate()
    const { addToCart, totalCount } = useCart()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/products')
            .then(r => setProducts(r.data))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
        )
    }

    return (
        <div className="relative text-slate-900">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Cửa Hàng HN Fitcore
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Sản phẩm bổ sung & Phụ kiện chính hãng
                    </p>
                </div>

                <button
                    onClick={() => navigate('/member/cart')}
                    className="relative rounded-xl border border-slate-200 bg-white p-3 text-red-600 shadow-sm shadow-slate-200/70 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                    <ShoppingCart size={24} />

                    {totalCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                            {totalCount}
                        </span>
                    )}
                </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map(p => (
                    <div
                        key={p.id}
                        className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
                    >
                        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-slate-50">
                            {p.image_url ? (
                                <img
                                    src={p.image_url}
                                    alt={p.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <Package size={48} className="text-slate-300" />
                            )}

                            <div className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur-md">
                                {CAT_LABELS[p.category]}
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col p-5">
                            <h3 className="mb-1 text-lg font-black leading-tight text-slate-900">
                                {p.name}
                            </h3>

                            <p className="mb-4 line-clamp-2 text-xs text-slate-500">
                                {p.description}
                            </p>

                            <div className="mt-auto flex items-end justify-between">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-tight text-slate-400">
                                        Giá bán
                                    </div>
                                    <div className="text-xl font-black text-red-600">
                                        {Number(p.price).toLocaleString('vi-VN')}₫
                                    </div>
                                </div>

                                <button
                                    onClick={() => addToCart(p)}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                                    title="Thêm vào giỏ hàng"
                                >
                                    <ShoppingCart size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm shadow-slate-200/70">
                        <Package size={44} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-sm text-slate-500">
                            Chưa có sản phẩm nào trong cửa hàng.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}