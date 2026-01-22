"use client";

import React from "react";
import { FaCogs, FaHandshake, FaHeadset } from "react-icons/fa";
import { motion } from "framer-motion";
import config from "@/config";

interface WhyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const WhyCard: React.FC<WhyCardProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center bg-black p-6 rounded-lg shadow-lg text-white">
      <div className="bg-indigo-100 rounded-full p-4 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
      <p className="text-sm text-center text-white">{description}</p>
    </div>
  );
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  }),
};

const WhySection: React.FC = () => {
  const cards = [
    {
      icon: <FaCogs className="text-4xl text-indigo-600" />,
      title: "WEBSITE CHUẨN SEO và RESPONSIVE",
      description: `${config.companyName} tối ưu website chuẩn SEO, mang đến cho khách hàng nền tảng vững chắc để vươn lên top các công cụ tìm kiếm, giúp phát triển bền vững trong tương lai`,
    },

    {
      icon: <FaHandshake className="text-4xl text-indigo-600" />,
      title: "GIAO DIỆN CÁ NHÂN HÓA",
      description:
        "Xu hướng cá nhân hóa và thân thiện với người dùng vẫn là yếu tố quan trọng nhất hiện nay mà chúng tôi cung cấp cho khách hàng.",
    },

    {
      icon: <FaHeadset className="text-4xl text-indigo-600" />,
      title: "HỖ TRỢ TẬN TÌNH",
      description: `Hỗ trợ tận tình là phương châm quan trọng nhất của ${config.companyName}, với chúng tôi phục vụ khách hàng tốt nhất là yếu tố giúp chúng tôi tồn tại và phát triển`,
    },
  ];

  return (
    <section className="py-20 px-8 bg-[#1a1a1f] border-b border-white/10">
      <motion.h2
        className="text-3xl font-bold text-center mb-8 text-white"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Tại sao nên chọn {config.companyName}
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            custom={index}
            initial="hidden"
            whileInView="visible"
            variants={cardVariants}
            viewport={{ once: true }}
          >
            <WhyCard {...card} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhySection;
