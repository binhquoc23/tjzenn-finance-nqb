"use client";

import React, { useRef } from "react";
import { FaShoppingCart, FaBuilding, FaCode } from "react-icons/fa";
import ServiceCard from "./ServiceCard";
import config from "@/config";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  }),
};

const ServicesSection: React.FC = () => {
  const section2Ref = useRef<HTMLDivElement>(null);
  const handleScrollToSection2 = () => {
    section2Ref.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <section className="bg-[#1a1a1f] text-white py-20 px-6 md:px-16 flex flex-col lg:flex-row items-center justify-center gap-8 text-center lg:text-left border-b border-white/10">
        <motion.div
          className="w-64 h-64 relative mb-10 md:mb-0"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <Image
            src="/images/demo-web/website-banner.png"
            alt="SEAL Logo"
            width={600}
            height={600}
            className="object-contain"
          />
        </motion.div>

        <div className="max-w-2xl text-center md:text-left">
          <motion.h1
            className="text-4xl md:text-4xl font-bold mb-6"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Giải pháp Website tối ưu cho doanh nghiệp & cá nhân
          </motion.h1>

          <motion.p
            className="text-lg leading-relaxed mb-8 text-gray-300"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            {config.companyName} đồng hành cùng bạn trong quá trình thiết kế và
            phát triển website chuẩn UI/UX – nhanh, đẹp, dễ dùng và tối ưu cho
            mọi thiết bị. Phù hợp cho doanh nghiệp, cá nhân, landing page bán
            hàng và hệ thống quản lý riêng.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <button
              onClick={handleScrollToSection2}
              className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-gray-200 transition"
            >
              Khám phá ngay →
            </button>
            <Link
              href="/faq-service"
              className="text-white font-medium hover:text-gray-300 transition px-5 py-2 rounded-full inline-block text-center"
            >
              Các câu hỏi thường gặp →
            </Link>
          </motion.div>
        </div>
      </section>
      <section
        ref={section2Ref}
        className="py-20 px-8 bg-[#1a1a1f] border-b border-white/10"
      >
        <motion.h1
          className="text-3xl text-white font-bold text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Dịch vụ thiết kế website
        </motion.h1>
        <motion.p
          className="text-center text-white mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {config.companyName} cung cấp những giải pháp công nghệ tiên tiến,
          mang đến đầy đủ dịch vụ thiết kế website giúp xây dựng thương hiệu
          online mạnh mẽ và thúc đẩy doanh thu vượt trội.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            // mapping cho gọn và dễ thêm hiệu ứng
            {
              icon: <FaShoppingCart />,
              title: "Thiết kế website bán hàng",
              description: `Tăng trưởng doanh thu vượt trội với giải pháp thiết kế website bán hàng chuẩn SEO từ ${config.companyName}, tối ưu hiệu suất – chinh phục Google dễ dàng`,
            },
            {
              icon: <FaBuilding />,
              title: "Thiết kế website doanh nghiệp",
              description: `Trải nghiệm dịch vụ thiết kế website doanh nghiệp chuẩn SEO từ ${config.companyName} – giải pháp giúp nâng tầm thương hiệu và khẳng định vị thế trên thị trường số.`,
            },
            {
              icon: <FaCode />,
              title: "Thiết kế website theo yêu cầu",
              description:
                "Thiết kế website tùy chỉnh với giao diện và tính năng độc quyền, từ nền tảng đặt tour đến mạng xã hội và các giải pháp web đặc thù.",
            },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
            >
              <ServiceCard
                icon={card.icon}
                title={card.title}
                description={card.description}
                link={""}
              />
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
};

export default ServicesSection;
