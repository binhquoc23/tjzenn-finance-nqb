"use client";
import config from "@/config";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

interface AboutUsProps {
  className?: string;
}

export default function AboutUsSection({ className }: AboutUsProps) {
  return (
    <section
      className={cn(
        "bg-[#1a1a1f] text-white w-full min-h-screen flex flex-col items-center px-4 md:py-20 py-14 text-center pt-12",
        className
      )}
    >
      {/* main content */}
      <div className="flex mt-44 flex-col items-center justify-center flex-grow">
        {/* Bubble + Logo */}
        <div className="relative text-6xl sm:text-7xl md:text-8xl font-bold mb-8 flex items-center justify-center">
          <motion.div
            initial={{ y: 0 }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, -10, 0],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              duration: 6,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="absolute z-10 md:-top-64 -top-48 w-52 h-52 md:w-80 md:h-80"
          >
            <Image
              src="/images/logo.png"
              alt="Bubble"
              fill
              className="object-contain"
            />
          </motion.div>
          <span className="text-7xl font-black italic">
            {config.companyName}
          </span>
        </div>

        {/* Heading */}
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-semibold max-w-4xl leading-snug mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Kiến tạo tương lai công nghệ
        </motion.h2>

        {/* Paragraph */}
        <div className="w-full max-w-3xl text-left">
          <motion.p
            className="text-gray-400 text-lg sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {config.companyName} tin rằng sự phát triển bền vững không chỉ đến
            từ nền tảng kiến thức vững chắc, mà còn từ tinh thần không ngừng học
            hỏi, đổi mới và phấn đấu mỗi ngày. Chúng tôi hiểu rằng công nghệ
            luôn thay đổi, và để bắt kịp thời đại, mỗi cá nhân và tổ chức đều
            cần được trang bị kiến thức thực tiễn, khả năng thích nghi nhanh và
            một tư duy cầu tiến. Đó cũng chính là giá trị cốt lõi mà{" "}
            {config.companyName} luôn theo đuổi trong từng dòng code, từng sản
            phẩm và từng khóa học.
          </motion.p>
        </div>
      </div>

      {/* Video*/}
      <motion.div
        className="w-full max-w-4xl mt-12 rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="relative aspect-video w-full h-auto">
          <Image
            src="/images/about-banner.png"
            alt="Giới thiệu"
            fill
            className="object-contain"
          />
        </div>
      </motion.div>
    </section>
  );
}
