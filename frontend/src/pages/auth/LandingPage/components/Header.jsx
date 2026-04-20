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

      <nav className="hidden items-center gap-8 text-sm text-slate-200 md:flex">
        <a href="#home" className="text-red-500">
          Home
        </a>
        <a href="#about" className="hover:text-white">
          About us
        </a>
        <a href="#bmi" className="hover:text-white">
          BMI
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
  );
}
