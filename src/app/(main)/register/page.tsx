"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { createUser } from "@/services/UserService";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Vui lòng nhập tên hiển thị");
    if (!email.trim()) return toast.error("Vui lòng nhập email");
    if (password !== confirmPassword) return toast.error("Mật khẩu không khớp");
    if (password.length < 6) return toast.error("Mật khẩu tối thiểu 6 ký tự");

    try {
      setSubmitting(true);

      const res = await fetch("/api/auth/register-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // ví dụ { error: "Email đã được sử dụng..." }
        throw new Error(data?.error || "Có lỗi xảy ra, thử lại sau");
      }

      // Thành công: đã gửi email xác thực
      toast.success(
        "Gần xong rồi! Vui lòng kiểm tra email và nhấp xác nhận. Link xác nhận hết hạn trong 5 phút"
      );

      // Optional: chuyển user về trang login luôn
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra, thử lại sau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex pt-20 justify-center px-4">
        <div className="shadow-lg rounded-lg w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">
            Đăng ký
          </h1>

          <div className="space-y-4 mb-6">
            <button
              type="button"
              onClick={() => {
                // dùng google oauth
                signIn("google", { callbackUrl: "/auth/dashboard" });
              }}
              className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition"
            >
              <FcGoogle className="text-xl" />
              <span>Đăng ký với Google</span>
            </button>

            <button
              type="button"
              onClick={() =>
                signIn("github", { callbackUrl: "/auth/dashboard" })
              }
              className="flex items-center justify-center gap-3 w-full bg-[#1F2937] text-white rounded-md px-4 py-2 hover:bg-gray-800 transition"
            >
              <FaGithub className="text-xl" />
              <span>Đăng ký với GitHub</span>
            </button>
          </div>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300 dark:border-gray-600" />
            <span className="px-3 text-sm text-white">Hoặc</span>
            <hr className="flex-grow border-gray-300 dark:border-gray-600" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white"
              >
                Chúng tôi có thể gọi bạn là?
              </label>
              <input
                id="name"
                type="text"
                placeholder="VD: Nguyễn Văn A"
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                placeholder="VD: nguyenvana@gmail.com"
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white"
              >
                Mật khẩu
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  required
                  className="w-full px-4 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-black"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-white"
              >
                Nhập lại mật khẩu
              </label>
              <div className="relative mt-1">
                <input
                  id="confirm-password"
                  type={confirmVisible ? "text" : "password"}
                  required
                  className="w-full px-4 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-black"
                  onClick={() => setConfirmVisible(!confirmVisible)}
                >
                  {confirmVisible ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-buttonRoot text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-60"
            >
              {submitting ? "Đang tải..." : "Tạo tài khoản"}
            </button>
          </form>

          <p className="text-center text-sm text-white mt-4">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-[#047857] hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
