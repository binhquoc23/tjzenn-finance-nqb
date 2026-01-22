"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.8,
      ease: "easeInOut",
    },
  },
};

const BannerStudentReview: React.FC = () => {
  const section2Ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <section className="bg-[#1a1a1f] text-white pb-20 pt-8 px-6 md:px-16 flex flex-col lg:flex-row items-center justify-center gap-8 text-center lg:text-left border-b border-white/10">
        <motion.div
          className="w-[320px] h-[320px] relative"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <Image
            src="/images/student-review/review-banner.png"
            alt="Student Review"
            width={600}
            height={600}
            className="object-contain w-full h-full"
          />
        </motion.div>

        <div className="max-w-2xl text-center md:text-left">
          <motion.h1
            className="text-4xl md:text-4xl font-bold mb-6"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Học viên nói gì về TJZenn?
          </motion.h1>

          <motion.p
            className="text-lg leading-relaxed mb-8 text-gray-300"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Những chia sẻ chân thật từ các bạn đã đồng hành cùng TJZenn trong
            hành trình học lập trình, phát triển kỹ năng và tạo ra sản phẩm thực
            tế.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <Link href="/course">
              <button className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-gray-200 transition">
                Học ngay →
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BannerStudentReview;
