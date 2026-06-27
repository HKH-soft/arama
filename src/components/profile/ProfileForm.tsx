"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface ProfileFormProps {
  initialData: {
    name: string | null;
    bio: string | null;
    phone: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [name, setName] = useState(initialData.name || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "خطا در ذخیره", variant: "destructive" });
        return;
      }
      toast({ title: "پروفایل با موفقیت ذخیره شد" });
    } catch {
      toast({ title: "خطا در اتصال به سرور", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">نام</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام شما" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">شماره تلفن</label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="09123456789"
          dir="ltr"
          className="text-left"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">بیوگرافی</label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="درباره خود بنویسید..."
          maxLength={500}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">{bio.length}/500</p>
      </div>
      <Button type="submit" disabled={isLoading} className="gap-2">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        ذخیره تغییرات
      </Button>
    </form>
  );
}
