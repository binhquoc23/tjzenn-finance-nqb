import Image from "next/image";
import Link from "next/link";
import { UserIcon } from "lucide-react";
import { getHomeBlog } from "@/lib/blog";

export default async function Blogs() {
  const posts = await getHomeBlog();
  return (
    <section className="bg-[#1a1a1f] text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Bài viết</h2>
          <Link
            href="/blog"
            className="text-lg font-semibold text-[#168bb9] hover:text-[#0076a4] hover:underline transition"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Link key={index} href={`/blog/${post.url}`}>
              <div className="space-y-4 w-full group transition duration-300 cursor-pointer">
                <div className="relative aspect-[3/2] w-full bg-[#1a1a1f] rounded-lg overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    title={post.title}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <h3 className="text-lg font-bold leading-snug line-clamp-2 break-words overflow-hidden group-hover:underline transition duration-300">
                  {post.title}
                </h3>

                <p className="text-gray-300 line-clamp-2 break-words overflow-hidden">
                  {post.shortDescription}
                </p>
                <div className="inline-block bg-[#26272d] text-violet-500 px-2 py-0.5 rounded text-xs font-medium w-fit">
                  {post.category}
                </div>
                <div className="flex items-center text-sm gap-2 text-blue-400">
                  <UserIcon className="w-4 h-4" />
                  <span>{post.author?.name || "Đã bị xóa"}</span>
                  <span className="text-white/60">
                    {new Date(post.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
