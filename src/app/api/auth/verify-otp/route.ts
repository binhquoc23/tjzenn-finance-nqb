import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const OTP_TABLE = "password-reset-otps";
const TOKEN_TABLE = "password-reset-tokens";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    const normEmail = String(email || "")
      .trim()
      .toLowerCase();
    const code = String(otp || "").trim();

    // Lấy OTP mới nhất theo email
    const { data: row } = await supabase
      .from(OTP_TABLE)
      .select("*")
      .eq("email", normEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Trả chung 400 để không lộ logic
    if (!row)
      return NextResponse.json({ error: "OTP không hợp lệ" }, { status: 400 });

    // Hết hạn?
    if (Date.now() > new Date(row.expires_at).getTime()) {
      await supabase.from(OTP_TABLE).delete().eq("id", row.id);
      return NextResponse.json({ error: "OTP đã hết hạn" }, { status: 400 });
    }

    // Quá số lần thử?
    if ((row.attempts ?? 0) >= 5) {
      await supabase.from(OTP_TABLE).delete().eq("id", row.id);
      return NextResponse.json(
        { error: "OTP đã bị khóa. Vui lòng yêu cầu mã mới." },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(code, row.otp_hash);
    if (!ok) {
      await supabase
        .from(OTP_TABLE)
        .update({ attempts: (row.attempts ?? 0) + 1 })
        .eq("id", row.id);
      return NextResponse.json({ error: "OTP không hợp lệ" }, { status: 400 });
    }

    // Đúng OTP → tạo reset_token 10 phút
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insErr } = await supabase.from(TOKEN_TABLE).insert([
      {
        email: normEmail,
        token,
        expires_at: expiresAt,
      },
    ]);
    if (insErr) {
      console.error(insErr);
      return NextResponse.json(
        { error: "Không thể tạo token" },
        { status: 500 }
      );
    }

    // Xóa OTP sau khi dùng
    await supabase.from(OTP_TABLE).delete().eq("id", row.id);

    // Trả về URL new-password
    return NextResponse.json({
      redirect: `${process.env.NEXT_PUBLIC_URL}/new-password?token=${token}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi không xác định" }, { status: 500 });
  }
}
