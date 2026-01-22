// src/services/ExpenseService.ts
import { supabase } from "@/lib/supabaseClient";
import {
  getAllCategoryExpenses,
  getAllCategoryBudget,
} from "./CategoryExpenseService";

export type Expense = {
  id: number;
  name: string;
  category: number | null; // FK -> category-expenses.id
  amount: number;
  date: string | null; // timestamp (ISO string)
  note: string | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
};

export type ExpenseAdmin = Expense & {
  user_name: string;
};

export type NewExpense = {
  name: string;
  category?: number | null;
  amount: number;
  date?: string | null;
  note?: string | null;
  user_id: string;
};

export type GetExpensesParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: number; // lọc theo id danh mục
  dateFrom?: string; // "YYYY-MM-DD" hoặc ISO
  dateTo?: string; // "YYYY-MM-DD" hoặc ISO (inclusive)
  user_id?: string;
};

const TABLE = "expenses";

export async function createExpense(payload: NewExpense) {
  const name = payload.name?.trim();
  if (!name) throw new Error("Tên chi phí không được để trống");

  const category =
    payload.category === undefined ? null : payload.category ?? null;

  // amount: số >= 0
  if (payload.amount === undefined || payload.amount === null) {
    throw new Error("Vui lòng nhập số tiền (amount)");
  }
  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Số tiền không hợp lệ");
  }

  let date: string | null = null;
  if (payload.date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
      throw new Error("Ngày chi phí không hợp lệ (YYYY-MM-DD)");
    }
    date = payload.date; // lưu thẳng '2025-08-21'
  }

  const note = payload.note?.trim() || null;
  const { user_id } = payload;

  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ name, category, amount, date, note, user_id }])
    .select("id,name,category,amount,date,note,user_id,created_at,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as Expense;
}

export async function getExpenses({
  page = 1,
  pageSize = 10,
  search = "",
  category,
  dateFrom,
  dateTo,
  user_id,
}: GetExpensesParams = {}) {
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select("id,name,category,amount,date,note,user_id,created_at,updated_at", {
      count: "exact",
    })
    // Ưu tiên sắp theo ngày phát sinh, nulls last; phụ theo created_at
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (user_id) query = query.eq("user_id", user_id);

  const q = (search || "").trim();
  if (q) query = query.or(`name.ilike.%${q}%,note.ilike.%${q}%`);

  if (category !== undefined) query = query.eq("category", category);

  // --- Lọc khoảng ngày (inclusive) ---
  if (dateFrom || dateTo) {
    query = query.not("date", "is", null);

    if (dateFrom) query = query.gte("date", dateFrom);
    if (dateTo) query = query.lte("date", dateTo);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []) as Expense[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

// ===== SỬA LẠI getAllExpenses (phần còn lại giữ nguyên) =====
export async function getAllExpenses({
  page = 1,
  pageSize = 10,
  search = "",
  category,
  dateFrom,
  dateTo,
}: Omit<GetExpensesParams, "user_id"> = {}) {
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 1. Lấy danh sách ID của các category có has_budget = false (từ service đã lọc sẵn)
  const { items: allowedCategories } = await getAllCategoryExpenses({
    page: 1,
    pageSize: 500, // đủ lớn để lấy hết
    search: "",
  });
  const allowedCategoryIds = allowedCategories.map((c) => c.id);

  // 2. Query chính
  let query = supabase
    .from(TABLE)
    .select(
      `
      id,
      name,
      category,
      amount,
      date,
      note,
      user_id,
      created_at,
      updated_at,
      users!expenses_user_id_fkey (
        id,
        name
      )
    `,
      { count: "exact" }
    )
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  // 3. Lọc: category null HOẶC category nằm trong danh sách allowed
  if (allowedCategoryIds.length > 0) {
    query = query.or(
      `category.is.null,category.in.(${allowedCategoryIds.join(",")})`
    );
  } else {
    // Nếu không có category nào has_budget=false thì chỉ giữ lại category null
    query = query.is("category", null);
  }

  // 4. Các filter khác giữ nguyên
  const q = (search || "").trim();
  if (q) query = query.or(`name.ilike.%${q}%,note.ilike.%${q}%`);

  if (category !== undefined) {
    // Vì dropdown chỉ có category allowed rồi nên vẫn giữ filter này
    query = query.eq("category", category);
  }

  if (dateFrom || dateTo) {
    query = query.not("date", "is", null);
    if (dateFrom) query = query.gte("date", dateFrom);
    if (dateTo) query = query.lte("date", dateTo);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const items = (data ?? []).map((item: any) => ({
    ...item,
    user_name: item.users?.name ?? "Không xác định",
  }));

  return {
    items: items as (Expense & { user_name: string })[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

export type UpdateExpense = {
  name?: string;
  category?: number | null;
  amount?: number;
  date?: string | null; // ISO
  note?: string | null;
};

export async function updateExpense(id: number, payload: UpdateExpense) {
  const updates: Record<string, any> = {};

  if (payload.name !== undefined) {
    const name = payload.name.trim();
    if (!name) throw new Error("Tên chi phí không được để trống");
    updates.name = name;
  }

  if (payload.category !== undefined) {
    updates.category = payload.category ?? null;
  }

  if (payload.amount !== undefined) {
    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("Số tiền không hợp lệ");
    }
    updates.amount = amount;
  }

  if (payload.date !== undefined) {
    if (payload.date === null) {
      updates.date = null;
    } else {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
        throw new Error("Ngày chi phí không hợp lệ (YYYY-MM-DD)");
      }
      updates.date = payload.date;
    }
  }

  if (payload.note !== undefined) {
    updates.note = payload.note?.trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("Không có dữ liệu để cập nhật");
  }

  // nếu chưa có trigger updated_at trong DB, set thủ công
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select("id,name,category,amount,date,note,created_at,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as Expense;
}

export async function deleteExpense(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function getAllBudget({
  page = 1,
  pageSize = 10,
  search = "",
  category,
  dateFrom,
  dateTo,
}: Omit<GetExpensesParams, "user_id"> = {}) {
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 1️⃣ Lấy category có has_budget = true
  const { items: budgetCategories } = await getAllCategoryBudget({
    page: 1,
    pageSize: 500,
    search: "",
  });

  const budgetCategoryIds = budgetCategories.map((c) => c.id);

  // 2️⃣ Query expenses
  let query = supabase
    .from("expenses")
    .select(
      `
      id,
      name,
      category,
      amount,
      date,
      note,
      user_id,
      created_at,
      updated_at,
      users!expenses_user_id_fkey (
        id,
        name
      )
    `,
      { count: "exact" }
    )
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  // 3️⃣ Chỉ lấy expense thuộc category budget
  if (budgetCategoryIds.length > 0) {
    query = query.in("category", budgetCategoryIds);
  } else {
    // Không có category budget → không có chi tiêu
    return {
      items: [],
      total: 0,
      currentPage: page,
      totalPages: 1,
      pageSize,
    };
  }

  // 4️⃣ Filter khác giữ nguyên
  const q = search.trim();
  if (q) {
    query = query.or(`name.ilike.%${q}%,note.ilike.%${q}%`);
  }

  if (category !== undefined) {
    query = query.eq("category", category);
  }

  if (dateFrom || dateTo) {
    query = query.not("date", "is", null);
    if (dateFrom) query = query.gte("date", dateFrom);
    if (dateTo) query = query.lte("date", dateTo);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const items = (data ?? []).map((item: any) => ({
    ...item,
    user_name: item.users?.name ?? "Không xác định",
  }));

  return {
    items: items as (Expense & { user_name: string })[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}
