"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // <= NextAuth client
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // dùng Credentials Provider (đã cấu hình ở NextAuth)
      const res = await signIn("credentials", {
        redirect: false, // tự điều hướng thủ công
        email: email.trim().toLowerCase(),
        password,
      });

      if (!res || res.error) {
        alert(res?.error || "Đăng nhập thất bại");
        return;
      }
      router.push("/auth/dashboard"); // callback sau khi login
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex pt-20 justify-center px-4">
        <div className="shadow-lg rounded-lg w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">
            Đăng nhập
          </h1>

          <div className="space-y-4 mb-6">
            <button
              onClick={() =>
                signIn("google", { callbackUrl: "/auth/dashboard" })
              } // cần cấu hình provider Google
              className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition"
            >
              <FcGoogle className="text-xl" />
              <span>Đăng nhập với Google</span>
            </button>

            <button
              onClick={() =>
                signIn("github", { callbackUrl: "/auth/dashboard" })
              } // cần cấu hình provider GitHub
              className="flex items-center justify-center gap-3 w-full bg-[#1F2937] text-white rounded-md px-4 py-2 hover:bg-gray-800 transition"
            >
              <FaGithub className="text-xl" />
              <span>Đăng nhập với GitHub</span>
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-buttonRoot text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-60"
            >
              {submitting ? "Đang tải..." : "Đăng nhập"}
            </button>
          </form>

          <p className="text-center text-sm text-white mt-4">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-[#047857] hover:underline">
              Đăng ký ngay
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            <Link href="/forgot" className="text-[#047857] hover:underline">
              Quên mật khẩu?
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
