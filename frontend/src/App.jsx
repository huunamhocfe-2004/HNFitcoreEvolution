import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Pages
import LoginPage from './pages/auth/LoginPage'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Members from './pages/admin/Members'
import MemberDetail from './pages/admin/MemberDetail'
import Packages from './pages/admin/Packages'
import Subscriptions from './pages/admin/Subscriptions'
import BookingsAdmin from './pages/admin/BookingsAdmin'
import ProductsAdmin from './pages/admin/ProductsAdmin'
import OrdersAdmin from './pages/admin/OrdersAdmin'
import CheckIn from './pages/admin/CheckIn'
import ClassesAdmin from './pages/admin/ClassesAdmin'
import MemberLayout from './components/layout/MemberLayout'
import MemberProfile from './pages/member/MemberProfile'
import Progress from './pages/member/Progress'
import WorkoutLogs from './pages/member/WorkoutLogs'
import Store from './pages/member/Store'
import MemberOrders from './pages/member/MemberOrders'
import MemberBooking from './pages/member/MemberBooking'
import Cart from './pages/member/Cart'
import TrainersAdmin from './pages/admin/TrainersAdmin'
import FeedbackAdmin from './pages/admin/FeedbackAdmin'
import HirePT from './pages/member/HirePT'

// Route guards
const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth()
    if (loading) return (
        <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-yellow-500 font-bold tracking-widest text-xs uppercase animate-pulse">Đang tải Fitcore...</div>
        </div>
    )
    if (!user) return <Navigate to="/login" replace />
    if (roles && !roles.includes(user.role)) {
        return <Navigate to={user.role === 'member' ? '/member' : '/'} replace />
    }
    return children
}

const AppRoutes = () => {
    const { user } = useAuth()

    return (
        <Routes>
            <Route path="/login" element={
                user ? <Navigate to={user.role === 'member' ? '/member' : '/'} replace /> : <LoginPage />
            } />

            {/* Admin / Staff routes */}
            <Route path="/" element={
                <ProtectedRoute roles={['admin', 'staff']}>
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="members" element={<Members />} />
                <Route path="members/:id" element={<MemberDetail />} />
                <Route path="packages" element={<Packages />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="bookings" element={<BookingsAdmin />} />
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="orders" element={<OrdersAdmin />} />
                <Route path="checkin" element={<CheckIn />} />
                <Route path="classes-mgmt" element={<ClassesAdmin />} />
                <Route path="trainers" element={<TrainersAdmin />} />
                <Route path="feedback" element={<FeedbackAdmin />} />
            </Route>

            {/* Member routes */}
            <Route path="/member" element={
                <ProtectedRoute roles={['member']}>
                    <MemberLayout />
                </ProtectedRoute>
            }>
                <Route index element={<MemberProfile />} />
                <Route path="progress" element={<Progress />} />
                <Route path="workout-logs" element={<WorkoutLogs />} />
                <Route path="store" element={<Store />} />
                <Route path="member-orders" element={<MemberOrders />} />
                <Route path="booking" element={<MemberBooking />} />
                <Route path="hire-pt" element={<HirePT />} />
                <Route path="cart" element={<Cart />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <AppRoutes />
            </CartProvider>
        </AuthProvider>
    )
}
