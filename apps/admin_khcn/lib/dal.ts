'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import axios from 'axios'
import { API_BASE_URL } from '@/config/constants'

// Vì login chưa có token, chúng ta gọi trực tiếp axios thay vì dùng serverApi instance
// (để tránh interceptor tự động check token hoặc redirect vòng lặp)

export async function loginAction(formData: FormData) {
    const username = formData.get('username')
    const password = formData.get('password')

    const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://api-gateway:8080/api/v1/admin';

    try {
        const res = await axios.post(`${INTERNAL_API_URL}/auth/login`, {
            username,
            password,
        })

        // API Gateway trả về cookie ở dạng set-cookie header thay vì JSON
        const setCookies = res.headers['set-cookie'] || [];
        let token = null;
        for (const cookieStr of setCookies) {
            if (cookieStr.startsWith('accessToken=')) {
                token = cookieStr.split(';')[0].substring('accessToken='.length);
                break;
            }
        }

        if (!token) {
            return { error: 'Không lấy được phiên đăng nhập từ máy chủ.' }
        }

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
                error: error.response?.data?.message || error.response?.data?.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.'
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
