// src/components/admin/expense/ExpenseTable.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, Plus, Calendar, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  getAllExpenses,
  deleteExpense,
  type Expense,
  ExpenseAdmin,
} from "@/services/ExpenseService";

import {
  getAllCategoryExpenses,
  type CategoryExpense,
} from "@/services/CategoryExpenseService";

import Select from "react-select";
import XLSX from "xlsx-js-style";
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

// ==== Excel helpers (re-useable) ====
const BORDER_THIN = {
  top: { style: "thin", color: { rgb: "FF444444" } },
  bottom: { style: "thin", color: { rgb: "FF444444" } },
  left: { style: "thin", color: { rgb: "FF444444" } },
  right: { style: "thin", color: { rgb: "FF444444" } },
};

const headerCellStyle = {
  font: { bold: true, color: { rgb: "FFFFFFFF" } },
  fill: { patternType: "solid", fgColor: { rgb: "FF111827" } },
  alignment: { horizontal: "center", vertical: "center" as const },
  border: BORDER_THIN,
};

const bodyCellStyle = {
  alignment: { vertical: "center" as const },
  border: BORDER_THIN,
};

const moneyCellStyle = {
  ...bodyCellStyle,
  alignment: { horizontal: "left", vertical: "center" as const },
  numFmt: "#,##0 [$₫-vi-VN]",
};

const percentCellStyle = {
  ...bodyCellStyle,
  alignment: { horizontal: "left", vertical: "center" as const },
  numFmt: "0.00%",
};

function autosizeCols(data: any[][]) {
  const widths = data[0].map((_c, i) =>
    Math.max(
      ...data.map((row) => {
        const v = row[i];
        const s = v == null ? "" : String(v);
        return Math.min(60, Math.max(8, s.length + 2)); // clamp
      })
    )
  );
  return widths.map((wch) => ({ wch }));
}

function applyTableStyles(
  ws: XLSX.WorkSheet,
  range: { s: { r: number; c: number }; e: { r: number; c: number } }
) {
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellAddr] || (ws[cellAddr] = { t: "s", v: "" });
      const isHeader = r === range.s.r;
      const base = isHeader ? headerCellStyle : bodyCellStyle;
      cell.s = { ...(cell.s || {}), ...base };
    }
  }
}

function toExcelDate(ymd?: string | null) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, (m as number) - 1, d);
}

