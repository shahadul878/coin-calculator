"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-slate-200/80 bg-white shadow-premium text-slate-900 font-sans",
        },
      }}
    />
  );
}
