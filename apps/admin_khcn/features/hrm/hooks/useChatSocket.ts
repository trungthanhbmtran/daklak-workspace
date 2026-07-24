"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { hrmKeys } from "../keys";

// URL của API Gateway (giả sử là http://localhost:5000/chat, tuỳ vào cấu hình)
// Bạn có thể đặt vào biến môi trường NEXT_PUBLIC_API_URL
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function useChatSocket(conversationId: string | undefined, userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    // Khởi tạo kết nối socket tới API Gateway
    const baseUrl = typeof window !== "undefined" ? window.location.origin : SOCKET_URL;
    const socket = io(`${baseUrl}/admin/chat`, {
      path: "/api/v1/admin/chat/socket.io",
      query: { userId: userId || "Anonymous" },
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      // Join room
      socket.emit("join_room", { conversationId });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Lắng nghe tin nhắn mới
    socket.on("new_message", (message: any) => {
      // Cập nhật React Query Cache để UI tự render
      const queryKey = hrmKeys.taskComments(conversationId as any);
      
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        
        // Thường API trả về cấu trúc: { success: true, data: { items: [...] } }
        // Hoặc trả về mảng trực tiếp, tuỳ backend. (hrmTasksApi.getComments trả về mảng)
        const oldItems = Array.isArray(oldData) ? oldData : oldData?.data?.items || oldData?.data || [];
        
        // Tránh bị trùng lặp nếu API đã trả về
        if (oldItems.find((item: any) => item.id === message.id)) {
          return oldData;
        }

        const newItems = [message, ...oldItems];

        if (Array.isArray(oldData)) {
          return newItems;
        } else if (oldData?.data?.items) {
          return { ...oldData, data: { ...oldData.data, items: newItems } };
        } else {
          return { ...oldData, data: newItems };
        }
      });
    });

    socket.on("typing", (data: { userId: string }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.userId)) return [...prev, data.userId];
        return prev;
      });
    });

    socket.on("stop_typing", (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    return () => {
      socket.emit("leave_room", { conversationId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, queryClient, userId]);

  const emitTyping = () => {
    if (socketRef.current && isConnected && conversationId) {
      socketRef.current.emit("typing", { conversationId });
    }
  };

  const emitStopTyping = () => {
    if (socketRef.current && isConnected && conversationId) {
      socketRef.current.emit("stop_typing", { conversationId });
    }
  };

  return { isConnected, typingUsers, emitTyping, emitStopTyping };
}
