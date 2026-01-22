// src/components/budget/BudgetUpdate.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Check, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import {
  updateBudgetCategory,
  adjustBudgetCurrentAmount,
  type BudgetCategory,
} from "@/services/BudgetService";

import {
  getExpenses,
  deleteExpense,
  createExpense,
  type Expense,
} from "@/services/ExpenseService";

import ExpenseUpdate from "@/components/expenses/ExpenseUpdate";

interface BudgetUpdateProps {
  item: BudgetCategory; // dữ liệu hiện tại (has_budget=true)
  onClose: () => void;
  onUpdated?: (updated: BudgetCategory) => void;
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

const nfVI = new Intl.NumberFormat("vi-VN");
const isHex6 = (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v);
const digitsOnly = (s: string) => (s.match(/\d/g) || []).join("");

// yyyy-MM-dd -> dd/MM/yyyy (cho list chi tiêu)
function ymdToLabel(ymd: string) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

// ISO -> yyyy-MM-dd
function isoToYMD(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BudgetUpdate({
  item,
  onClose,
  onUpdated,
}: BudgetUpdateProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(false);

  // form ngân sách
  const [form, setForm] = useState({
    name: item.name || "",
    description: item.description || "",
    color: item.color || "#3B82F6",
    targetDigits: String(item.target_amount ?? 0),
    targetDisplay: nfVI.format(item.target_amount ?? 0),
    currentDigits: String(item.current_amount ?? 0),
    currentDisplay: nfVI.format(item.current_amount ?? 0),
  });

  // list chi tiêu thuộc ngân sách này
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // form thêm chi tiêu mới trong ngân sách
  const [newExp, setNewExp] = useState<{
    name: string;
    amountDigits: string;
    amountDisplay: string;
    dateYMD: string;
    dateLabel: string;
  }>({
    name: "",
    amountDigits: "",
    amountDisplay: "",
    dateYMD: todayYMD(),
    dateLabel: ymdToLabel(todayYMD()),
  });

  const [addingExpense, setAddingExpense] = useState(false);
  const newAmountRef = useRef<HTMLInputElement | null>(null);
  const newDateRef = useRef<HTMLInputElement | null>(null);

  // giữ bản gốc để chỉ gửi field đổi
  const initial = useMemo(
    () => ({
      name: item.name || "",
      description: item.description || "",
      color: item.color || "#3B82F6",
      target_amount: Math.floor(item.target_amount ?? 0),
      current_amount: Math.floor(item.current_amount ?? 0),
    }),
    [item]
  );

  useEffect(() => {
    setForm({
      name: item.name || "",
      description: item.description || "",
      color: item.color || "#3B82F6",
      targetDigits: String(item.target_amount ?? 0),
      targetDisplay: nfVI.format(item.target_amount ?? 0),
      currentDigits: String(item.current_amount ?? 0),
      currentDisplay: nfVI.format(item.current_amount ?? 0),
    });
  }, [item]);

  // hàm load chi tiêu của ngân sách hiện tại
  const reloadExpenses = async () => {
    if (!userId) return;
    try {
      setLoadingExpenses(true);
      const res = await getExpenses({
        page: 1,
        pageSize: 200,
        category: item.id, // ngân sách này chính là 1 category
        user_id: userId,
      });
      setExpenses(res.items);

      // đồng bộ lại "Số tiền hiện tại" bằng tổng chi tiêu
      const sum = res.items.reduce((acc, e) => acc + Number(e.amount ?? 0), 0);
      setForm((s) => ({
        ...s,
        currentDigits: String(sum),
        currentDisplay: nfVI.format(sum),
      }));
    } catch (e: any) {
      toast.error("Không tải được chi tiêu của ngân sách này", {
        description: e?.message || "Lỗi không xác định",
      });
    } finally {
      setLoadingExpenses(false);
    }
  };

  // load expenses khi mở modal / đổi ngân sách
  useEffect(() => {
    reloadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, item.id]);

  const handlePickColor = (hex: string) => {
    setForm((s) => ({ ...s, color: hex }));
  };

  const targetInputRef = useRef<HTMLInputElement | null>(null);
  const currentInputRef = useRef<HTMLInputElement | null>(null);

  const handleMoneyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "target" | "current"
  ) => {
    const raw = digitsOnly(e.target.value);
    const display = raw ? nfVI.format(Number(raw)) : "";
    if (key === "target") {
      setForm((s) => ({ ...s, targetDigits: raw, targetDisplay: display }));
    } else {
      setForm((s) => ({ ...s, currentDigits: raw, currentDisplay: display }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    if (!name) return toast.error("Tên ngân sách không được để trống");

    const color = (form.color || "").trim();
    if (color && !isHex6(color)) {
      return toast.error("Mã màu không hợp lệ. Dùng dạng #RRGGBB");
    }

    const target = Number(form.targetDigits || "0");
    if (!Number.isFinite(target) || target <= 0) {
      return toast.error("Mục tiêu phải là số > 0");
    }

    const payload: Record<string, any> = {};
    if (name !== initial.name) payload.name = name;

    const desc = form.description.trim();
    if (desc !== initial.description) payload.description = desc || null;

    if ((color || null) !== (initial.color || null))
      payload.color = color || null;

    if (Math.floor(target) !== initial.target_amount) {
      payload.target_amount = Math.floor(target);
    }

    if (Object.keys(payload).length === 0) {
      toast.info("Không có thay đổi nào để lưu");
      return;
    }

    try {
      setLoading(true);
      const updated = await updateBudgetCategory(item.id, payload);

      toast.success("Cập nhật ngân sách thành công", {
        description: `Đã lưu “${updated.name}” (mục tiêu ${nfVI.format(
          updated.target_amount
        )} VND).`,
      });

      onUpdated?.(updated);
      onClose();
    } catch (err: any) {
      toast.error("Cập nhật thất bại", {
        description: err?.message || "Lỗi không xác định",
      });
    } finally {
      setLoading(false);
    }
  };

  // thêm chi tiêu mới cho ngân sách này
  const handleAddExpense = async () => {
    try {
      if (!userId) {
        toast.error("Chưa xác thực người dùng");
        return;
      }

      const name = newExp.name.trim();
      if (!name) {
        toast.error("Tên chi tiêu không được để trống");
        return;
      }

      const raw = (newExp.amountDigits || "").trim();
      if (!raw) {
        toast.error("Số tiền không được để trống");
        return;
      }
      const amountNum = Number(raw);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        toast.error("Số tiền phải là số > 0");
        return;
      }

      const dateYMD = (newExp.dateYMD || "").trim();
      if (!dateYMD) {
        toast.error("Ngày phát sinh không được để trống");
        return;
      }

      setAddingExpense(true);

      const payload = {
        name,
        amount: amountNum,
        date: dateYMD,
        note: null as string | null,
        user_id: userId,
        category: item.id, // gắn thẳng vào ngân sách hiện tại
      };

      await createExpense(payload);

      try {
        await adjustBudgetCurrentAmount(item.id, amountNum);
      } catch (err) {
        console.warn("adjustBudgetCurrentAmount (add in budget) failed", err);
      }

      await reloadExpenses();

      toast.success("Đã thêm chi tiêu vào ngân sách", {
        description: name,
      });
      setNewExp({
        name: "",
        amountDigits: "",
        amountDisplay: "",
        dateYMD: todayYMD(),
        dateLabel: ymdToLabel(todayYMD()),
      });
    } catch (e: any) {
      toast.error("Thêm chi tiêu thất bại", {
        description: e?.message || "Lỗi không xác định",
      });
    } finally {
      setAddingExpense(false);
    }
  };

  // xoá chi tiêu trong ngân sách: trừ vào current_amount
  const handleDeleteExpense = async (exp: Expense) => {
    const ok = window.confirm(`Xoá chi tiêu "${exp.name}" khỏi ngân sách này?`);
    if (!ok) return;

    try {
      await deleteExpense(exp.id);

      try {
        const amount = Number(exp.amount ?? 0);
        if (amount > 0) {
          // trừ tiền khỏi ngân sách
          await adjustBudgetCurrentAmount(item.id, -amount);
        }
      } catch (err) {
        console.warn(
          "adjustBudgetCurrentAmount (delete in budget) failed",
          err
        );
      }

      await reloadExpenses();

      toast.success("Đã xoá chi tiêu khỏi ngân sách", {
        description: exp.name,
      });
    } catch (e: any) {
      toast.error("Xoá chi tiêu thất bại", {
        description: e?.message || "Lỗi không xác định",
      });
    }
  };

  // money input cho mini add
  const handleNewAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = digitsOnly(e.target.value);
    const display = raw ? nfVI.format(Number(raw)) : "";
    setNewExp((s) => ({
      ...s,
      amountDigits: raw,
      amountDisplay: display,
    }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1c1c1e] rounded-xl w-full max-w-2xl h-[90vh] relative flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#1c1c1e] p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">
              Cập nhật ngân sách
            </h2>
            <button
              className="absolute top-6 right-6 text-white hover:text-gray-400"
              onClick={onClose}
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form + list */}
          <form
            id="budget-update-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-auto px-6 py-4 space-y-4"
          >
            {/* name */}
            <div>
              <label className="block mb-1 text-white">Tên ngân sách</label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
                value={form.name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, name: e.target.value }))
                }
                required
                disabled={loading}
                placeholder="Ví dụ: Ăn uống, Xăng xe, ..."
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
                ref={targetInputRef}
                type="text"
                inputMode="numeric"
                className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
                value={form.targetDisplay}
                onChange={(e) => handleMoneyChange(e, "target")}
                onPaste={(e) => {
                  const t = e.clipboardData.getData("text");
                  if (!/^\d[\d\s.]*$/.test(t)) e.preventDefault();
                }}
                placeholder="vd: 5.000.000"
                disabled={loading}
              />
            </div>

