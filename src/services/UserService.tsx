// src/services/UserService.ts
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type NewUser = {
  name: string;
  email: string;
  password: string;
  role?: string | null;
};

export type UpdateUser = {
  name?: string;
  email?: string;
  password?: string; // hash nếu update password
  role?: string | null;
};

const TABLE = "users";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** LIST (pagination + search) */
export async function getUsers(params: {
  page: number;
  pageSize: number;
  search?: string;
  role?: string; // optional filter
}) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(200, Math.max(1, params.pageSize || 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select("id,name,email,role,created_at,updated_at", { count: "exact" });

  const q = (params.search || "").trim().toLowerCase();
  if (q) {
    // tìm theo name/email
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  if (params.role) {
    query = query.eq("role", params.role);
  }

  const { data, error, count } = await query
    .order("id", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []) as User[],
    total,
    totalPages,
    page,
    pageSize,
  };
}

/** CREATE */
export async function createUser(payload: NewUser) {
  const name = payload.name?.trim();
  if (!name) throw new Error("Tên người dùng không được để trống");

  const email = payload.email?.trim().toLowerCase();
  if (!email || !isValidEmail(email)) throw new Error("Email không hợp lệ");

  if (!payload.password?.trim())
    throw new Error("Mật khẩu không được để trống");

  const { data: existingUser, error: checkError } = await supabase
    .from(TABLE)
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (checkError) throw new Error("Không thể kiểm tra email, thử lại sau");
  if (existingUser) throw new Error("Email đã được sử dụng");

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const role = payload.role ?? "user";

  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ name, email, password: hashedPassword, role }])
    .select("id,name,email,role,created_at,updated_at")
    .single();

  if (error) {
    if (error.message && error.message.toLowerCase().includes("duplicate")) {
      throw new Error("Email đã được sử dụng");
    }
    throw new Error(error.message);
  }

  return data as User;
}

/** READ BY ID */
export async function getUserById(id: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id,name,email,role,created_at,updated_at")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as User;
}

/** UPDATE */
export async function updateUser(id: number, payload: UpdateUser) {
  const updates: Record<string, any> = {};

  if (payload.name !== undefined) {
    const name = payload.name.trim();
    if (!name) throw new Error("Tên người dùng không được để trống");
    updates.name = name;
  }

  if (payload.email !== undefined) {
    const email = payload.email.trim().toLowerCase();
    if (!email || !isValidEmail(email)) throw new Error("Email không hợp lệ");
    updates.email = email;
  }

  if (payload.password !== undefined) {
    const password = payload.password.trim();
    if (!password) throw new Error("Mật khẩu không được để trống");
    updates.password = password; // NOTE: nên là hash
  }

  if (payload.role !== undefined) {
    updates.role = payload.role ?? null;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("Không có dữ liệu để cập nhật");
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select("id,name,email,role,created_at,updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data as User;
}

/** DELETE */
export async function deleteUser(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
