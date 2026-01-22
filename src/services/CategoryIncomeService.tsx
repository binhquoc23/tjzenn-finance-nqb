import { supabase } from "@/lib/supabaseClient";

export type CategoryIncome = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;

  created_at: string | null;
  updated_at: string | null;
};

export type NewCategoryIncome = {
  name: string;
  description?: string | null;
  color?: string | null; // thêm màu
  user_id: string;
};

export type GetCategoryIncomesParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function createCategoryIncome(payload: NewCategoryIncome) {
  const name = payload.name.trim();
  const description = payload.description?.trim() || null;
  const color = payload.color || null;
  const user_id = payload.user_id || null;

  const { data, error } = await supabase
    .from("category-income")
    .insert([{ name, description, color, user_id }])
    .select("id,name,description,color,created_at,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as CategoryIncome;
}

export async function getCategoryIncomes({
  page = 1,
  pageSize = 10,
  search = "",
  user_id,
}: GetCategoryIncomesParams & { user_id: string }) {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  // sanitize
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("category-income")
    .select("id,name,description,color,created_at,updated_at,user_id", {
      count: "exact",
    })
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  // lọc theo search nếu có
  const q = search.trim();
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []) as CategoryIncome[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

export async function getCategoryIncomesAdmin({
  page = 1,
  pageSize = 10,
  search = "",
}: GetCategoryIncomesParams = {}) {
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(200, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("category-income")
    .select("id,name,description,color,created_at,updated_at,user_id", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  const q = search.trim();
  if (q) query = query.ilike("name", `%${q}%`);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []) as CategoryIncome[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

// ----- READ (ADMIN/ALL) - LIST ALL categories (no user_id)
export async function getAllCategoryIncomes({
  page = 1,
  pageSize = 200,
  search = "",
}: GetCategoryIncomesParams = {}) {
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(1000, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("category-income")
    .select("id,name,description,color,created_at,updated_at,user_id", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  const q = (search || "").trim();
  if (q) query = query.ilike("name", `%${q}%`);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []) as CategoryIncome[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

export type UpdateCategoryIncome = {
  name?: string;
  description?: string | null;
  color?: string | null;
};

// ----- hàm update theo id
export async function updateCategoryIncome(
  id: number,
  payload: UpdateCategoryIncome
) {
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

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("category-income")
    .update(updates)
    .eq("id", id)
    .select("id,name,description,color,created_at,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as CategoryIncome;
}

export async function deleteCategoryIncome(id: number) {
  const { error } = await supabase
    .from("category-income")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}
