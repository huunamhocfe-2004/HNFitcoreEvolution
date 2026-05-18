import { Mail, Phone, MapPinHouse, X } from "lucide-react";

export default function TrainerModal({ selectedTrainer, setSelectedTrainer }) {
  if (!selectedTrainer) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
      onClick={() => setSelectedTrainer(null)}
    >
      <div
        className="animate-scale-in relative w-full max-w-3xl overflow-hidden rounded-4xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setSelectedTrainer(null)}
          className="absolute right-5 top-5 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:rotate-90 hover:bg-red-500 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="flex w-full flex-col items-center justify-center bg-slate-50 p-10 text-center md:w-2/5 animate-slide-in-left">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-linear-to-tr from-red-600 to-orange-400 opacity-25 blur" />
              <img
                src={selectedTrainer.img}
                alt={selectedTrainer.name}
                className="relative h-40 w-40 rounded-full border-4 border-white object-cover shadow-xl"
              />
            </div>

            <h3 className="mt-6 text-2xl font-black text-slate-900">
              {selectedTrainer.name}
            </h3>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-red-600">
              {selectedTrainer.role}
            </p>

            <div className="mt-6 flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              {selectedTrainer.status}
            </div>

            <div className="mt-8 w-full border-t border-slate-200 pt-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Học phí dự kiến
              </p>
              <p className="text-xl font-black text-slate-900">
                {selectedTrainer.rate}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-8 bg-white p-10 md:w-3/5 animate-slide-in-right">
            <div>
              <h4 className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                <span className="h-1 w-5 bg-red-600" /> Thông tin liên lạc
              </h4>
              <div className="grid gap-4 text-sm font-medium text-slate-600">
                <div className="group flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                    <Mail size={18} />
                  </div>
                  {selectedTrainer.email}
                </div>
                <div className="group flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                    <Phone size={18} />
                  </div>
                  {selectedTrainer.phone}
                </div>
                <div className="group flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                    <MapPinHouse size={18} />
                  </div>
                  {selectedTrainer.address}
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                <span className="h-1 w-5 bg-red-600" /> Bằng cấp chuyên môn
              </h4>
              <div className="space-y-3 pl-1">
                {(selectedTrainer.certifications || []).map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm text-slate-600"
                  >
                    <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <span className="text-[10px]">✔</span>
                    </div>
                    <span className="font-semibold">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                <span className="h-1 w-5 bg-red-600" /> Chương trình dạy
              </h4>
              <div className="flex flex-wrap gap-2">
                {(selectedTrainer.teaching || []).map((program, index) => (
                  <span
                    key={index}
                    className="cursor-default rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:border-red-300 hover:text-red-600"
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
  );
}
