"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { signOut } from "@/lib/auth-client";

export function Navbar({ user: initialUser }: { user: { id: string; name?: string | null; email?: string | null; image?: string | null; avatarUrl?: string | null } | null }) {
  const { user } = useUser();
  const effectiveUser = user || initialUser;
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const navLinks = [
    { name: "امکانات", href: "/#features" },
    { name: "قیمت‌گذاری", href: "/#pricing" },
    { name: "درباره ما", href: "/about" },
    { name: "وبلاگ", href: "/blog" },
    { name: "تماس", href: "/contact" },
  ];

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl"
      dir="rtl"
    >
      {/* Main glass bar */}
      <div className=" relative rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.42)]">
        {/* Apple Premium Glass Base Layer */}
        <div className="absolute inset-0 rounded-2xl bg-background/90 dark:bg-neutral-900/[0.45] backdrop-blur-[32px] saturate-[210%] transition-colors duration-300" />

        {/* Liquid Fluid Gloss/Sheen Surface Injection */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none bg-linear-to-b from-white/35 dark:from-white/8 via-white/[0.03] dark:via-transparent to-transparent" />

        {/* Dynamic Micro-Refraction Borders (Crisp Specular Edge Highlight) */}
        <div className="absolute inset-0 rounded-2xl border-0 pointer-events-none mix-blend-overlay dark:mix-blend-normal" />
        <div className="absolute inset-0 rounded-2xl border-t border-x border-white/60 dark:border-white/[0.12] pointer-events-none" />

        {/* Content */}
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
                آ
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground transition-colors">
                آراما
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-neutral-600 dark:text-neutral-300 hover:bg-neutral-950/5 dark:hover:bg-white/10 rounded-xl"
                aria-label="تغییر تم"
              >
                {mounted && theme === "dark" ? (
                  <Sun className="w-4.5 h-4.5" />
                ) : (
                  <Moon className="w-4.5 h-4.5" />
                )}
              </Button>
              {user ? (
                <>
                  <Link href="/profile" className="flex items-center">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={
                          effectiveUser?.avatarUrl || effectiveUser?.image || ""
                        }
                      />
                      <AvatarFallback className="bg-primary/30 text-primary text-[10px] font-bold">
                        {effectiveUser?.name
                          ? effectiveUser.name.slice(0, 2)
                          : "کاربر"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <Button
                    variant="ghost"
                    className="rounded-full text-sm text-neutral-700 dark:text-neutral-200 border-0 hover:bg-neutral-950/5 dark:hover:bg-white/10 gap-2"
                    asChild
                  >
                    <Link href="/dashboard">داشبورد</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-neutral-600 dark:text-neutral-300 hover:bg-neutral-950/5 dark:hover:bg-white/10 rounded-xl"
                    title="خروج"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="rounded-full text-sm text-neutral-700 dark:text-neutral-200 border-0 hover:bg-neutral-950/5 dark:hover:bg-white/10"
                    asChild
                  >
                    <Link href="/login">ورود</Link>
                  </Button>
                  <Button
                    className="bg-primary rounded-full hover:bg-primary/80 text-white dark:text-black border-0 font-medium shadow-sm transition-all"
                    asChild
                  >
                    <Link href="/signup">شروع رایگان</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Action Trigger */}
            <div className="md:hidden flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-neutral-600 dark:text-neutral-300 rounded-xl"
                aria-label="تغییر تم"
              >
                {mounted && theme === "dark" ? (
                  <Sun className="w-4.5 h-4.5" />
                ) : (
                  <Moon className="w-4.5 h-4.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-neutral-800 dark:text-neutral-100 rounded-xl"
                aria-label={mobileMenuOpen ? "بستن منو" : "باز کردن منو"}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Glass Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden mt-2 rounded-2xl overflow-hidden relative shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.42)]"
          >
            {/* Fluid Glass Spec Overlay */}
            <div className="absolute inset-0 rounded-2xl bg-white/[0.55] dark:bg-neutral-900/[0.55] backdrop-blur-[32px] saturate-[210%]" />
            <div className="absolute inset-0 rounded-2xl border border-white/50 dark:border-neutral-800/60 pointer-events-none" />

            <div className="relative px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-base font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-950/5 dark:hover:bg-white/5 transition-all"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                {effectiveUser ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-center rounded-xl bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
                      asChild
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        داشبورد
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-center rounded-xl text-neutral-800 dark:text-neutral-200 hover:bg-neutral-950/5 dark:hover:bg-white/5"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="w-4 h-4 ml-2" />
                      خروج
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-center rounded-xl bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
                      asChild
                    >
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        ورود
                      </Link>
                    </Button>
                    <Button
                      className="w-full justify-center rounded-xl bg-primary hover:bg-primary/80 text-white dark:text-black border-0 font-medium shadow-sm transition-all"
                      asChild
                    >
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        شروع رایگان
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
