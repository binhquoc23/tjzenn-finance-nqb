"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import config from "@/config";
import Link from "next/link";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const BannerFaqService: React.FC = () => {
  return (
    <section className="bg-[#1a1a1f] text-white px-6 md:px-16 py-20 flex flex-col md:flex-row items-center justify-center gap-6 border-b border-white/10">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-4">FAQ - Dịch vụ</h1>
        <p className="text-lg text-gray-300 mb-8">
          Giải đáp các câu hỏi thường gặp về dịch vụ thiết kế website và phần
          mềm tại {config.companyName}. Từ quy trình, chi phí đến thời gian
          triển khai
        </p>
        <Link href="/contact">
          <button className="bg-white mb-6 text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition">
            Lên lịch 1 buổi tư vấn →
          </button>
        </Link>

        <Link href="/faq-course">
          <button className="text-white ml-5 font-medium hover:text-gray-300 transition">
            FAQ khóa học →
          </button>
        </Link>
      </motion.div>

      <motion.div
        className="relative w-full max-w-sm h-[200px] md:h-[400px]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Image
          src="/images/faq/faq-service.png"
          alt="3D blob"
          fill
          className="object-contain"
          priority
        />
      </motion.div>
    </section>
  );
};

export default BannerFaqService;
