"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // trạng thái hiện/ẩn cho 3 ô
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword) {
      return setError("Vui lòng nhập mật khẩu hiện tại");
    }
    if (newPassword.length < 6) {
      return setError("Mật khẩu mới phải có ít nhất 6 ký tự");
    }
    if (newPassword !== confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp");
    }
    if (newPassword === oldPassword) {
      return setError("Mật khẩu mới phải khác mật khẩu cũ");
    }

    setError("");

    try {
      setSubmitting(true);

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || "Không thể đổi mật khẩu");
        return;
      }

      toast.success("Đổi mật khẩu thành công");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Đang tải...
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen flex pt-20 justify-center px-4">
      <div className="shadow-lg rounded-lg w-full max-w-md p-8 ">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">
          Đổi mật khẩu
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mật khẩu hiện tại */}
          <div>
            <label
              htmlFor="oldPassword"
              className="block text-sm font-medium text-white"
            >
              Mật khẩu hiện tại
            </label>
            <div className="relative mt-1">
              <input
                id="oldPassword"
                type={showOld ? "text" : "password"}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-white text-black focus:outline-none focus:ring-2 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-black"
                onClick={() => setShowOld((v) => !v)}
              >
                {showOld ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-white"
            >
              Mật khẩu mới
            </label>
            <div className="relative mt-1">
              <input
                id="newPassword"
                type={showNew ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-white text-black focus:outline-none focus:ring-2 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-black"
                onClick={() => setShowNew((v) => !v)}
              >
                {showNew ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-white"
            >
              Xác nhận mật khẩu mới
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-white text-black focus:outline-none focus:ring-2 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-black"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-buttonRoot text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-60"
          >
            {submitting ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}
