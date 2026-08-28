"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "bg-white border border-slate-200 text-slate-900",
        },
      }}
    />
  );
}
