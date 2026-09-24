"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function GeneratingPage() {
  const router = useRouter();

  useEffect(() => {
    // Simulate processing time — sẽ thay bằng real API call khi Lan Anh kết nối
    const timer = setTimeout(() => {
      router.replace("/results");
    }, 6500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">
      <LoadingScreen stepMs={1200} />
    </main>
  );
}
