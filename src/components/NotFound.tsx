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

const NotFound: React.FC = () => {
  return (
    <section className="bg-[#1a1a1f] min-h-screen text-white px-6 md:px-16 py-20 flex flex-col md:flex-row items-center justify-center gap-6 border-b border-white/10">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            404
          </span>{" "}
          - Không tìm thấy trang mong muốn
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Rất tiếc, chúng tôi không thể tìm thấy trang bạn yêu cầu. Vui lòng
          quay lại trang chủ hoặc kiểm tra lại đường dẫn
        </p>
        <Link href="/" passHref>
          <button className="bg-white mb-6 text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition">
            Về trang chủ →
          </button>
        </Link>
      </motion.div>

      <motion.div
        className="relative w-full max-w-sm h-[260px] md:h-[400px]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Image
          src="/images/notfound-banner.png"
          alt="3D blob"
          fill
          className="object-contain"
          priority
        />
      </motion.div>
    </section>
  );
};

export default NotFound;
