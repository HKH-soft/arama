import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-background"
      dir="rtl"
    >
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-foreground">
              ۴۰۴ - صفحه یافت نشد
            </h1>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            صفحه مورد نظر وجود ندارد.
          </p>
          <Link
            href="/"
            className="text-primary hover:underline mt-4 inline-block text-sm"
          >
            بازگشت به صفحه اصلی
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
