"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// Người dùng nhập email ở /forgot → gọi API /api/auth/forgot

// BE check users xem email có tồn tại (không lộ ra ngoài).

// Tạo OTP 6 số, hash bằng bcrypt, TTL 10 phút, lưu vào bảng password_reset_otps (kèm attempts=0).

// Gửi email OTP (hoặc log ra console khi dev).

// FE luôn hiển thị: “Nếu email đã được đăng ký trong TJFinance, OTP đã được gửi.” → push tới /otp?email=....

// Người dùng nhập OTP ở /otp → gọi API /api/auth/verify-otp

// BE lấy OTP mới nhất theo email trong password_reset_otps.

// Nếu hết hạn → xoá row, báo “OTP đã hết hạn”.

// Nếu thử sai ≥ 5 lần → xoá row, khoá OTP hiện tại.

// Nếu đúng OTP → tạo reset_token (random 32 bytes hex), TTL 10 phút, lưu vào password_reset_tokens, xoá OTP.

// Trả về { redirect: "/new-password?token=..." }.

// FE router.push sang trang tạo mật khẩu mới.

// Người dùng đặt mật khẩu mới ở /new-password?token=... → gọi API /api/auth/reset-password

// BE tìm reset_token trong password_reset_tokens.

// Nếu hết hạn → xoá token, báo “Token hết hạn”.

// Nếu ok → hash mật khẩu mới (bcrypt), update vào users.password, xoá reset_token.

// FE toast “Đặt lại mật khẩu thành công!” → push /login.

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = email.trim();
    if (!val) return toast.error("Vui lòng nhập email");

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: val }),
        cache: "no-store", // tránh cache khùng
      });
      const data = await res.json();
      console.log("forgot response:", data); // ✅ debug nhanh

      if (data.exists) {
        // có tài khoản → đã gửi (hoặc cố gắng gửi) OTP
        if (data.sent) {
          toast.success("OTP đã được gửi. Vui lòng kiểm tra email!");
        } else {
          toast.error(data.message || "Không thể gửi OTP, thử lại sau.");
        }
        router.push(`/otp?email=${encodeURIComponent(val)}`);
      } else {
        // không có tài khoản → báo toast, KHÔNG chuyển trang
        toast.error(data.message || "Email này chưa được đăng ký");
      }
    } catch {
      toast.error("Có lỗi xảy ra, thử lại sau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex pt-20 justify-center px-4">
      <div className="shadow-lg rounded-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">
          Quên mật khẩu
        </h1>
        <p className="text-sm text-gray-300 text-center mb-6">
          Nhập email đã đăng ký để nhận mã xác thực
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-buttonRoot text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-60"
          >
            {submitting ? "Đang gửi..." : "Nhận mã xác thực"}
          </button>
        </form>

        <p className="text-center text-sm text-white mt-6">
          <Link href="/login" className="text-[#047857] hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
