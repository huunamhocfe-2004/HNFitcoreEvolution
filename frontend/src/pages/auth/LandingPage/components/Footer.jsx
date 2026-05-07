import { Phone, Mail, MapPinHouse, Copyright } from "lucide-react";

export default function Footer() {
  return (
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
          <h4 className="font-bold">Công ty</h4>
          <div className="mt-4 space-y-2 text-sm text-slate-200">
            <p>About us</p>
            <p>Why us</p>
            <p>Partnership</p>
            <p>Teams</p>
          </div>
        </div>

        <div>
          <h4 className="font-bold">Danh mục</h4>
          <div className="mt-4 space-y-2 text-sm text-slate-200">
            <p>Strength Training</p>
            <p>Yoga</p>
            <p>Bodybuilding</p>
            <p>Weight Loss</p>
          </div>
        </div>

        <div>
          <h4 className="font-bold">Liên hệ</h4>
          <div className="mt-4 space-y-2 text-sm text-slate-200">
            <div className="flex gap-2">
              <Phone className="h-5 w-5" />
              <p>0367397104</p>
            </div>
            <div className="flex gap-2">
              <Mail className="h-5 w-5" />
              <p>buihuunam36@gmail.com</p>
            </div>
            <div className="flex gap-2">
              <MapPinHouse className="h-5 w-5" />
              <p>Số 3 Cầu Giấy, Hà Nội</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold">Đăng ký</h4>
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

      <p className="my-6 flex items-center justify-center gap-2 py-2 text-center text-sm font-bold text-white">
        <Copyright className="h-4 w-4" /> Copyright by HuuNam
      </p>
    </footer>
  );
}