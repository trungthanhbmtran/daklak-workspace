'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import axios from 'axios'
import { API_BASE_URL } from '@/config/constants'

export async function loginAction(formData: FormData) {
  const username = formData.get('username')
  const password = formData.get('password')

  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password })
    const { accessToken, refreshToken } = res.data

    // Cookies are now set by API Gateway directly
    // const cookieStore = await cookies()
    // ...

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
