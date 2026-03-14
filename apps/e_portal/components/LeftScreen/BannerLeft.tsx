import { Card } from '@heroui/card'
import { Link } from '@heroui/link'
import Image from 'next/image'
import React from 'react'

function BannerLeft() {
  const ListNavigation = [
    { name: 'KH-CN', bg: "/images/pakq.jpg", link: '/vi/receivefeedback' },
    { name: 'KH-CN', bg: "/images/cong-khai-ngan-sach-1729740910463465320413-0-0-169-270-crop-17297409194401648647028.webp", link: '/vi/draftcomments' },
  ]
  return (
    <div className="flex flex-col gap-4">
      {ListNavigation.map((item, index) => (
        <Link key={index} href={item.link} className="w-full block">
          {/* 
             1. Bỏ h-30 để Card co giãn theo ảnh 
             2. Thêm border-none/shadow-none nếu muốn banner trông tự nhiên 
          */}
          <Card radius='none' className='w-full h-auto overflow-hidden p-0 border-none shadow-sm'>
            <Image
              src={item.bg}
              alt={item.name}
              // Set width/height = 0 và sizes="100vw" để Next.js tự tính tỷ lệ
              width={0}
              height={0}
              sizes="100vw"
              // w-full: Chiếm hết chiều ngang
              // h-auto: Tự động tính chiều cao để không bị méo/cắt
              // object-contain: Đảm bảo hiển thị trọn vẹn (nhưng dùng h-auto thì không cần cái này cũng được)
              className="w-full h-auto"
              priority={index === 0} 
            />
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default BannerLeft