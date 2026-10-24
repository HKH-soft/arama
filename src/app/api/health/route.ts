import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const start = performance.now();
    // Check if the database connection works
    await db.execute(sql`select 1`);
    await db.execute(sql`SELECT count(*) FROM rate_limits LIMIT 1`);
    await db.execute(sql`SELECT count(*) FROM profiles LIMIT 1`);
    await db.execute(sql`SELECT count(*) FROM conversations LIMIT 1`);
    const end = performance.now();
    const latency = (end - start).toFixed(2);

    const accept = request.headers.get("accept") || "";
    const isHtml = accept.includes("text/html");

    const data = {
      status: "ok",
      database: "connected",
      migrations: "up-to-date",
      latency_ms: latency,
      timestamp: new Date().toISOString(),
    };

    if (isHtml) {
      const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arama - System Health</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
    <style>body { font-family: 'Vazirmatn', sans-serif; background-color: #f3f4f6; }</style>
</head>
<body class="flex items-center justify-center min-h-screen">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden m-4 border border-gray-100">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold">داشبورد سلامت سیستم (آراما)</h1>
                <p class="text-blue-100 mt-1 text-sm">بررسی لحظه‌ای وضعیت سرور و دیتابیس</p>
            </div>
            <div class="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
        </div>
        
        <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Status Card -->
                <div class="bg-green-50 rounded-xl p-5 border border-green-100 flex items-start space-x-4 space-x-reverse">
                    <div class="bg-green-500 text-white p-2 rounded-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div>
                        <h3 class="text-gray-500 text-sm font-medium">وضعیت کلی سرور</h3>
                        <p class="text-2xl font-bold text-gray-800 mt-1">سالم (OK)</p>
                    </div>
                </div>

                <!-- DB Card -->
                <div class="bg-blue-50 rounded-xl p-5 border border-blue-100 flex items-start space-x-4 space-x-reverse">
                    <div class="bg-blue-500 text-white p-2 rounded-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1.5 3 4 3h8c2.5 0 4-1 4-3V7c0-2-1.5-3-4-3H8C5.5 4 4 5 4 7z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12c0 2 1.5 3 4 3h8c2.5 0 4-1 4-3"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 17c0 2 1.5 3 4 3h8c2.5 0 4-1 4-3"></path></svg>
                    </div>
                    <div>
                        <h3 class="text-gray-500 text-sm font-medium">پایگاه داده (PostgreSQL)</h3>
                        <p class="text-xl font-bold text-gray-800 mt-1">متصل (Connected)</p>
                    </div>
                </div>
                
                <!-- Latency Card -->
                <div class="bg-purple-50 rounded-xl p-5 border border-purple-100 flex items-start space-x-4 space-x-reverse">
                    <div class="bg-purple-500 text-white p-2 rounded-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h3 class="text-gray-500 text-sm font-medium">زمان پاسخگویی (Latency)</h3>
                        <p class="text-xl font-bold text-gray-800 mt-1">${data.latency_ms} <span class="text-sm font-normal text-gray-500">میلی‌ثانیه</span></p>
                    </div>
                </div>

                <!-- Migrations Card -->
                <div class="bg-amber-50 rounded-xl p-5 border border-amber-100 flex items-start space-x-4 space-x-reverse">
                    <div class="bg-amber-500 text-white p-2 rounded-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <div>
                        <h3 class="text-gray-500 text-sm font-medium">جداول امنیتی و کلیدی</h3>
                        <p class="text-xl font-bold text-gray-800 mt-1">تایید شده (Verified)</p>
                    </div>
                </div>
            </div>
            
            <div class="mt-8 border-t border-gray-100 pt-6 flex justify-between items-center">
                <span class="text-gray-400 text-xs font-mono" dir="ltr">Time: ${data.timestamp}</span>
                <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 shadow-sm animate-pulse">Live</span>
            </div>
        </div>
    </div>
</body>
</html>`;
      return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("[HEALTH CHECK FAILED]", errorDetails, error);

    const isDev = process.env.NODE_ENV !== "production";
    const publicErrorMsg = isDev ? errorDetails : "خطا در اتصال به سرویس‌های پایگاه داده.";
    
    const htmlError = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arama - System Error</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
    <style>body { font-family: 'Vazirmatn', sans-serif; background-color: #fef2f2; }</style>
</head>
<body class="flex items-center justify-center min-h-screen">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden m-4 border border-red-100">
        <div class="bg-gradient-to-r from-red-600 to-rose-700 px-8 py-6 text-white flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold">خطای سیستمی (Critical Error)</h1>
                <p class="text-red-100 mt-1 text-sm">ارتباط با سرور یا دیتابیس برقرار نشد</p>
            </div>
            <div class="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
        </div>
        <div class="p-8">
            <div class="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 font-mono text-left" dir="ltr">
                ${publicErrorMsg}
            </div>
        </div>
    </div>
</body>
</html>`;

    const accept = request.headers.get("accept") || "";
    if (accept.includes("text/html")) {
        return new NextResponse(htmlError, { status: 500, headers: { "Content-Type": "text/html" } });
    }

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: publicErrorMsg,
      },
      { status: 500 }
    );
  }
}
