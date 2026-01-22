"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import {
  Globe,
  Boxes,
  Bot,
  Database,
  TabletSmartphone,
  Figma,
  UserRound,
  MonitorPlay,
  CircleDollarSign,
  UserRoundPlus,
} from "lucide-react";
import config from "@/config";

const departments = [
  { name: "Frontend Developer (Next.js/React)", icon: Globe },
  { name: "Backend Developer (NestJS/Node.js)", icon: Database },
  { name: "Mobile Developer (React Native)", icon: TabletSmartphone },
  { name: "UI/UX Designer", icon: Figma },
  { name: "Giảng viên cộng đồng (Part-time)", icon: UserRound },
  { name: "Content Creator (TikTok, Blog)", icon: MonitorPlay },
  { name: "Marketing Online", icon: CircleDollarSign },
  { name: "Partnership Manager", icon: Bot },
  { name: "Blockchain Engineer", icon: Boxes },
  { name: "Cộng tác viên khóa học", icon: UserRoundPlus },
];

export default function CareersGrid({ className }: { className?: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section
      ref={ref}
      className={cn(
        "bg-[#1a1a1f] text-white w-full md:py-20 py-16 px-6 flex flex-col items-center",
        className
      )}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl font-bold mb-4"
      >
        Tìm kiếm người đồng hành
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-white/70 text-lg mb-12 text-left w-full max-w-2xl"
      >
        Đồng hành cùng {config.companyName} trong hành trình xây dựng nền tảng
        công nghệ & giáo dục hiện đại. Chúng tôi luôn tìm kiếm những cá nhân đam
        mê lập trình, giáo dục và phát triển sản phẩm.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 bg-[#0a0a0a] p-10 rounded-3xl shadow-xl"
      >
        {departments.map(({ name, icon: Icon }, i) => (
          <Link href="/contact" key={i}>
            <div className="flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
              <Icon className="w-10 h-10 mb-2 text-white" />
              <span className="text-sm font-semibold text-white">{name}</span>
            </div>
          </Link>
        ))}
      </motion.div>
    </section>
  );
}
