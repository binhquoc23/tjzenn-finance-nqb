"use client";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserIcon } from "lucide-react";

const CourseDetailPrice = ({ course }: { course: any }) => {
  const [openChapters, setOpenChapters] = useState<number[]>([]);

  const toggleChapter = (index: number) => {
    setOpenChapters((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-8 p-4">
      {/* Left content */}
      <div className="lg:w-2/3 w-full space-y-6">
        {/* Goals */}
        <div className="bg-black rounded-md p-4 text-white ">
          <h2 className="text-xl font-semibold mb-4">Những gì bạn sẽ học</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {course?.goals?.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <FaCheckCircle className="text-green-600 w-4 h-4 mt-1 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Video demo */}
        {course?.videoDemo && getEmbedUrl(course.videoDemo) && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Video Demo thành quả đạt được sau khi kết thúc khóa học:
            </h3>
            <div className="aspect-video w-full rounded-md overflow-hidden">
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(course.videoDemo) || ""}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Accordion content */}
        <div className="rounded-md p-4 bg-black text-white">
          <h3 className="font-bold text-xl mb-2">Nội dung khóa học</h3>
          <p>
            {course?.chapterCount} chương • {course?.lessonCount} bài giảng •{" "}
            {course?.hourCount} giờ tổng thời lượng
          </p>
          {Array.isArray(course?.accordion) &&
            course.accordion.map((chapter: any, index: number) => {
              const isOpen = openChapters.includes(index);
              return (
                <div
                  key={index}
                  className="mt-4 border border-white/10 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleChapter(index)}
                    className="w-full flex justify-between items-center px-4 py-3 text-left bg-gray-600 transition"
                  >
                    <span className=" font-medium">{chapter.chapter}</span>
                    <span className="text-xl">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 py-4 bg-[#1a1a1f] border-t border-white/10">
                      <ul className="list-disc list-inside space-y-1">
                        {chapter.lessons?.map((lesson: string, idx: number) => (
                          <li key={idx}>{lesson}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Right content */}
      <div className="lg:w-1/3 w-full rounded-md p-4">
        <h1 className="text-white text-2xl font-bold mb-3">{course?.title}</h1>
        <div className="space-y-2 text-sm text-white mb-4">
          <span className="inline-block bg-[#26272d] text-violet-500 px-2 py-0.5 rounded text-xs font-medium w-fit mb-2">
            {course?.category}
          </span>
          <div className="flex items-center gap-1 text-blue-400">
            <UserIcon className="w-4 h-4" />
            <span>{course?.author?.name || "Đã bị xóa"}</span>
          </div>
        </div>

        <p className="text-white mb-4">{course?.shortDescription}</p>
        <Image
          src={course?.image || "/images/not-image.png"}
          alt={course?.title}
          width={500}
          height={200}
          className="rounded-md mb-4 text-center mx-auto"
        />
        <span className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold mb-2 inline-block">
          {course?.price?.toLocaleString("vi-VN")} VND
        </span>
        <Link href="/contact" passHref>
          <button className="w-full bg-buttonRoot text-white py-2 rounded-md mb-4 font-semibold">
            Mua ngay
          </button>
        </Link>
        <p className="text-xl text-white mb-4 font-bold">Khóa học bao gồm:</p>
        <ul className="text-lg space-y-2 text-white list-disc list-inside">
          {course?.includes?.map((item: string, idx: number) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseDetailPrice;
