// src/components/budgets/BudgetAdd.tsx
"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  createBudgetCategory,
  type BudgetCategory,
} from "@/services/BudgetService";

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

const nfVI = new Intl.NumberFormat("vi-VN");
const formatVND = (digits: string) =>
  digits ? nfVI.format(Number(digits)) : "";

export default function BudgetAdd({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd?: (b: BudgetCategory) => void;
}) {
  const { data: session } = useSession();
  const user = session?.user;

  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#FFFFFF",
    targetDigits: "",
    targetDisplay: "",
    currentDigits: "0",
    currentDisplay: "0",
  });

  const [loading, setLoading] = useState(false);

  const handlePickColor = (hex: string) =>
    setForm((s) => ({ ...s, color: hex }));

  const handleMoneyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "target" | "current"
  ) => {
    const digits = (e.target.value.match(/\d/g) || []).join("");
    const display = formatVND(digits);
    if (key === "target")
      setForm((s) => ({ ...s, targetDigits: digits, targetDisplay: display }));
    else
      setForm((s) => ({
        ...s,
        currentDigits: digits,
        currentDisplay: display,
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return toast.error("Chưa đăng nhập");

    const name = form.name.trim();
    if (!name) return toast.error("Tên ngân sách không được để trống");

    const target = Number(form.targetDigits || "0");
    const current = Number(form.currentDigits || "0");
    if (!target || target <= 0)
      return toast.error("Mục tiêu ngân sách phải > 0");
    if (current < 0) return toast.error("Số tiền hiện tại không hợp lệ");
    if (current > target)
      return toast.error("Hiện tại không được lớn hơn mục tiêu");

    try {
      setLoading(true);
      const created = await createBudgetCategory({
        name,
        description: form.description.trim() || null,
        color: form.color,
        user_id: user.id,
        target_amount: target,
        current_amount: current,
      });

      toast.success("Tạo ngân sách thành công", {
        description: `“${created.name}” (mục tiêu ${nfVI.format(target)} VND).`,
      });
      onAdd?.(created);
      onClose();
    } catch (err: any) {
      toast.error("Tạo ngân sách thất bại", {
        description: err?.message || "Lỗi không xác định",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c1e] rounded-xl w-full max-w-md h-[80vh] relative flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1c1c1e] p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Thêm ngân sách</h2>
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
          id="add-budget-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-auto px-6 py-4 space-y-4"
        >
          {/* name */}
          <div>
            <label className="block mb-1 text-white">Tên ngân sách</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
              disabled={loading}
              placeholder="Ví dụ: Ăn uống, Giải trí..."
            />
          </div>

          {/* description */}
          <div>
            <label className="block mb-1 text-white">Mô tả</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
              rows={3}
              disabled={loading}
              placeholder="Ghi chú (không bắt buộc)"
            />
          </div>

          {/* target_amount */}
          <div>
            <label className="block mb-1 text-white">Mục tiêu (VND)</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.targetDisplay}
              onChange={(e) => handleMoneyChange(e, "target")}
              placeholder="vd: 5.000.000"
              disabled={loading}
            />
          </div>

          {/* current_amount */}
          {/* <div>
            <label className="block mb-1 text-white">Hiện tại (VND)</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.currentDisplay}
              onChange={(e) => handleMoneyChange(e, "current")}
              placeholder="vd: 1.000.000"
              disabled={loading}
            />
          </div> */}

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="block text-white">Màu hiển thị</label>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-md border border-white/20"
                style={{ backgroundColor: form.color }}
                title={form.color}
              />
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
            form="add-budget-form"
            className="w-full py-2 rounded-lg bg-buttonRoot text-white font-semibold disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Thêm ngân sách"}
          </button>
        </div>
      </div>
    </div>
  );
}
