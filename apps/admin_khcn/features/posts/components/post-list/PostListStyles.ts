import {
  FileEdit, Send, Activity, CheckCircle2,
  EyeOff, FileText, X, ShieldAlert, FileMinus
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
  icon: LucideIcon;
}

export function getStatusStyle(code: string): StatusStyle {
  switch (code) {
    case "DRAFT":
      return {
        bg: "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800",
        text: "text-slate-600 dark:text-slate-400",
        dot: "bg-slate-400",
        icon: FileEdit
      };
    case "SUBMITTED":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-100/50 dark:border-amber-900/30",
        text: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500",
        icon: Send
      };
    case "UNDER_REVIEW":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-100/50 dark:border-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-500 animate-pulse",
        icon: Activity
      };
    case "APPROVED":
      return {
        bg: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100/50 dark:border-cyan-900/30",
        text: "text-cyan-700 dark:text-cyan-400",
        dot: "bg-cyan-500",
        icon: CheckCircle2
      };
    case "REJECTED":
      return {
        bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-100/50 dark:border-rose-900/30",
        text: "text-rose-700 dark:text-rose-400",
        dot: "bg-rose-500",
        icon: X
      };
    case "PUBLISHED":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse",
        icon: CheckCircle2
      };
    case "UNPUBLISHED":
      return {
        bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-100/50 dark:border-orange-900/30",
        text: "text-orange-700 dark:text-orange-400",
        dot: "bg-orange-500",
        icon: EyeOff
      };
    case "ARCHIVED":
      return {
        bg: "bg-gray-50 dark:bg-gray-950/40 border-gray-200 dark:border-gray-800",
        text: "text-gray-600 dark:text-gray-400",
        dot: "bg-gray-400",
        icon: FileText
      };
    default:
      return {
        bg: "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800",
        text: "text-slate-600 dark:text-slate-400",
        dot: "bg-slate-400",
        icon: ShieldAlert
      };
  }
}