            {/* current_amount */}
            <div>
              <label className="block mb-1 text-white">
                Số tiền hiện tại (VND)
              </label>
              <input
                ref={currentInputRef}
                type="text"
                inputMode="numeric"
                className="w-full px-4 py-2 rounded-lg bg-black/60 text-white/40 border border-gray-700 cursor-not-allowed select-none"
                value={form.currentDisplay}
                readOnly
                aria-disabled="true"
                title="Trường này chỉ hiển thị, không thể chỉnh sửa"
              />
              <p className="mt-1 text-xs text-white/40">
                Cập nhật tự động từ các chi tiêu thuộc ngân sách này.
              </p>
            </div>

            {/* color picker */}
            <div className="space-y-2">
              <label className="block text-white">Màu hiển thị</label>
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

            {/* THÊM CHI TIÊU CHO NGÂN SÁCH NÀY */}
            <div className="mt-4 border border-white/10 rounded-xl p-3 bg-black/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Thêm chi tiêu cho ngân sách này
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Tên chi tiêu */}
                <div className="sm:col-span-1">
                  <label className="block mb-1 text-xs text-white/70">
                    Tên chi tiêu
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-black text-white border border-gray-600 text-sm"
                    value={newExp.name}
                    onChange={(e) =>
                      setNewExp((s) => ({ ...s, name: e.target.value }))
                    }
                    disabled={addingExpense}
                  />
                </div>

                {/* Số tiền */}
                <div>
                  <label className="block mb-1 text-xs text-white/70">
                    Số tiền (VND)
                  </label>
                  <input
                    ref={newAmountRef}
                    type="text"
                    inputMode="numeric"
                    className="w-full px-3 py-2 rounded-lg bg-black text-white border border-gray-600 text-sm"
                    value={newExp.amountDisplay}
                    onChange={handleNewAmountChange}
                    onPaste={(e) => {
                      const t = e.clipboardData.getData("text");
                      if (!/^\d[\d\s.]*$/.test(t)) e.preventDefault();
                    }}
                    disabled={addingExpense}
                  />
                </div>

                {/* Ngày phát sinh */}
                <div>
                  <label className="block mb-1 text-xs text-white/70">
                    Ngày phát sinh
                  </label>
                  <div className="relative">
                    {/* Ô hiển thị dd/MM/yyyy */}
                    <input
                      readOnly
                      value={newExp.dateLabel}
                      className="w-full px-3 py-2 rounded-lg bg-black text-white border border-gray-600 text-sm"
                      aria-label="Ngày phát sinh (dd/mm/yyyy)"
                    />

                    {/* Input date thật, overlay lên để mở calendar */}
                    <input
                      ref={newDateRef}
                      type="date"
                      min="1900-01-01"
                      max="2099-12-31"
                      value={newExp.dateYMD}
                      onChange={(e) => {
                        const ymd = e.target.value;
                        setNewExp((s) => ({
                          ...s,
                          dateYMD: ymd,
                          dateLabel: ymdToLabel(ymd),
                        }));
                      }}
                      onKeyDown={(e) => e.preventDefault()}
                      onBeforeInput={(e) => e.preventDefault()}
                      className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Chọn ngày trên lịch"
                      onClick={() => {
                        try {
                          // @ts-ignore
                          newDateRef.current?.showPicker?.();
                        } catch {
                          newDateRef.current?.focus();
                        }
                      }}
                      // ĐỪNG disable input này, nếu muốn chặn thì chỉ disable nút "Thêm chi tiêu"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddExpense}
                  disabled={addingExpense}
                  className="px-4 py-2 rounded-lg bg-buttonRoot text-white text-sm font-semibold disabled:opacity-60"
                >
                  {addingExpense ? "Đang thêm..." : "Thêm chi tiêu"}
                </button>
              </div>
            </div>

            {/* DANH SÁCH CHI TIÊU CỦA NGÂN SÁCH NÀY */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-white">
                  Chi tiêu trong ngân sách này
                </h3>
                {loadingExpenses && (
                  <span className="text-xs text-white/60">
                    Đang tải danh sách...
                  </span>
                )}
              </div>

              {expenses.length === 0 ? (
                <p className="text-sm text-white/50">
                  Chưa có chi tiêu nào thuộc ngân sách này.
                </p>
              ) : (
                <div className="max-h-56 overflow-auto rounded-lg border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-black/40 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Tên</th>
                        <th className="px-3 py-2 text-left">Ngày</th>
                        <th className="px-3 py-2 text-right">Số tiền</th>
                        <th className="px-3 py-2 text-right w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => {
                        const ymd = exp.date
                          ? isoToYMD(exp.date)
                          : exp.created_at
                          ? isoToYMD(exp.created_at as any)
                          : "";
                        return (
                          <tr
                            key={exp.id}
                            className="border-t border-white/5 hover:bg-white/5"
                          >
                            <td className="px-3 py-2 max-w-[160px] truncate">
                              {exp.name}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {ymd ? ymdToLabel(ymd) : "—"}
                            </td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">
                              {nfVI.format(Number(exp.amount ?? 0))}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  type="button"
                                  className="hover:text-yellow-400"
                                  onClick={() => setSelectedExpense(exp)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  className="hover:text-red-500"
                                  onClick={() => handleDeleteExpense(exp)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 z-10 bg-[#1c1c1e] px-6 py-4 border-t border-white/10">
            <button
              type="submit"
              form="budget-update-form"
              className="w-full py-2 rounded-lg bg-buttonRoot text-white font-semibold disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal sửa chi tiêu (đè lên trên modal ngân sách) */}
      {selectedExpense && (
        <ExpenseUpdate
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onUpdate={async () => {
            setSelectedExpense(null);
            await reloadExpenses();
          }}
        />
      )}
    </>
  );
}
