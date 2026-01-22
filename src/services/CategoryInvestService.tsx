import { supabase } from "@/lib/supabaseClient";

export type CategoryInvest = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;

  created_at: string | null;
  updated_at: string | null;
};

export type NewCategoryInvest = {
  name: string;
  description?: string | null;
  color?: string | null; // thêm màu
  user_id: string;
};

export type GetCategoryInvestsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function createCategoryInvest(payload: NewCategoryInvest) {
  const name = payload.name.trim();
  const description = payload.description?.trim() || null;
  const color = payload.color || null;
  const user_id = payload.user_id || null;

  const { data, error } = await supabase
    .from("category-invest")
    .insert([{ name, description, color, user_id }])
    .select("id,name,description,color,created_at,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as CategoryInvest;
}

export async function getCategoryInvests({
  page = 1,
  pageSize = 10,
  search = "",
  user_id,
}: GetCategoryInvestsParams & { user_id: string }) {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  // sanitize
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("category-invest")
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
    items: (data ?? []) as CategoryInvest[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

export type UpdateCategoryInvest = {
  name?: string;
  description?: string | null;
  color?: string | null;
};

// ----- hàm update theo id
export async function updateCategoryInvest(
  id: number,
  payload: UpdateCategoryInvest
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
    .from("category-invest")
    .update(updates)
    .eq("id", id)
    .select("id,name,description,color,created_at,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as CategoryInvest;
}

export async function deleteCategoryInvest(id: number) {
  const { error } = await supabase
    .from("category-invest")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}

// ===== ADMIN/ALL: lấy tất cả category-invest (không lọc user_id) =====
export async function getAllCategoryInvests({
  page = 1,
  pageSize = 200,
  search = "",
}: GetCategoryInvestsParams = {}) {
  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(1000, Math.max(1, Math.floor(pageSize)));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("category-invest")
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
    items: (data ?? []) as CategoryInvest[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}
