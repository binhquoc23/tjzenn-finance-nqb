// src/components/admin/invest/InvestTable.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, Calendar, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getAllInvests,
  deleteInvest,
  type Invest,
  type InvestAdmin,
} from "@/services/InvestService";

import {
  getAllCategoryInvests,
  type CategoryInvest,
} from "@/services/CategoryInvestService";

import Select from "react-select";
import XLSX from "xlsx-js-style";
// Nếu anh có modal update riêng cho invest thì đổi import lại:
// import InvestUpdate from "@/components/invest/InvestUpdate";
import InvestUpdate from "@/components/invest/InvestUpdate";

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

export default function InvestTable() {
  // data state
  const [items, setItems] = useState<InvestAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ui state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // filter: category
  const [categoryId, setCategoryId] = useState<number | 0>(0);
  const [categoryOptions, setCategoryOptions] = useState<CategoryInvest[]>([]);
  const [categoryMap, setCategoryMap] = useState<
    Record<number, { name: string; color: string | null }>
  >({});
  const [selected, setSelected] = useState<Invest | null>(null);

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
        const all: CategoryInvest[] = [];

        while (true) {
          const res = await getAllCategoryInvests({
            page: pageIdx,
            pageSize: pageSizeCat,
            search: "",
          });
          all.push(...(res.items as CategoryInvest[]));
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

  // fetch invests (ALL)
  const fetchInvests = async () => {
    try {
      const res = await getAllInvests({
        page,
        pageSize,
        search: debouncedSearch,
        category: categoryId > 0 ? categoryId : undefined, // FIX BUG: không bao giờ truyền 0
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      if (res.items.length === 0 && page > 1 && res.totalPages < page) {
        setPage(1);
        return;
      }

      setItems(res.items as InvestAdmin[]);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      toast.error("Không tải được danh sách đầu tư", {
        description: e?.message || "Lỗi không xác định",
      });
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchInvests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, debouncedSearch, categoryId, dateFrom, dateTo]);

  // modal scroll lock
  useEffect(() => {
    if (selected) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [selected]);

  // delete
  const handleDelete = async (id: number) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    const ok = window.confirm(`Xóa đầu tư "${it.name}"?`);
    if (!ok) return;

    try {
      await deleteInvest(id);
      await fetchInvests();
      toast.success("XÓA THÀNH CÔNG", {
        description: (
          <>
            <strong>{it.name}</strong> đã bị xoá khỏi hệ thống.
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
        Vui lòng đăng nhập để xem danh sách đầu tư.
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
          Quản trị đầu tư{" "}
          <span className="text-3xl font-bold text-green-600">({total})</span>
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-3">
          {/* Nếu anh muốn mở modal tạo mới / export excel thì bật lại giống IncomeTable */}
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
          menuPortalTarget={typeof window !== "undefined" ? document.body : null}
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
                  Không tìm thấy đầu tư nào
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
          <InvestUpdate
            invest={selected}
            onClose={() => setSelected(null)}
            onUpdate={() => {
              setSelected(null);
              fetchInvests();
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
