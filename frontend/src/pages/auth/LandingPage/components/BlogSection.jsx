import { CalendarDays, Clock3, Dumbbell, X } from "lucide-react";
import { useState } from "react";

export default function BlogSection({ blogRef, blogVisible, blogs }) {
  const [selectedBlog, setSelectedBlog] = useState(null);

  return (
    <section
      ref={blogRef}
      id="blog"
      className="bg-[#2f2b2b] px-6 py-16 text-white lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            blogVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-red-400">
            <Dumbbell className="h-4 w-4" /> Blog phòng gym
          </div>

          <h2 className="mt-5 text-4xl font-extrabold leading-tight">
            Khám phá thêm về <span className="text-red-500">HN Fitcore</span>
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-300">
            Những bài viết ngắn giúp khách vãng lai hiểu rõ hơn về không gian,
            lộ trình tập luyện và cách phòng gym đồng hành cùng hội viên.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {blogs.map((blog, index) => (
            <article
              key={blog.title}
              className={`group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-xl shadow-black/20 backdrop-blur-sm transition-all duration-700 hover:border-red-500/40 hover:bg-white/8 ${
                blogVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-16 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 180}ms` }}
            >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute left-5 top-5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-red-950/30">
                  {blog.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-red-400" />{" "}
                    {blog.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 text-red-400" /> {blog.readTime}
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-extrabold leading-snug text-white">
                  {blog.title}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-300">
                  {blog.summary}
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedBlog(blog)}
                  className="mt-auto inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500 hover:shadow-lg hover:shadow-red-600/30"
                >
                  Đọc thêm
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedBlog && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setSelectedBlog(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-4xl border border-white/10 bg-[#f8fafc] text-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedBlog(null)}
              className="absolute right-5 top-5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-lg transition hover:rotate-90 hover:bg-red-600 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="max-h-[90vh] overflow-y-auto">
              <div className="relative h-80 overflow-hidden">
                <img
                  src={selectedBlog.image}
                  alt={selectedBlog.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-8 left-8 right-16 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-300">
                    {selectedBlog.category}
                  </p>
                  <h3 className="mt-3 max-w-2xl text-4xl font-black leading-tight">
                    {selectedBlog.title}
                  </h3>
                </div>
              </div>

              <div className="p-8 sm:p-10">
                <div className="mb-7 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-red-500" />{" "}
                    {selectedBlog.date}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-red-500" />{" "}
                    {selectedBlog.readTime}
                  </span>
                </div>

                <div className="space-y-5 text-base leading-8 text-slate-700">
                  {selectedBlog.content.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-8 rounded-3xl bg-red-50 p-6 text-sm leading-7 text-red-900">
                  <span className="font-extrabold">Gợi ý:</span> Đăng ký lịch tư
                  vấn để được kiểm tra mục tiêu, thể trạng và chọn lộ trình tập
                  phù hợp.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
