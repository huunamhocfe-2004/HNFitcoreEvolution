export default function Header({ navigate }) {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between py-6">
      <div className="flex gap-5">
        <div className="relative h-15 w-15 overflow-hidden rounded-full">
          <img
            className="absolute h-full w-full object-cover object-center"
            src="../../../public/favicon.ico"
            alt=""
          />
        </div>
        <button className="text-xl font-extrabold tracking-widest text-red-500">
          HN Fitcore Evolution
        </button>
      </div>

      <nav className="hidden items-center gap-4 text-sm text-slate-200 md:flex">
        {/* Link Active (Trang chủ) */}
        <a
          href="#home"
          className="text-red-500 text-xl font-bold px-4 py-2 transition-colors duration-300 hover:text-red-400"
        >
          Home
        </a>

        {/* Các link bình thường với nền nhẹ */}
        <a
          href="#about"
          className="px-4 py-2 rounded-full transition-colors duration-300 hover:text-white hover:bg-slate-700/50"
        >
          About us
        </a>
        <a
          href="#bmi"
          className="px-4 py-2 rounded-full transition-colors duration-300 hover:text-white hover:bg-slate-700/50"
        >
          BMI
        </a>
        <a
          href="#program"
          className="px-4 py-2 rounded-full transition-colors duration-300 hover:text-white hover:bg-slate-700/50"
        >
          Program
        </a>
        <a
          href="#membership"
          className="px-4 py-2 rounded-full transition-colors duration-300 hover:text-white hover:bg-slate-700/50"
        >
          Membership
        </a>
        <a
          href="#blog"
          className="px-4 py-2 rounded-full transition-colors duration-300 hover:text-white hover:bg-slate-700/50"
        >
          Blog
        </a>
        <a
          href="#contact"
          className="px-4 py-2 rounded-full transition-colors duration-300 hover:text-white hover:bg-slate-700/50"
        >
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
  );
}
