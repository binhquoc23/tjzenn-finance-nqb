"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  PiggyBank,
  CalendarDays,
  CalendarClock,
  Coins,
  Banknote,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";
import { getExpenses, type Expense } from "@/services/ExpenseService";
import {
  getCategoryExpenses,
  type CategoryExpense,
} from "@/services/CategoryExpenseService";
import { getIncomes, type Income } from "@/services/IncomeService";
import {
  getCategoryIncomes,
  type CategoryIncome,
} from "@/services/CategoryIncomeService";
import { getInvests, type Invest } from "@/services/InvestService";
import {
  getCategoryInvests,
  type CategoryInvest,
} from "@/services/CategoryInvestService";
import { useSession, signIn } from "next-auth/react";
import XLSX from "xlsx-js-style";

// types
type BarItem = { name: string; value: number; color?: string };
type ChartData = Record<string, BarItem[]>;

// utils
const formatVND = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}
function getTodayVN() {
  const d = new Date();
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
}
function ymd(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}
function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
const FALLBACK_COLORS = [
  "#4f46e5",
  "#16a34a",
  "#ec4899",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
];

export default function Dashboard() {
  const { y: curYear, m: curMonth } = useMemo(getTodayVN, []);
  const [filterMonth, setFilterMonth] = useState<string>(pad2(curMonth));
  const [filterYear, setFilterYear] = useState<string>(String(curYear));
  const monthYearLabel = useMemo(
    () => `${filterMonth}/${filterYear}`,
    [filterMonth, filterYear]
  );

  // keys
  const chiTieuKey = `Chi tiêu ${monthYearLabel}`;
  const dauTuKey = `Đầu tư ${monthYearLabel}`;
  const thuNhapKey = `Thu nhập ${monthYearLabel}`;
  const conLaiKey = `Còn lại ${monthYearLabel}`;

  const [selectedChart, setSelectedChart] = useState<string>(
    `Chi tiêu ${pad2(curMonth)}/${curYear}`
  );

  // totals
  const [spendingTotal, setSpendingTotal] = useState<number | null>(null);
  const [investmentTotal, setInvestmentTotal] = useState<number | null>(null);
  const [incomeTotal, setIncomeTotal] = useState<number | null>(null);

  const [chartData, setChartData] = useState<ChartData>({
    [chiTieuKey]: [],
    [dauTuKey]: [],
    [thuNhapKey]: [],
  });

  // map category (chi tiêu)
  const [catMap, setCatMap] = useState<
    Record<number, { name: string; color?: string }>
  >({});

  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  // tiện: hàm reset khi không có user
  function clearUserScopedState() {
    setCatMap({});
    setSpendingTotal(null);
    setIncomeTotal(null);
    setInvestmentTotal(null);
    setChartData((prev) => ({
      ...prev,
      [chiTieuKey]: [],
      [thuNhapKey]: [],
      [dauTuKey]: [],
    }));
  }

  async function loadCategories() {
    if (!userId) {
      clearUserScopedState();
      return;
    }
    const { items } = await getCategoryExpenses({
      page: 1,
      pageSize: 1000,
      search: "",
      user_id: userId,
    });
    const map: Record<number, { name: string; color?: string }> = {};
    (items as CategoryExpense[]).forEach((c) => {
      map[c.id] = { name: c.name, color: c.color || undefined };
    });
    setCatMap(map);
  }

  async function loadSpending(monthStr: string, yearStr: string) {
    if (!userId) {
      clearUserScopedState();
      return;
    }

    const year = Number(yearStr);
    const month = Number(monthStr);
    const dFrom = ymd(year, month, 1);
    const dTo = ymd(year, month, lastDayOfMonth(year, month));

    // 1) expenses
    const res = await getExpenses({
      page: 1,
      pageSize: 2000,
      dateFrom: dFrom,
      dateTo: dTo,
      user_id: userId,
    });
    const items = res.items as Expense[];

    // 2) categories (refresh để có màu mới)
    const catRes = await getCategoryExpenses({
      page: 1,
      pageSize: 1000,
      search: "",
      user_id: userId,
    });
    const cats = catRes.items as CategoryExpense[];
    const catMapLocal = new Map<number, { name: string; color?: string }>();
    cats.forEach((c) => {
      catMapLocal.set(c.id, { name: c.name, color: c.color || undefined });
    });

    // 3) group
    const byCat = new Map<
      number | "null",
      { key: number | "null"; label: string; color?: string; sum: number }
    >();
    for (const it of items) {
      const key = (it.category ?? "null") as number | "null";
      const cat = typeof key === "number" ? catMapLocal.get(key) : undefined;

      const label =
        typeof key === "number" ? cat?.name ?? `Danh mục ${key}` : "Khác";
      const color = typeof key === "number" ? cat?.color : undefined;

      if (!byCat.has(key)) {
        byCat.set(key, { key, label, color, sum: 0 });
      }
      byCat.get(key)!.sum += Number(it.amount || 0);
    }

    // 4) chart data
    let i = 0;
    const data = Array.from(byCat.values())
      .map((row) => ({
        name: row.label,
        value: row.sum,
        color: row.color || FALLBACK_COLORS[i++ % FALLBACK_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    setSpendingTotal(data.reduce((acc, x) => acc + x.value, 0));
    setChartData((prev) => ({
      ...prev,
      [chiTieuKey]: data,
    }));
  }

  // ------ LOAD INCOME (thu nhập thật) ------
  async function loadIncome(monthStr: string, yearStr: string) {
    if (!userId) {
      clearUserScopedState();
      return;
    }

    const year = Number(yearStr);
    const month = Number(monthStr);
    const dFrom = ymd(year, month, 1);
    const dTo = ymd(year, month, lastDayOfMonth(year, month));

    // 1) incomes trong tháng
    const res = await getIncomes({
      page: 1,
      pageSize: 2000,
      dateFrom: dFrom,
      dateTo: dTo,
      user_id: userId,
    });
    const items = res.items as Income[];

    // 2) category thu nhập
    const catRes = await getCategoryIncomes({
      page: 1,
      pageSize: 1000,
      search: "",
      user_id: userId,
    });
    const cats = catRes.items as CategoryIncome[];
    const catMapIncome = new Map<number, { name: string; color?: string }>();
    cats.forEach((c) => {
      catMapIncome.set(c.id, { name: c.name, color: c.color || undefined });
    });

    // 3) group theo danh mục
    const byCat = new Map<
      number | "null",
      { key: number | "null"; label: string; color?: string; sum: number }
    >();
    for (const it of items) {
      const key = (it.category ?? "null") as number | "null";
      const cat = typeof key === "number" ? catMapIncome.get(key) : undefined;
      const label =
        typeof key === "number" ? cat?.name ?? `Danh mục ${key}` : "Khác";
      const color = typeof key === "number" ? cat?.color : undefined;

      if (!byCat.has(key)) {
        byCat.set(key, { key, label, color, sum: 0 });
      }
      byCat.get(key)!.sum += Number(it.amount || 0);
    }

    // 4) chart data + total
    let i = 0;
    const data = Array.from(byCat.values())
      .map((row) => ({
        name: row.label,
        value: row.sum,
        color: row.color || FALLBACK_COLORS[i++ % FALLBACK_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    setIncomeTotal(data.reduce((acc, x) => acc + x.value, 0));
    setChartData((prev) => ({
      ...prev,
      [thuNhapKey]: data,
    }));
  }

  // ------ LOAD INVESTMENT (đầu tư thật) ------
  async function loadInvestment(monthStr: string, yearStr: string) {
    if (!userId) {
      clearUserScopedState();
      return;
    }

    const year = Number(yearStr);
    const month = Number(monthStr);
    const dFrom = ymd(year, month, 1);
    const dTo = ymd(year, month, lastDayOfMonth(year, month));

    // 1) invests trong tháng
    const res = await getInvests({
      page: 1,
      pageSize: 2000,
      dateFrom: dFrom,
      dateTo: dTo,
      user_id: userId,
    });
    const items = res.items as Invest[];

    // 2) category đầu tư
    const catRes = await getCategoryInvests({
      page: 1,
      pageSize: 1000,
      search: "",
      user_id: userId,
    });
    const cats = catRes.items as CategoryInvest[];
    const catMapInvest = new Map<number, { name: string; color?: string }>();
    cats.forEach((c) => {
      catMapInvest.set(c.id, { name: c.name, color: c.color || undefined });
    });

    // 3) group theo danh mục
    const byCat = new Map<
      number | "null",
      { key: number | "null"; label: string; color?: string; sum: number }
    >();
    for (const it of items) {
      const key = (it.category ?? "null") as number | "null";
      const cat = typeof key === "number" ? catMapInvest.get(key) : undefined;
      const label =
        typeof key === "number" ? cat?.name ?? `Danh mục ${key}` : "Khác";
      const color = typeof key === "number" ? cat?.color : undefined;

      if (!byCat.has(key)) {
        byCat.set(key, { key, label, color, sum: 0 });
      }
      byCat.get(key)!.sum += Number(it.amount || 0);
    }

    // 4) chart data + total
    let i = 0;
    const data = Array.from(byCat.values())
      .map((row) => ({
        name: row.label,
        value: row.sum,
        color: row.color || FALLBACK_COLORS[i++ % FALLBACK_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    setInvestmentTotal(data.reduce((acc, x) => acc + x.value, 0));
    setChartData((prev) => ({
      ...prev,
      [dauTuKey]: data,
    }));
  }

  // chỉ load khi đã xác thực
  useEffect(() => {
    if (status !== "authenticated" || !userId) {
      clearUserScopedState();
      return;
    }
    (async () => {
      await loadCategories();
      await Promise.all([
        loadSpending(filterMonth, filterYear),
        loadIncome(filterMonth, filterYear),
        loadInvestment(filterMonth, filterYear), // <— đầu tư thật
      ]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, userId]);

  // reload khi đổi tháng/năm
  useEffect(() => {
    if (status !== "authenticated" || !userId) return;
    (async () => {
      await Promise.all([
        loadSpending(filterMonth, filterYear),
        loadIncome(filterMonth, filterYear),
        loadInvestment(filterMonth, filterYear), // <— đầu tư thật
      ]);
      setSelectedChart((prev) =>
        prev.startsWith("Chi tiêu") ||
        prev.startsWith("Thu nhập") ||
        prev.startsWith("Đầu tư")
          ? prev.replace(/\d{2}\/\d{4}$/, monthYearLabel)
          : prev
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, filterYear, status, userId]);

  const remainingTotal =
    incomeTotal !== null && spendingTotal !== null && investmentTotal !== null
      ? incomeTotal - (spendingTotal + investmentTotal)
      : null;

  const cards = [
    {
      icon: <Coins className="h-8 w-8 text-blue-400" />,
      title: thuNhapKey,
      value: incomeTotal !== null ? formatVND(incomeTotal) : "...",
      key: thuNhapKey,
      isClickable: true,
    },
    {
      icon: <DollarSign className="h-8 w-8 text-green-400" />,
      title: chiTieuKey,
      value: spendingTotal !== null ? formatVND(spendingTotal) : "...",
      key: chiTieuKey,
      isClickable: true,
    },
    {
      icon: <PiggyBank className="h-8 w-8 text-yellow-400" />,
      title: dauTuKey,
      value: investmentTotal !== null ? formatVND(investmentTotal) : "...",
      key: dauTuKey,
      isClickable: true,
    },
    {
      icon: <Banknote className="h-8 w-8 text-red-400" />,
      title: conLaiKey,
      value: remainingTotal !== null ? formatVND(remainingTotal) : "...",
      key: conLaiKey,
      isClickable: false,
    },
  ];

  const months = Array.from({ length: 12 }, (_, i) => {
    const v = pad2(i + 1);
    return { label: v, value: v };
  });
  const years = ["2023", "2024", "2025", "2026"];

  // ===== Excel helpers =====
  function hexToARGB(hex: string) {
    const h = hex.replace("#", "").trim();
    if (h.length === 3) {
      // e.g. #abc -> aabbcc
      const e = h
        .split("")
        .map((c) => c + c)
        .join("");
      return "FF" + e.toUpperCase();
    }
    return "FF" + h.toUpperCase();
  }

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

  function formatYMDToDMY(ymd?: string | null) {
    if (!ymd) return "";
    // ymd: YYYY-MM-DD -> DD/MM/YYYY
    const [y, m, d] = ymd.split("-");
    if (!y || !m || !d) return ymd;
    return `${d}/${m}/${y}`;
  }

  async function handleExportExcel() {
    try {
      const year = Number(filterYear);
      const month = Number(filterMonth);
      const dFrom = ymd(year, month, 1);
      const dTo = ymd(year, month, lastDayOfMonth(year, month));
      const label = `${pad2(month)}/${year}`;

      // --- Re-fetch danh mục để map tên + màu chuẩn mới nhất ---
      const [expCatsRes, incCatsRes, invCatsRes] = await Promise.all([
        getCategoryExpenses({
          page: 1,
          pageSize: 1000,
          search: "",
          user_id: userId!,
        }),
        getCategoryIncomes({
          page: 1,
          pageSize: 1000,
          search: "",
          user_id: userId!,
        }),
        getCategoryInvests({
          page: 1,
          pageSize: 1000,
          search: "",
          user_id: userId!,
        }),
      ]);

      const expCat = new Map<number, { name: string; color?: string }>();
      (expCatsRes.items as CategoryExpense[]).forEach((c) =>
        expCat.set(c.id, { name: c.name, color: c.color || undefined })
      );

      const incCat = new Map<number, { name: string; color?: string }>();
      (incCatsRes.items as CategoryIncome[]).forEach((c) =>
        incCat.set(c.id, { name: c.name, color: c.color || undefined })
      );

      const invCat = new Map<number, { name: string; color?: string }>();
      (invCatsRes.items as CategoryInvest[]).forEach((c) =>
        invCat.set(c.id, { name: c.name, color: c.color || undefined })
      );

      // --- Re-fetch chi tiết để có log giao dịch ---
      const [expRes, incRes, invRes] = await Promise.all([
        getExpenses({
          page: 1,
          pageSize: 5000,
          dateFrom: dFrom,
          dateTo: dTo,
          user_id: userId!,
        }),
        getIncomes({
          page: 1,
          pageSize: 5000,
          dateFrom: dFrom,
          dateTo: dTo,
          user_id: userId!,
        }),
        getInvests({
          page: 1,
          pageSize: 5000,
          dateFrom: dFrom,
          dateTo: dTo,
          user_id: userId!,
        }),
      ]);

      const expItems = (expRes.items as Expense[]) || [];
      const incItems = (incRes.items as Income[]) || [];
      const invItems = (invRes.items as Invest[]) || [];

      // --- Workbook ---
      const wb = XLSX.utils.book_new();

      // ===== 1) Sheet Tổng quan =====
      const summaryRows: any[][] = [
        ["Báo cáo tổng quan", label],
        [""],
        ["Chỉ tiêu", "Giá trị (VND)"],
        ["Thu nhập", incomeTotal ?? 0],
        ["Chi tiêu", spendingTotal ?? 0],
        ["Đầu tư", investmentTotal ?? 0],
        [
          "Còn lại",
          (incomeTotal ?? 0) - ((spendingTotal ?? 0) + (investmentTotal ?? 0)),
        ],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);

      // Style header row (row index 2 because 0-based: row 0 title, row 1 empty, row 2 header)
      applyTableStyles(wsSummary, { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } });

      // Body: A4..B7 đều có border
      for (let r = 3; r <= 6; r++) {
        for (let c = 0; c <= 1; c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          wsSummary[addr] = wsSummary[addr] || { t: "s", v: "" };
          wsSummary[addr].s = {
            ...(wsSummary[addr].s || {}),
            ...bodyCellStyle,
          };
        }
      }

      // Cột B (giá trị) dùng moneyCellStyle
      ["B4", "B5", "B6", "B7"].forEach((addr) => {
        if (wsSummary[addr]) {
          wsSummary[addr].s = {
            ...(wsSummary[addr].s || {}),
            ...moneyCellStyle,
          };
        }
      });
      // Money columns styles
      ["B4", "B5", "B6", "B7"].forEach((addr) => {
        if (wsSummary[addr])
          wsSummary[addr].s = {
            ...(wsSummary[addr].s || {}),
            ...moneyCellStyle,
          };
      });

      wsSummary["!cols"] = autosizeCols(summaryRows);
      wsSummary["!cols"][0] = {
        wch: Math.max(14, wsSummary["!cols"][0].wch || 0),
      }; // A: Chỉ tiêu
      wsSummary["!cols"][1] = {
        wch: Math.max(16, wsSummary["!cols"][1].wch || 0),
      }; // B: Giá tr
      XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng quan");

      // ===== helper dựng sheet theo danh mục =====
      function buildCategorySheet(
        title: string,
        rows: { name: string; value: number; color?: string }[]
      ) {
        const total = rows.reduce((a, b) => a + (b.value || 0), 0) || 1;
        const aoa: any[][] = [
          [title, label, ""],
          [""],
          ["Danh mục", "Số tiền (VND)", "Tỷ lệ"],
        ];
        rows.forEach((r) => {
          aoa.push([r.name, r.value || 0, (r.value || 0) / total]);
        });

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        applyTableStyles(ws, { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } });

        // style cột tiền + %
        for (let i = 3; i < aoa.length; i++) {
          const moneyAddr = XLSX.utils.encode_cell({ r: i, c: 1 });
          const percentAddr = XLSX.utils.encode_cell({ r: i, c: 2 });
          if (ws[moneyAddr])
            ws[moneyAddr].s = { ...(ws[moneyAddr].s || {}), ...moneyCellStyle };
          if (ws[percentAddr])
            ws[percentAddr].s = {
              ...(ws[percentAddr].s || {}),
              ...percentCellStyle,
            };
        }

        // tô màu nền theo màu danh mục (nếu có) cho cột A (tên)
        rows.forEach((r, idx) => {
          const rowIndex = 3 + idx;
          const aAddr = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
          ws[aAddr] = ws[aAddr] || { t: "s", v: r.name };
          const fillColor = r.color
            ? {
                fill: {
                  patternType: "solid",
                  fgColor: { rgb: hexToARGB(r.color) },
                },
              }
            : {};
          ws[aAddr].s = {
            ...(ws[aAddr].s || {}),
            ...bodyCellStyle,
            ...fillColor,
          };
        });

        ws["!cols"] = autosizeCols(aoa);
        return ws;
      }

      // Lấy data hiện có trên UI
      const chiTieuData = chartData[`Chi tiêu ${label}`] || [];
      const thuNhapData = chartData[`Thu nhập ${label}`] || [];
      const dauTuData = chartData[`Đầu tư ${label}`] || [];

      const wsExpCat = buildCategorySheet(
        "Chi tiêu theo danh mục",
        chiTieuData
      );
      const wsIncCat = buildCategorySheet(
        "Thu nhập theo danh mục",
        thuNhapData
      );
      const wsInvCat = buildCategorySheet("Đầu tư theo danh mục", dauTuData);

      XLSX.utils.book_append_sheet(wb, wsExpCat, "Chi tiêu (DM)");
      XLSX.utils.book_append_sheet(wb, wsIncCat, "Thu nhập (DM)");
      XLSX.utils.book_append_sheet(wb, wsInvCat, "Đầu tư (DM)");

      // ===== 3) Sheet Chi tiết giao dịch =====
      function toDetailRows<
        T extends {
          date?: string;
          created_at?: string;
          amount?: number;
          category?: number | null;
          // các field name có thể khác nhau giữa 3 loại -> lấy theo thứ tự ưu tiên:
          name?: string;
          title?: string;
          content?: string;
          description?: string;
          note?: string;
        }
      >(items: T[], catMap: Map<number, { name: string; color?: string }>) {
        // Header mới: Ngày | Tên | Danh mục | Số tiền (VND)
        const aoa: any[][] = [["Ngày", "Tên", "Danh mục", "Số tiền (VND)"]];

        items.forEach((it) => {
          const d = formatYMDToDMY(it.date ?? it.created_at ?? "");
          const catId = (it.category ?? null) as number | null;
          const catName =
            catId != null
              ? catMap.get(catId)?.name ?? `Danh mục ${catId}`
              : "Khác";

          // lấy "Tên" với fallback hợp lý cho cả Expense/Income/Invest
          const displayName =
            it.name ??
            it.title ??
            it.content ??
            it.description ??
            it.note ??
            ""; // nếu không có thì để trống

          const amount = Number(it.amount || 0);
          aoa.push([d, displayName, catName, amount]);
        });

        return aoa;
      }

      const expDetail = toDetailRows(expItems, expCat);
      const incDetail = toDetailRows(incItems, incCat);
      const invDetail = toDetailRows(invItems, invCat);

      function buildDetailSheet(title: string, aoa: any[][]) {
        const ws = XLSX.utils.aoa_to_sheet([[title, label], [""], ...aoa]);

        // header + body + cột tiền (giữ nguyên như anh đang có)
        applyTableStyles(ws, { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } });
        const startRow = 3,
          endRow = 2 + aoa.length;
        for (let r = startRow; r <= endRow; r++) {
          for (let c = 0; c <= 3; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            ws[addr] = ws[addr] || { t: "s", v: "" };
            ws[addr].s = { ...(ws[addr].s || {}), ...bodyCellStyle };
          }
          const moneyAddr = XLSX.utils.encode_cell({ r, c: 3 });
          if (ws[moneyAddr])
            ws[moneyAddr].s = { ...(ws[moneyAddr].s || {}), ...moneyCellStyle };
        }

        // autosize trước
        ws["!cols"] = autosizeCols([[title, label], [""], ...aoa]);

        // 👉 Nới riêng cột A (index 0) thêm "một xíu"
        // Lấy width hiện tại (nếu có), tăng thêm 2, tối thiểu 14
        const curA = ws["!cols"]?.[0]?.wch ?? 12;
        const widenedA = Math.max(14, curA + 2);
        ws["!cols"] = ws["!cols"] || [];
        ws["!cols"][0] = { wch: widenedA }; // A: Ngày
        ws["!cols"][1] = ws["!cols"][1] || { wch: 28 }; // B: Tên
        ws["!cols"][2] = ws["!cols"][2] || { wch: 22 }; // C: Danh mục
        ws["!cols"][3] = ws["!cols"][3] || { wch: 20 }; // D: Số tiền

        return ws;
      }

      XLSX.utils.book_append_sheet(
        wb,
        buildDetailSheet("Chi tiết Chi tiêu", expDetail),
        "Chi tiết Chi tiêu"
      );
      XLSX.utils.book_append_sheet(
        wb,
        buildDetailSheet("Chi tiết Thu nhập", incDetail),
        "Chi tiết Thu nhập"
      );
      XLSX.utils.book_append_sheet(
        wb,
        buildDetailSheet("Chi tiết Đầu tư", invDetail),
        "Chi tiết Đầu tư"
      );

      // ===== Ghi file =====
      const fileName = `Tong-quan-${pad2(month)}-${year}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Export Excel error:", err);
      alert("Xuất Excel thất bại. Anh thử lại giúp em nhé!");
    }
  }

  // sửa lại CustomLabel
  const CustomLabel = (props: any) => {
    const { x, y, width, value, payload, fill, background } = props;
    const formattedValue = formatVND(value);
    const isShort = width < 100;

    const barColor = String(payload?.color ?? fill ?? background?.fill ?? "")
      .trim()
      .toLowerCase();
    const isWhite = barColor === "#ffffff";
    const textColor = isWhite ? "red" : "#fff";

    return (
      <text
        x={x + (isShort ? width + 5 : width - 10)}
        y={y + 15}
        fill={textColor}
        fontSize="15"
        textAnchor={isShort ? "start" : "end"}
      >
        {formattedValue}
      </text>
    );
  };

  // ----- RENDER GUARD -----
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Đang tải thông tin đăng nhập...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen text-white p-6">
        <div className="max-w-xl rounded-xl border border-zinc-800 bg-[#101010] p-6 space-y-3">
          <h2 className="text-xl font-semibold">Cần đăng nhập</h2>
          <p className="text-zinc-300">
            Vui lòng đăng nhập để xem số liệu tổng quan của bạn.
          </p>
          <button
            onClick={() => signIn()}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // ----- UI chính khi đã có user -----
  return (
    <div className="min-h-screen text-white p-6 space-y-6 pb-20">
      <h1 className="text-4xl font-bold mb-6">Tổng quan</h1>

      {/* Filter tháng/năm */}
      <div className="bg-[#0c0c0c] max-w-2xl border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-zinc-400" />
          <label htmlFor="month" className="text-sm text-zinc-300">
            Tháng
          </label>
        </div>
        <select
          id="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="w-[120px] rounded-lg bg-[#101010] border border-zinc-800 px-3 py-2 text-sm"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 md:ml-4">
          <CalendarClock className="h-5 w-5 text-zinc-400" />
          <label htmlFor="year" className="text-sm text-zinc-300">
            Năm
          </label>
        </div>
        <select
          id="year"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="w-[140px] rounded-lg bg-[#101010] border border-zinc-800 px-3 py-2 text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <button
          onClick={() => handleExportExcel()}
          className="ml-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
        >
          Xuất Excel
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ icon, title, value, key, isClickable }) => (
          <div
            key={title}
            onClick={isClickable ? () => setSelectedChart(key) : undefined}
            className={`bg-[#101010] rounded-xl p-6 flex flex-col justify-between shadow-lg transition ${
              isClickable
                ? selectedChart === key
                  ? "bg-[#2a2a2e] cursor-pointer"
                  : "hover:bg-[#2a2a2e] cursor-pointer"
                : "cursor-default"
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              {icon}
              <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-10 bg-[#101010] rounded-2xl shadow-lg">
        <ResponsiveContainer
          width="100%"
          height={Math.max((chartData[selectedChart]?.length ?? 0) * 72, 320)}
        >
          <BarChart data={chartData[selectedChart] ?? []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <YAxis type="category" dataKey="name" stroke="#ccc" width={120} />
            <XAxis type="number" hide />
            <Tooltip
              formatter={(v: any, _name: any, props: any) => [
                formatVND(Number(v)),
                props?.payload?.name ?? "",
              ]}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {(chartData[selectedChart] ?? []).map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.color ||
                    FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                  }
                />
              ))}
              <LabelList dataKey="value" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Custom label tách ra ngoài component để tránh re-create liên tục
function CustomLabel(props: any) {
  const { x, y, width, value, payload, fill, background } = props;
  const formattedValue = formatVND(Number(value));
  const isShort = width < 100;

  const barColor = String(payload?.color ?? fill ?? background?.fill ?? "")
    .trim()
    .toLowerCase();
  const isWhite = barColor === "#ffffff";
  const textColor = isWhite ? "red" : "#fff";

  return (
    <text
      x={x + (isShort ? width + 5 : width - 10)}
      y={y + 15}
      fill={textColor}
      fontSize="15"
      textAnchor={isShort ? "start" : "end"}
    >
      {formattedValue}
    </text>
  );
}
