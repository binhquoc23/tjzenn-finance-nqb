import { supabase } from "@/lib/supabaseClient";

export type CategoryExpense = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;

  created_at: string | null;
  updated_at: string | null;
};

export type NewCategoryExpense = {
  name: string;
  description?: string | null;
  color?: string | null; // thêm màu
  user_id: string;
};

export type GetCategoryExpensesParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function createCategoryExpense(payload: NewCategoryExpense) {
  const name = payload.name.trim();
  const description = payload.description?.trim() || null;
  const color = payload.color || null;
  const user_id = payload.user_id || null;

  const { data, error } = await supabase
    .from("category-expenses")
    .insert([{ name, description, color, user_id }])
    .select("id,name,description,color,created_at,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as CategoryExpense;
}

export async function getCategoryExpenses({
  page = 1,
  pageSize = 10,
  search = "",
  user_id,
}: GetCategoryExpensesParams & { user_id: string }) {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  // sanitize
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("category-expenses")
    .select("id,name,description,color,created_at,updated_at,user_id", {
      count: "exact",
    })
    .eq("user_id", user_id)
    .eq("has_budget", false) // chỉ lấy những bản ghi có has_budget = false
    .order("created_at", { ascending: false })
    .range(from, to);

  const q = search.trim();
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []) as CategoryExpense[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

export async function getCategoryExpensesBudget({
  page = 1,
  pageSize = 10,
  search = "",
  user_id,
}: GetCategoryExpensesParams & { user_id: string }) {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  // sanitize
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("category-expenses")
    .select("id,name,description,color,created_at,updated_at,user_id", {
      count: "exact",
    })
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const q = search.trim();
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []) as CategoryExpense[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

export type UpdateCategoryExpense = {
  name?: string;
  description?: string | null;
  color?: string | null;
};

// ----- hàm update theo id
export async function updateCategoryExpense(
  id: number,
  payload: UpdateCategoryExpense
) {
  // build object chỉ chứa field được gửi lên
  const updates: Record<string, any> = {};

  if (payload.name !== undefined) {
    const name = payload.name.trim();
    if (!name) throw new Error("Tên danh mục không được để trống");
    updates.name = name;
  }

  if (payload.description !== undefined) {
    updates.description = payload.description?.trim() || null;
  }

  if (payload.color !== undefined) {
    const color = payload.color || null;
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      throw new Error("Mã màu không hợp lệ. Vui lòng dùng dạng #RRGGBB");
    }
    updates.color = color;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("Không có dữ liệu để cập nhật");
  }

  // Nếu chưa dùng trigger updated_at trong DB, có thể tự set thủ công:
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("category-expenses")
    .update(updates)
    .eq("id", id)
    .select("id,name,description,color,created_at,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as CategoryExpense;
}

export async function deleteCategoryExpense(id: number) {
  const { error } = await supabase
    .from("category-expenses")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}

// src/services/CategoryExpenseService.ts (hoặc file chứa hàm này)

export type GetAllCategoryExpensesParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function getAllCategoryExpenses({
  page = 1,
  pageSize = 10,
  search = "",
}: GetAllCategoryExpensesParams = {}) {
  // sanitize
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(500, Math.max(1, Math.floor(pageSize))); // cho phép pageSize lớn hơn vì admin hay export

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("category-expenses")
    .select(
      "id,name,description,color,created_at,updated_at,user_id,has_budget,target_amount,current_amount",
      { count: "exact" }
    )
    // Chỉ lấy những danh mục có has_budget = false theo yêu cầu của anh
    .eq("has_budget", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  const q = search.trim();
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []) as CategoryExpense[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

export async function getAllCategoryBudget({
  page = 1,
  pageSize = 10,
  search = "",
}: GetAllCategoryExpensesParams = {}) {
  // sanitize
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(500, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("category-expenses")
    .select(
      "id,name,description,color,created_at,updated_at,user_id,has_budget,target_amount,current_amount",
      { count: "exact" }
    )
    // 🔥 CHỈ LẤY has_budget = true
    .eq("has_budget", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  const q = search.trim();
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []) as CategoryExpense[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}
