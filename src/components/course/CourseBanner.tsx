"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const CourseBanner: React.FC = () => {
  return (
    <section className="bg-[#1a1a1f] text-white px-6 md:px-16 py-20 flex flex-col md:flex-row items-center justify-center gap-6 border-b border-white/10">
      <motion.div
        className="w-full max-w-xl"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Hành trình trở thành lập trình viên thực thụ
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Từng bước làm chủ công nghệ, xây dựng sản phẩm thực tế – sẵn sàng bước
          vào thế giới sáng tạo không giới hạn.
        </p>

        <Link href="/contact">
          <button className="bg-white mb-6 text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition">
            Lên lịch 1 buổi tư vấn →
          </button>
        </Link>

        <Link href="/faq-course">
          <button className="text-white ml-4 font-medium hover:text-gray-300 transition">
            Các câu hỏi thường gặp →
          </button>
        </Link>
      </motion.div>

      <motion.div
        className="relative w-full max-w-2xl h-[260px] md:h-[500px]"
        initial={{ opacity: 0, scale: 2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Image
          src="/images/courses/course-banner.png"
          alt="3D blob"
          fill
          className="object-contain rounded-3xl"
          priority
        />
      </motion.div>
    </section>
  );
};

export default CourseBanner;
