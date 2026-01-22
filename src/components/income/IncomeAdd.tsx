"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import Editor from "@/components/editor/Editor";
import { createIncome, type Income } from "@/services/IncomeService";
import AsyncCreatableSelect from "react-select/async-creatable";
import { makeSelectStyles } from "@/components/select/rsStyles";
import { useSession } from "next-auth/react";
import {
  getCategoryIncomes,
  createCategoryIncome,
} from "@/services/CategoryIncomeService";

interface AddIncomeModalProps {
  onClose: () => void;
  onAdd: (income: Income) => void;
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

export default function IncomeAdd({
  onClose,
  onAdd,
  onCategoryCreated,
}: AddIncomeModalProps) {
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

  // preload một ít options làm default
  useEffect(() => {
    (async () => {
      if (!userId) return; // chưa có session thì thôi
      try {
        const res = await getCategoryIncomes({
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
        toast.error("Không tìm thấy danh mục thu nhập");
      }
    })();
  }, [userId]);

  // load khi gõ
  const loadCategoryOptions = async (inputValue: string): Promise<Option[]> => {
    if (!userId) return []; // chưa có user thì không load
    const q = (inputValue || "").trim();

    try {
      const res = await getCategoryIncomes({
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

  // tạo mới danh mục
  const handleCreateCategory = async (inputLabel: string) => {
    const name = inputLabel.trim();
    if (!name) return;
    if (!userId) {
      toast.error("Chưa xác thực người dùng");
      return;
    }

    try {
      const created = await createCategoryIncome({
        name,
        user_id: userId,
        color: "#FFFFFF",
      });

      const newOpt: Option = { value: String(created.id), label: created.name };
      setCategoryOptions((prev) => [newOpt, ...prev]);
      setSelectedCategory(newOpt);
      setForm((prev) => ({ ...prev, category: newOpt.value }));
      onCategoryCreated?.({
        id: created.id,
        name: created.name,
        color: created.color ?? null,
      });
      toast.success("Đã tạo danh mục thu nhập mới", {
        description: newOpt.label,
      });
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

      // 1) Tên
      const name = form.name.trim();
      if (!name) throw new Error("Tên thu nhập không được để trống");

      // 2) Danh mục (bắt buộc)
      // if (!form.category) throw new Error("Danh mục không được để trống");

      // 3) Số tiền
      const rawAmount = (form.amount ?? "").trim();
      if (!rawAmount) throw new Error("Số tiền không được để trống");
      const amountNum = Number(rawAmount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        throw new Error("Số tiền phải là số > 0");
      }

      // 4) Ngày phát sinh
      const dateYMD = (form.dateYMD ?? "").trim();
      if (!dateYMD) throw new Error("Ngày phát sinh không được để trống");

      const payload = {
        name,
        category: form.category ? Number(form.category) : null, // bắt buộc có nên không cho null
        amount: amountNum,
        date: dateYMD, // cột DATE -> gửi YYYY-MM-DD
        note: form.note?.trim() || null,
        user_id: userId!,
      };

      const created = await createIncome(payload);

      toast.success("TẠO THU NHẬP THÀNH CÔNG", {
        description: (
          <>
            <strong>{created.name}</strong> đã được thêm vào hệ thống.
          </>
        ),
      });
      onAdd(created);
      onClose();
    } catch (err: any) {
      toast.error("TẠO THU NHẬP THẤT BẠI", {
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
          <h2 className="text-2xl font-bold text-white">Thêm thu nhập</h2>
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-400"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          id="add-income-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-auto px-6 py-4 space-y-4"
        >
          {/* name */}
          <div>
            <label className="block mb-1 text-white">Tên thu nhập</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-black text-white border border-gray-600"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="vd: Lương chính, freelance..."
              required
            />
          </div>

          {/* category: AsyncCreatable (search + tạo mới) */}
          <div>
            <label className="block mb-1 text-white">Danh mục</label>
            <AsyncCreatableSelect
              isDisabled={!userId}
              classNamePrefix="rs"
              cacheOptions
              defaultOptions={categoryOptions} // hiển thị sẵn vài option
              loadOptions={loadCategoryOptions} // gọi Supabase khi gõ
              value={selectedCategory}
              onChange={(opt: any) => {
                const v = opt ? (opt as Option).value : "";
                setSelectedCategory(opt as Option | null);
                setForm((prev) => ({ ...prev, category: v }));
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
              loadingMessage={() => "Đang tìm..."}
              noOptionsMessage={() => "Không có kết quả"}
            />
            <p className="text-xs text-white/60 mt-1">
              Tìm kiếm danh mục hoặc tạo mới
            </p>
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
              placeholder="vd: 15.000.000"
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
              folder="income"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-[#1c1c1e] px-6 py-4 border-t border-white/10">
          <button
            type="submit"
            form="add-income-form"
            disabled={submitting}
            className="w-full py-2 rounded-lg bg-buttonRoot text-white font-semibold disabled:opacity-60"
          >
            {submitting ? "Đang lưu..." : "Thêm thu nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
