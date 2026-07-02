import { Outlet } from "react-router";
import { HakawatiHeader } from "./HakawatiHeader";

export function HakawatiLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <HakawatiHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
