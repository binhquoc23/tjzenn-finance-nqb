// src/services/BudgetService.ts
import { supabase } from "@/lib/supabaseClient";

/** -------- Types -------- */
export type BudgetCategory = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
  user_id?: string | null;

  has_budget: true;
  target_amount: number;
  current_amount: number;
};

export type NewBudgetCategory = {
  name: string;
  description?: string | null;
  color?: string | null;
  user_id: string;
  target_amount: number; // >= 0
  current_amount?: number; // default 0
};

export type GetBudgetCategoriesParams = {
  user_id: string;
  page?: number;
  pageSize?: number;
  search?: string;
};

export type UpdateBudgetCategory = {
  name?: string;
  description?: string | null;
  color?: string | null;

  // ngân sách
  target_amount?: number; // >= 0
  current_amount?: number; // >= 0 (đặt trực tiếp)
  has_budget?: boolean; // cho phép tắt/bật nếu cần
};

/** -------- Internal helpers -------- */
const TABLE = "category-expenses";
const SELECT =
  "id,name,description,color,created_at,updated_at,user_id,has_budget,target_amount,current_amount";

function clampInt(n: number, min = 0) {
  return Math.max(min, Math.floor(n));
}

/** -------- Create -------- */
export async function createBudgetCategory(payload: NewBudgetCategory) {
  const name = payload.name.trim();
  if (!name) throw new Error("Tên danh mục không được để trống");

  const description = payload.description?.trim() || null;
  const color = payload.color || null;
  const user_id = payload.user_id || null;

  const target = clampInt(payload.target_amount, 0);
  const current = clampInt(payload.current_amount ?? 0, 0);
  if (current > target) {
    throw new Error("current_amount không được lớn hơn target_amount");
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        name,
        description,
        color,
        user_id,
        has_budget: true,
        target_amount: target,
        current_amount: current,
      },
    ])
    .select(SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as BudgetCategory;
}

/** -------- List / Search (chỉ ngân sách) -------- */
export async function getBudgetCategories({
  user_id,
  page = 1,
  pageSize = 10,
  search = "",
}: GetBudgetCategoriesParams) {
  if (!user_id) throw new Error("user_id is required");

  page = Math.max(1, Math.floor(page));
  pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select(SELECT, { count: "exact" })
    .eq("user_id", user_id)
    .eq("has_budget", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  const q = search.trim();
  if (q) query = query.ilike("name", `%${q}%`);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []) as BudgetCategory[],
    total,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

/** -------- Update thông tin & ngân sách -------- */
export async function updateBudgetCategory(
  id: number,
  payload: UpdateBudgetCategory
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
      throw new Error("Mã màu không hợp lệ. Dùng dạng #RRGGBB");
    }
    updates.color = color;
  }
  if (payload.has_budget !== undefined) {
    updates.has_budget = !!payload.has_budget;
  }
  if (payload.target_amount !== undefined) {
    updates.target_amount = clampInt(payload.target_amount, 0);
  }
  if (payload.current_amount !== undefined) {
    updates.current_amount = clampInt(payload.current_amount, 0);
  }
  if (Object.keys(updates).length === 0) {
    throw new Error("Không có dữ liệu để cập nhật");
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .eq("has_budget", true) // đảm bảo chỉ chạm vào danh mục ngân sách
    .select(SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as BudgetCategory;
}

/** -------- Xoá danh mục ngân sách -------- */
export async function deleteBudgetCategory(id: number) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("has_budget", true);

  if (error) throw new Error(error.message);
  return true;
}

export async function adjustBudgetCurrentAmount(id: number, delta: number) {
  const d = Math.floor(delta);
  if (!Number.isFinite(d) || d === 0) {
    return null;
  }

  // Đọc thông tin hiện tại
  const { data, error } = await supabase
    .from(TABLE)
    .select("has_budget,current_amount,target_amount")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null; // không tìm thấy

  if (!data.has_budget) {
    // không phải ngân sách thì bỏ qua
    return null;
  }

  const current = Number(data.current_amount ?? 0);
  const target =
    data.target_amount !== null && data.target_amount !== undefined
      ? Number(data.target_amount)
      : null;

  let next = current + d;

  if (next < 0) next = 0;
  if (target !== null && Number.isFinite(target) && next > target) {
    next = target;
  }

  const { data: updated, error: updError } = await supabase
    .from(TABLE)
    .update({
      current_amount: next,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(SELECT)
    .single();

  if (updError) throw new Error(updError.message);
  return updated as BudgetCategory;
}
