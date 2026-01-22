import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

const USERS_TABLE = "users";
const PENDING_TABLE = "pending-user-tokens";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Tên người dùng không được để trống" },
        { status: 400 }
      );
    }

    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    if (!password?.trim() || password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu tối thiểu 6 ký tự" },
        { status: 400 }
      );
    }

    const normEmail = email.trim().toLowerCase();

    // 1. Check email đã có user active chưa?
    {
      const { data: existingUser, error: checkExistingErr } = await supabase
        .from(USERS_TABLE)
        .select("id")
        .eq("email", normEmail)
        .maybeSingle();

      if (checkExistingErr) {
        return NextResponse.json(
          { error: "Không thể kiểm tra email, thử lại sau" },
          { status: 500 }
        );
      }

      if (existingUser) {
        return NextResponse.json(
          {
            error: "Email này đã được kích hoạt trước đó. Vui lòng đăng nhập.",
          },
          { status: 409 }
        );
      }
    }

    // 2. Check email đang pending chưa kích hoạt (token còn hạn)?
    {
      const { data: pendingRow, error: pendingErr } = await supabase
        .from(PENDING_TABLE)
        .select("id, expires_at")
        .eq("email", normEmail)
        .order("expires_at", { ascending: false }) // lấy cái mới nhất
        .limit(1)
        .maybeSingle();

      if (pendingErr) {
        return NextResponse.json(
          { error: "Không thể kiểm tra trạng thái xác nhận email" },
          { status: 500 }
        );
      }

      if (pendingRow) {
        const expiresAtMs = new Date(pendingRow.expires_at).getTime();
        const now = Date.now();

        if (now < expiresAtMs) {
          // VẪN CÒN HIỆU LỰC → KHÔNG CHO TẠO LẠI
          return NextResponse.json(
            {
              error:
                "Email này đã được đăng ký và đang chờ xác nhận. Vui lòng kiểm tra hộp thư.",
            },
            { status: 409 }
          );
        } else {
          // Token cũ hết hạn rồi → dọn rác token cũ cho sạch để tạo token mới
          await supabase.from(PENDING_TABLE).delete().eq("id", pendingRow.id);
        }
      }
    }

    // 3. Tới đây thì: email chưa active + chưa có pending hợp lệ
    const passwordHash = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // +5 phút
    const createdAt = new Date().toISOString();

    const { error: insertPendingErr } = await supabase
      .from(PENDING_TABLE)
      .insert([
        {
          email: normEmail,
          name: name.trim(),
          password_hash: passwordHash,
          token,
          expires_at: expiresAt,
          created_at: createdAt,
        },
      ]);

    if (insertPendingErr) {
      console.error("insertPendingErr", insertPendingErr);
      return NextResponse.json(
        { error: "Không thể tạo phiên xác thực" },
        { status: 500 }
      );
    }

    const confirmUrl = `${process.env.NEXT_PUBLIC_URL}/api/auth/confirm?token=${token}`;

    await sendVerificationEmail({
      to: normEmail,
      subject: "Xác nhận đăng ký tài khoản",
      html: `
        <p>Chào ${name},</p>
        <p>Nhấp vào link bên dưới để kích hoạt tài khoản. Link sẽ hết hạn sau 5 phút:</p>
        <p><a href="${confirmUrl}">${confirmUrl}</a></p>
        <p>Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.</p>
      `,
    });

    return NextResponse.json(
      {
        message:
          "Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư trong vòng 5 phút để kích hoạt tài khoản.",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi không xác định" }, { status: 500 });
  }
}
