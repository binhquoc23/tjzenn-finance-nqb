"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import Editor from "@/components/editor/Editor";
import { createExpense, Expense } from "@/services/ExpenseService";
import AsyncCreatableSelect from "react-select/async-creatable";
import { makeSelectStyles } from "@/components/select/rsStyles";
import { useSession } from "next-auth/react";
import {
  getCategoryExpenses,
  createCategoryExpense,
} from "@/services/CategoryExpenseService";
import {
  getBudgetCategories,
  adjustBudgetCurrentAmount,
} from "@/services/BudgetService";

interface AddExpenseModalProps {
  onClose: () => void;
  onAdd: (expense: Expense) => void;
  onCategoryCreated?: (c: {
    id: number;
    name: string;
    color: string | null;
  }) => void;
}

// yyyy-MM-dd -> dd/MM/yyyy
function ymdToLabel(ymd: string) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// format VND
const nfVI = new Intl.NumberFormat("vi-VN");
function formatVND(rawDigits: string) {
  if (!rawDigits) return "";
  const n = Number(rawDigits);
  if (!Number.isFinite(n)) return "";
  return nfVI.format(n);
}

type Option = { value: string; label: string };

export default function ExpenseAdd({
  onClose,
  onAdd,
  onCategoryCreated,
}: AddExpenseModalProps) {
  const [form, setForm] = useState<{
    name: string;
    category: string; // id (string)
    amount: string; // số thuần "150000"
    amountDisplay: string; // "150.000"
    dateYMD: string; // YYYY-MM-DD
    dateLabel: string; // dd/MM/yyyy
    note: string;
  }>({
    name: "",
    category: "",
    amount: "",
    amountDisplay: "",
    dateYMD: "",
    dateLabel: "",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const dateRef = useRef<HTMLInputElement | null>(null);
  const amountRef = useRef<HTMLInputElement | null>(null);

  // ---- Category Select state ----
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);

  // styles: dark + max height + z-index
  const selectStyles = makeSelectStyles({ maxHeight: 240 });

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [budgetOptions, setBudgetOptions] = useState<Option[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Option | null>(null);

  // preload ngân sách (has_budget = true)
  useEffect(() => {
    (async () => {
      if (!userId) return;
      try {
        const res = await getBudgetCategories({
          user_id: userId,
          page: 1,
          pageSize: 20,
          search: "",
        });
        const opts: Option[] = (res.items ?? []).map((r) => ({
          value: String(r.id),
          label: r.name,
        }));
        setBudgetOptions(opts);
      } catch {
        toast.error("Không tải được danh sách ngân sách");
      }
    })();
  }, [userId]);

  // loader tìm kiếm ngân sách
  const loadBudgetOptions = async (inputValue: string): Promise<Option[]> => {
    if (!userId) return [];
    const q = (inputValue || "").trim();
    try {
      const res = await getBudgetCategories({
        user_id: userId,
        page: 1,
        pageSize: 20,
        search: q,
      });
      return (res.items ?? []).map((r) => ({
        value: String(r.id),
        label: r.name,
      }));
    } catch {
      return [];
    }
  };

  // preload một ít options làm default
  useEffect(() => {
    (async () => {
      if (!userId) return; // chưa có session thì thôi
      try {
        const res = await getCategoryExpenses({
          page: 1,
          pageSize: 20,
          search: "",
          user_id: userId, // <-- lọc theo user
        });

        const opts: Option[] = (res.items ?? []).map((r) => ({
          value: String(r.id),
          label: r.name,
        }));
        setCategoryOptions(opts);
      } catch (e) {
        toast.error("Không tìm thấy danh mục chi tiêu");
      }
    })();
  }, [userId]);

  // load khi gõ
  const loadCategoryOptions = async (inputValue: string): Promise<Option[]> => {
    if (!userId) return []; // chưa có user thì không load
    const q = (inputValue || "").trim();

    try {
      const res = await getCategoryExpenses({
        page: 1,
        pageSize: 20,
        search: q,
        user_id: userId, // <-- lọc theo user
      });

      return (res.items ?? []).map((r) => ({
        value: String(r.id),
        label: r.name,
      })) as Option[];
    } catch {
      return [];
    }
  };

  // tạo mới
  const handleCreateCategory = async (inputLabel: string) => {
    const name = inputLabel.trim();
    if (!name) return;
    if (!userId) {
      toast.error("Chưa xác thực người dùng");
      return;
    }

    try {
      const created = await createCategoryExpense({
        name,
        user_id: userId,
        color: "#FFFFFF",
      });

      const newOpt: Option = { value: String(created.id), label: created.name };
      setCategoryOptions((prev) => [newOpt, ...prev]);
      setSelectedCategory(newOpt);
      setForm((prev) => ({ ...prev, category: newOpt.value }));
      // >>> Bắn ngược lên table để cập nhật ngay map
      onCategoryCreated?.({
        id: created.id,
        name: created.name,
        color: created.color ?? null,
      });
      toast.success("Đã tạo danh mục mới", { description: newOpt.label });
    } catch (error: any) {
      toast.error("Tạo danh mục thất bại", {
        description: error?.message || "Lỗi không xác định",
      });
    }
  };

  useEffect(() => {
    const ymd = todayYMD();
    setForm((prev) => ({ ...prev, dateYMD: ymd, dateLabel: ymdToLabel(ymd) }));
  }, []);

  // tiền: chỉ giữ số + format hiển thị
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const caret = input.selectionStart ?? input.value.length;
    const digitsLeft = (input.value.slice(0, caret).match(/\d/g) || []).length;

    const digits = (input.value.match(/\d/g) || []).join("");
    const display = formatVND(digits);

    setForm((prev) => ({ ...prev, amount: digits, amountDisplay: display }));

    requestAnimationFrame(() => {
      const el = amountRef.current;
      if (!el) return;
      let count = 0,
        pos = display.length;
      for (let i = 0; i < display.length; i++) {
        if (/\d/.test(display[i])) count++;
        if (count === digitsLeft) {
          pos = i + 1;
          break;
        }
      }
      try {
        el.setSelectionRange(pos, pos);
      } catch {}
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      const name = form.name.trim();
      if (!name) throw new Error("Tên chi tiêu không được để trống");

      const categoryId = form.category ? Number(form.category) : null;
      if (!categoryId) throw new Error("Vui lòng chọn danh mục hoặc ngân sách");

      const rawAmount = (form.amount ?? "").trim();
      if (!rawAmount) throw new Error("Số tiền không được để trống");
      const amountNum = Number(rawAmount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        throw new Error("Số tiền phải là số > 0");
      }

      const dateYMD = (form.dateYMD ?? "").trim();
      if (!dateYMD) throw new Error("Ngày phát sinh không được để trống");

      const payload = {
        name,
        amount: amountNum,
        date: dateYMD,
        note: form.note?.trim() || null,
        user_id: userId,
        category: categoryId,
      };

      const created = await createExpense(payload);

      // Nếu đang chọn Ngân sách (selectedBudget có value), cộng dồn ngân sách:
      if (selectedBudget?.value) {
        try {
          await adjustBudgetCurrentAmount(
            Number(selectedBudget.value),
            amountNum
          );
        } catch (err) {
          console.warn("adjustBudgetCurrentAmount failed", err);
        }
      }

      toast.success("TẠO CHI TIÊU THÀNH CÔNG", {
        description: (
          <>
            <strong>{created.name}</strong> đã được thêm vào hệ thống.
          </>
        ),
      });
      onAdd(created);
      onClose();
    } catch (err: any) {
      toast.error("TẠO CHI TIÊU THẤT BẠI", {
        description: err?.message || "Lỗi không xác định",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1c1e] rounded-xl w-full max-w-6xl h-[90vh] relative flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1c1c1e] p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Thêm chi tiêu</h2>
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-400"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          id="add-expense-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-auto px-6 py-4 space-y-4"
        >
          {/* name */}
          <div>
            <label className="block mb-1 text-white">Tên chi tiêu</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="vd: Đổ xăng"
              required
            />
          </div>

          {/* category: AsyncCreatable (search + tạo mới) */}
          {/* Hàng ngang: Danh mục | Ngân sách */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Danh mục chi tiêu (has_budget = false) — giữ nguyên phần hiện tại của anh,
      chỉ cần đảm bảo khi chọn danh mục thì clear ngân sách */}
            <div>
              <label className="block mb-1 text-white">Danh mục chi tiêu</label>
              {/* Danh mục chi tiêu (has_budget = false) */}
              <AsyncCreatableSelect
                isDisabled={!userId || !!selectedBudget}
                classNamePrefix="rs"
                cacheOptions
                defaultOptions={categoryOptions}
                loadOptions={loadCategoryOptions}
                value={selectedCategory}
                onChange={(opt: any) => {
                  const v = opt ? (opt as Option).value : "";
                  setSelectedBudget(null); // clear ngân sách
                  setSelectedCategory(opt as Option | null);
                  setForm((p) => ({ ...p, category: v })); // ghi vào category chung
                }}
                onCreateOption={handleCreateCategory}
                placeholder="Tìm hoặc tạo danh mục..."
                styles={selectStyles}
                isClearable
                filterOption={null}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
                menuShouldScrollIntoView={false}
              />
              <p className="text-xs text-white/60 mt-1">
                Chỉ chọn <strong>một</strong> trong hai: Danh mục hoặc Ngân
                sách.
              </p>
            </div>

            {/* Ngân sách (has_budget = true) — dùng BudgetService */}
            <div>
              <label className="block mb-1 text-white">Ngân sách</label>
              {/* Ngân sách (has_budget = true) */}
              <AsyncCreatableSelect
                isDisabled={!userId || !!selectedCategory}
                classNamePrefix="rs"
                cacheOptions
                defaultOptions={budgetOptions}
                loadOptions={loadBudgetOptions}
                value={selectedBudget}
                onChange={(opt: any) => {
                  const v = opt ? (opt as Option).value : "";
                  setSelectedCategory(null); // clear danh mục thường
                  setSelectedBudget(opt as Option | null);
                  setForm((p) => ({ ...p, category: v })); // cũng ghi vào category chung
                }}
                onCreateOption={undefined as any}
                placeholder="Chọn ngân sách..."
                styles={selectStyles}
                isClearable
                filterOption={null}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
                menuShouldScrollIntoView={false}
              />
              <p className="text-xs text-white/60 mt-1">
                Khi chọn Ngân sách, phần Danh mục sẽ tự khóa (và ngược lại)
              </p>
            </div>
          </div>

          {/* amount */}
          <div>
            <label className="block mb-1 text-white">Số tiền (VND)</label>
            <input
              ref={amountRef}
              type="text"
              inputMode="numeric"
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.amountDisplay}
              onChange={handleAmountChange}
              onPaste={(e) => {
                const t = e.clipboardData.getData("text");
                if (!/^\d[\d\s.]*$/.test(t)) e.preventDefault();
              }}
              placeholder="vd: 150.000"
              aria-label="Số tiền (định dạng VND)"
            />
          </div>

          {/* date */}
          <div>
            <label className="block mb-1 text-white">Ngày phát sinh</label>
            <div className="relative">
              <input
                readOnly
                value={form.dateLabel}
                className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
                aria-label="Ngày phát sinh (dd/mm/yyyy)"
              />
              <input
                ref={dateRef}
                type="date"
                min="1900-01-01"
                max="2099-12-31"
                value={form.dateYMD}
                onChange={(e) => {
                  const ymd = e.target.value;
                  setForm((prev) => ({
                    ...prev,
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
                    dateRef.current?.showPicker?.();
                  } catch {}
                }}
              />
            </div>
          </div>

          {/* note */}
          <div>
            <label className="block mb-1 text-white">
              Ghi chú{" "}
              <span className="text-green-600">(Có thể đính kèm hóa đơn)</span>
            </label>
            <Editor
              initialContent={form.note}
              onContentChange={(note) => setForm((prev) => ({ ...prev, note }))}
              folder="expense"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-[#1c1c1e] px-6 py-4 border-t border-white/10">
          <button
            type="submit"
            form="add-expense-form"
            disabled={submitting}
            className="w-full py-2 rounded-lg bg-buttonRoot text-white font-semibold disabled:opacity-60"
          >
            {submitting ? "Đang lưu..." : "Thêm chi tiêu"}
          </button>
        </div>
      </div>
    </div>
  );
}
