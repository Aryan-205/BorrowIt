"use client";

import {
  PiCheckCircleFill,
  PiCircleNotch,
  PiInfoFill,
  PiWarningFill,
  PiXCircleFill,
} from "react-icons/pi";
import { Toaster as SonnerToaster, toast, type ToasterProps } from "sonner";

function SonnarRoot({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      theme="light"
      position="bottom-center"
      richColors
      closeButton
      className="toaster group"
      icons={{
        success: (
          <PiCheckCircleFill size={16} className="text-[#22C55E]" aria-hidden />
        ),
        info: <PiInfoFill size={16} className="text-[#2563EB]" aria-hidden />,
        warning: (
          <PiWarningFill size={16} className="text-[#F59E0B]" aria-hidden />
        ),
        error: <PiXCircleFill size={16} className="text-[#EF4444]" aria-hidden />,
        loading: (
          <PiCircleNotch size={16} className="animate-spin text-[#7E7576]" aria-hidden />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-lg !border !border-[#EEEEEE] !bg-white !text-black !shadow-[0_4px_12px_rgba(0,0,0,0.08)] font-sans",
          title: "text-sm font-semibold",
          description: "text-sm text-[#7E7576]",
          actionButton: "!bg-black !text-white !rounded-lg text-xs font-semibold",
          cancelButton: "!bg-[#F6F6F6] !text-[#7E7576] !rounded-lg text-xs font-semibold",
          closeButton: "!bg-white !text-[#7E7576] !border-[#EEEEEE]",
        },
      }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "8px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export const Sonnar = Object.assign(SonnarRoot, { toast });
export { toast };
