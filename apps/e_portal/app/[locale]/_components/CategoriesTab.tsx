'use client'
import React from 'react'
import { useFetch } from '@/hooks/useFetch'
import { Link } from '@heroui/link'

function CategoriesTab() {
    const { data: res, isLoading, error } : any = useFetch('/posts/categories')
    const categories = res?.data || []

    const renderMenu = (items: any[]) => {
        return (
            <ul className="flex flex-wrap items-center gap-6 text-white">
                {items.map((item) => (
                    <li key={item.id} className="relative group">
                        <Link
                            href={item.slug || '#'}
                            className="hover:text-yellow-300 text-white transition-colors"
                        >
                            {item.name}
                        </Link>

                        {/* Nếu có children thì hiển thị dropdown */}
                        {item.children && item.children.length > 0 && (
                            <ul className="absolute hidden group-hover:block rounded-lg mt-2 p-2 min-w-[200px] z-50">
                                {item.children.map((child: any) => (
                                    <li key={child.id}>
                                        <Link
                                            href={child.slug || '#'}
                                            className="block px-3 py-2 text-sm text-white  hover:bg-blue-700 rounded-md"
                                        >
                                            {child.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        )
    }


    return (
        <nav aria-label="Top" className="  mx-auto container ">
            <div className="border-b  border-gray-200">
                {isLoading && <p className="text-white text-sm">Đang tải...</p>}
                {error && <p className="text-red-300 text-sm">Lỗi tải danh mục</p>}
                {!isLoading && !error && categories.length > 0 && renderMenu(categories)}
            </div>
        </nav>
    )
}

export default CategoriesTab