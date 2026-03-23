'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.API_URL || 'http://api-gateway:8080/api/v1/admin';

export async function loginAction(formData: FormData) {
  const username = formData.get('username')
  const password = formData.get('password')

  try {
    const res = await axios.post(`${API_URL}/auth/login`, { username, password })
    const { accessToken, refreshToken } = res.data

    const cookieStore = await cookies()

    // Access Token (ví dụ sống 15 phút)
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60,
      path: '/',
    })

    // Refresh Token (ví dụ sống 7 ngày)
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.message || 'Thông tin đăng nhập không chính xác.' }
    }
    return { error: 'Lỗi kết nối đến API Gateway.' }
  }

  // Dashboard route không tồn tại, portal page là /hub
  // Với basePath: '/admin', redirect('/hub') sẽ đẩy sang /admin/hub
  redirect('/hub')
}
