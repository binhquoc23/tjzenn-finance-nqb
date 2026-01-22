import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const USERS_TABLE = "users";
const PENDING_TABLE = "pending-user-tokens";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const baseUrl = process.env.NEXT_PUBLIC_URL; // ví dụ http://localhost:3000

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/activated?status=invalid`);
  }

  // 1. Lấy pending record
  const { data: pending, error: pendingErr } = await supabase
    .from(PENDING_TABLE)
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (pendingErr || !pending) {
    return NextResponse.redirect(`${baseUrl}/activated?status=invalid`);
  }

  // 2. Check hết hạn
  const now = Date.now();
  const expiresAtMs = new Date(pending.expires_at).getTime();
  if (now > expiresAtMs) {
    await supabase.from(PENDING_TABLE).delete().eq("id", pending.id);

    return NextResponse.redirect(
      `${baseUrl}/activated?status=expired&email=${encodeURIComponent(
        pending.email
      )}`
    );
  }

  // 3. Check email đã tồn tại chưa
  const { data: existingUser } = await supabase
    .from(USERS_TABLE)
    .select("id")
    .eq("email", pending.email)
    .maybeSingle();

  if (!existingUser) {
    // 4. Insert user chính thức
    const { error: insertUserErr } = await supabase.from(USERS_TABLE).insert([
      {
        name: pending.name,
        email: pending.email,
        password: pending.password_hash,
        role: "user",
      },
    ]);

    if (insertUserErr) {
      console.error("insertUserErr", insertUserErr);

      // trường hợp lỗi DB bất ngờ
      return NextResponse.redirect(
        `${baseUrl}/activated?status=error&email=${encodeURIComponent(
          pending.email
        )}`
      );
    }
  }

  // 5. Xoá token sau khi dùng (1 lần duy nhất)
  await supabase.from(PENDING_TABLE).delete().eq("id", pending.id);

  // 6. Redirect tới trang activated
  return NextResponse.redirect(
    `${baseUrl}/activated?status=success&email=${encodeURIComponent(
      pending.email
    )}`
  );
}
