// src/components/admin/income/IncomeTable.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, Plus, Calendar, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getAllIncomes,
  deleteIncome,
  type Income,
  IncomeAdmin,
} from "@/services/IncomeService";

import {
  getAllCategoryIncomes,
  type CategoryIncome,
} from "@/services/CategoryIncomeService";

import Select from "react-select";
import XLSX from "xlsx-js-style";
import IncomeUpdate from "@/components/income/IncomeUpdate";

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

export default function IncomeTable() {
  // data state
  const [items, setItems] = useState<IncomeAdmin[]>([]);
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
  const [categoryOptions, setCategoryOptions] = useState<CategoryIncome[]>([]);
  const [categoryMap, setCategoryMap] = useState<
    Record<number, { name: string; color: string | null }>
  >({});
  const [selected, setSelected] = useState<Income | null>(null);

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
        // lấy nhiều cho chắc (tuỳ anh)
        let pageIdx = 1;
        const pageSizeCat = 500;
        const all: CategoryIncome[] = [];

        while (true) {
          const res = await getAllCategoryIncomes({
            page: pageIdx,
            pageSize: pageSizeCat,
            search: "",
          });
          all.push(...(res.items as CategoryIncome[]));
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

  // fetch incomes (ALL)
  const fetchIncomes = async () => {
    try {
      const res = await getAllIncomes({
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

      setItems(res.items as Income[]);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      toast.error("Không tải được danh sách thu nhập", {
        description: e?.message || "Lỗi không xác định",
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      // 1) Tải TẤT CẢ income theo filter hiện tại (không chỉ 1 trang)
      let pageIdx = 1;
      const pageSizeExport = 2000;
      const all: Income[] = [];

      while (true) {
        const res = await getAllIncomes({
          page: pageIdx,
          pageSize: pageSizeExport,
          search: (debouncedSearch || "").trim(),
          category: categoryId > 0 ? categoryId : undefined, // FIX BUG
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });
        all.push(...(res.items as Income[]));
        if (pageIdx >= res.totalPages) break;
        pageIdx++;
      }

      // 2) Map ALL categories (đang sẵn state) — fallback nếu state chưa có
      let cats: CategoryIncome[] = categoryOptions;
      if (!cats || cats.length === 0) {
        const tmp: CategoryIncome[] = [];
        let p = 1;
        while (true) {
          const r = await getAllCategoryIncomes({ page: p, pageSize: 500 });
          tmp.push(...(r.items as CategoryIncome[]));
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
        ["Thu nhập theo danh mục", ""],
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
          wsCat[addr].s = {
            ...(wsCat[addr].s || {}),
            ...bodyCellStyle,
            alignment: {
              horizontal: "left",
              vertical: "center",
              shrinkToFit: true,
            },
          };
        }
      }

      for (let r = 3; r < aoaCat.length; r++) {
        const m = XLSX.utils.encode_cell({ r, c: 1 });
        const p = XLSX.utils.encode_cell({ r, c: 2 });
        if (wsCat[m]) wsCat[m].s = { ...(wsCat[m].s || {}), ...moneyCellStyle };
        if (wsCat[p])
          wsCat[p].s = { ...(wsCat[p].s || {}), ...percentCellStyle };
      }

      wsCat["!freeze"] = { xSplit: 0, ySplit: 3 };
      wsCat["!cols"] = autosizeCols(aoaCat);
      XLSX.utils.book_append_sheet(wb, wsCat, "Tổng theo danh mục");

      // ==== Sheet B: Chi tiết ====
      const aoaDetail: any[][] = [
        ["Chi tiết Thu nhập", ""],
        [""],
        ["Ngày", "Tên", "Danh mục", "Số tiền (VND)"],
        ...all.map((it) => [
          toExcelDate(it.date ?? it.created_at ?? ""),
          it.name ?? "",
          it.category != null
            ? catMap.get(it.category)?.name ?? `Danh mục ${it.category}`
            : "Khác",
          Number(it.amount || 0),
        ]),
      ];

      const wsDetail = XLSX.utils.aoa_to_sheet(aoaDetail);

      applyTableStyles(wsDetail, { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } });
      for (let c = 0; c <= 3; c++) {
        const addr = XLSX.utils.encode_cell({ r: 2, c });
        if (wsDetail[addr]) {
          wsDetail[addr].s = {
            ...(wsDetail[addr].s || {}),
            alignment: { horizontal: "left", vertical: "center" },
          };
        }
      }

      const startRow = 3;
      const endRow = 2 + (aoaDetail.length - 2);
      for (let r = startRow; r <= endRow; r++) {
        for (let c = 0; c <= 3; c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          wsDetail[addr] = wsDetail[addr] || { t: "s", v: "" };
          wsDetail[addr].s = {
            ...(wsDetail[addr].s || {}),
            ...bodyCellStyle,
            alignment: {
              horizontal: "left",
              vertical: "center",
              shrinkToFit: true,
            },
          };
        }

        const dateAddr = XLSX.utils.encode_cell({ r, c: 0 });
        if (wsDetail[dateAddr]) wsDetail[dateAddr].z = "dd/mm/yyyy";

        const moneyAddr = XLSX.utils.encode_cell({ r, c: 3 });
        if (wsDetail[moneyAddr])
          wsDetail[moneyAddr].s = {
            ...(wsDetail[moneyAddr].s || {}),
            ...moneyCellStyle,
          };
      }

      wsDetail["!freeze"] = { xSplit: 0, ySplit: 3 };
      wsDetail["!cols"] = autosizeCols(aoaDetail);

      const COL_A_MIN = 10;
      const COL_B_MIN = 40;
      const COL_C_MIN = 40;
      const COL_D_MIN = 32;

      wsDetail["!cols"] ||= [];
      wsDetail["!cols"][0] = {
        wch: Math.max(wsDetail["!cols"][0]?.wch ?? 0, COL_A_MIN),
      };
      wsDetail["!cols"][1] = {
        wch: Math.max(wsDetail["!cols"][1]?.wch ?? 0, COL_B_MIN),
      };
      wsDetail["!cols"][2] = {
        wch: Math.max(wsDetail["!cols"][2]?.wch ?? 0, COL_C_MIN),
      };
      wsDetail["!cols"][3] = {
        wch: Math.max(wsDetail["!cols"][3]?.wch ?? 0, COL_D_MIN),
      };

      XLSX.utils.book_append_sheet(wb, wsDetail, "Chi tiết");

      const label = (() => {
        const d1 = dateFrom ? ymdToLabel(dateFrom) : "";
        const d2 = dateTo ? ymdToLabel(dateTo) : "";
        if (d1 && d2) return `${d1}—${d2}`;
        if (d1) return `từ ${d1}`;
        if (d2) return `đến ${d2}`;
        return "tat-ca";
      })();

      const fileName = `Thu-nhap-${label}.xlsx`.replace(/\s+/g, "-");
      XLSX.writeFile(wb, fileName, { compression: true });
    } catch (e) {
      console.error("Export Excel error:", e);
      alert("Xuất Excel thất bại. Anh thử lại giúp em nhé!");
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchIncomes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, debouncedSearch, categoryId, dateFrom, dateTo]);

  // modal scroll lock
  useEffect(() => {
    if (showAddModal || selected) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [showAddModal, selected]);

  // delete
  const handleDelete = async (id: number) => {
    const inc = items.find((x) => x.id === id);
    if (!inc) return;
    const ok = window.confirm(`Xóa thu nhập "${inc.name}"?`);
    if (!ok) return;
    try {
      await deleteIncome(id);
      await fetchIncomes();
      toast.success("XÓA THÀNH CÔNG", {
        description: (
          <>
            <strong>{inc.name}</strong> đã bị xoá khỏi hệ thống.
          </>
        ),
      });
    } catch (e: any) {
      toast.error("XÓA THẤT BẠI", {
        description: e?.message || "Lỗi không xác định",
      });
    }
  };

  // quick ranges
  const setThisMonth = () => {
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
    const to = endOfMonthYMD(now);
    setPage(1);
    setDateFrom(from);
    setDateTo(to);
    setDateFromLabel(ymdToLabel(from));
    setDateToLabel(ymdToLabel(to));
  };

  const clearDateFilter = () => {
    setPage(1);
    setDateFrom("");
    setDateTo("");
    setDateFromLabel("");
    setDateToLabel("");
  };

  function endOfMonthYMD(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = d.getMonth() + 1;
    const last = new Date(yyyy, mm, 0).getDate();
    return `${yyyy}-${String(mm).padStart(2, "0")}-${String(last).padStart(
      2,
      "0"
    )}`;
  }

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
        Vui lòng đăng nhập để xem danh sách thu nhập.
      </div>
    );
  }

  if (status === "authenticated" && (session?.user as any)?.role !== "admin")
    return <div className="p-4 sm:p-6 min-h-screen text-white"></div>;

  return (
    <div className="min-h-screen text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">
          Quản trị thu nhập{" "}
          <span className="text-3xl font-bold text-green-600">({total})</span>
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-3">
          {/* <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-buttonRoot rounded-xl text-white hover:opacity-90 disabled:opacity-50"
            disabled={!userId}
            title={!userId ? "Vui lòng đăng nhập" : ""}
          >
            <Plus className="w-4 h-4" /> Thêm thu nhập
          </button> */}

          {/* <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white"
            title="Xuất danh sách theo bộ lọc"
          >
            Xuất Excel
          </button> */}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 items-start">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Tìm theo tên hoặc ghi chú"
          className="w-full px-3 py-2 rounded-lg bg-black text-white border border-gray-600"
        />

        {/* <Select
          value={categoryOptionsData.find((opt) => opt.value === categoryId)}
          onChange={(opt: any) => {
            setPage(1);
            setCategoryId(opt?.value ?? 0);
          }}
          options={categoryOptionsData}
          className="w-full"
          classNamePrefix="rs"
          menuPortalTarget={
            typeof window !== "undefined" ? document.body : null
          }
          menuPosition="fixed"
          styles={{
            menu: (base) => ({
              ...base,
              zIndex: 60,
              backgroundColor: "black",
              border: "1px solid #374151",
            }),
            menuList: (base) => ({
              ...base,
              maxHeight: 200,
              overflowY: "auto",
              paddingTop: 0,
              paddingBottom: 0,
            }),
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
                  Không tìm thấy thu nhập nào
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
          <IncomeUpdate
            income={selected}
            onClose={() => setSelected(null)}
            onUpdate={() => {
              setSelected(null);
              fetchIncomes();
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
