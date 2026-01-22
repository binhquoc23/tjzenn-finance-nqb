// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // 1. Đăng nhập thủ công (email/password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu");
        }

        const { data, error } = await supabase
          .from("users")
          .select("id, email, name, password, role")
          .eq("email", credentials.email.toLowerCase())
          .single();

        if (error || !data) throw new Error("Tài khoản không tồn tại");

        if (!data.password) {
          throw new Error("Mật khẩu không đúng");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          data.password
        );

        if (!isValid) throw new Error("Mật khẩu không đúng");

        return {
          id: data.id.toString(),
          email: data.email,
          name: data.name,
          role: data.role,
        };
      },
    }),

    // 2. Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 3. GitHub OAuth
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // nếu là đăng nhập qua credentials thì cho qua luôn
      if (account?.provider === "credentials") {
        return true;
      }

      // Xử lý cả google lẫn github
      if (account?.provider === "google" || account?.provider === "github") {
        const emailRaw =
          user.email ||
          (profile as any)?.email ||
          (profile as any)?.login + "@users.noreply.github.com";

        const email = emailRaw?.toLowerCase()?.trim();
        const displayName =
          user.name ||
          (profile as any)?.name ||
          (profile as any)?.login ||
          "Người dùng";

        if (!email) {
          console.error(
            "OAuth login không trả email. (GitHub có thể ẩn email)"
          );
          return false;
        }

        const { data: existingUser, error: checkErr } = await supabase
          .from("users")
          .select("id, email, name, role")
          .eq("email", email)
          .single();

        const notFound = checkErr && checkErr.code === "PGRST116";

        if (checkErr && !notFound) {
          console.error("Lỗi kiểm tra user:", checkErr);
          return false;
        }

        if (!existingUser && notFound) {
          const { error: insertErr } = await supabase.from("users").insert([
            {
              name: displayName,
              email: email,
              password: null,
              role: "user",
            },
          ]);

          if (insertErr) {
            console.error("Lỗi tạo user mới khi login OAuth:", insertErr);
            return false;
          }
        }

        return true;
      }

      return true;
    },

    async jwt({ token, user, account, profile }) {
      // Khi login bằng credentials
      if (user) {
        token.id = (user as any).id || token.id;
        token.name = user.name || token.name;
        token.email = user.email || token.email;
        (token as any).role = (user as any).role || (token as any).role;
      }

      // Khi login bằng Google hoặc GitHub -> fill thêm info từ DB
      if (
        (account?.provider === "google" || account?.provider === "github") &&
        token.email
      ) {
        const { data: row, error } = await supabase
          .from("users")
          .select("id, name, email, role")
          .eq("email", token.email.toLowerCase())
          .single();

        if (!error && row) {
          token.id = row.id.toString();
          token.name = row.name;
          token.email = row.email;
          (token as any).role = row.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        if (!session.user) {
          (session as any).user = {};
        }
        (session.user as any).id = token.id;
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? null;
        (session.user as any).role = (token as any).role ?? null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
