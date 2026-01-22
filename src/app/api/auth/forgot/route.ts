// src/app/api/auth/forgot/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mailer";

const USERS_TABLE = "users";
const OTP_TABLE = "password-reset-otps";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!isValidEmail(normEmail)) {
      return NextResponse.json(
        { exists: false, message: "Email không hợp lệ" },
        { status: 200 }
      );
    }

    //  Cách chắc ăn: lấy tối đa 1 record rồi check độ dài
    const { data: found, error: existErr } = await supabase
      .from(USERS_TABLE)
      .select("id")
      .eq("email", normEmail)
      .limit(1);

    if (existErr) {
      console.error("existErr", existErr);
      return NextResponse.json(
        { exists: false, message: "Có lỗi xảy ra, thử lại sau" },
        { status: 200 }
      );
    }

    if (!found || found.length === 0) {
      //  Chưa đăng ký → KHÔNG insert OTP, KHÔNG gửi mail
      return NextResponse.json(
        { exists: false, message: "Email này chưa được đăng ký" },
        { status: 200 }
      );
    }

    // Dọn rác OTP hết hạn
    await supabase
      .from(OTP_TABLE)
      .delete()
      .lt("expires_at", new Date().toISOString());

    // Tạo OTP 6 số + hash + TTL 10'
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insErr } = await supabase.from(OTP_TABLE).insert([
      {
        email: normEmail,
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
      },
    ]);

    if (insErr) {
      console.error("insErr", insErr);
      return NextResponse.json(
        { exists: true, sent: false, message: "Gửi OTP thất bại, thử lại sau" },
        { status: 200 }
      );
    }

    // Gửi email THẬT
    await sendVerificationEmail({
      to: normEmail,
      subject: "Mã OTP đặt lại mật khẩu",
      html: `
        <p>Xin chào,</p>
        <p>Mã OTP đặt lại mật khẩu của bạn là:</p>
        <h2 style="font-size:22px; letter-spacing:2px;">${otp}</h2>
        <p>Mã có hiệu lực trong 10 phút. Nếu không phải bạn yêu cầu, vui lòng bỏ qua.</p>
      `,
    });

    return NextResponse.json(
      { exists: true, sent: true, message: "OTP đã được gửi" },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { exists: false, message: "Có lỗi xảy ra, thử lại sau" },
      { status: 200 }
    );
  }
}
