"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

const slides = [
  {
    title: "Kiến thức công nghệ – Khóa học chất lượng cao từ TJZenn",
    description:
      "Khóa học lập trình thực chiến & chia sẻ kiến thức chuyên sâu về giải thuật, system design và dự án thực tế.",
    buttonText: "Khám phá ngay",
    buttonLink: "/course",
    image: "/images/home/course.png",
  },
  {
    title: "Thiết kế website & phần mềm theo yêu cầu",
    description:
      "Cung cấp giải pháp thiết kế và phát triển website, phần mềm quản lý chuyên biệt, phù hợp quy trình vận hành của từng doanh nghiệp",
    buttonText: "Xem chi tiết",
    buttonLink: "/website",
    image: "/images/home/building.png",
  },
  {
    title: "Đồng hành cùng TJZenn",
    description:
      "Bạn đam mê lập trình, chia sẻ tri thức hoặc đang cần hỗ trợ phát triển dự án phần mềm? Hãy kết nối với TJZenn để cùng tạo nên giá trị thực cho cộng đồng và doanh nghiệp.",
    buttonText: "Liên hệ ngay",
    buttonLink: "/contact",
    image: "/images/home/contact.png",
  },
];

export default function AutoSlideBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className=" w-full bg-[#1A1A1F] relative text-white border border-gray-700">
      {/* Diagonal Grid with Green Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
          repeating-linear-gradient(45deg, rgba(0, 255, 128, 0.1) 0, rgba(0, 255, 128, 0.1) 1px, transparent 1px, transparent 20px),
          repeating-linear-gradient(-45deg, rgba(0, 255, 128, 0.1) 0, rgba(0, 255, 128, 0.1) 1px, transparent 1px, transparent 20px)
        `,
          backgroundSize: "40px 40px",
        }}
      />
      <section className="relative z-10 overflow-hidden py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col-reverse md:flex-row items-center gap-8 w-full"
            >
              <div className="text-white max-w-lg">
                <h2 className="text-3xl font-bold mb-4">
                  {slides[current].title}
                </h2>
                <p className="mb-6 text-lg md:text-lg">
                  {slides[current].description}
                </p>
                <Link href={slides[current].buttonLink}>
                  <Button className="bg-buttonRoot hover:bg-buttonRoot">
                    {slides[current].buttonText}
                  </Button>
                </Link>
              </div>
              <div className="w-full md:w-[400px]">
                <Image
                  src={slides[current].image}
                  alt={slides[current].title}
                  title={slides[current].title}
                  width={400}
                  height={400}
                  className="rounded w-full h-auto max-h-[370px]"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center mt-6 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-6 h-1 rounded-full transition-all duration-300 ${
                index === current ? "bg-white" : "bg-white/50"
              }`}
            ></button>
          ))}
        </div>
      </section>
    </div>
  );
}
