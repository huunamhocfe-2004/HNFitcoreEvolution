import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  User,
  Award,
  CheckCircle,
  CreditCard,
  X,
  ArrowLeft,
  Check,
  Eye,
  MapPin,
  Briefcase,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { createPortal } from "react-dom";

const BANK_INFO = {
  ID: "mbbank",
  ACCOUNT_NO: "003629022004",
  ACCOUNT_NAME: "BUI HUU NAM",
};

// Hàm hỗ trợ parse JSON an toàn khi hiển thị chi tiết
const parseArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export default function HirePT() {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // States cho luồng thuê PT
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [modal, setModal] = useState(false);
  const [step, setStep] = useState(0); // 0: selection, 1: payment
  const [renting, setRenting] = useState(false);

  // State cho luồng xem chi tiết HLV
  const [viewingTrainer, setViewingTrainer] = useState(null);

  useEffect(() => {
    const loadRows = async () => {
      try {
        const [r1, r2] = await Promise.all([
          api.get("/trainers"),
          api.get("/packages"),
        ]);
        setTrainers(r1.data);
        setPackages(
          r2.data.filter((p) => p.title.toLowerCase().includes("pt")),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRows();
  }, []);

  const openRent = (trainer) => {
    setSelectedTrainer(trainer);
    setStep(0);
    setModal(true);
  };

  const confirmRent = async () => {
    if (!selectedPackage) return toast.error("Vui lòng chọn gói tập PT");
    setRenting(true);
    try {
      if (!user?.member_id)
        return toast.error(
          "Không tìm thấy thông tin hội viên. Vui lòng thử đăng nhập lại.",
        );

      await api.post("/subscriptions", {
        member_id: user.member_id,
        package_id: selectedPackage.id,
        trainer_id: selectedTrainer.id,
        is_paid: false,
      });

      toast.success(
        "Đã gửi yêu cầu thuê PT thành công! Vui lòng đợi quản trị viên xác nhận thanh toán.",
      );
      setModal(false);
      setSelectedPackage(null);
      setSelectedTrainer(null);
      setStep(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setRenting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-8 text-slate-900 duration-500">
      <div>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
          Chọn huấn luyện viên cá nhân
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Đội ngũ PT chuyên nghiệp sẵn sàng đồng hành cùng mục tiêu của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainers.map((t) => (
          <div
            key={t.id}
            className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 transition-all duration-300 hover:border-red-200 hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-0.5 transition-all duration-500 group-hover:border-red-300">
                {t.avatar ? (
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <User size={40} />
                  </div>
                )}
              </div>

              <h3 className="mb-1 flex items-center justify-center gap-2 text-lg font-black text-slate-900">
                {t.name}
                {t.badge && (
                  <span className="rounded bg-red-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white">
                    {t.badge}
                  </span>
                )}
              </h3>

              <div className="mb-4 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-600">
                {t.title ||
                  t.specialty ||
                  t.specialization ||
                  "General Training"}
              </div>

              <div className="mb-4 w-full space-y-3 font-medium">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Award size={14} className="text-red-600" />
                  <span>{t.experience_years || 0} năm kinh nghiệm</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <CheckCircle size={14} className="shrink-0 text-red-600" />
                  <span className="truncate">
                    {parseArray(t.certifications)[0] ||
                      "Chứng chỉ chuyên môn PT"}
                  </span>
                </div>
              </div>

              <p className="mb-6 line-clamp-2 w-full text-center text-xs italic leading-relaxed text-slate-500">
                "
                {t.bio ||
                  "Luôn đồng hành cùng bạn trên con đường chinh phục vóc dáng..."}
                "
              </p>
            </div>

            <div className="mt-auto flex w-full gap-2">
              <button
                onClick={() => setViewingTrainer(t)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Eye size={14} /> Xem
              </button>
              <button
                onClick={() => openRent(t)}
                className="flex-[1.5] rounded-xl bg-red-600 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:scale-[1.02] hover:bg-red-500 active:scale-95"
              >
                Thuê PT
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* POPUP XEM CHI TIẾT HLV */}
      {viewingTrainer &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={(e) =>
              e.target === e.currentTarget && setViewingTrainer(null)
            }
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
              <div className="relative flex items-center gap-6 border-b border-slate-200 bg-slate-50 p-8">
                <button
                  onClick={() => setViewingTrainer(null)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <X size={20} />
                </button>

                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-red-100 bg-white">
                  {viewingTrainer.avatar ? (
                    <img
                      src={viewingTrainer.avatar}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <User size={40} />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                    {viewingTrainer.name}
                    {viewingTrainer.badge && (
                      <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                        {viewingTrainer.badge}
                      </span>
                    )}
                  </h2>

                  <p className="mt-1 text-sm font-bold text-red-600">
                    {viewingTrainer.title || viewingTrainer.specialization}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={14} className="text-slate-400" />
                      {viewingTrainer.experience_years} năm kinh nghiệm
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      {viewingTrainer.work_address || "Hệ thống HN Fitcore"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="max-h-[60vh] space-y-8 overflow-y-auto p-8">
                <div>
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Thông điệp từ HLV
                  </h3>
                  <p className="border-l-2 border-red-200 pl-4 text-sm italic leading-relaxed text-slate-600">
                    "{viewingTrainer.bio || "Chưa cập nhật thông điệp"}"
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <Award size={14} className="text-red-600" />
                      Bằng cấp & Chứng chỉ
                    </h3>
                    <ul className="space-y-3">
                      {parseArray(viewingTrainer.certifications).length > 0 ? (
                        parseArray(viewingTrainer.certifications).map(
                          (item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs leading-relaxed text-slate-600"
                            >
                              <CheckCircle2
                                size={14}
                                className="mt-0.5 shrink-0 text-emerald-500"
                              />
                              {item}
                            </li>
                          ),
                        )
                      ) : (
                        <li className="text-xs text-slate-400">
                          Đang cập nhật...
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <BookOpen size={14} className="text-red-600" />
                      Chuyên môn giảng dạy
                    </h3>
                    <ul className="space-y-3">
                      {parseArray(viewingTrainer.teaching).length > 0 ? (
                        parseArray(viewingTrainer.teaching).map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs leading-relaxed text-slate-600"
                          >
                            <CheckCircle2
                              size={14}
                              className="mt-0.5 shrink-0 text-blue-500"
                            />
                            {item}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-400">
                          Đang cập nhật...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Kỹ năng nổi bật
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parseArray(viewingTrainer.skills).length > 0 ? (
                      parseArray(viewingTrainer.skills).map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">
                        Đang cập nhật...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4">
                <button
                  onClick={() => setViewingTrainer(null)}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    const t = viewingTrainer;
                    setViewingTrainer(null);
                    openRent(t);
                  }}
                  className="rounded-xl bg-red-600 px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                >
                  Bắt đầu tập với HLV này
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* POPUP THUÊ PT & THANH TOÁN */}
      {modal &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setModal(false)}
          >
            <div className="flex max-h-[85vh] w-full max-w-[900px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
              <div className="flex flex-col md:flex-row">
                <div className="w-full border-b border-slate-200 bg-slate-50 p-8 md:w-1/3 md:border-b-0 md:border-r">
                  <div className="mb-4 h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {selectedTrainer.avatar ? (
                      <img
                        src={selectedTrainer.avatar}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <User size={30} />
                      </div>
                    )}
                  </div>

                  <h4 className="text-lg font-black text-slate-900">
                    {selectedTrainer.name}
                  </h4>

                  <div className="mb-6 text-[10px] font-black uppercase tracking-widest text-red-600">
                    {selectedTrainer.title ||
                      selectedTrainer.specialty ||
                      selectedTrainer.specialization}
                  </div>

                  <div className="space-y-4 border-t border-slate-200 pt-6 font-medium">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={14} className="mt-0.5 text-red-600" />
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        Lộ trình tập luyện cá nhân hóa theo mục tiêu
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle size={14} className="mt-0.5 text-red-600" />
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        Hướng dẫn dinh dưỡng bài bản
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle size={14} className="mt-0.5 text-red-600" />
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        Theo dõi chỉ số cơ thể hàng tuần
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative flex-1 overflow-y-auto p-8">
                  <button
                    onClick={() => setModal(false)}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <X size={20} />
                  </button>

                  {step === 0 ? (
                    <>
                      <h3 className="mb-1 text-xl font-black text-slate-900">
                        Chọn gói tập PT
                      </h3>
                      <p className="mb-6 text-xs font-medium text-slate-500">
                        Các gói thuê PT tính theo ngày bao gồm phí phòng & phí
                        PT
                      </p>

                      <div className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
                        {packages.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPackage(p)}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                              selectedPackage?.id === p.id
                                ? "border-red-200 bg-red-50 shadow-[0_0_20px_rgba(239,68,68,0.08)]"
                                : "border-slate-200 bg-slate-50 hover:border-red-200 hover:bg-red-50/50"
                            }`}
                          >
                            <div>
                              <div className="text-sm font-bold text-slate-900">
                                {p.title}
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {p.duration_days} Ngày huấn luyện
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-red-600">
                                {Number(p.price).toLocaleString("vi-VN")}₫
                              </div>
                              <div className="text-[10px] font-medium text-slate-400">
                                Trọn gói
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedPackage && (
                        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 animate-in slide-in-from-bottom-2 duration-300">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="text-xs font-bold uppercase text-slate-500">
                              Tổng cộng
                            </div>
                            <div className="text-lg font-black text-red-600">
                              {Number(selectedPackage.price).toLocaleString(
                                "vi-VN",
                              )}
                              ₫
                            </div>
                          </div>
                          <button
                            onClick={() => setStep(1)}
                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                          >
                            <CreditCard size={16} />
                            Tiếp tục thanh toán
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full flex-col">
                      <button
                        onClick={() => setStep(0)}
                        className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-red-600"
                      >
                        <ArrowLeft size={14} /> Quay lại chọn gói
                      </button>

                      <div className="flex flex-1 flex-col gap-8 md:flex-row">
                        <div className="flex-1 space-y-6">
                          <div>
                            <h3 className="mb-1 text-xl font-black uppercase italic tracking-tighter text-slate-900">
                              Thanh toán chuyển khoản
                            </h3>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                              Vui lòng quét mã QR hoặc chuyển khoản thủ công
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                                Gói huấn luyện
                              </div>
                              <div className="font-bold text-slate-900">
                                {selectedPackage.title}
                              </div>
                              <div className="mt-1 text-xl font-black italic tracking-tighter text-red-600">
                                {Number(selectedPackage.price).toLocaleString(
                                  "vi-VN",
                                )}
                                ₫
                              </div>
                            </div>

                            <div className="space-y-3 font-medium">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold uppercase text-slate-500">
                                  Ngân hàng
                                </span>
                                <span className="font-bold uppercase text-slate-900">
                                  {BANK_INFO.ID}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold uppercase text-slate-500">
                                  Số tài khoản
                                </span>
                                <span className="font-mono font-bold tracking-wider text-slate-900">
                                  {BANK_INFO.ACCOUNT_NO}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold uppercase text-slate-500">
                                  Nội dung
                                </span>
                                <span className="font-bold text-red-600">
                                  FC {user.member_id} {selectedPackage.id}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto pt-4">
                            <button
                              onClick={confirmRent}
                              disabled={renting}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {renting ? (
                                "ĐANG XỬ LÝ..."
                              ) : (
                                <>
                                  <Check size={18} /> TÔI ĐÃ THANH TOÁN
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex w-full flex-col items-center justify-center gap-4 md:w-64">
                          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/80">
                            <img
                              src={`https://img.vietqr.io/image/${BANK_INFO.ID}-${BANK_INFO.ACCOUNT_NO}-compact2.png?amount=${selectedPackage.price}&addInfo=FC%20${user.member_id}%20${selectedPackage.id}&accountName=${encodeURIComponent(BANK_INFO.ACCOUNT_NAME)}`}
                              alt="VietQR"
                              className="aspect-square w-full object-contain"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                            <span className="text-[10px] font-bold italic text-slate-500">
                              QR tự động cập nhật số tiền
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
