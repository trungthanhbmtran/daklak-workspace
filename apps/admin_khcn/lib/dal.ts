'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import axios from 'axios'

// Vì login chưa có token, chúng ta gọi trực tiếp axios thay vì dùng serverApi instance
// (để tránh interceptor tự động check token hoặc redirect vòng lặp)
const API_URL = process.env.API_GATEWAY_URL || 'http://api-gateway.default.svc.cluster.local:8080'

export async function loginAction(formData: FormData) {
    const username = formData.get('username')
    const password = formData.get('password')

    try {
        const res = await axios.post(`${API_URL}/api/auth/login`, {
            username,
            password,
        })

        const token = res.data.accessToken

        const cookieStore = await cookies()
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 ngày
            path: '/',
        })

    } catch (error) {
        // Xử lý lỗi từ axios
        if (axios.isAxiosError(error)) {
            return {
                // Trả về message từ API gateway nếu có, không thì báo lỗi chung
                error: error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.'
            }
        }
        return { error: 'Lỗi kết nối đến hệ thống xác thực.' }
    }

    // Chú ý quan trọng: redirect() luôn phải đặt BÊN NGOÀI khối try...catch
    // Nếu để bên trong, khối catch sẽ vô tình "bắt" luôn lệnh chuyển hướng của Next.js
    redirect('/dashboard')
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}
