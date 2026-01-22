"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserAdd from "@/components/admin/users/UserAdd";
import UserUpdate from "@/components/admin/users/UserUpdate";
import { deleteUser, getUsers, type User } from "@/services/UserService";

export default function UserTable() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const currentRole = (session?.user as any)?.role;
  const isAdmin = currentRole === "admin";

  // data
  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ui
  const [showAddModal, setShowAddModal] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = async () => {
    try {
      const res = await getUsers({
        page,
        pageSize,
        search: debouncedSearch,
      });

      if (res.items.length === 0 && page > 1 && res.totalPages < page) {
        setPage(1);
        return;
      }

      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      toast.error("Không tải được danh sách users", {
        description: e?.message || "Lỗi không xác định",
      });
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isAdmin, page, debouncedSearch]);

  // scroll lock
  useEffect(() => {
    if (showAddModal || selected)
      document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [showAddModal, selected]);

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

  const handleDelete = async (id: number) => {
    const u = items.find((x) => x.id === id);
    if (!u) return;

    const ok = window.confirm(`Xóa user "${u.name}"?`);
    if (!ok) return;

    try {
      await deleteUser(id);
      await fetchUsers();
      toast.success("XÓA THÀNH CÔNG", {
        description: (
          <>
            <strong>{u.name}</strong> đã bị xoá.
          </>
        ),
      });
    } catch (e: any) {
      toast.error("XÓA THẤT BẠI", {
        description: e?.message || "Lỗi không xác định",
      });
    }
  };

  // loading UI
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
        Vui lòng đăng nhập.
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Bạn không có quyền truy cập trang quản trị users.
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
          Quản trị người dùng{" "}
          <span className="text-3xl font-bold text-green-600">({total})</span>
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-buttonRoot rounded-xl text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Thêm user
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 items-start">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Tìm theo tên hoặc email"
          className="w-full px-3 py-2 rounded-lg bg-black text-white border border-gray-600"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-4 py-2">Tên</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Tạo lúc</th>
              <th className="px-4 py-2 text-right"></th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  Không tìm thấy user nào
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <tr
                  key={u.id}
                  className="bg-[#1c1c1e] hover:bg-[#2a2a2e] rounded-xl transition"
                >
                  <td className="px-4 py-3 rounded-l-xl max-w-[240px] truncate">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 max-w-[260px] truncate">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex px-2 py-1 rounded-md text-xs font-semibold",
                        u.role === "admin"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-green-500/20 text-green-300 border border-green-500/30",
                      ].join(" ")}
                    >
                      {u.role || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleString("vi-VN")
                      : "—"}
                  </td>

                  <td className="px-4 py-3 text-right rounded-r-xl">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelected(u)}
                        className="hover:text-yellow-400"
                        title="Sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="hover:text-red-500"
                        title="Xóa"
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

        {showAddModal && (
          <UserAdd
            onClose={() => setShowAddModal(false)}
            onAdd={() => fetchUsers()}
          />
        )}

        {selected && (
          <UserUpdate
            user={selected}
            onClose={() => setSelected(null)}
            onUpdated={() => {
              setSelected(null);
              fetchUsers();
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
