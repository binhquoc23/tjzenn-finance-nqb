"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { createUser, type User } from "@/services/UserService";

interface UserAddProps {
  onClose: () => void;
  onAdd: (u: User) => void;
}

export default function UserAdd({ onClose, onAdd }: UserAddProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
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

      const password = form.password.trim();
      if (!password) throw new Error("Mật khẩu không được để trống");

      const role = (form.role || "user").trim();

      const created = await createUser({ name, email, password, role });

      toast.success("TẠO USER THÀNH CÔNG", {
        description: (
          <>
            <strong>{created.name}</strong> đã được thêm.
          </>
        ),
      });

      onAdd(created);
      onClose();
    } catch (err: any) {
      toast.error("TẠO USER THẤT BẠI", {
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
          <h2 className="text-2xl font-bold text-white">Thêm user</h2>
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-400"
            onClick={onClose}
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          id="add-user-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-auto px-6 py-4 space-y-4"
        >
          <div>
            <label className="block mb-1 text-white">Tên</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="vd: Nguyễn Văn A"
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
              placeholder="vd: a@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-white">Mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-white/60 mt-1">
              Mật khẩu sẽ được hash trước khi lưu DB.
            </p>
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
        </form>

        <div className="sticky bottom-0 z-10 bg-[#1c1c1e] px-6 py-4 border-t border-white/10">
          <button
            type="submit"
            form="add-user-form"
            disabled={submitting}
            className="w-full py-2 rounded-lg bg-buttonRoot text-white font-semibold disabled:opacity-60"
          >
            {submitting ? "Đang lưu..." : "Thêm user"}
          </button>
        </div>
      </div>
    </div>
  );
}
