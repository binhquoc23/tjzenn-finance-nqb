"use client";
import config from "@/config";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AboutUsProps {
  className?: string;
}

export default function HeroBanner({ className }: AboutUsProps) {
  return (
    <section
      className={cn(
        " text-white w-full min-h-screen flex flex-col items-center px-4 md:py-20 py-14 text-center pt-12",
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
          <span className="text-6xl font-black italic">TJ Finance</span>
        </div>

        {/* Heading */}
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-semibold max-w-4xl leading-snug mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Quản lý tài chính cá nhân
        </motion.h2>

        {/* Paragraph */}
        <div className="w-full max-w-3xl text-left">
          <motion.p
            className="text-gray-400 text-lg sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Quản lý chi tiêu cá nhân cũng như danh mục đầu tư hướng đến tự do
            tài chính
          </motion.p>
        </div>
        <motion.div
          className="text-gray-400 text-lg sm:text-lg mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Link href={"/login"}>
            <Button className="text-lg bg-buttonRoot hover:bg-buttonRoot">
              Trải nghiệm miễn phí ngay
            </Button>
          </Link>
        </motion.div>

        <motion.div
          className="w-full max-w-4xl mt-12 rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="relative aspect-video w-full h-auto">
            <Image
              src="/images/home/money-icon.webp"
              alt="Giới thiệu"
              fill
              className="object-contain"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
