"use client";

import React, { useRef } from "react";

import config from "@/config";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const slideDown = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const BannerBlog: React.FC = () => {
  const section2Ref = useRef<HTMLDivElement>(null);
  const handleScrollToSection2 = () => {
    section2Ref.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <section className="bg-[#1a1a1f] text-white py-20 px-6 md:px-16 flex flex-col lg:flex-row items-center justify-center gap-8 text-center lg:text-left border-b border-white/10">
        {/* Image */}
        <motion.div
          className="w-80 h-80 relative mb-10 md:mb-0"
          variants={slideDown}
          initial="hidden"
          animate="visible"
        >
          <Image
            src="/images/blogs/blog-banner.png"
            alt="SEAL Logo"
            width={600}
            height={600}
            className="object-contain"
          />
        </motion.div>

        {/* Content */}
        <div className="max-w-2xl text-center md:text-left">
          <motion.h1
            className="text-4xl md:text-4xl font-bold mb-6"
            variants={slideDown}
            initial="hidden"
            animate="visible"
          >
            Chia sẻ kiến thức công nghệ
          </motion.h1>

          <motion.p
            className="text-lg leading-relaxed mb-8 text-gray-300"
            variants={slideDown}
            initial="hidden"
            animate="visible"
          >
            Tổng hợp các bài viết chuyên sâu về lập trình, system design,
            blockchain, AI và kinh nghiệm làm dự án thực tế. Nơi bạn không chỉ
            học kiến thức, mà còn hiểu cách áp dụng vào sản phẩm thật.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            variants={slideDown}
            initial="hidden"
            animate="visible"
          >
            <Link href="/contact">
              <button className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-gray-200 transition">
                Liên hệ {config.companyName} →
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BannerBlog;
