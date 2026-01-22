"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  id: number;
  name: string;
  features: string[];
  image: string;
  link: string;
  category: "ERP" | "Marketing";
}

const projects: Project[] = [
  {
    id: 1,
    name: "Phần mềm quản lý nhân viên",
    features: [
      "Quản lý hồ sơ, thông tin nhân viên",
      "Lịch làm việc, nghỉ phép, tăng ca",
      "Tính lương, kế hoạch đào tạo",
      "Thống kê, báo cáo, phân tích",
    ],
    image: "/images/software/software-user.png",
    link: "#",
    category: "ERP",
  },
  {
    id: 2,
    name: "Phần mềm quản lý kho, đơn hàng",
    features: [
      "Quản lý số lượng tồn kho, xuất phiếu nhập kho",
      "Ghi nhận chi tiết người nhận / giao",
      "Kiểm tra hạn sử dụng, tình trạng đơn hàng",
      "Báo cáo, thông kê",
    ],
    image: "/images/software/software-truck.png",
    link: "#",
    category: "ERP",
  },
  {
    id: 3,
    name: "Phần mềm giao việc",
    features: [
      "Tạo & phân công công việc",
      "Thiết lập deadline, ưu tiên",
      "Thông báo & nhắc nhở",
      "Tiến độ, báo cáo",
    ],
    image: "/images/software/software-task.png",
    link: "#",
    category: "ERP",
  },
  {
    id: 4,
    name: "Phần mềm gửi email",
    features: [
      "Nhiều mẫu template, chọn hàng trăm khách hàng",
      "Đặt lịch gửi email tự động",
      "Lọc email trùng, không hợp lệ",
      "Thống kê tỉ lệ gửi thành công",
    ],
    image: "/images/software/software-email.png",
    link: "#",
    category: "Marketing",
  },
  {
    id: 5,
    name: "Phần mềm tích điểm (Loyalty)",
    features: [
      "Tự động tích điểm, nâng hạn thành viên",
      "Thông báo cho khách hàng khi thăng hạng / đăng ký",
      "Thư chúc mừng sinh nhật",
      "Đổi thưởng cho khách hàng",
    ],
    image: "/images/software/software-loyalty.png",
    link: "#",
    category: "Marketing",
  },
];

const tabs = ["ERP", "Marketing"] as const;
type Tab = (typeof tabs)[number];

export default function SoftwareCard() {
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]);
  const filtered = projects.filter((p) => p.category === activeTab);

  return (
    <div className="max-w-7xl bg-[#1a1a1f] text-white mx-auto py-16">
      <motion.h2
        className="text-3xl font-bold text-center mb-10 pt-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Các giải pháp phần mềm
      </motion.h2>

      {/* Tabs */}
      <motion.div
        className="flex justify-center space-x-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 font-medium transition-colors duration-200 \
              ${
                activeTab === tab
                  ? "text-white border-b-2 border-white"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-3">
        <AnimatePresence mode="wait">
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
            >
              <Link
                href={project.link}
                scroll={false}
                className="bg-black text-white shadow-lg flex flex-col items-start hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="relative w-full h-64">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover "
                  />
                </div>
                <div className="px-4 pb-4">
                  <h3 className="mt-4 text-xl font-bold text-white">
                    {project.name}
                  </h3>

                  <ul className="mt-2 list-disc list-inside text-sm text-white space-y-1">
                    {project.features.map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
