"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const reviews = [
  "/images/student-review/review1.jpg",
  "/images/student-review/review2.jpg",
  "/images/student-review/review3.jpg",
  "/images/student-review/review4.jpg",
  "/images/student-review/review5.jpg",
  "/images/student-review/review6.jpg",
  "/images/student-review/review7.jpg",
  "/images/student-review/review8.jpg",
  "/images/student-review/review9.jpg",
  "/images/student-review/review10.jpg",
  "/images/student-review/review11.jpg",
  "/images/student-review/review12.jpg",
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function StudentReviews() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = selectedImg ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedImg]);

  return (
    <motion.section
      className="bg-[#1a1a1f] text-white py-14 px-4 relative z-0"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
    >
      <div className="max-w-full mx-auto text-center mb-12">
        <h2 className="text-3xl sm:text-3xl font-bold">Đánh giá từ học viên</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {reviews.map((src, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden border border-white/10 shadow-lg cursor-pointer"
            onClick={() => setSelectedImg(src)}
          >
            <Image
              src={src}
              alt={`Đánh giá học viên ${i + 1}`}
              width={400}
              height={700}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>

      {selectedImg && (
        <div
          onClick={() => setSelectedImg(null)}
          className="fixed mt-14 inset-0 bg-black/80 flex items-center justify-center z-[9999] px-4"
        >
          <div className="relative max-w-4xl w-full">
            <Image
              src={selectedImg}
              alt="Xem đánh giá"
              width={800}
              height={1200}
              className="w-full max-h-[90vh] object-contain rounded-lg shadow-xl"
            />
          </div>
        </div>
      )}
    </motion.section>
  );
}
