// src/services/InvestService.ts
import { supabase } from "@/lib/supabaseClient";

export type Invest = {
  id: number;
  name: string;
  category: number | null; // FK -> category-invest.id
  amount: number;
  date: string | null; // "YYYY-MM-DD"
  note: string | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
};

export type NewInvest = {
  name: string;
  category?: number | null;
  amount: number;
  date?: string | null; // "YYYY-MM-DD"
  note?: string | null;
  user_id: string;
};

export type GetInvestsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: number; // lọc theo id danh mục
  dateFrom?: string; // "YYYY-MM-DD" (inclusive)
  dateTo?: string; // "YYYY-MM-DD" (inclusive)
  user_id?: string;
};

const TABLE = "invest";

// ----- CREATE
export async function createInvest(payload: NewInvest) {
  const name = payload.name?.trim();
  if (!name) throw new Error("Tên khoản đầu tư không được để trống");

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
      throw new Error("Ngày đầu tư không hợp lệ (YYYY-MM-DD)");
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
  return data as Invest;
}

// ----- READ (LIST)
export async function getInvests({
  page = 1,
  pageSize = 10,
  search = "",
  category,
  dateFrom,
  dateTo,
  user_id,
}: GetInvestsParams = {}) {
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
    items: (data ?? []) as Invest[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

// ----- UPDATE
export type UpdateInvest = {
  name?: string;
  category?: number | null;
  amount?: number;
  date?: string | null; // "YYYY-MM-DD" | null
  note?: string | null;
};

export async function updateInvest(id: number, payload: UpdateInvest) {
  const updates: Record<string, any> = {};

  if (payload.name !== undefined) {
    const name = payload.name.trim();
    if (!name) throw new Error("Tên khoản đầu tư không được để trống");
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
        throw new Error("Ngày đầu tư không hợp lệ (YYYY-MM-DD)");
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
  return data as Invest;
}

// ----- DELETE
export async function deleteInvest(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

// ----- READ (ADMIN - LIST ALL, with user name)
export type InvestAdmin = Invest & {
  user_name: string;
};
export type GetAllInvestsParams = Omit<GetInvestsParams, "user_id">;

export async function getAllInvests({
  page = 1,
  pageSize = 10,
  search = "",
  category,
  dateFrom,
  dateTo,
}: Omit<GetInvestsParams, "user_id"> = {}) {
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
      users!invest_user_id_fkey (
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

  const items = (data ?? []).map((item: any) => ({
    ...item,
    user_name: item.users?.name ?? "Không xác định",
  }));

  return {
    items: items as InvestAdmin[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}
