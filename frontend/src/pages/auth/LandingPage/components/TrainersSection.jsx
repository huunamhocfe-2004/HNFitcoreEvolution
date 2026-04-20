import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function TrainersSection({
  trainerRef,
  trainerVisible,
  trainers,
  setSelectedTrainer,
}) {
  return (
    <section
      ref={trainerRef}
      id="trainers"
      className="mx-auto max-w-7xl px-6 py-16 lg:px-10"
    >
      <div className="mb-12 flex items-center justify-between">
        <div className="w-full text-center">
          <h2
            className={`text-4xl font-extrabold uppercase transition-all duration-700 ${
              trainerVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            HUẤN LUYỆN VIÊN
          </h2>
          <p className="mt-2 text-slate-400">
            Đội ngũ chuyên gia sẵn sàng đồng hành cùng bạn.
          </p>
        </div>
      </div>

      <div
        className={`transition-all duration-1000 delay-300 ${
          trainerVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
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
            1024: { slidesPerView: 3 },
          }}
          className="relative px-4 py-8 pb-24"
        >
          {trainers.map((trainer, index) => (
            <SwiperSlide key={index}>
              <div className="group flex flex-col overflow-hidden rounded-[10px] bg-linear-to-b from-gray-100 via-gray-200 to-[#ffffff] shadow-lg transition-all duration-300 hover:scale-98 hover:shadow-2xl hover:shadow-black/50">
                <div className="relative flex grow flex-col items-center p-8">
                  <div className="relative">
                    <img
                      src={trainer.img}
                      alt={trainer.name}
                      className="h-28 w-28 rounded-full border-4 border-[#2b2626] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-black">
                    {trainer.name}
                  </h3>
                  <p className="text-sm font-medium text-slate-400">
                    {trainer.role}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <User size={14} /> {trainer.status}
                  </div>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {trainer.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                          skill.startsWith("+")
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-500 text-black"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="mt-6 line-clamp-2 text-center text-sm leading-relaxed text-slate-400 italic">
                    "{trainer.bio}"
                  </p>
                </div>

                <button
                  onClick={() => setSelectedTrainer(trainer)}
                  className="mx-auto mb-4 inline-block w-fit cursor-pointer rounded-4xl bg-[#011dbd] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-300 transition-all group-hover:bg-blue-600 group-hover:text-white"
                >
                  Xem chi tiết
                </button>
              </div>
            </SwiperSlide>
          ))}

          <div className="custom-prev absolute left-0 top-[45%] z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-black backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-red-500 hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <ChevronLeft size={24} strokeWidth={3} />
          </div>

          <div className="custom-next absolute right-0 top-[45%] z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-black backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-red-500 hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <ChevronRight size={24} strokeWidth={3} />
          </div>
        </Swiper>
      </div>
    </section>
  );
}