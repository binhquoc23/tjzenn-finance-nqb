// src/components/admin/budget/BudgetTable.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, Calendar, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  getAllBudget,
  deleteExpense,
  type Expense,
  type ExpenseAdmin,
} from "@/services/ExpenseService";

import {
  getAllCategoryBudget,
  type CategoryExpense,
} from "@/services/CategoryExpenseService";

import ExpenseUpdate from "@/components/expenses/ExpenseUpdate";

// ---- Helpers ----
const nfVI = new Intl.NumberFormat("vi-VN");
function formatVND(n: number) {
  if (!Number.isFinite(n)) return "";
  return nfVI.format(n);
}

function ymdToLabel(ymd: string) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

export default function BudgetTable() {
  // data state
  const [items, setItems] = useState<ExpenseAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ui state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // filter: category
  const [categoryId, setCategoryId] = useState<number | 0>(0);
  const [categoryOptions, setCategoryOptions] = useState<CategoryExpense[]>([]);
  const [categoryMap, setCategoryMap] = useState<
    Record<number, { name: string; color: string | null }>
  >({});

  const [selected, setSelected] = useState<Expense | null>(null);

  // filter: date range (YYYY-MM-DD)
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [dateFromLabel, setDateFromLabel] = useState<string>("");
  const [dateToLabel, setDateToLabel] = useState<string>("");

  const dateFromRef = useRef<HTMLInputElement | null>(null);
  const dateToRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // load ALL budget categories (admin/all) => has_budget = true
  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        let pageIdx = 1;
        const pageSizeCat = 500;
        const all: CategoryExpense[] = [];

        while (true) {
          const res = await getAllCategoryBudget({
            page: pageIdx,
            pageSize: pageSizeCat,
            search: "",
          });
          all.push(...(res.items as CategoryExpense[]));
          if (pageIdx >= res.totalPages) break;
          pageIdx++;
        }

        setCategoryOptions(all);

        const map: Record<number, { name: string; color: string | null }> = {};
        for (const c of all) {
          map[c.id] = { name: c.name, color: c.color ?? null };
        }
        setCategoryMap(map);
      } catch (e: any) {
        toast.error("Không tải được danh mục ngân sách", {
          description: e?.message || "Lỗi không xác định",
        });
      }
    })();
  }, [status]);

  useEffect(() => {
    if (status === "loading") return;

    const role = (session?.user as any)?.role;

    if (status === "unauthenticated") {
      alert("Bạn không có quyền vào trang này");
      router.replace("/auth/dashboard");
      return;
    }

    if (status === "authenticated" && role !== "admin") {
      alert("Bạn không có quyền vào trang này");
      router.replace("/auth/dashboard");
    }
  }, [status, session, router]);

  // fetch budget expenses (ALL) => has_budget = true
  const fetchBudgets = async () => {
    try {
      const res = await getAllBudget({
        page,
        pageSize,
        search: debouncedSearch,
        category: categoryId > 0 ? categoryId : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      if (res.items.length === 0 && page > 1 && res.totalPages < page) {
        setPage(1);
        return;
      }

      setItems(res.items as ExpenseAdmin[]);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      toast.error("Không tải được danh sách ngân sách", {
        description: e?.message || "Lỗi không xác định",
      });
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, debouncedSearch, categoryId, dateFrom, dateTo]);

  const handleDelete = async (id: number) => {
    if (!confirm("Xoá khoản ngân sách này?")) return;
    try {
      await deleteExpense(id);
      toast.success("Xoá thành công");
      fetchBudgets();
    } catch (e: any) {
      toast.error("Xoá thất bại", {
        description: e?.message || "Lỗi không xác định",
      });
    }
  };

  function setThisMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const from = `${year}-${month}-01`;
    const to = `${year}-${month}-${new Date(
      year,
      now.getMonth() + 1,
      0
    ).getDate()}`;

    setDateFrom(from);
    setDateTo(to);
    setDateFromLabel(ymdToLabel(from));
    setDateToLabel(ymdToLabel(to));
    setPage(1);
  }

  function clearDateFilter() {
    setDateFrom("");
    setDateTo("");
    setDateFromLabel("");
    setDateToLabel("");
    setPage(1);
  }

  if (status === "loading")
    return <div className="p-4 sm:p-6 min-h-screen text-white"></div>;
  if (status === "authenticated" && (session?.user as any)?.role !== "admin")
    return <div className="p-4 sm:p-6 min-h-screen text-white"></div>;

  return (
    <div className="p-4 sm:p-6 min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">
          Quản trị ngân sách{" "}
          <span className="text-3xl font-bold text-green-600">
            ({nfVI.format(total)})
          </span>
        </h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Tìm tên, ghi chú..."
          className="px-3 py-2 rounded-lg bg-black text-white border border-gray-600"
        />

        {/* Date range */}
        <div className="sm:col-span-2 lg:col-span-2 flex flex-wrap items-center gap-2">
          {/* From */}
          <div className="relative w-full sm:w-40">
            <input
              readOnly
              value={dateFromLabel}
              placeholder="Từ ngày"
              onClick={() => {
                if (dateFromRef.current?.showPicker)
                  dateFromRef.current.showPicker();
                else dateFromRef.current?.click();
              }}
              className="w-full px-3 py-2 pr-9 rounded-lg bg-black text-white border border-gray-600 cursor-pointer"
              aria-label="Từ ngày"
            />
            <input
              ref={dateFromRef}
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => {
                const ymd = e.target.value;
                setPage(1);
                setDateFrom(ymd);
                setDateFromLabel(ymdToLabel(ymd));
              }}
              className="absolute inset-0 w-full h-full opacity-0 outline-none"
              tabIndex={-1}
              aria-hidden="true"
              style={{
                WebkitTextFillColor: "transparent",
                color: "transparent",
                caretColor: "transparent",
              }}
            />
            <Calendar
              onClick={() => {
                if (dateFromRef.current?.showPicker)
                  dateFromRef.current.showPicker();
                else dateFromRef.current?.click();
              }}
              className="w-4 h-4 z-20 absolute right-2 top-1/2 -translate-y-1/2 text-white/60 cursor-pointer"
            />
          </div>

          {/* To */}
          <div className="relative w-full sm:w-40">
            <input
              readOnly
              value={dateToLabel}
              placeholder="Đến ngày"
              onClick={() => {
                if (dateToRef.current?.showPicker)
                  dateToRef.current.showPicker();
                else dateToRef.current?.click();
              }}
              className="w-full px-3 py-2 pr-9 rounded-lg bg-black text-white border border-gray-600 cursor-pointer"
              aria-label="Đến ngày"
            />
            <input
              ref={dateToRef}
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => {
                const ymd = e.target.value;
                setPage(1);
                setDateTo(ymd);
                setDateToLabel(ymdToLabel(ymd));
              }}
              className="absolute inset-0 w-full h-full opacity-0 outline-none"
              tabIndex={-1}
              aria-hidden="true"
              style={{
                WebkitTextFillColor: "transparent",
                color: "transparent",
                caretColor: "transparent",
              }}
            />
            <Calendar
              onClick={() => {
                if (dateToRef.current?.showPicker)
                  dateToRef.current.showPicker();
                else dateToRef.current?.click();
              }}
              className="w-4 h-4 z-20 absolute right-2 top-1/2 -translate-y-1/2 text-white/60 cursor-pointer"
            />
          </div>

          <div className="flex w-full sm:w-auto gap-2 mt-1 sm:mt-0">
            <button
              onClick={setThisMonth}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-700 text-sm whitespace-nowrap"
              type="button"
              title="Tháng này"
            >
              Tháng này
            </button>
            <button
              onClick={clearDateFilter}
              className="flex-1 sm:flex-none px-2 py-2 rounded-lg bg-red-500 hover:bg-red-600"
              type="button"
              title="Xóa lọc ngày"
            >
              <XCircle className="w-4 h-4 mx-auto sm:mx-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-4 py-2">Tên</th>
              <th className="px-4 py-2">Ngày</th>
              <th className="px-4 py-2 max-w-[160px]">Số tiền</th>
              <th className="px-4 py-2">Danh mục</th>
              <th className="px-4 py-2">Người dùng</th>
              <th className="px-4 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  Không tìm thấy khoản ngân sách nào
                </td>
              </tr>
            ) : (
              items.map((e) => (
                <tr
                  key={e.id}
                  className="bg-[#1c1c1e] hover:bg-[#2a2a2e] rounded-xl transition"
                >
                  <td className="px-4 py-3 rounded-l-xl max-w-[240px] truncate">
                    {e.name}
                  </td>

                  <td className="px-4 py-3 max-w-[160px] truncate">
                    {e.date ? ymdToLabel(e.date) : "—"}
                  </td>

                  <td className="px-4 py-3 max-w-[160px] truncate">
                    {formatVND(e.amount)}
                  </td>

                  <td className="px-4 py-3 max-w-[240px] truncate">
                    {(() => {
                      if (e.category == null) return "—";
                      const cat = categoryMap[e.category];
                      if (!cat) return `#${e.category}`;

                      return (
                        <span className="inline-flex items-center gap-2">
                          {cat.color ? (
                            <span
                              className="inline-block w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: cat.color }}
                              aria-label={`Màu ${cat.color}`}
                              title={cat.color}
                            />
                          ) : null}
                          <span
                            className="truncate font-medium"
                            style={{ color: cat.color || "inherit" }}
                          >
                            {cat.name}
                          </span>
                        </span>
                      );
                    })()}
                  </td>

                  <td className="px-4 py-3 max-w-[200px] truncate">
                    {(e as any).user_name ?? "Không xác định"}
                  </td>

                  <td className="px-4 py-3 text-right rounded-r-xl">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelected(e as any)}
                        className="hover:text-yellow-400"
                        title="Sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="hover:text-red-500"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {selected && (
          <ExpenseUpdate
            expense={selected}
            onClose={() => setSelected(null)}
            onUpdate={() => {
              setSelected(null);
              fetchBudgets();
            }}
          />
        )}
      </div>

      {/* Pagination */}
      {items.length > 0 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="px-3 py-1 text-sm">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}
