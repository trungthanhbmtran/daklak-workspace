'use client'
import React from 'react'
import { useFetch } from '@/hooks/useFetch'
import LEDMarqueeSmooth from '../LEDMarqueeSmooth'

function NotificationScreen() {
  const { data, isLoading, error } : any = useFetch(`/posts`, { 
        params: { 
           category : 'thong-bao'
        } 
    });

    if (isLoading) return <div>loading....</div>
        const dataNotification = data?.data


    return (
        <LEDMarqueeSmooth data={dataNotification} />
    )
}

export default NotificationScreen