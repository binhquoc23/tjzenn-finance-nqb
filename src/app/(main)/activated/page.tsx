"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";

export default function ActivatedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status"); // success | expired | invalid | error
  const email = searchParams.get("email") || "";

  const { title, description, highlightColor } = useMemo(() => {
    if (status === "success") {
      return {
        title: "Kích hoạt thành công 🎉",
        description: email
          ? `Tài khoản ${email} đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.`
          : "Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.",
        highlightColor: "text-emerald-400",
      };
    }

    if (status === "expired") {
      return {
        title: "Link đã hết hạn ⏳",
        description:
          "Link xác nhận đã quá hạn 5 phút. Vui lòng đăng ký lại để nhận link mới.",
        highlightColor: "text-yellow-400",
      };
    }

    if (status === "invalid") {
      return {
        title: "Link không hợp lệ",
        description:
          "Token không hợp lệ hoặc đã được sử dụng rồi. Bạn vui lòng đăng ký lại tài khoản.",
        highlightColor: "text-red-400",
      };
    }

    if (status === "error") {
      return {
        title: "Có lỗi xảy ra 🚧",
        description:
          "Chúng tôi gặp sự cố khi kích hoạt tài khoản. Vui lòng thử lại sau.",
        highlightColor: "text-red-400",
      };
    }

    // fallback
    return {
      title: "Thông báo",
      description:
        "Không xác định được trạng thái kích hoạt. Bạn có thể thử đăng nhập hoặc đăng ký lại.",
      highlightColor: "text-white",
    };
  }, [status, email]);

  return (
    <div className="min-h-screen text-white px-4 py-16 flex flex-col items-center">
      <div className="w-full max-w-md">
        {/* Title */}
        <h1 className={`text-2xl font-semibold mb-3 ${highlightColor}`}>
          {title}
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed mb-6">
          {description}
        </p>

        {/* Info box (chỉ hiện khi success + có email) */}
        {status === "success" && email ? (
          <div className="mb-8 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <div className="font-medium text-emerald-400">
              Email đã xác minh
            </div>
            <div className="break-all">{email}</div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/login")}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 text-center transition-colors"
          >
            Đi đến trang đăng nhập
          </button>

          {status !== "success" && (
            <button
              onClick={() => router.push("/register")}
              className="w-full rounded-lg bg-transparent border border-white/20 hover:bg-white/5 text-white font-semibold py-2.5 text-center transition-colors"
            >
              Đăng ký lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
