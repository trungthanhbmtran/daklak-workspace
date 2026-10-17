"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  AmaKeyMode,
  AmaKeySession,
  AmaKeyAction,
} from "./amakey-engine";

interface AmaKeyContextType {
  mode: AmaKeyMode;
  setMode: (mode: AmaKeyMode) => void;
  isVirtualKeyboardOpen: boolean;
  setIsVirtualKeyboardOpen: (open: boolean) => void;
  toggleVirtualKeyboard: () => void;
  isGuideOpen: boolean;
  setIsGuideOpen: (open: boolean) => void;
  toggleGuide: () => void;
  activeElement: HTMLInputElement | HTMLTextAreaElement | null;
  insertText: (text: string) => void;
  deleteBackwards: () => void;
}

const AmaKeyContext = createContext<AmaKeyContextType | null>(null);

const STORAGE_KEY = "amakey_typing_mode";
const DEFAULT_MODE: AmaKeyMode = "telexEde";

export function AmaKeyProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AmaKeyMode>(DEFAULT_MODE);
  const [isVirtualKeyboardOpen, setIsVirtualKeyboardOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const activeElementRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [activeElementState, setActiveElementState] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const sessionRef = useRef<AmaKeySession>(new AmaKeySession(DEFAULT_MODE));
  const theHeNguCanhRef = useRef<number>(0);

  // Khôi phục mode đã lưu trong localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AmaKeyMode | null;
      if (saved && ["off", "telexEde", "vniEde", "telexVi", "vniVi"].includes(saved)) {
        setModeState(saved);
        sessionRef.current.setMode(saved);
      }
    } catch {
      // Bỏ qua lỗi truy cập localStorage
    }
  }, []);

  const setMode = useCallback((newMode: AmaKeyMode) => {
    setModeState(newMode);
    sessionRef.current.setMode(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // Bỏ qua
    }
  }, []);

  const toggleVirtualKeyboard = useCallback(() => {
    setIsVirtualKeyboardOpen((prev) => !prev);
  }, []);

  const toggleGuide = useCallback(() => {
    setIsGuideOpen((prev) => !prev);
  }, []);

  // Chèn ký tự trực tiếp tại vị trí con trỏ chuột của ô nhập liệu đang focus
  const insertText = useCallback((text: string) => {
    const el = activeElementRef.current;
    if (!el) return;

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;

    // Sử dụng setRangeText hoặc native value setter để kích hoạt React onChange
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    const newValue = el.value.slice(0, start) + text + el.value.slice(end);

    if (el instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(el, newValue);
    } else if (el instanceof HTMLInputElement && nativeInputValueSetter) {
      nativeInputValueSetter.call(el, newValue);
    } else {
      el.value = newValue;
    }

    const nextPos = start + text.length;
    el.selectionStart = nextPos;
    el.selectionEnd = nextPos;

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.focus();
  }, []);

  // Xóa ký tự lùi (Backspace từ bàn phím ảo)
  const deleteBackwards = useCallback(() => {
    const el = activeElementRef.current;
    if (!el) return;

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;

    if (start === 0 && end === 0) return;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    let newValue = "";
    let nextPos = 0;

    if (start !== end) {
      // Xóa vùng bôi đen
      newValue = el.value.slice(0, start) + el.value.slice(end);
      nextPos = start;
    } else {
      // Xóa 1 ký tự trước con trỏ (tính cả ký tự kết hợp)
      newValue = el.value.slice(0, start - 1) + el.value.slice(start);
      nextPos = Math.max(0, start - 1);
    }

    if (el instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(el, newValue);
    } else if (el instanceof HTMLInputElement && nativeInputValueSetter) {
      nativeInputValueSetter.call(el, newValue);
    } else {
      el.value = newValue;
    }

    el.selectionStart = nextPos;
    el.selectionEnd = nextPos;

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.focus();
  }, []);

  // Theo dõi phần tử nhập liệu đang focus toàn cục trong HRM
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        // Bỏ qua các input không nhận ký tự gõ
        if (
          target instanceof HTMLInputElement &&
          ["file", "checkbox", "radio", "submit", "button", "reset", "image", "color"].includes(
            target.type
          )
        ) {
          return;
        }
        activeElementRef.current = target;
        setActiveElementState(target);
        theHeNguCanhRef.current += 1;
        sessionRef.current.datLai(theHeNguCanhRef.current);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  // Bộ chặn sự kiện trước khi nhập (beforeinput event listener) theo chuẩn AmaKey Web Adapter
  useEffect(() => {
    if (mode === "off") return;

    const handleBeforeInput = (e: Event) => {
      if (!(e instanceof InputEvent)) return;
      if (e.inputType !== "insertText" || !e.data) return;

      const target = e.target;
      if (
        !(target instanceof HTMLInputElement) &&
        !(target instanceof HTMLTextAreaElement)
      ) {
        return;
      }

      // Bỏ qua các input mật khẩu hoặc input phi ký tự
      if (target instanceof HTMLInputElement && target.type === "password") {
        return;
      }

      const inputChar = e.data;
      let action: AmaKeyAction = sessionRef.current.xuLy(
        inputChar,
        theHeNguCanhRef.current
      );

      if (action.daDatLai) {
        action = sessionRef.current.xuLy(inputChar, theHeNguCanhRef.current);
      }

      if (action.daDatLai || !action.daXuLy) {
        return;
      }

      e.preventDefault();

      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? start;
      const viTriXoa = Math.max(0, start - action.soKyTuThayThe);

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;

      const val = target.value;
      const newVal = val.slice(0, viTriXoa) + action.vanBanSoan + val.slice(end);

      if (target instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
        nativeTextAreaValueSetter.call(target, newVal);
      } else if (target instanceof HTMLInputElement && nativeInputValueSetter) {
        nativeInputValueSetter.call(target, newVal);
      } else {
        target.value = newVal;
      }

      const newPos = viTriXoa + action.vanBanSoan.length;
      target.selectionStart = newPos;
      target.selectionEnd = newPos;

      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Phím tắt toàn cục: Alt + K để chuyển nhanh chế độ gõ
      if (e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const modes: AmaKeyMode[] = ["telexEde", "vniEde", "telexVi", "vniVi", "off"];
        const currentIndex = modes.indexOf(mode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        setMode(nextMode);
        return;
      }

      // Phím tắt mở/đóng bàn phím ảo: Alt + Shift + K
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleVirtualKeyboard();
        return;
      }

      if (e.key === "Backspace") {
        sessionRef.current.xoaKyTu(theHeNguCanhRef.current);
      } else if (e.key === " " || e.key === "Enter") {
        sessionRef.current.ketThucBangDauCach(theHeNguCanhRef.current);
      }
    };

    document.addEventListener("beforeinput", handleBeforeInput, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("beforeinput", handleBeforeInput, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [mode, setMode, toggleVirtualKeyboard]);

  return (
    <AmaKeyContext.Provider
      value={{
        mode,
        setMode,
        isVirtualKeyboardOpen,
        setIsVirtualKeyboardOpen,
        toggleVirtualKeyboard,
        isGuideOpen,
        setIsGuideOpen,
        toggleGuide,
        activeElement: activeElementState,
        insertText,
        deleteBackwards,
      }}
    >
      {children}
    </AmaKeyContext.Provider>
  );
}

export function useAmaKey() {
  const context = useContext(AmaKeyContext);
  if (!context) {
    throw new Error("useAmaKey phải được sử dụng bên trong AmaKeyProvider");
  }
  return context;
}
