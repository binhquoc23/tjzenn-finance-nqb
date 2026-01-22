// src/services/IncomeService.ts
import { supabase } from "@/lib/supabaseClient";

export type Income = {
  id: number;
  name: string;
  category: number | null; // FK -> category-income.id
  amount: number;
  date: string | null; // "YYYY-MM-DD"
  note: string | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
};

export type IncomeAdmin = Income & {
  user_name: string;
};

export type NewIncome = {
  name: string;
  category?: number | null;
  amount: number;
  date?: string | null; // "YYYY-MM-DD"
  note?: string | null;
  user_id: string;
};

export type GetIncomesParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: number; // lọc theo id danh mục
  dateFrom?: string; // "YYYY-MM-DD" (inclusive)
  dateTo?: string; // "YYYY-MM-DD" (inclusive)
  user_id?: string;
};

const TABLE = "income";

// ----- CREATE
export async function createIncome(payload: NewIncome) {
  const name = payload.name?.trim();
  if (!name) throw new Error("Tên khoản thu không được để trống");

  const category =
    payload.category === undefined ? null : payload.category ?? null;

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
      throw new Error("Ngày thu không hợp lệ (YYYY-MM-DD)");
    }
    date = payload.date;
  }

  const note = payload.note?.trim() || null;
  const { user_id } = payload;

  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ name, category, amount, date, note, user_id }])
    .select("id,name,category,amount,date,note,user_id,created_at,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as Income;
}

// ----- READ (LIST)
export async function getIncomes({
  page = 1,
  pageSize = 10,
  search = "",
  category,
  dateFrom,
  dateTo,
  user_id,
}: GetIncomesParams = {}) {
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select("id,name,category,amount,date,note,user_id,created_at,updated_at", {
      count: "exact",
    })
    // Ưu tiên theo ngày phát sinh (nulls last), phụ theo created_at
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (user_id) query = query.eq("user_id", user_id);

  const q = (search || "").trim();
  if (q) query = query.or(`name.ilike.%${q}%,note.ilike.%${q}%`);

  if (category !== undefined) query = query.eq("category", category);

  // Lọc khoảng ngày (inclusive)
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
    items: (data ?? []) as Income[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

// ----- READ (ADMIN - LIST ALL, no user_id)
export type GetAllIncomesParams = Omit<GetIncomesParams, "user_id">;

/**
 * Lấy tất cả khoản thu (không lọc theo user_id).
 * Dành cho admin. Có join ra user_name (cần có relation income.user_id -> profiles.id).
 *
 * Lưu ý: nếu bảng user của anh không phải "profiles" hoặc field tên không phải "full_name",
 * thì đổi phần select cho đúng schema.
 */
// ----- READ (ADMIN - LIST ALL, with user name)
export async function getAllIncomes({
  page = 1,
  pageSize = 10,
  search = "",
  category,
  dateFrom,
  dateTo,
}: Omit<GetIncomesParams, "user_id"> = {}) {
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

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
      users!income_user_id_fkey (
        id,
        name
      )
    `,
      { count: "exact" }
    )
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  const q = (search || "").trim();
  if (q) query = query.or(`name.ilike.%${q}%,note.ilike.%${q}%`);

  if (category !== undefined) query = query.eq("category", category);

  if (dateFrom || dateTo) {
    query = query.not("date", "is", null);
    if (dateFrom) query = query.gte("date", dateFrom);
    if (dateTo) query = query.lte("date", dateTo);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Ép kiểu để có user_name
  const items = (data ?? []).map((item: any) => ({
    ...item,
    user_name: item.users?.name ?? "Không xác định",
  }));

  return {
    items: items as (Income & { user_name: string })[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

// ----- UPDATE
export type UpdateIncome = {
  name?: string;
  category?: number | null;
  amount?: number;
  date?: string | null; // "YYYY-MM-DD" | null
  note?: string | null;
};

export async function updateIncome(id: number, payload: UpdateIncome) {
  const updates: Record<string, any> = {};

  if (payload.name !== undefined) {
    const name = payload.name.trim();
    if (!name) throw new Error("Tên khoản thu không được để trống");
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
        throw new Error("Ngày thu không hợp lệ (YYYY-MM-DD)");
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

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select("id,name,category,amount,date,note,created_at,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as Income;
}

// ----- DELETE
export async function deleteIncome(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
