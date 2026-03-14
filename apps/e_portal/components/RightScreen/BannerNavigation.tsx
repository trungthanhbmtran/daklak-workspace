import { Card } from '@heroui/card'
import { Link } from '@heroui/link'
import Image from 'next/image'
import React from 'react'

function BannerNavigation() {
  const ListNavigation = [
    { name: 'KH-CN', bg: "/images/vbpq.jpg", link: '/about' },
    // { name: 'KH-CN', bg: "/images/vbpq.jpg", link: '/about' },
    // { name: 'KH-CN', bg: "/images/vbpq.jpg", link: '/about' },
  ]
  return (
    ListNavigation.map((item, index) => (
      <Link key={index} href={item.link} >
        <Card radius='none' className='w-full h-30 overflow-hidden p-2'>
        <Image
          src={item.bg}
          alt={item.name}
          width={400}
          height={100}
          className="w-full h-full object-cover "
          priority={index === 0} // ưu tiên load hình đầu
        />
      </Card>
      </Link >
    ))
  )
}

export default BannerNavigation