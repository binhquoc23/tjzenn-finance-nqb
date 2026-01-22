"use client";

import { useEffect, useState } from "react";
import { motion, animate, useMotionValue } from "framer-motion";
import { useInView } from "react-intersection-observer";

function CountUp({
  to,
  duration = 2,
  format = (n: number) => Math.floor(n).toString(),
  animateValue = true,
}: {
  to: number;
  duration?: number;
  format?: (n: number) => string;
  animateValue?: boolean;
}) {
  const motionVal = useMotionValue(0);
  const [current, setCurrent] = useState(animateValue ? "0" : format(to));

  useEffect(() => {
    if (!animateValue) return;

    const controls = animate(motionVal, to, {
      duration,
      onUpdate: (v) => {
        setCurrent(Math.floor(v).toString());
      },
      onComplete: () => {
        setCurrent(format(to));
      },
    });
    return () => controls.stop();
  }, [motionVal, to, duration, format, animateValue]);

  return <span>{current}</span>;
}

const stats = [
  { value: 5, label: "Đội ngũ phát triển" },
  {
    value: 2024,
    label: "Thành lập",
    format: (n: number) => `${n}`,
  },
  {
    value: 200,
    label: "Tự đầu tư",
    format: (n: number) => `${n.toLocaleString()} Triệu`,
    gradient: true,
  },
];

const highlights = [
  { value: 1289, label: "Học viên" },
  { value: 10035, label: "Lượt truy cập mỗi tháng" },
];
export default function AboutStatsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section
      ref={ref}
      className="bg-[#1a1a1f] text-white w-full px-6 md:py-20 py-14 flex flex-col items-center border-t border-b border-white/10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-4 px-4 py-1 text-2xl font-medium tracking-widest uppercase rounded-full bg-[#111111] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
      >
        TRỤ SỞ CHÍNH
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl md:text-4xl font-semibold mb-12"
      >
        Biên Hòa, Việt Nam
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 w-full max-w-5xl text-center">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
            className="flex flex-col items-center"
          >
            <div
              className={`text-4xl font-semibold ${
                stat.gradient
                  ? "bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
                  : "text-white"
              }`}
            >
              {inView ? (
                <CountUp
                  to={stat.value}
                  format={
                    stat.format
                      ? stat.format
                      : (n) =>
                          stat.label === "Thành lập"
                            ? `${n}`
                            : `${Math.floor(n).toLocaleString()}`
                  }
                  animateValue={stat.label !== "Thành lập"} // chỉ animation nếu KHÔNG phải là "Thành lập"
                />
              ) : (
                stat.value
              )}
            </div>
            <span className="text-lg text-gray-400 mt-1">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 max-w-4xl w-full justify-center"
      >
        {highlights.map((item, i) => (
          <div
            key={i}
            className="flex-1 bg-[#111111] p-6 rounded-2xl text-left"
          >
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              {inView ? (
                <CountUp
                  to={item.value}
                  format={(n) => n.toLocaleString("vi-VN")}
                />
              ) : (
                item.value
              )}
            </div>
            <div className="text-white text-lg whitespace-pre-line mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
