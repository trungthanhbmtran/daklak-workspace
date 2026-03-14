'use client'
import { Phone } from 'lucide-react';

const StickyRingPhone = () => {

  const handlePhoneIconClick = () => {
    window.location.href = `tel: 02623 3856630`;
  };
  return (
    <div onClick={handlePhoneIconClick} className=" fixed cursor-pointer rounded-full bottom-12  left-4 z-50 flex  items-center justify-center p-2 gap-4 bg-red-500 ">
      <div className="relative" >
        <Phone className=" w-8 h-8 text-white animate-pulse"></Phone>
        <div className="absolute inset-0 flex items-center justify-center rounded-full border-2  border-red-700 animate-ping"></div>
      </div>
      <p className="text-white text-lg hidden sm:block"> 02623 3856630</p>
    </div>
  );
};

export default StickyRingPhone;
