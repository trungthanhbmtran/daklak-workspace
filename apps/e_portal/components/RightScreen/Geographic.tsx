import { Card, CardHeader, CardBody } from '@heroui/card'
import { Divider } from '@heroui/divider'
import Image from 'next/image'
import React from 'react'
import BoxCard from '../BoxContent'

function Geographic() {

  return (
    <BoxCard title="BẢN ĐỒ HÀNH CHÍNH" className="max-w-[400px]">
      <Image width={350} height={350} src={"/images/HC-DAKLAK.jpg"} alt="images/hc-daklak"></Image>
    </BoxCard>
  )
}

export default Geographic