import { Outlet, ScrollRestoration } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";
import { MobileTabBar } from "../components/MobileTabBar";

export function Layout() {
  return (
    <div className="min-h-screen bg-ink-950 text-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* مساحة أسفل المحتوى حتى لا يغطّي شريط الجوال آخر الصفحة */}
      <div className="pb-[4.5rem] md:pb-0">
        <Footer />
      </div>
      <FloatingWhatsApp />
      <MobileTabBar />
      <ScrollRestoration />
    </div>
  );
}
