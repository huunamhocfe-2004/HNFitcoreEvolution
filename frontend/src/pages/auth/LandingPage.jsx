import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import useInview from "../../../src/hooks/useInview";
import {
  Phone,
  MapPinHouse,
  Mail,
  Copyright,
  Instagram,
  Facebook,
  User,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function LandingPage() {
  const navigate = useNavigate();
  //   const [page, setPage] = useState("landing");
  const [show, setShow] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const [introRef, heroVisible] = useInview();
  const [getReadyRef, getReadyVisible] = useInview();
  const [trainerRef, trainerVisible] = useInview();
  const [programRef, programVisible] = useInview();
  const [memberRef, memberVisible] = useInview();
  const [contactRef, contactVisible] = useInview();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);
  const programs = [
    {
      title: "Strength Training",
      desc: "Quản lý giáo án, huấn luyện viên cá nhân và tiến độ tập luyện cho từng hội viên.",
      active: false,
      icon: "🏋️",
    },
    {
      title: "Yoga Class",
      desc: "Sắp xếp lớp học, số lượng học viên và lịch đặt chỗ theo thời gian thực.",
      active: false,
      icon: "🧘",
    },
    {
      title: "Bodybuilding",
      desc: "Theo dõi gói tập, check-in, thanh toán và hiệu suất vận hành phòng gym tập trung.",
      active: true,
      icon: "💪",
    },
    {
      title: "Weight Loss",
      desc: "Quản lý mục tiêu thể chất, đo chỉ số cơ thể và lộ trình chăm sóc khách hàng.",
      active: false,
      icon: "🔥",
    },
  ];

  const pricing = [
    {
      name: "Discover",
      monthlyPrice: "300000",
      annualPrice: "3000000",
      features: ["5 lớp mỗi tuần", "4 buổi PT mỗi tháng", "Báo cáo cơ bản"],
      highlight: false,
    },
    {
      name: "Enterprise",
      monthlyPrice: "500000",
      annualPrice: "5000000",
      features: [
        "PT không giới hạn",
        "Báo cáo nâng cao",
        "Quản lý check-in thông minh",
      ],
      highlight: true,
    },
    {
      name: "Professional",
      monthlyPrice: "900000",
      annualPrice: "9000000",
      features: ["8 lớp mỗi tháng", "Quản lý HLV", "Theo dõi doanh thu"],
      highlight: false,
    },
  ];
  const trainers = [
    {
      name: "Bùi Hữu Nam",
      role: "Senior Bodybuilding Coach",
      img: "../../../public/me.jpg",
      bio: "Bùi Hữu Nam là một huấn luyện viên dày dặn kinh nghiệm với hơn 10 năm thay đổi vóc dáng cho học viên.",
      rate: "500k/hr",
      status: "HN Fitcore",
      badge: "available",
      skills: ["Gym", "Nutrition", "Bulking", "+2"],
      // Các trường bổ sung:
      email: "nam.bui@hnfitcore.com",
      phone: "0367 397 104",
      address: "Cơ sở 1 - Cầu Giấy, Hà Nội",
      certifications: [
        "NASM Certified Personal Trainer",
        "Chứng nhận chuyên gia Dinh dưỡng Thể thao (ISSA)",
      ],
      teaching: [
        "Bodybuilding Advanced",
        "Strength Training",
        "Kiểm soát cân nặng",
      ],
    },
    {
      name: "Alex Johnson",
      role: "Yoga Master",
      img: "../../../public/Stones.jpg",
      bio: "Alex là một chuyên gia Yoga giúp bạn tìm lại sự cân bằng giữa tâm trí và cơ thể một cách hiệu quả.",
      rate: "300k/hr",
      status: "Freelancer",
      badge: "",
      skills: ["Yoga", "Meditation", "Flexibility", "+1"],
      email: "alex.j@gmail.com",
      phone: "0988 123 456",
      address: "Cơ sở 2 - Quận 1, TP.HCM",
      certifications: [
        "200-Hour RYT Yoga Alliance",
        "Chứng chỉ Trị liệu Thiền định",
      ],
      teaching: ["Hatha Yoga", "Vinyasa Flow", "Meditation Core"],
    },
    {
      name: "Minh Tuấn",
      role: "Strength & Conditioning",
      img: "../../../public/garcia.webp",
      bio: "Chuyên gia đào tạo vận động viên chuyên nghiệp với các giáo án sức mạnh nâng cao.",
      rate: "450k/hr",
      status: "HN Fitcore",
      badge: "hot",
      skills: ["Powerlifting", "Crossfit", "Cardio", "+3"],
      email: "tuan.minh@hnfitcore.com",
      phone: "0912 345 678",
      address: "Cơ sở 1 - Cầu Giấy, Hà Nội",
      certifications: [
        "CSCS (Certified Strength and Conditioning Specialist)",
        "Cử nhân Giáo dục Thể chất",
      ],
      teaching: ["Powerlifting", "Crossfit", "Huấn luyện Thể lực chuyên sâu"],
    },
    {
      name: "Sarah Kim",
      role: "Weight Loss Specialist",
      img: "../../../public/Sarah Kim.png",
      bio: "Đồng hành cùng bạn trên hành trình giảm mỡ, siết cơ khoa học mà không cần nhịn ăn cực đoan.",
      rate: "350k/hr",
      status: "Freelancer",
      badge: "available",
      skills: ["Diet", "HIIT", "Pilates", "+1"],
      email: "sarah.kim@gmail.com",
      phone: "0933 555 777",
      address: "Cơ sở 3 - Đống Đa, Hà Nội",
      certifications: [
        "ACE Weight Management Specialist",
        "Chứng chỉ HLV Pilates Quốc tế",
      ],
      teaching: ["Weight Loss Bootcamp", "Pilates", "HIIT Cardio"],
    },
    {
      name: "Linda",
      role: "Kickboxing Coach",
      img: "../../../public/Linda.png",
      bio: "Huấn luyện viên võ thuật tự do giúp bạn rèn luyện phản xạ, đốt mỡ và tự vệ thực chiến.",
      rate: "400k/hr",
      status: "HN Fitcore",
      badge: "",
      skills: ["Boxing", "Muay Thai", "Fitness", "+2"],
      email: "linda.fight@hnfitcore.com",
      phone: "0977 888 999",
      address: "Cơ sở 1 - Cầu Giấy, Hà Nội",
      certifications: [
        "Đai đen Taekwondo",
        "Huấn luyện viên Muay Thai chuyên nghiệp",
      ],
      teaching: ["Kickboxing", "Muay Thai Cơ Bản", "Phản xạ tự vệ"],
    },
    {
      name: "Ngọc Diệp",
      role: "Interactive Designer",
      img: "../../../public/anna.jpg",
      bio: "Chuyên gia thiết kế lộ trình tập luyện cá nhân hóa theo từng thể trạng đặc biệt của khách hàng.",
      rate: "300k/hr",
      status: "Freelancer",
      badge: "free trial",
      skills: ["Planning", "Anatomy", "Recovery", "+4"],
      email: "diep.ngoc@gmail.com",
      phone: "0909 111 222",
      address: "Cơ sở 2 - Quận 1, TP.HCM",
      certifications: [
        "Chứng chỉ Phục hồi chức năng",
        "Chuyên gia Phân tích Vận động",
      ],
      teaching: [
        "Thiết kế Lộ trình Dinh dưỡng",
        "Bài tập Phục hồi (Recovery)",
        "Posture Correction",
      ],
    },
  ];
  return (
    <div className="min-h-screen bg-[#2b2626] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between py-6">
        <div className="flex gap-5">
          <div className="relative w-15 h-15 rounded-full overflow-hidden">
            <img
              className="absolute w-full h-full object-cover object-center"
              src="../../../public/favicon.ico"
              alt=""
            />
          </div>
          <button className="text-xl font-extrabold tracking-widest text-red-500">
            HN Fitcore Evolution
          </button>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-200 md:flex">
          <a href="#home" className="text-red-500">
            Home
          </a>
          <a href="#about" className="hover:text-white">
            About us
          </a>
          <a href="#program" className="hover:text-white">
            Program
          </a>
          <a href="#membership" className="hover:text-white">
            Membership
          </a>
          <a href="#contact" className="hover:text-white">
            Contact
          </a>
        </nav>

        <button
          onClick={() => navigate("/login")}
          className="cursor-pointer rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-red-900/40 transition hover:bg-red-500"
        >
          Đăng nhập
        </button>
      </header>

      {/* giữ nguyên toàn bộ phần body */}
      <section
        ref={introRef}
        id="home"
        className="relative mx-auto grid max-w-7xl items-center gap-10 overflow-hidden px-6 pb-20 pt-8 lg:grid-cols-2 lg:px-10"
      >
        <div className="absolute -left-16 top-40 h-72 w-72 rounded-full bg-red-700/25 blur-3xl" />
        <div
          className={`transition-all duration-700 ease-out ${
            heroVisible
              ? "translate-x-0 opacity-100 scale-100"
              : "-translate-x-20 opacity-0 scale-95"
          }`}
        >
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight md:text-6xl">
            We believe in transforming lives through{" "}
            <span className="text-red-500">Fitness</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 md:text-base">
            Giải pháp quản lý phòng gym hiện đại giúp bạn kiểm soát hội viên,
            gói tập, huấn luyện viên, lịch lớp và doanh thu trong cùng một hệ
            thống trực quan.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="cursor-pointer rounded-xl bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-500"
            >
              Get Started
            </button>
            <button
              onClick={() => setIsVideoOpen(true)}
              className="flex items-center gap-3 text-slate-300 hover:text-white"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg">
                ▶
              </span>
              Watch Videos
            </button>
          </div>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-extrabold">65+</div>
              <div className="mt-1 text-sm text-slate-300">
                HLV chuyên nghiệp
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">978+</div>
              <div className="mt-1 text-sm text-slate-300">Hội viên</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold">200+</div>
              <div className="mt-1 text-sm text-slate-300">Chương trình</div>
            </div>
          </div>
        </div>

        <div
          className={`relative flex justify-center lg:justify-end transition-all duration-700 delay-200 ease-out ${heroVisible ? "translate-x-0 opacity-100 blur-0 scale-100" : "translate-x-20 opacity-0 blur-sm scale-95"}`}
        >
          <div
            className={`absolute bottom-8 right-10 h-56 w-56 rounded-full bg-red-600/20 blur-3xl`}
          />
          <img
            src="/intro.jpg"
            alt="Gym members"
            className={`relative z-10 h-135 w-full max-w-130 rounded-[28px] object-cover shadow-2xl shadow-black/40`}
          />
        </div>
      </section>

      <section
        ref={getReadyRef}
        id="about"
        className="mx-auto grid max-w-7xl items-center gap-10 bg-[#4a4545] px-6 py-16 lg:grid-cols-[420px_1fr] lg:px-10"
      >
        <div
          className={`mx-auto w-full max-w-90 overflow-hidden rounded-[28px] transition-all duration-700 ease-out ${getReadyVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"}`}
        >
          <img
            src="../../../public/gym.webp"
            alt="Fitness woman"
            className="h-90 w-full object-cover"
          />
        </div>

        <div
          className={`transition-all duration-700 ease-out ${show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
        >
          <h2 className="text-4xl font-extrabold leading-tight">
            Hãy sẵn sàng để đạt được mục tiêu{" "}
            <span className="text-red-500">thể chất</span> của bạn!
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">
            Tối ưu vận hành phòng gym với dashboard quản lý tập trung. Theo dõi
            hội viên, check-in, lớp học, doanh thu và hiệu suất huấn luyện viên
            trên một giao diện duy nhất.
          </p>
          <button
            onClick={() => setPage("login")}
            className={`cursor-pointer mt-8 rounded-xl bg-red-600 px-8 py-3 font-semibold hover:bg-red-500 transition-all duration-700 ease-out delay-800 ${getReadyVisible ? "translate-y-0 opacity-100" : "translate-y-30 opacity-0"}`}
          >
            Free Trial Today
          </button>
        </div>
      </section>

      <section
        ref={programRef}
        id="program"
        className="mx-auto max-w-7xl px-6 py-16 lg:px-10"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2
              className={`text-4xl font-extrabold leading-tight transition-all duration-700 ${programVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"}`}
            >
              Chương trình tốt nhất <br /> Chúng tôi cung cấp cho bạn
            </h2>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {programs.map((item, index) => (
            <div
              key={item.title}
              className={`rounded-[22px] p-6 transition-all duration-700 flex flex-col ${
                item.active
                  ? "bg-red-600 shadow-xl shadow-red-950/30"
                  : "bg-[#5a5555] hover:bg-[#655f5f]"
              } ${
                programVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-16 opacity-0"
              }`}
              style={{
                transitionDelay: `${index * 350}ms`,
              }}
            >
              <div className="mb-5 text-3xl">{item.icon}</div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p
                className={`mt-4 text-sm leading-7 ${item.active ? "text-white/90" : "text-slate-200"}`}
              >
                {item.desc}
              </p>
              <button className="cursor-pointer text-sm font-semibold underline underline-offset-4 mt-auto mr-auto pt-6">
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={memberRef}
        id="membership"
        className="bg-[#3f3a3a] px-6 py-16 lg:px-10 text-white"
      >
        <div className="mx-auto max-w-7xl">
          <div
            className={`text-center transition-all duration-700 ${
              memberVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-4xl font-extrabold">Chọn Gói Hội Viên</h2>
            <p className="mt-3 text-slate-300">
              Chọn gói phù hợp cho mô hình phòng gym của bạn.
            </p>
            <div className="mx-auto mt-6 inline-flex rounded-full bg-[#5a5555] p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  !isAnnual
                    ? "bg-red-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Tháng
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  isAnnual
                    ? "bg-red-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Năm
              </button>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pricing.map((plan, index) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 transition-all duration-700 ${
                  plan.highlight
                    ? "bg-red-600 shadow-2xl shadow-red-950/30"
                    : "bg-[#5a5555]"
                } ${
                  memberVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 350}ms` }}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold">
                      {/* Giả sử plan.price là số, ta format sang VNĐ */}
                      {Number(
                        isAnnual ? plan.annualPrice : plan.monthlyPrice,
                      ).toLocaleString("vi-VN")}
                    </span>
                    <span className="text-xl font-bold">đ</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-200">mỗi tháng</div>
                </div>

                <ul className="mt-8 space-y-4 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="text-green-400">✔</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setPage("login")}
                  className={`mt-8 w-full rounded-full px-5 py-3 font-semibold transition cursor-pointer ${
                    plan.highlight
                      ? "bg-white text-red-600 hover:bg-slate-100"
                      : "border border-white/40 hover:bg-white/10"
                  }`}
                >
                  Đăng ký ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION TRAINERS (LÀM LẠI THEO MẪU PROFILE CARDS) --- */}
      <section
        ref={trainerRef}
        id="trainers"
        className="mx-auto max-w-7xl px-6 py-16 lg:px-10"
      >
        <div className="mb-12 flex items-center justify-between">
          <div className="text-center w-full">
            <h2
              className={`text-4xl uppercase font-extrabold transition-all duration-700 ${trainerVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
            >
              HUẤN LUYỆN VIÊN
            </h2>
            <p className="mt-2 text-slate-400">
              Đội ngũ chuyên gia sẵn sàng đồng hành cùng bạn.
            </p>
          </div>
          {/* Các nút điều hướng tùy chỉnh nếu muốn, hoặc dùng mặc định của Swiper */}
        </div>

        <div
          className={`transition-all duration-1000 delay-300 ${trainerVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: ".custom-next",
              prevEl: ".custom-prev",
            }}
            pagination={{ clickable: true, dynamicMainBullets: true }}
            autoplay={{ delay: 5000 }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }, // Hiển thị đúng 3 profile mỗi lần
            }}
            className="px-4 py-8 pb-24 relative" // Để lộ shadow khi hover
          >
            {trainers.map((trainer, index) => (
              <SwiperSlide key={index}>
                <div className="bg-linear-to-b from-gray-100 via-gray-200 to-[#ffffff] group flex flex-col overflow-hidden rounded-[10px] bg-[#3f3a3a] shadow-lg transition-all duration-300 hover:scale-98 hover:shadow-2xl hover:shadow-black/50">
                  <div className="relative flex grow flex-col items-center p-8">
                    {/* Avatar */}
                    <div className="relative">
                      <img
                        src={trainer.img}
                        alt={trainer.name}
                        className="h-28 w-28 rounded-full border-4 border-[#2b2626] object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Info */}
                    <h3 className="mt-5 text-xl font-bold text-black">
                      {trainer.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-400">
                      {trainer.role}
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <User size={14} /> {trainer.status}
                    </div>

                    {/* Skills Tags */}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {trainer.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className={`rounded-full border px-3 py-1 text-[11px] font-bold ${skill.startsWith("+") ? "bg-blue-600 border-blue-600 text-white" : "border-slate-500 text-black"}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <p className="mt-6 text-center text-sm leading-relaxed text-slate-400 line-clamp-2 italic">
                      "{trainer.bio}"
                    </p>
                  </div>

                  {/* Bottom Button (Full Width) */}
                  <button
                    onClick={() => {
                      setSelectedTrainer(trainer);
                    }}
                    className="mx-auto w-fit px-6 cursor-pointer rounded-4xl inline-block bg-[#011dbd] py-3 mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-300 transition-all group-hover:bg-blue-600 group-hover:text-white"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </SwiperSlide>
            ))}
            <div className="custom-prev absolute left-0 top-[45%] z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/5 border border-white/10 text-black backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-red-500 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <ChevronLeft size={24} strokeWidth={3} />
            </div>

            <div className="custom-next absolute right-0 top-[45%] z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/5 border border-white/10 text-black backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-red-500 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <ChevronRight size={24} strokeWidth={3} />
            </div>
          </Swiper>
        </div>
      </section>
      <section
        ref={contactRef}
        id="contact"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10"
      >
        {/* Container chính: Thêm Gradient, Shadow lớn và Border siêu mỏng */}
        <div
          className={`relative overflow-hidden rounded-4xl bg-linear-to-br from-[#4a4545] to-[#2d2a2a] p-8 shadow-2xl sm:p-10 lg:grid lg:grid-cols-2 lg:gap-16 lg:p-14 border border-white/10 transition-all duration-700 ${contactVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-0"}`}
        >
          {/* Vệt sáng trang trí (Glow effect) tạo cảm giác năng động của Gym */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-600/15 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/40 blur-3xl"></div>

          {/* Cột 1: Nội dung */}
          <div className="relative z-10 flex flex-col justify-center">
            {/* Label có chấm đỏ nhấp nháy tạo cảm giác Live/Active */}
            <div className="inline-flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-red-400">
                Book a demo
              </p>
            </div>

            <h2 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Sẵn sàng bứt phá cho{" "}
              <span className="bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                HN Fitcore Evolution
              </span>{" "}
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg italic">
              "Tự động hóa toàn bộ quy trình vận hành. Từ quản lý thẻ hội viên,
              sắp xếp lịch PT, đến theo dõi doanh thu – tất cả được tích hợp
              mượt mà trong một nền tảng duy nhất."
            </p>

            {/* Các tính năng cam kết nhỏ (Trust badges) */}
            <div className="mt-8 flex flex-wrap gap-6 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Tốc độ tối đa
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Dễ dàng mở rộng
              </span>
            </div>
          </div>

          {/* Cột 2: Form nhập liệu */}
          <div className="relative z-10 mt-12 lg:mt-0 flex items-center">
            {/* Khối nền mờ (Glassmorphism) ôm trọn Form */}
            <div className="w-full rounded-3xl bg-black/20 p-6 backdrop-blur-md border border-white/5 sm:p-8">
              <div className="flex flex-col gap-5">
                {/* Ô nhập Tên phòng gym */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Tên phòng gym"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white transition-all placeholder:text-slate-400 focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* Ô nhập Email */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Email quản trị"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white transition-all placeholder:text-slate-400 focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* Nút bấm có hiệu ứng Hover & Click */}
                <button
                  onClick={() => setPage("login")}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-red-500 hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98]"
                >
                  Trải nghiệm demo ngay
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#4a4545] px-6 py-12 pb-0 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="text-xl font-extrabold tracking-widest text-red-500">
              HN Fitcore Evolution
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-200 italic">
              Nơi sức mạnh cốt lõi định hình phiên bản hoàn hảo nhất của bạn."
            </p>
          </div>
          <div>
            <h4 className="font-bold">Company</h4>
            <div className="mt-4 space-y-2 text-sm text-slate-200">
              <p>About us</p>
              <p>Why us</p>
              <p>Partnership</p>
              <p>Teams</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold">Categories</h4>
            <div className="mt-4 space-y-2 text-sm text-slate-200">
              <p>Strength Training</p>
              <p>Yoga</p>
              <p>Bodybuilding</p>
              <p>Weight Loss</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold">Contact</h4>
            <div className="mt-4 space-y-2 text-sm text-slate-200">
              <div className="flex gap-2">
                <Phone className="w-5 h-5" />
                <p>0367397104</p>
              </div>
              <div className="flex gap-2">
                <Mail className="w-5 h-5" />
                <p>HNFitcore@gmail.com</p>
              </div>
              <div className="flex gap-2">
                <MapPinHouse className="w-5 h-5" />
                <p>Hanoi</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold">Subscribe</h4>
            <div className="mt-4 flex overflow-hidden rounded-full bg-white/10">
              <input
                type="text"
                placeholder="Enter your email"
                className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-300"
              />
              <button className="bg-red-600 px-4 font-semibold">→</button>
            </div>
          </div>
        </div>
        <p className="text-center py-2 flex gap-2 justify-center items-center my-6 text-sm text-white font-bold">
          <Copyright className="w-4 h-4" /> Copyright by HuuNam
        </p>
      </footer>
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-opacity"
          onClick={() => setIsVideoOpen(false)} // Click ra ngoài để đóng
        >
          {/* Ngăn chặn sự kiện click lan truyền khi bấm vào khu vực video */}
          <div
            className="relative w-full max-w-4xl animate-[pulse_0.3s_ease-out_1]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute -right-4 -top-12 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-slate-300 transition-all hover:bg-red-600 hover:text-white hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative w-full aspect-video overflow-hidden rounded-3xl shadow-2xl shadow-black/80 border border-white/10 bg-black">
              <video
                className="w-full h-full object-cover"
                src="/vidAd.mp4"
                controls
                autoPlay
                playsInline
              >
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            </div>
          </div>
        </div>
      )}
      {/* --- POPUP TRAINER PROFILE MODAL --- */}
      {/* --- POPUP TRAINER PROFILE MODAL (LIGHT TONE) --- */}
      {selectedTrainer && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedTrainer(null)}
        >
          {/* Container chính: Đổi bg-[#2b2626] thành bg-white và thêm animate-scale-in */}
          <div 
            className="animate-scale-in relative w-full max-w-3xl overflow-hidden rounded-4xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng: Đổi màu icon cho dễ nhìn trên nền trắng */}
            <button
              onClick={() => setSelectedTrainer(null)}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-red-500 hover:text-white hover:rotate-90"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col md:flex-row">
              {/* Cột trái: Thông tin cơ bản - Dùng màu xám nhạt (bg-slate-50) */}
              <div className={`flex w-full flex-col items-center justify-center bg-slate-50 p-10 text-center md:w-2/5 animate-slide-in-left`}>
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-linear-to-tr from-red-600 to-orange-400 blur opacity-25"></div>
                  <img 
                    src={selectedTrainer.img} 
                    alt={selectedTrainer.name} 
                    className="relative h-40 w-40 rounded-full border-4 border-white object-cover shadow-xl" 
                  />
                </div>
                
                <h3 className="mt-6 text-2xl font-black text-slate-900">{selectedTrainer.name}</h3>
                <p className="font-bold uppercase tracking-widest text-red-600 text-[11px] mt-1">{selectedTrainer.role}</p>
                
                <div className="mt-6 flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-100">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  {selectedTrainer.status}
                </div>
                
                <div className="mt-8 w-full border-t border-slate-200 pt-6">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Học phí dự kiến</p>
                  <p className="text-xl font-black text-slate-900">{selectedTrainer.rate}</p>
                </div>
              </div>

              {/* Cột phải: Chi tiết chuyên môn - Dùng nền trắng thuần */}
              <div className="flex w-full flex-col gap-8 p-10 md:w-3/5 bg-white animate-slide-in-right">
                
                {/* Contact: Đổi text sang màu tối */}
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-5">
                    <span className="h-1 w-5 bg-red-600"></span> Thông tin liên lạc
                  </h4>
                  <div className="grid gap-4 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-4 group">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <Mail size={18}/>
                      </div>
                      {selectedTrainer.email}
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <Phone size={18}/>
                      </div>
                      {selectedTrainer.phone}
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <MapPinHouse size={18}/>
                      </div>
                      {selectedTrainer.address}
                    </div>
                  </div>
                </div>

                {/* Certifications: Dùng icon màu xanh lá để tạo cảm giác uy tín */}
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-4">
                    <span className="h-1 w-5 bg-red-600"></span> Bằng cấp chuyên môn
                  </h4>
                  <div className="space-y-3 pl-1">
                    {selectedTrainer.certifications.map((cert, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm text-slate-600">
                        <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <span className="text-[10px]">✔</span>
                        </div>
                        <span className="font-semibold">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teaching: Các tag màu đỏ nhạt trên nền trắng */}
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-4">
                    <span className="h-1 w-5 bg-red-600"></span> Chương trình dạy
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrainer.teaching.map((program, index) => (
                      <span 
                        key={index} 
                        className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 border border-slate-200 hover:border-red-300 hover:text-red-600 transition-all cursor-default"
                      >
                        {program}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
