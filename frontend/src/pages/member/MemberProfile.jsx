import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import {
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Star,
  MessageSquare,
  Send,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

const BANK_INFO = {
  ID: "mbbank",
  ACCOUNT_NO: "003629022004",
  ACCOUNT_NAME: "BUI HUU NAM",
};

const statusBadge = (s) =>
  ({
    active: (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
        Đang hoạt động
      </span>
    ),
    expired: (
      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Hết hạn
      </span>
    ),
    paused: (
      <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
        Tạm dừng
      </span>
    ),
  })[s] || (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
      {s}
    </span>
  );

export default function MemberProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: "" });
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [renewalActionLoading, setRenewalActionLoading] = useState(false);
  const memberQrRef = useRef(null);

  const loadProfile = () => {
    if (user?.member_id) {
      setLoading(true);
      api
        .get(`/members/${user.member_id}`)
        .then((r) => setProfile(r.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadProfile();
    api.get("/packages").then((r) => setPackages(r.data));
    api
      .get("/feedback/mine")
      .then((r) => setMyFeedbacks(r.data))
      .catch(() => setMyFeedbacks([]));
  }, [user]);

  const loadMyFeedbacks = () => {
    api
      .get("/feedback/mine")
      .then((r) => setMyFeedbacks(r.data))
      .catch(() => setMyFeedbacks([]));
  };

  const downloadMemberQr = () => {
    const qrCanvas = memberQrRef.current;
    if (!qrCanvas) return toast.error("Không tìm thấy mã QR để tải");

    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrCanvas, 40, 40, 560, 560);

    const link = document.createElement("a");
    link.download = `${profile.qr_code || `FC-${profile.id}`}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.comment.trim())
      return toast.error("Vui lòng nhập ý kiến của bạn");
    setSendingFeedback(true);
    try {
      await api.post("/feedback", feedback);
      toast.success("Cảm ơn bạn đã gửi phản hồi cho Fitcore!");
      setFeedback({ rating: 5, comment: "" });
      loadMyFeedbacks();
    } catch (err) {
      toast.error("Lỗi khi gửi phản hồi");
    } finally {
      setSendingFeedback(false);
    }
  };

  const startPurchase = (pkg) => {
    setSelectedPkg(pkg);
    setPurchaseStep(1);
  };

  const confirmPurchase = async () => {
    setSubmitting(true);
    try {
      await api.post("/subscriptions", {
        member_id: profile.id,
        package_id: selectedPkg.id,
        is_paid: 0,
      });
      toast.success(
        "Gửi yêu cầu thành công! Vui lòng đợi quản trị viên xác nhận.",
      );
      setPurchaseModal(false);
      setPurchaseStep(0);
      setSelectedPkg(null);
      loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi đăng ký gói");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRenewalProposal = async (subId, action) => {
    setRenewalActionLoading(true);
    try {
      if (action === "accept") {
        const res = await api.put(`/subscriptions/${subId}/accept-renewal`);
        toast.success(res.data.message || "Đã đồng ý gia hạn");
      } else {
        const res = await api.delete(`/subscriptions/${subId}/cancel-renewal`);
        toast.success(res.data.message || "Đã hủy đề xuất gia hạn");
      }
      loadProfile();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không xử lý được đề xuất gia hạn",
      );
    } finally {
      setRenewalActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="space-y-4">
        <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );

  if (!profile) {
    return (
      <div className="py-12 text-center text-slate-500">
        Không tìm thấy thông tin hội viên
      </div>
    );
  }

  const subscriptions = profile.subscriptions || [];

  const gymSub = subscriptions.find((s) => !s.trainer_id);
  const isGymRenewalProposal =
    gymSub &&
    !gymSub.is_paid &&
    ["admin", "staff"].includes(gymSub.created_by_role);
  const isGymPending = gymSub && !gymSub.is_paid && !isGymRenewalProposal;
  const isGymExpired =
    gymSub && gymSub.is_paid && new Date(gymSub.end_date) < new Date();
  const isGymActive = gymSub && gymSub.is_paid && !isGymExpired;

  const ptSub = subscriptions.find((s) => s.trainer_id);
  const isPtPending = ptSub && !ptSub.is_paid;
  const isPtActive =
    ptSub && ptSub.is_paid && new Date(ptSub.end_date) >= new Date();

  const currentSub = gymSub || ptSub;
  const isRenewalProposal = (s) =>
    s &&
    !s.is_paid &&
    !s.trainer_id &&
    ["admin", "staff"].includes(s.created_by_role);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-10 text-slate-900">
      {/* Main Header Card */}
      <div className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-red-100 blur-3xl" />

        <div className="relative flex flex-col items-center gap-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70 md:flex-row md:p-12">
          <div className="relative shrink-0">
            <div className="relative rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/80">
                <QRCodeCanvas
                  ref={memberQrRef}
                  value={profile.qr_code || `FC-${profile.id}`}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                THẺ HỘI VIÊN
              </div>
              <div className="font-mono text-sm font-bold text-slate-700">
                {profile.qr_code}
              </div>
              <button
                type="button"
                onClick={downloadMemberQr}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
              >
                <Download size={14} /> Tải QR
              </button>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="mb-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {statusBadge(profile.status)}

              {isGymRenewalProposal && (
                <span className="animate-pulse rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[9px] font-bold uppercase text-orange-600">
                  Đề xuất gia hạn
                </span>
              )}

              {isGymPending && (
                <span className="animate-pulse rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[9px] font-bold uppercase text-orange-600">
                  Gói tập chờ duyệt
                </span>
              )}

              {isPtPending && (
                <span className="animate-pulse rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[9px] font-bold uppercase text-orange-600">
                  Yêu cầu PT chờ duyệt
                </span>
              )}
            </div>

            <div className="mb-2 flex flex-col items-center gap-4 md:flex-row">
              {profile.avatar && (
                <div className="h-12 w-12 aspect-square shrink-0 overflow-hidden rounded-full border-2 border-red-200 shadow-lg shadow-red-100">
                  <img
                    src={profile.avatar}
                    className="block h-full w-full object-cover object-center"
                    alt={profile.name}
                  />
                </div>
              )}

              <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900 md:text-5xl">
                {profile.name}
              </h1>
            </div>

            <p className="mb-8 max-w-md font-medium text-slate-500">
              Chào mừng bạn trở lại! Hãy sử dụng mã QR bên cạnh để check-in
              nhanh tại quầy lễ tân.
            </p>

            <div className="grid grid-cols-2 gap-6 border-t border-slate-200 pt-6 sm:grid-cols-3">
              <div>
                <div className="mb-1 text-[10px] font-black uppercase text-slate-400">
                  Mã Số
                </div>
                <div className="font-bold text-slate-900">
                  {profile.qr_code}
                </div>
              </div>

              <div>
                <div className="mb-1 text-[10px] font-black uppercase text-slate-400">
                  Tham Gia
                </div>
                <div className="font-bold text-slate-900">
                  {new Date(profile.joined_date).toLocaleDateString("vi-VN")}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <div className="mb-1 text-[10px] font-bold uppercase text-slate-400">
                  Xếp Hạng
                </div>
                <div className="font-bold italic text-red-600">
                  ELITE MEMBER
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Subscriptions Middle Part */}
        <div className="space-y-6 md:col-span-2">
          {/* Gym Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 lg:p-8">
            <div className="absolute right-0 top-0 p-4">
              <CreditCard size={48} className="-rotate-12 text-slate-100" />
            </div>

            <h3 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              THÔNG TIN GÓI TẬP
            </h3>

            {gymSub ? (
              <div className="space-y-8">
                <div>
                  <div className="text-3xl font-black italic tracking-tight text-slate-900">
                    {gymSub.title}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {gymSub.description || "Gói tập tiêu chuẩn tại Fitcore"}
                  </div>

                  {!gymSub.is_paid && !isGymRenewalProposal && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                      <AlertCircle className="text-orange-500" size={20} />
                      <div className="text-xs font-bold uppercase tracking-widest text-orange-600">
                        Vui lòng đợi quản trị viên xác nhận thanh toán
                      </div>
                    </div>
                  )}

                  {isGymRenewalProposal && (
                    <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          className="mt-0.5 shrink-0 text-orange-500"
                          size={20}
                        />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-widest text-orange-600">
                            Quản trị viên đề xuất gia hạn gói tập này
                          </div>
                          <div className="mt-2 text-xs text-slate-600">
                            Bạn có muốn gia hạn tiếp gói này không?
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          disabled={renewalActionLoading}
                          onClick={() =>
                            handleRenewalProposal(gymSub.id, "accept")
                          }
                          className="rounded-xl bg-red-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Đồng ý gia hạn
                        </button>

                        <button
                          type="button"
                          disabled={renewalActionLoading}
                          onClick={() =>
                            handleRenewalProposal(gymSub.id, "cancel")
                          }
                          className="rounded-xl border border-slate-200 bg-white py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Không gia hạn
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500">
                      <Calendar size={12} /> NGÀY HIỆU LỰC
                    </div>
                    <div className="font-bold text-slate-900">
                      {gymSub.is_paid
                        ? new Date(gymSub.start_date).toLocaleDateString(
                            "vi-VN",
                          )
                        : "—"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-500">
                      <Calendar size={12} /> NGÀY HẾT HẠN
                    </div>
                    <div className="font-bold text-red-600">
                      {gymSub.is_paid
                        ? new Date(gymSub.end_date).toLocaleDateString("vi-VN")
                        : "—"}
                    </div>
                  </div>
                </div>

                {isGymExpired && !isGymPending && (
                  <button
                    onClick={() => setPurchaseModal(true)}
                    className="w-full rounded-xl bg-red-600 py-4 font-black uppercase italic tracking-widest text-white transition hover:bg-red-500"
                  >
                    GIA HẠN GÓI TẬP NGAY
                  </button>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="mb-6 font-medium text-slate-500">
                  Bạn chưa đăng ký gói tập nào.
                </p>
                <button
                  onClick={() => setPurchaseModal(true)}
                  className="rounded-xl bg-red-600 px-10 py-4 font-black uppercase italic tracking-widest text-white shadow-xl shadow-red-200 transition hover:scale-105 hover:bg-red-500 active:scale-95"
                >
                  MUA GÓI TẬP NGAY
                </button>
              </div>
            )}
          </div>

          {/* PT Card if exists */}
          {ptSub && (
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 lg:p-8">
              <div className="absolute right-0 top-0 p-4">
                <User size={48} className="-rotate-12 text-slate-100" />
              </div>

              <h3 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                HUẤN LUYỆN VIÊN RIÊNG
              </h3>

              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-1 space-y-6">
                  <div>
                    <div className="mb-1 text-[10px] font-bold uppercase text-slate-400">
                      PT ĐANG THEO DÕI
                    </div>
                    <div className="text-2xl font-black italic text-slate-900">
                      {ptSub.trainer_name}
                    </div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-widest text-red-600">
                      {ptSub.title}
                    </div>
                  </div>

                  {!ptSub.is_paid ? (
                    <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                      <AlertCircle className="text-orange-500" size={18} />
                      <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                        Đang chờ admin duyệt yêu cầu
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-1 text-[9px] font-bold uppercase text-slate-400">
                          BẮT ĐẦU
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {new Date(ptSub.start_date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-1 text-[9px] font-bold uppercase text-slate-400">
                          KẾT THÚC
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {new Date(ptSub.end_date).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-24 w-24 self-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 md:self-start">
                  {ptSub.trainer_avatar ? (
                    <img
                      src={ptSub.trainer_avatar}
                      className="block h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <User size={40} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Personal Details Side */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
          <h3 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
            CÁ NHÂN
          </h3>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-red-50 p-2 text-red-600">
                <Mail size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Email liên hệ
                </div>
                <div className="truncate text-sm font-medium text-slate-700">
                  {profile.email}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-red-50 p-2 text-red-600">
                <Phone size={16} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">
                  Số điện thoại
                </div>
                <div className="text-sm font-medium text-slate-700">
                  {profile.phone || "—"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-red-50 p-2 text-red-600">
                <Calendar size={16} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">
                  Ngày sinh
                </div>
                <div className="text-sm font-medium text-slate-700">
                  {profile.birth_date
                    ? new Date(profile.birth_date).toLocaleDateString("vi-VN")
                    : "—"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-red-50 p-2 text-red-600">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">
                  Định danh
                </div>
                <div className="font-mono text-sm font-medium tracking-tighter text-slate-700">
                  {profile.id_card || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
        <div className="absolute right-0 top-0 rotate-12 p-6 text-slate-100">
          <MessageSquare size={120} />
        </div>

        <h3 className="mb-8 flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-slate-500">
          <Star size={16} className="fill-red-500 text-red-500" />
          ĐÁNH GIÁ TRẢI NGHIỆM
        </h3>

        <form onSubmit={submitFeedback} className="relative z-10 max-w-2xl">
          <div className="mb-6">
            <label className="mb-4 block text-xs font-black uppercase tracking-widest text-slate-500">
              Mức độ hài lòng của bạn?
            </label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedback((p) => ({ ...p, rating: star }))}
                  className={`rounded-xl border p-3 transition-all ${
                    feedback.rating >= star
                      ? "border-red-200 bg-red-50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                      : "border-slate-200 bg-slate-50 text-slate-300 hover:border-red-200 hover:text-red-400"
                  }`}
                >
                  <Star
                    size={24}
                    className={feedback.rating >= star ? "fill-red-500" : ""}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-3 block text-xs font-black uppercase tracking-widest text-slate-500">
              Ý kiến đóng góp
            </label>
            <textarea
              value={feedback.comment}
              onChange={(e) =>
                setFeedback((p) => ({ ...p, comment: e.target.value }))
              }
              className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
              placeholder="Hãy để lại ý kiến của bạn để giúp HN Fitcore ngày càng hoàn thiện hơn..."
            />
          </div>

          <button
            type="submit"
            disabled={sendingFeedback}
            className="group flex items-center gap-2 rounded-xl bg-red-600 px-10 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sendingFeedback ? (
              "ĐANG GỬI..."
            ) : (
              <>
                <Send
                  size={16}
                  className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
                GỬI PHẢN HỒI
              </>
            )}
          </button>
        </form>

        {myFeedbacks.length > 0 && (
          <div className="relative z-10 mt-8 border-t border-slate-200 pt-8">
            <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500">
              Lịch sử phản hồi
            </h4>
            <div className="space-y-3">
              {myFeedbacks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < item.rating ? "#ef4444" : "transparent"}
                          className={
                            i < item.rating ? "text-red-500" : "text-slate-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">{item.comment}</p>

                  {item.admin_reply ? (
                    <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3">
                      <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-red-600">
                        Phản hồi từ Fitcore
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {item.admin_reply}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Đang chờ admin / nhân viên phản hồi
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="border-b border-slate-200 p-8">
          <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-slate-500">
            <CreditCard size={16} className="text-red-500" />
            LỊCH SỬ ĐĂNG KÝ & THANH TOÁN
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Gói tập / Loại
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Chi phí
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Thời hạn
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.map((s, i) => (
                <tr key={i} className="transition-colors hover:bg-red-50/40">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">
                      {s.title}
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {s.trainer_id ? `PT: ${s.trainer_name}` : "GÓI CƠ BẢN"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-red-600">
                      {Number(s.amount_paid || s.price).toLocaleString("vi-VN")}
                      ₫
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-bold uppercase text-slate-500">
                      {new Date(s.start_date).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(s.end_date).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {s.is_paid ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-600">
                        Thành công
                      </span>
                    ) : isRenewalProposal(s) ? (
                      <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[9px] font-black uppercase text-orange-600">
                        Đề xuất gia hạn
                      </span>
                    ) : (
                      <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[9px] font-black uppercase text-orange-600">
                        Chờ duyệt
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {subscriptions.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center text-sm italic text-slate-500"
                  >
                    Chưa có lịch sử giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {purchaseModal && 
      createPortal(
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={(e) =>
            e.target === e.currentTarget && setPurchaseModal(false)
          }
        >
          <div className="flex max-h-[85vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
            {purchaseStep === 0 ? (
              <div className="flex max-h-[85vh] flex-col">
                <div className="border-b border-slate-200 p-8 pb-5">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                    Chọn Gói Tập
                  </h2>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Nâng cấp sức mạnh cùng HN Fitcore evolution
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {packages.map((p) => (
                      <div
                        key={p.id}
                        className="group flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all hover:-translate-y-1 hover:border-red-200 hover:bg-red-50/60 hover:shadow-lg"
                        onClick={() => startPurchase(p)}
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="rounded-lg bg-red-50 p-2 text-red-600">
                            <CreditCard size={20} />
                          </div>
                          <div className="text-xs font-black uppercase text-slate-400 transition-colors group-hover:text-red-600">
                            {p.duration_days} ngày
                          </div>
                        </div>

                        <div className="mb-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-red-600">
                          {p.title}
                        </div>

                        <p className="mb-6 flex-1 text-xs text-slate-500">
                          {p.description}
                        </p>

                        <div className="text-2xl font-black italic tracking-tighter text-red-600">
                          {Number(p.price).toLocaleString("vi-VN")}₫
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-200 bg-white p-5">
                  <button
                    onClick={() => setPurchaseModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                  >
                    ĐÓNG
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-h-[85vh] overflow-y-auto">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-8">
                    <button
                      onClick={() => setPurchaseStep(0)}
                      className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors hover:text-red-600"
                    >
                      <ArrowLeft size={14} /> QUAY LẠI
                    </button>

                    <h2 className="mb-2 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                      Thanh Toán
                    </h2>
                    <p className="mb-8 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Chuyển khoản QR để kích hoạt nhanh
                    </p>

                    <div className="space-y-6">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                          Gói đã chọn
                        </div>
                        <div className="font-bold text-slate-900">
                          {selectedPkg.title}
                        </div>
                        <div className="mt-1 text-xl font-black italic tracking-tighter text-red-600">
                          {Number(selectedPkg.price).toLocaleString("vi-VN")}₫
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold uppercase text-slate-500">
                            Ngân hàng
                          </span>
                          <span className="font-bold uppercase text-slate-900">
                            {BANK_INFO.ID}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold uppercase text-slate-500">
                            Số tài khoản
                          </span>
                          <span className="font-mono font-bold tracking-wider text-slate-900">
                            {BANK_INFO.ACCOUNT_NO}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold uppercase text-slate-500">
                            Nội dung
                          </span>
                          <span className="font-bold text-red-600">
                            FC {profile.qr_code} {selectedPkg.id}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-4">
                        <button
                          onClick={confirmPurchase}
                          disabled={submitting}
                          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submitting ? (
                            "ĐANG XỬ LÝ..."
                          ) : (
                            <>
                              <Check size={18} /> TÔI ĐÃ CHUYỂN KHOẢN
                            </>
                          )}
                        </button>

                        <p className="mt-4 text-center text-[10px] font-bold uppercase italic tracking-widest text-slate-400">
                          *Gói tập sẽ được kích hoạt ngay sau khi admin xác nhận
                          giao dịch
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col items-center justify-center gap-6 bg-slate-50 p-12 md:w-95">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Quét mã VietQR
                    </div>

                    <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.16)]">
                      <img
                        src={`https://img.vietqr.io/image/${BANK_INFO.ID}-${BANK_INFO.ACCOUNT_NO}-compact2.png?amount=${selectedPkg.price}&addInfo=FC%20${profile.qr_code}%20${selectedPkg.id}&accountName=${encodeURIComponent(BANK_INFO.ACCOUNT_NAME)}`}
                        alt="VietQR"
                        className="aspect-square w-full object-contain"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                      <span className="text-[10px] font-bold italic text-slate-700">
                        Mã QR tự động cập nhật số tiền
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
