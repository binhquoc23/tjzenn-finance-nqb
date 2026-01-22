// app/loading.tsx
"use client";
import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      <Loader2 className="animate-spin w-6 h-6 mr-2" />
    </div>
  );
}
