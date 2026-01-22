export const dynamic = "force-static";
import React from "react";
import { Metadata } from "next";
import { baseOpenGraph } from "../../shared-metadata";
import FaqSection from "@/components/faq/FAQCourse";
import BannerFaqCourse from "@/components/faq/BannerFaqCourse";

const url = process.env.NEXT_PUBLIC_URL + "/course";
const urlImage = process.env.NEXT_PUBLIC_URL + "/images/logo.png";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp về khóa học",
  description:
    "Giải đáp mọi thắc mắc trước khi đăng ký khóa học tại TJZenn – từ nội dung giảng dạy, phương pháp học, quyền lợi học viên đến các câu hỏi kỹ thuật và thanh toán. Tất cả những gì bạn cần biết để bắt đầu hành trình học lập trình hiệu quả và thực chiến",
  openGraph: {
    ...baseOpenGraph,
    url: url,
    images: [
      {
        url: urlImage,
      },
    ],
  },
  alternates: {
    canonical: url,
  },
};

const FAQPage = async () => {
  return (
    <div className="flex p-4 w-full ">
      <div className="w-full">
        <BannerFaqCourse />
        <FaqSection />
      </div>
    </div>
  );
};

export default FAQPage;
