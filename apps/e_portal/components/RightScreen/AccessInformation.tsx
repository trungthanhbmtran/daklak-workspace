'use client';
import React, { useEffect, useState } from 'react';
import BoxCard from '../BoxContent';

const AccessInformation = () => {
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [allTimeCount, setAllTimeCount] = useState<number | null>(null);

  useEffect(() => {
    // Thêm script Histats
    const script = document.createElement('script');
    script.src = 'https://s10.histats.com/js15_as.js'; // thay bằng code script của bạn
    script.async = true;
    document.body.appendChild(script);

    // Histats thường render <a> hoặc <span>, có thể lấy dữ liệu bằng querySelector
    const interval = setInterval(() => {
      const todayEl = document.querySelector<HTMLSpanElement>('#histats-today');
      const allEl = document.querySelector<HTMLSpanElement>('#histats-all');
      if (todayEl) setTodayCount(Number(todayEl.textContent || 0));
      if (allEl) setAllTimeCount(Number(allEl.textContent || 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <BoxCard title="Thống kê truy cập">
      <h1>Hôm nay : {todayCount ?? '...'} </h1>
      <h1>Tất cả : {allTimeCount ?? '...'} </h1>

      {/* Đây là phần Histats render (ẩn hoặc hiển thị) */}
      <div style={{ display: 'none' }}>
        <span id="histats-today">0</span>
        <span id="histats-all">0</span>
      </div>
    </BoxCard>
  );
};

export default AccessInformation;
