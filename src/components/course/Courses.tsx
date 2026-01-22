import Image from "next/image";
import Link from "next/link";
import { UserIcon } from "lucide-react";
import { getAllCourse } from "@/lib/courses";

export default async function Courses() {
  const courses = await getAllCourse();
  return (
    <section className="bg-[#1a1a1f] text-white px-6 py-20">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold">Khóa học</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => {
            const isFree = course.isFree;
            const href = isFree
              ? `/course/${course.url}`
              : `/coursePremium/${course.url}`;

            return (
              <Link key={index} href={href}>
                <div className="space-y-4 max-w-full group transition duration-300 cursor-pointer">
                  <div className="relative aspect-[3/2] w-full bg-[#1a1a1f] rounded-lg overflow-hidden">
                    <Image
                      src={course.image || "/images/not-image.png"}
                      alt={course.title}
                      title={course.title}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="text-lg font-bold leading-snug line-clamp-2 break-words overflow-hidden group-hover:underline transition duration-300">
                    {course.title}
                  </h3>

                  <p className="text-gray-300 line-clamp-2 break-words overflow-hidden">
                    {course.shortDescription}
                  </p>
                  <div className="inline-block bg-[#26272d] text-violet-500 px-2 py-0.5 rounded text-xs font-medium w-fit">
                    {course.category}
                  </div>
                  <div className="flex flex-wrap items-center text-sm gap-2 text-blue-400">
                    <UserIcon className="w-4 h-4" />
                    <span>{course.author?.name || "Đã bị xóa"}</span>
                    <span className="text-white/60">
                      {new Date(course.created_at).toLocaleDateString("vi-VN")}
                    </span>

                    {isFree ? (
                      <span className="bg-green-700 text-white px-2 py-0.5 rounded text-xs font-medium">
                        Miễn phí
                      </span>
                    ) : (
                      <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-semibold">
                        {course.price.toLocaleString("vi-VN")} VND
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
