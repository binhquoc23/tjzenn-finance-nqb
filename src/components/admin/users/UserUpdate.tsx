"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { updateUser, type User } from "@/services/UserService";

interface UserUpdateProps {
  user: User;
  onClose: () => void;
  onUpdated: () => void; // reload list
}

export default function UserUpdate({
  user,
  onClose,
  onUpdated,
}: UserUpdateProps) {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "user",
    password: "", // nhập mới nếu muốn đổi
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      const name = form.name.trim();
      if (!name) throw new Error("Tên người dùng không được để trống");

      const email = form.email.trim().toLowerCase();
      if (!email) throw new Error("Email không được để trống");

      const role = (form.role || "user").trim();

      const payload: any = { name, email, role };

      // nếu có nhập password mới thì hash rồi update
      if (form.password.trim()) {
        const hashed = await bcrypt.hash(form.password.trim(), 10);
        payload.password = hashed;
      }

      await updateUser(user.id, payload);

      toast.success("CẬP NHẬT THÀNH CÔNG", {
        description: (
          <>
            <strong>{name}</strong> đã được cập nhật.
          </>
        ),
      });

      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error("CẬP NHẬT THẤT BẠI", {
        description: err?.message || "Lỗi không xác định",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c1e] rounded-xl w-full max-w-3xl h-[80vh] relative flex flex-col">
        <div className="sticky top-0 z-10 bg-[#1c1c1e] p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Sửa user</h2>
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-400"
            onClick={onClose}
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          id="update-user-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-auto px-6 py-4 space-y-4"
        >
          <div>
            <label className="block mb-1 text-white">Tên</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-white">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-white">Role</label>
            <select
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-white">
              Mật khẩu mới (nếu đổi)
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="Để trống nếu không đổi"
            />
            <p className="text-xs text-white/60 mt-1">
              Nếu nhập mật khẩu mới, hệ thống sẽ hash rồi mới update DB.
            </p>
          </div>
        </form>

        <div className="sticky bottom-0 z-10 bg-[#1c1c1e] px-6 py-4 border-t border-white/10">
          <button
            type="submit"
            form="update-user-form"
            disabled={submitting}
            className="w-full py-2 rounded-lg bg-buttonRoot text-white font-semibold disabled:opacity-60"
          >
            {submitting ? "Đang lưu..." : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
}
