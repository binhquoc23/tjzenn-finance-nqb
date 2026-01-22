"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import { createCategoryIncome } from "@/services/CategoryIncomeService";
import { useSession } from "next-auth/react";

export type CategoryIncome = {
  id: number;
  name: string;
  description: string | null;
  color?: string | null;
  created_at?: string;
  updated_at?: string;
};

interface CategoryIncomeAddProps {
  onClose: () => void;
  onAdd?: (cat: CategoryIncome) => void;
}

const PRESET_COLORS = [
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#22C55E",
  "#10B981",
  "#3B82F6",
  "#0EA5E9",
  "#8B5CF6",
  "#A855F7",
  "#EC4899",
];

export default function CategoryIncomeAdd({
  onClose,
  onAdd,
}: CategoryIncomeAddProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#FFFFFF",
  });
  const [customColor, setCustomColor] = useState(form.color);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const user = session?.user as { id?: string; name?: string } | undefined;

  const handlePickColor = (hex: string) => {
    setForm((s) => ({ ...s, color: hex }));
    setCustomColor(hex);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Tên danh mục không được để trống");
      return;
    }
    if (!user?.id) {
      toast.error(
        "Không xác định được người dùng. Anh đăng nhập lại giúp em nhé."
      );
      return;
    }

    try {
      setLoading(true);
      const row = await createCategoryIncome({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        color: form.color,
        user_id: user.id,
      });

      toast.success("Tạo danh mục thu nhập thành công", {
        description: `“${row.name}” đã được thêm.`,
      });

      onAdd?.(row as CategoryIncome);
      onClose();
    } catch (err: any) {
      const msg = String(err?.message || "");
      const isDuplicate = /duplicate key value/i.test(msg);
      toast.error("Tạo danh mục thất bại", {
        description: isDuplicate
          ? "Tên danh mục đã tồn tại. Anh thử tên khác nhé."
          : msg || "Lỗi không xác định",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c1e] rounded-xl w-full max-w-md h-[70vh] relative flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1c1c1e] p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            Thêm danh mục thu nhập
          </h2>
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-400"
            onClick={onClose}
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          id="add-category-income-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-auto px-6 py-4 space-y-4"
        >
          <div>
            <label className="block mb-1 text-white">Tên danh mục</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
              disabled={loading}
              placeholder="Ví dụ: Lương chính, freelance ..."
            />
          </div>

          <div>
            <label className="block mb-1 text-white">Mô tả</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
              rows={4}
              disabled={loading}
              placeholder="Ghi chú thêm (không bắt buộc)"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="block text-white">Màu hiển thị</label>

            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-md border border-white/20"
                style={{ backgroundColor: form.color }}
                title={form.color}
              />
              {/* Nếu muốn mở input color, bật lại các input bên dưới */}
              {/* <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  handlePickColor(e.target.value);
                }}
                className="h-8 w-12 bg-transparent cursor-pointer"
                disabled={loading}
              /> */}
              {/* <input
                value={customColor}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomColor(v);
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) handlePickColor(v);
                }}
                className="px-3 py-2 rounded-lg bg-black text-white border border-gray-600 w-28"
                placeholder="#3B82F6"
                disabled={loading}
              /> */}
            </div>

            <div className="grid grid-cols-6 gap-2 mt-2">
              {PRESET_COLORS.map((c) => {
                const selected = form.color.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handlePickColor(c)}
                    className={`h-9 rounded-lg border relative focus:outline-none ${
                      selected ? "ring-2 ring-white/80" : "border-white/20"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Chọn màu ${c}`}
                    title={c}
                    disabled={loading}
                  >
                    {selected && (
                      <span className="absolute right-1 top-1 text-black">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-[#1c1c1e] px-6 py-4 border-t border-white/10">
          <button
            type="submit"
            form="add-category-income-form"
            className="w-full py-2 rounded-lg bg-buttonRoot text-white font-semibold disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Thêm danh mục"}
          </button>
        </div>
      </div>
    </div>
  );
}
