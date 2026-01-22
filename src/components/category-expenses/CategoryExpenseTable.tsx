"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import CategoryExpenseAdd from "@/components/category-expenses/CategoryExpenseAdd";
import {
  deleteCategoryExpense,
  getCategoryExpenses,
} from "@/services/CategoryExpenseService";
import CategoryExpenseUpdate from "@/components/category-expenses/CategoryExpenseUpdate";
import { useSession } from "next-auth/react";

type CategoryExpense = {
  id: number;
  name: string;
  description: string | null;
  color?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const PAGE_SIZE = 10;

export default function CategoryExpenseTable() {
  const [items, setItems] = useState<CategoryExpense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CategoryExpense | null>(
    null
  );

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: session, status } = useSession(); // lấy thêm status
  const userId = session?.user?.id;

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // lock scroll khi mở modal
  useEffect(() => {
    if (showAddModal || selectedItem) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [showAddModal, selectedItem]);

  // fetch data
  const fetchCategories = async () => {
    if (!userId) return; // chặn gọi khi chưa có userId
    try {
      const res = await getCategoryExpenses({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        user_id: userId,
      });

      if (res.items.length === 0 && page > 1) {
        setPage(1);
        return;
      }

      setItems(res.items as CategoryExpense[]);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      toast.error("Lỗi khi tải danh mục", { description: err.message });
    }
  };

  useEffect(() => {
    if (status === "authenticated" && userId) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, userId, page, debouncedSearch]);

  const handleDelete = async (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const ok = window.confirm(`Bạn chắc muốn xoá danh mục “${item.name}” chứ?`);
    if (!ok) return;

    try {
      await deleteCategoryExpense(id);
      toast.success("Đã xoá danh mục", {
        description: `“${item.name}” đã bị xoá.`,
      });

      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchCategories();
      }
    } catch (err: any) {
      toast.error("Xoá thất bại", {
        description: err?.message || "Lỗi không xác định",
      });
    }
  };

  // 👉 loading UI khi chưa có session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Đang tải thông tin đăng nhập...
      </div>
    );
  }

  // 👉 nếu chưa đăng nhập
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Vui lòng đăng nhập để xem danh mục chi tiêu.
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">
          Danh mục chi tiêu{" "}
          <span className="text-3xl font-bold text-green-600">({total})</span>
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-buttonRoot rounded-xl"
        >
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Tìm theo tên danh mục"
          className="px-3 py-2 rounded-lg bg-black text-white border border-gray-600 w-[300px]"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-4 py-2">Tên danh mục</th>
              <th className="px-4 py-2">Mô tả</th>
              <th className="px-4 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-400">
                  Không tìm thấy danh mục nào
                </td>
              </tr>
            ) : (
              items.map((cat) => (
                <tr
                  key={cat.id}
                  className="bg-[#1c1c1e] hover:bg-[#2a2a2e] rounded-xl transition"
                >
                  <td className="px-4 py-3 rounded-l-xl max-w-[260px]">
                    <div className="flex items-center gap-2">
                      {cat.color && (
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: cat.color }}
                          title={cat.color}
                        />
                      )}
                      <span
                        className="truncate"
                        style={{ color: cat.color || "#fff" }}
                        title={cat.name}
                      >
                        {cat.name}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 max-w-[520px] truncate"
                    title={cat.description || undefined}
                  >
                    {cat.description || "-"}
                  </td>
                  <td className="px-4 py-3 text-right rounded-r-xl">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedItem(cat)}
                        className="hover:text-yellow-400"
                        title="Sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
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

        {/* Modal Add */}
        {showAddModal && (
          <CategoryExpenseAdd
            onClose={() => setShowAddModal(false)}
            onAdd={() => {
              setShowAddModal(false);
              fetchCategories();
            }}
          />
        )}

        {selectedItem && (
          <CategoryExpenseUpdate
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdated={(updated) => {
              setItems((prev) =>
                prev.map((it) =>
                  it.id === updated.id ? (updated as CategoryExpense) : it
                )
              );
              setSelectedItem(null);
            }}
          />
        )}
      </div>

      {/* Pagination */}
      {items.length > 0 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="px-3 py-1 text-sm">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}
