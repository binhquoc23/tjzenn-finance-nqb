// src/components/budgets/BudgetTable.tsx
"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import BudgetAdd from "@/components/budget/BudgetAdd";
import BudgetUpdate from "@/components/budget/BudgetUpdate";

import {
  getBudgetCategories,
  deleteBudgetCategory,
  type BudgetCategory,
} from "@/services/BudgetService";

const PAGE_SIZE = 100;
const nfVI = new Intl.NumberFormat("vi-VN");
const fmtVND = (n: number) => nfVI.format(n);

// ---- helpers: màu từ hex -> rgba với alpha ----
function hexToRgb(hex: string) {
  const m = (hex || "").trim().replace("#", "");
  if (m.length === 3) {
    const r = parseInt(m[0] + m[0], 16);
    const g = parseInt(m[1] + m[1], 16);
    const b = parseInt(m[2] + m[2], 16);
    return { r, g, b };
  }
  if (m.length === 6) {
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}
function rgba(hex: string | null | undefined, a: number, fallback = "#3B82F6") {
  const h = (hex || fallback) as string;
  const rgb = hexToRgb(h);
  if (!rgb) return `rgba(59,130,246,${a})`; // fallback #3B82F6
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

export default function BudgetTable() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [items, setItems] = useState<BudgetCategory[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BudgetCategory | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (showAddModal || selectedItem)
      document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [showAddModal, selectedItem]);

  const fetchBudgets = async () => {
    if (!userId) return;
    try {
      const res = await getBudgetCategories({
        user_id: userId,
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
      });

      if (res.items.length === 0 && page > 1) {
        setPage(1);
        return;
      }

      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      toast.error("Lỗi khi tải ngân sách", { description: err?.message });
    }
  };

  useEffect(() => {
    if (status === "authenticated" && userId) fetchBudgets();
  }, [status, userId, page, debouncedSearch]); // eslint-disable-line

  const handleDelete = async (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const ok = window.confirm(
      `Bạn chắc muốn xoá ngân sách “${item.name}” (mục tiêu ${fmtVND(
        item.target_amount
      )} VND) chứ?`
    );
    if (!ok) return;

    try {
      await deleteBudgetCategory(id);
      toast.success("Đã xoá ngân sách", {
        description: `“${item.name}” đã bị xoá.`,
      });

      if (items.length === 1 && page > 1) setPage(page - 1);
      else fetchBudgets();
    } catch (err: any) {
      toast.error("Xoá thất bại", {
        description: err?.message || "Lỗi không xác định",
      });
    }
  };

  const progressOf = (it: BudgetCategory) => {
    const t = Math.max(0, Number(it.target_amount || 0));
    const c = Math.max(0, Number(it.current_amount || 0));
    if (t === 0) return 0;
    if (c >= t) return 100;
    return Math.floor((c / t) * 100);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Đang tải thông tin đăng nhập...
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Vui lòng đăng nhập để xem ngân sách.
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">
          Ngân sách{" "}
          <span className="text-3xl font-bold text-green-600">({total})</span>
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-buttonRoot rounded-xl"
        >
          <Plus className="w-4 h-4" /> Thêm ngân sách
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Tìm theo tên ngân sách"
          className="px-3 py-2 rounded-lg bg-black text-white border border-gray-600 w-[300px]"
        />
      </div>

      <div className="mt-4">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Chưa có ngân sách nào
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {items.map((it) => {
              const pct = progressOf(it);
              const remain = Math.max(
                0,
                (it.target_amount || 0) - (it.current_amount || 0)
              );
              const achieved = remain === 0;

              const color = it.color || "#3B82F6";
              const targetBg = rgba(color, 0.12);
              const targetBorder = rgba(color, 0.35);
              const targetText = color; // chữ cùng tông
              const targetChipBg = rgba(color, 0.18);

              return (
                <div
                  key={it.id}
                  className="group relative rounded-2xl bg-[#1c1c1e] border border-white/10 hover:border-white/20 transition shadow-sm hover:shadow-md"
                >
                  <div className="absolute right-3 top-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setSelectedItem(it)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                      title="Sửa ngân sách"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(it.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                      title="Xoá ngân sách"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 pb-2 flex items-start gap-3">
                    <span
                      className="mt-1 w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                    <div className="min-w-0">
                      <div
                        className="truncate font-semibold text-base"
                        style={{ color }}
                        title={it.name}
                      >
                        {it.name}
                      </div>
                      <div className="mt-1 text-xs text-white/60 line-clamp-2">
                        {it.description || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Tiến độ</span>
                      <span className="text-white/80 font-medium">{pct}%</span>
                    </div>
                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          achieved ? "bg-green-500" : "bg-green-400"
                        }`}
                        style={{ width: `${pct}%` }}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={pct}
                      />
                    </div>
                  </div>

                  {/* Stats: làm nổi "Mục tiêu" theo màu ngân sách */}
                  <div className="px-4 mt-4 grid grid-cols-2 gap-3">
                    <div
                      className="rounded-xl p-3 border"
                      style={{
                        backgroundColor: targetBg,
                        borderColor: targetBorder,
                        boxShadow: `0 0 0 1px ${rgba(color, 0.12)} inset`,
                      }}
                    >
                      <div
                        className="text-[11px] font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: targetChipBg,
                          color: targetText,
                        }}
                        title="Mục tiêu"
                      >
                        Mục tiêu
                      </div>
                      <div
                        className="mt-2 text-[15px] font-extrabold leading-snug"
                        style={{ color: targetText }}
                      >
                        {fmtVND(it.target_amount)}{" "}
                        <span className="text-white/70">VND</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xs text-white/60">Hiện tại</div>
                      <div className="mt-1 text-sm font-semibold">
                        {fmtVND(it.current_amount)}{" "}
                        <span className="text-white/50">VND</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3">
                    {achieved ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30">
                        Đã đạt mục tiêu
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
                        Còn {fmtVND(remain)} VND
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <BudgetAdd
          onClose={() => setShowAddModal(false)}
          onAdd={() => {
            setShowAddModal(false);
            fetchBudgets();
          }}
        />
      )}

      {selectedItem && (
        <BudgetUpdate
          item={selectedItem}
          onClose={() => {
            // Đóng modal + load lại ngân sách từ DB
            setSelectedItem(null);
            fetchBudgets();
          }}
          onUpdated={(updated) => {
            // Cập nhật local state cho mượt
            setItems((prev) =>
              prev.map((x) => (x.id === updated.id ? updated : x))
            );
            // Đóng modal + refetch để đảm bảo data luôn đúng
            setSelectedItem(null);
            fetchBudgets();
          }}
        />
      )}
    </div>
  );
}
