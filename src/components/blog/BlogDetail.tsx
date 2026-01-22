"use client";
import Image from "next/image";
import { UserIcon } from "lucide-react";

export default function BlogDetail({ blog }: { blog: any }) {
  const {
    title,
    shortDescription,
    image,
    content,
    author,
    category,
    created_at,
  } = blog;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12 text-white">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {title}
        </h1>
        <div className="inline-block bg-[#26272d] text-violet-500 px-2 py-0.5 rounded text-xs font-medium w-fit mb-4">
          {category}
        </div>
        <p className="text-lg text-white mb-6">{shortDescription}</p>
        <div className="flex items-center gap-4">
          <UserIcon className="w-6 h-6" />
          <div>
            <p className="font-medium">{author?.name || "Ẩn danh"}</p>
            <p className="text-sm text-gray-400">
              {new Date(created_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative w-full rounded-xl overflow-hidden mb-6">
        <Image
          src={image}
          alt={title}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto rounded-xl"
        />
      </div>

      {/* Content */}
      <div
        className="prose prose-invert max-w-none prose-img:rounded-xl prose-headings:font-semibold prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