export default function ExpenseTable() {
  // data state
  const [items, setItems] = useState<ExpenseAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ui state
  const [showAddModal, setShowAddModal] = useState(false);
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
  const userId = session?.user?.id;

  const categoryOptionsData = [
    { value: 0, label: "Tất cả danh mục" },
    ...categoryOptions.map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ];

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // load ALL categories (admin/all)
  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        let pageIdx = 1;
        const pageSizeCat = 500;
        const all: CategoryExpense[] = [];

        while (true) {
          const res = await getAllCategoryExpenses({
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
        toast.error("Không tải được danh mục", {
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

  // fetch expenses (ALL)
  const fetchExpenses = async () => {
    try {
      const res = await getAllExpenses({
        page,
        pageSize,
        search: debouncedSearch,
        // FIX BUG: không bao giờ truyền 0
        category: categoryId > 0 ? categoryId : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      if (res.items.length === 0 && page > 1 && res.totalPages < page) {
        setPage(1);
        return;
      }

      setItems(res.items as Expense[]);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      toast.error("Không tải được danh sách chi tiêu", {
        description: e?.message || "Lỗi không xác định",
      });
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchExpenses();
  }, [status, page, debouncedSearch, categoryId, dateFrom, dateTo]);

  const handleDelete = async (id: number) => {
    if (!confirm("Xoá chi tiêu này?")) return;
    try {
      await deleteExpense(id);
      toast.success("Xoá thành công");
      fetchExpenses();
    } catch (e: any) {
      toast.error("Xoá thất bại", {
        description: e?.message || "Lỗi không xác định",
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      // 1) Tải TẤT CẢ expense theo filter hiện tại (không chỉ 1 trang)
      let pageIdx = 1;
      const pageSizeExport = 2000;
      const all: Expense[] = [];

      while (true) {
        const res = await getAllExpenses({
          page: pageIdx,
          pageSize: pageSizeExport,
          search: (debouncedSearch || "").trim(),
          category: categoryId > 0 ? categoryId : undefined, // FIX BUG
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });
        all.push(...(res.items as Expense[]));
        if (pageIdx >= res.totalPages) break;
        pageIdx++;
      }

      // 2) Map ALL categories (đang sẵn state) — fallback nếu state chưa có
      let cats: CategoryExpense[] = categoryOptions;
      if (!cats || cats.length === 0) {
        const tmp: CategoryExpense[] = [];
        let p = 1;
        while (true) {
          const r = await getAllCategoryExpenses({ page: p, pageSize: 500 });
          tmp.push(...(r.items as CategoryExpense[]));
          if (p >= r.totalPages) break;
          p++;
        }
        cats = tmp;
      }

      const catMap = new Map<number, { name: string; color?: string | null }>();
      cats.forEach((c) => catMap.set(c.id, { name: c.name, color: c.color }));

      // 3) Workbook
      const wb = XLSX.utils.book_new();

      // ==== Sheet A: Tổng theo danh mục ====
      const byCat = new Map<
        number | "null",
        { label: string; sum: number; color?: string | null }
      >();

      for (const it of all) {
        const key = (it.category ?? "null") as number | "null";
        const cat = typeof key === "number" ? catMap.get(key) : undefined;
        const label =
          typeof key === "number" ? cat?.name ?? `Danh mục ${key}` : "Khác";
        const color = typeof key === "number" ? cat?.color ?? null : null;

        if (!byCat.has(key)) byCat.set(key, { label, sum: 0, color });
        byCat.get(key)!.sum += Number(it.amount || 0);
      }

      const rowsCat = Array.from(byCat.values()).sort((a, b) => b.sum - a.sum);
      const totalCat = rowsCat.reduce((a, b) => a + b.sum, 0) || 1;

      const aoaCat: any[][] = [
        ["Chi tiêu theo danh mục", ""],
        [""],
        ["Danh mục", "Số tiền (VND)", "Tỷ lệ"],
        ...rowsCat.map((r) => [r.label, r.sum, r.sum / totalCat]),
      ];

      const wsCat = XLSX.utils.aoa_to_sheet(aoaCat);

      applyTableStyles(wsCat, { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } });
      for (let c = 0; c <= 2; c++) {
        const addr = XLSX.utils.encode_cell({ r: 2, c });
        if (wsCat[addr]) {
          wsCat[addr].s = {
            ...(wsCat[addr].s || {}),
            alignment: { horizontal: "left", vertical: "center" },
          };
        }
      }

      for (let r = 3; r < aoaCat.length; r++) {
        for (let c = 0; c <= 2; c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          wsCat[addr] = wsCat[addr] || { t: "s", v: "" };
          const cell = wsCat[addr];
          if (c === 1) {
            cell.s = { ...(cell.s || {}), ...moneyCellStyle };
          } else if (c === 2) {
            cell.s = { ...(cell.s || {}), ...percentCellStyle };
          } else {
            cell.s = { ...(cell.s || {}), ...bodyCellStyle };
          }
        }
      }

      wsCat["!cols"] = autosizeCols(aoaCat);
      XLSX.utils.book_append_sheet(wb, wsCat, "Theo danh mục");

      // ==== Sheet B: Tổng theo ngày ====
      const byDay = new Map<
        string | "null",
        { label: string; sum: number; count: number }
      >();

      for (const it of all) {
        const key = (it.date ?? "null") as string | "null";
        const label = typeof key === "string" && key !== "null" ? key : "Khác";

        if (!byDay.has(key)) byDay.set(key, { label, sum: 0, count: 0 });
        const rec = byDay.get(key)!;
        rec.sum += Number(it.amount || 0);
        rec.count++;
      }

      const rowsDay = Array.from(byDay.values()).sort((a, b) => b.sum - a.sum);
      const totalDay = rowsDay.reduce((a, b) => a + b.sum, 0) || 1;

      const aoaDay: any[][] = [
        ["Chi tiêu theo ngày", ""],
        [""],
        ["Ngày", "Số tiền (VND)", "Tỷ lệ", "Số khoản"],
        ...rowsDay.map((r) => [r.label, r.sum, r.sum / totalDay, r.count]),
      ];

      const wsDay = XLSX.utils.aoa_to_sheet(aoaDay);

      applyTableStyles(wsDay, { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } });
      for (let c = 0; c <= 3; c++) {
        const addr = XLSX.utils.encode_cell({ r: 2, c });
        if (wsDay[addr]) {
          wsDay[addr].s = {
            ...(wsDay[addr].s || {}),
            alignment: { horizontal: "left", vertical: "center" },
          };
        }
      }

      for (let r = 3; r < aoaDay.length; r++) {
        for (let c = 0; c <= 3; c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          wsDay[addr] = wsDay[addr] || { t: "s", v: "" };
          const cell = wsDay[addr];
          if (c === 1) {
            cell.s = { ...(cell.s || {}), ...moneyCellStyle };
          } else if (c === 2) {
            cell.s = { ...(cell.s || {}), ...percentCellStyle };
          } else {
            cell.s = { ...(cell.s || {}), ...bodyCellStyle };
          }
        }
      }

      wsDay["!cols"] = autosizeCols(aoaDay);
      XLSX.utils.book_append_sheet(wb, wsDay, "Theo ngày");

      // ==== Sheet C: Danh sách chi tiết ====
      const aoa: any[][] = [
        [
          "ID",
          "Tên",
          "Ngày",
          "Số tiền (VND)",
          "Danh mục",
          "Màu danh mục",
          "Ghi chú",
          "Người dùng",
          "Tạo lúc",
          "Cập nhật lúc",
        ],
        ...all.map((it) => {
          const catId = it.category ?? null;
          const cat = typeof catId === "number" ? catMap.get(catId) : undefined;
          return [
            it.id,
            it.name,
            toExcelDate(it.date),
            Number(it.amount || 0),
            cat?.name ?? (catId ? `#${catId}` : ""),
            cat?.color ?? "",
            it.note ?? "",
            it.user_name ?? "",
            toExcelDate(it.created_at?.split("T")[0]),
            toExcelDate(it.updated_at?.split("T")[0]),
          ];
        }),
      ];

      const ws = XLSX.utils.aoa_to_sheet(aoa);
      applyTableStyles(ws, XLSX.utils.decode_range(ws["!ref"]!));

      for (let r = 1; r < aoa.length; r++) {
        const addrDate = XLSX.utils.encode_cell({ r, c: 2 });
        ws[addrDate].t = "d";
        ws[addrDate].z = "yyyy-mm-dd";

        const addrAmt = XLSX.utils.encode_cell({ r, c: 3 });
        ws[addrAmt].s = { ...(ws[addrAmt].s || {}), ...moneyCellStyle };

        const addrCreated = XLSX.utils.encode_cell({ r, c: 8 });
        ws[addrCreated].t = "d";
        ws[addrCreated].z = "yyyy-mm-dd";

        const addrUpdated = XLSX.utils.encode_cell({ r, c: 9 });
        ws[addrUpdated].t = "d";
        ws[addrUpdated].z = "yyyy-mm-dd";
      }

      ws["!cols"] = autosizeCols(aoa);
      XLSX.utils.book_append_sheet(wb, ws, "Chi tiết");

      // 4) Export file
      const now = new Date();
      const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
      const hms = now.toLocaleTimeString("vi-VN").replace(/:/g, "").slice(0, 6);
      const fileName = `chi-tieu_${ymd}_${hms}.xlsx`;
      XLSX.writeFile(wb, fileName, { cellStyles: true });
      toast.success("Xuất file thành công");
    } catch (e: any) {
      toast.error("Xuất file thất bại", {
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
          Quản trị chi tiêu{" "}
          <span className="text-3xl font-bold text-green-600">
            ({nfVI.format(total)})
          </span>
        </h1>
        {/* <button
          onClick={handleExportExcel}
          className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm"
        >
          Xuất Excel
        </button> */}
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

        {/* <Select
          value={categoryOptionsData.find((opt) => opt.value === categoryId)}
          onChange={(opt) => {
            setPage(1);
            setCategoryId(opt?.value ?? 0);
          }}
          options={categoryOptionsData}
          placeholder="Chọn danh mục"
          classNamePrefix="react-select"
          isSearchable={true}
          styles={{
            control: (base, state) => ({
              ...base,
              backgroundColor: "black",
              borderColor: state.isFocused ? "#FFFFF" : "#4B5563",
              boxShadow: "none",
              minHeight: "40px",
              ":hover": { borderColor: "#6B7280" },
            }),
            singleValue: (base) => ({ ...base, color: "white" }),
            input: (base) => ({ ...base, color: "white" }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? "#374151" : "black",
              color: "white",
              cursor: "pointer",
            }),
            placeholder: (base) => ({
              ...base,
              color: "rgba(255,255,255,0.7)",
            }),
            dropdownIndicator: (base) => ({
              ...base,
              color: "rgba(255,255,255,0.7)",
            }),
            indicatorSeparator: () => ({ display: "none" }),
          }}
        /> */}

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
                  Không tìm thấy chi tiêu nào
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
                    {e.user_name}
                  </td>

                  <td className="px-4 py-3 text-right rounded-r-xl">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelected(e)}
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
              fetchExpenses();
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
