"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const OTP_LENGTH = 6;

export default function OtpPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const email = useMemo(() => sp.get("email") || "", [sp]);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputsRef.current[index - 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").trim();
    if (!/^\d+$/.test(pasteData)) return;
    const pasteDigits = pasteData.slice(0, OTP_LENGTH).split("");
    const newOtp = [...otp];
    for (let i = 0; i < OTP_LENGTH; i++) newOtp[i] = pasteDigits[i] || "";
    setOtp(newOtp);
    inputsRef.current[
      Math.min(pasteDigits.length - 1, OTP_LENGTH - 1)
    ]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== OTP_LENGTH) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "OTP không hợp lệ");
        return;
      }
      // chuyển thẳng sang trang đặt mật khẩu mới
      router.push(data.redirect);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex pt-20 justify-center px-4">
      <div className="shadow-lg rounded-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2 text-center text-white">
          Nhập mã OTP
        </h1>
        <p className="text-white text-center my-4">
          Mã OTP đã được gửi về email {email ? <b>{email}</b> : null}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-12 h-12 text-center text-xl rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2"
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={handlePaste}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || otp.some((d) => d === "")}
            className="w-full bg-buttonRoot text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-60"
          >
            {submitting ? "Đang xác thực..." : "Xác nhận"}
          </button>
        </form>
      </div>
    </div>
  );
}
