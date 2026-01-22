import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

const USERS_TABLE = "users";
const TOKEN_TABLE = "password-reset-tokens";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || String(password).length < 6) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    // Tìm token
    const { data: row } = await supabase
      .from(TOKEN_TABLE)
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (!row)
      return NextResponse.json(
        { error: "Token không hợp lệ" },
        { status: 400 }
      );

    // Hết hạn?
    if (Date.now() > new Date(row.expires_at).getTime()) {
      await supabase.from(TOKEN_TABLE).delete().eq("id", row.id);
      return NextResponse.json({ error: "Token đã hết hạn" }, { status: 400 });
    }

    // Cập nhật password
    const hash = await bcrypt.hash(password, 10);
    const { error: upErr } = await supabase
      .from(USERS_TABLE)
      .update({ password: hash, updated_at: new Date().toISOString() })
      .eq("email", row.email);

    if (upErr) {
      console.error(upErr);
      return NextResponse.json(
        { error: "Không thể cập nhật mật khẩu" },
        { status: 500 }
      );
    }

    // Xoá token
    await supabase.from(TOKEN_TABLE).delete().eq("id", row.id);

    return NextResponse.json(
      { message: "Đổi mật khẩu thành công" },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi không xác định" }, { status: 500 });
  }
}
