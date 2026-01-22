import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const USERS_TABLE = "users";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;
    const { oldPassword, newPassword } = await req.json();

    if (
      !oldPassword ||
      !newPassword ||
      typeof oldPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // Lấy user hiện tại để kiểm tra mật khẩu cũ
    const { data: user, error: userErr } = await supabase
      .from(USERS_TABLE)
      .select("id,password,email")
      .eq("id", userId)
      .maybeSingle();

    if (userErr) {
      console.error("change-password: fetch user error", userErr);
      return NextResponse.json(
        { error: "Không lấy được thông tin người dùng" },
        { status: 500 }
      );
    }

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Tài khoản không tồn tại hoặc chưa thiết lập mật khẩu" },
        { status: 400 }
      );
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return NextResponse.json(
        { error: "Mật khẩu cũ không đúng" },
        { status: 400 }
      );
    }

    // Hash mật khẩu mới
    const hash = await bcrypt.hash(newPassword, 10);

    const { error: upErr } = await supabase
      .from(USERS_TABLE)
      .update({
        password: hash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (upErr) {
      console.error("change-password: update error", upErr);
      return NextResponse.json(
        { error: "Không thể cập nhật mật khẩu" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Đổi mật khẩu thành công" },
      { status: 200 }
    );
  } catch (e) {
    console.error("change-password: unexpected error", e);
    return NextResponse.json({ error: "Lỗi không xác định" }, { status: 500 });
  }
}
