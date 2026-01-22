import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: Msg[] = body?.messages;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing messages[]" },
        { status: 400 }
      );
    }

    // Gemini expects "contents" with role + parts
    const contents = [
      // system instruction có thể đưa vào dạng user message đầu,
      // hoặc dùng systemInstruction nếu SDK hỗ trợ version của anh.
      {
        role: "user",
        parts: [
          {
            text: "Bạn là trợ lý trên website quản lý đầu tư. Trả lời ngắn gọn, tiếng Việt. Nếu thiếu dữ liệu thì hỏi lại 1-2 câu.",
          },
        ],
      },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    // Docs quickstart dùng generateContent với model gemini-2.5-flash :contentReference[oaicite:9]{index=9}
    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    return NextResponse.json({ text: resp.text ?? "" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
