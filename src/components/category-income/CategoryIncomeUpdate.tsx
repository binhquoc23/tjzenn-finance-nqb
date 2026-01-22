"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  updateCategoryIncome,
  type CategoryIncome,
} from "@/services/CategoryIncomeService";

interface CategoryIncomeUpdateProps {
  item: CategoryIncome; // dữ liệu hiện tại
  onClose: () => void;
  onUpdated?: (updated: CategoryIncome) => void; // callback sau khi cập nhật
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

export default function CategoryIncomeUpdate({
  item,
  onClose,
  onUpdated,
}: CategoryIncomeUpdateProps) {
  const [form, setForm] = useState({
    name: item.name || "",
    description: item.description || "",
    color: item.color || "#3B82F6",
  });
  const [customColor, setCustomColor] = useState(form.color);
  const [loading, setLoading] = useState(false);

  // lưu initial để gửi "chỉ field thay đổi"
  const initial = useMemo(
    () => ({
      name: item.name || "",
      description: item.description || "",
      color: item.color || "#3B82F6",
    }),
    [item]
  );

  useEffect(() => {
    setForm({
      name: item.name || "",
      description: item.description || "",
      color: item.color || "#3B82F6",
    });
    setCustomColor(item.color || "#3B82F6");
  }, [item]);

  const handlePickColor = (hex: string) => {
    setForm((s) => ({ ...s, color: hex }));
    setCustomColor(hex);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      toast.error("Tên danh mục không được để trống");
      return;
    }

    // build payload chỉ gồm field đổi
    const payload: Record<string, any> = {};
    if (name !== initial.name) payload.name = name;

    const desc = form.description.trim();
    if (desc !== initial.description) payload.description = desc || null;

    if (form.color !== initial.color) payload.color = form.color || null;

    if (Object.keys(payload).length === 0) {
      toast.info("Không có thay đổi nào để lưu");
      return;
    }

    try {
      setLoading(true);
      const updated = await updateCategoryIncome(item.id, payload);

      toast.success("Cập nhật danh mục thu nhập thành công", {
        description: `Đã lưu “${updated.name}”.`,
      });

      onUpdated?.(updated);
      onClose();
    } catch (err: any) {
      const msg = String(err?.message || "");
      const isDuplicate = /duplicate key value/i.test(msg);
      toast.error("Cập nhật thất bại", {
        description: isDuplicate
          ? "Tên danh mục đã tồn tại, anh thử tên khác nhé."
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
          <h2 className="text-2xl font-bold text-white">Cập nhật danh mục</h2>
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
          id="update-category-income-form"
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

            {/* Preview */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-md border border-white/20"
                style={{ backgroundColor: form.color }}
                title={form.color}
              />
              {/* Bật lại 2 input dưới nếu anh muốn cho nhập tự do */}
              {/* <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  handlePickColor(e.target.value);
                }}
                className="h-8 w-12 bg-transparent cursor-pointer"
                disabled={loading}
              />
              <input
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

            {/* Preset palette */}
            <div className="grid grid-cols-6 gap-2 mt-2">
              {PRESET_COLORS.map((c) => {
                const selected =
                  (form.color || "").toLowerCase() === c.toLowerCase();
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
            form="update-category-income-form"
            className="w-full py-2 rounded-lg bg-buttonRoot text-white font-semibold disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
