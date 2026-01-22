"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import config from "@/config";
import Link from "next/link";
import { FaYoutube, FaFacebook, FaTiktok } from "react-icons/fa";
import { GrGroup } from "react-icons/gr";

export default function ContactFormFancy() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lastSent = localStorage.getItem("lastContactTime");
    const now = Date.now();

    if (lastSent && now - parseInt(lastSent) < 2 * 60 * 1000) {
      const secondsLeft = Math.ceil(
        (2 * 60 * 1000 - (now - parseInt(lastSent))) / 1000
      );
      toast.warning(
        `Bạn chỉ được gửi 1 lần mỗi 2 phút. Vui lòng thử lại sau ${secondsLeft}s.`
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gửi thất bại");

      toast.success("Gửi tin nhắn thành công!");
      setFormData({ name: "", email: "", phone: "", message: "" });
      localStorage.setItem("lastContactTime", now.toString());
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full  bg-[#1a1a1f] text-white py-16 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12">
        {/* Left: Contact Form */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-[#0e0e10] p-10 rounded-2xl shadow-xl backdrop-blur-md w-full md:max-w-xl border border-white/10"
        >
          <h2 className="text-3xl font-bold mb-4">
            Liên hệ với {config.companyName}
          </h2>
          <p className="text-gray-400 mb-6">
            Bạn đang quan tâm đến khóa học, dịch vụ thiết kế website/phần mềm
            hoặc muốn trở thành đối tác đồng hành cùng {config.companyName}? Vui
            lòng điền thông tin bên dưới, đội ngũ của chúng tôi sẽ liên hệ lại
            trong thời gian sớm nhất.
          </p>

          {/* social media */}
          <div className="mb-6 flex gap-4 justify-center sm:justify-start">
            <Link
              href={config.youtube}
              target="_blank"
              className="text-blue-400 hover:text-blue-500"
            >
              <FaYoutube className="h-6 w-6" />
            </Link>
            <Link
              href={config.tiktok}
              target="_blank"
              className="text-blue-400 hover:text-blue-500"
            >
              <FaTiktok className="h-6 w-6" />
            </Link>
            <Link
              href={config.facebook}
              target="_blank"
              className="text-blue-400 hover:text-blue-500"
            >
              <FaFacebook className="h-6 w-6" />
            </Link>

            <Link
              href={config.group}
              target="_blank"
              className="text-blue-400 hover:text-blue-500"
            >
              <GrGroup className="h-6 w-6" />
            </Link>
            {/* <Link href="#" className="text-blue-400 hover:text-blue-500">
              <FaTiktok className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-blue-400 hover:text-blue-500">
              <FaInstagram className="h-6 w-6" />
            </Link> */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Họ tên*"
                className="bg-[#111113] border border-white/10 rounded-md px-4 py-2 w-full text-white placeholder-gray-500"
                required
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Số điện thoại*"
                className="bg-[#111113] border border-white/10 rounded-md px-4 py-2 w-full text-white placeholder-gray-500"
                required
              />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email*"
              className="bg-[#111113] border border-white/10 rounded-md px-4 py-2 w-full text-white placeholder-gray-500"
              required
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Nội dung tin nhắn..."
              className="bg-[#111113] border border-white/10 rounded-md px-4 py-2 w-full text-white placeholder-gray-500"
              rows={4}
              required
            ></textarea>
            <button
              type="submit"
              className={`w-full py-3 bg-gradient-to-r bg-buttonRoot  rounded-md font-semibold hover:opacity-90 transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi..." : "Gửi liên hệ"}
            </button>
          </form>
        </motion.div>

        {/* Right: 3D animated circles */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative w-full h-[200px] md:h-[600px] flex items-center justify-center"
        >
          <div className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-500 blur-2xl opacity-20 animate-pulse -z-10" />
          {[0].map((index) => (
            <motion.div
              key={index}
              className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full border border-white/10 overflow-hidden bg-[#0d0d11]"
              style={{
                transformStyle: "preserve-3d",
                rotateX: `${index * 20}deg`,
                rotateZ: `${index * 30}deg`,
              }}
              animate={{ rotateY: [0, 360] }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.2,
              }}
            >
              <img
                src="/images/logo.png"
                alt={`circle-${index}`}
                className="w-full h-full object-contain p-4"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
