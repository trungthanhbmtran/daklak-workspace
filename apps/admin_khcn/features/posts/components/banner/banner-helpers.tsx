import * as React from "react";

export const DEFAULT_STYLES = {
  bgType: "gradient",
  bgGradientStart: "#990000",
  bgGradientMiddle: "#cc0000",
  bgGradientEnd: "#800000",
  bgImage: "",
  bgOpacity: 0.45,
  titleColor: "#fbc02d",
  textColor: "#fff7ed",
  alignment: "left",
  showStar: true,
  starColor: "#ffff00",
  starOpacity: 0.08,
  watermarkType: "star", // star, drum, lotus, custom
  watermarkUrl: "",
  buttonBg: "#ffde59",
  buttonTextColor: "#0f172a",
  buttonText: "Tìm hiểu thêm"
};

export const PRESETS = [
  {
    name: "Cờ đỏ Sao vàng",
    bgType: "gradient",
    bgGradientStart: "#990000",
    bgGradientMiddle: "#cc0000",
    bgGradientEnd: "#800000",
    bgImage: "",
    bgOpacity: 0.45,
    titleColor: "#fbc02d",
    textColor: "#fff7ed",
    starColor: "#ffff00",
    starOpacity: 0.08,
    watermarkType: "star",
    watermarkUrl: "",
    buttonBg: "#ffde59",
    buttonTextColor: "#0f172a",
    alignment: "left"
  },
  {
    name: "Hồng sen Tươi sáng",
    bgType: "gradient",
    bgGradientStart: "#b0124a",
    bgGradientMiddle: "#db2777",
    bgGradientEnd: "#9d174d",
    bgImage: "",
    bgOpacity: 0.45,
    titleColor: "#fdf2f8",
    textColor: "#fce7f3",
    starColor: "#ffffff",
    starOpacity: 0.05,
    watermarkType: "lotus",
    watermarkUrl: "",
    buttonBg: "#ffffff",
    buttonTextColor: "#be185d",
    alignment: "center"
  },
  {
    name: "Đại dương Sâu thẳm",
    bgType: "gradient",
    bgGradientStart: "#1e3a8a",
    bgGradientMiddle: "#2563eb",
    bgGradientEnd: "#172554",
    bgImage: "",
    bgOpacity: 0.45,
    titleColor: "#60a5fa",
    textColor: "#dbeafe",
    starColor: "#60a5fa",
    starOpacity: 0.08,
    watermarkType: "drum",
    watermarkUrl: "",
    buttonBg: "#3b82f6",
    buttonTextColor: "#ffffff",
    alignment: "left"
  },
  {
    name: "Xanh ngọc Vinh quang",
    bgType: "gradient",
    bgGradientStart: "#064e3b",
    bgGradientMiddle: "#059669",
    bgGradientEnd: "#022c22",
    bgImage: "",
    bgOpacity: 0.45,
    titleColor: "#a7f3d0",
    textColor: "#ecfdf5",
    starColor: "#34d399",
    starOpacity: 0.06,
    watermarkType: "lotus",
    watermarkUrl: "",
    buttonBg: "#10b981",
    buttonTextColor: "#ffffff",
    alignment: "left"
  },
  {
    name: "Ánh kim Hoàng triều",
    bgType: "gradient",
    bgGradientStart: "#78350f",
    bgGradientMiddle: "#d97706",
    bgGradientEnd: "#451a03",
    bgImage: "",
    bgOpacity: 0.45,
    titleColor: "#fef3c7",
    textColor: "#fffbeb",
    starColor: "#fbbf24",
    starOpacity: 0.1,
    watermarkType: "drum",
    watermarkUrl: "",
    buttonBg: "#fbbf24",
    buttonTextColor: "#78350f",
    alignment: "center"
  }
];

export const getBannerBackgroundStyle = (styles: any) => {
  const isPattern = styles.bgType === "pattern" || styles.bgType === "image";
  if (isPattern) {
    if (styles.bgImage === "pattern-drum") {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' opacity='0.08'><circle cx='50%' cy='50%' r='40%' fill='none' stroke='%23ffffff' stroke-width='2'/><circle cx='50%' cy='50%' r='30%' fill='none' stroke='%23ffffff' stroke-dasharray='10,10'/><circle cx='50%' cy='50%' r='20%' fill='none' stroke='%23ffffff'/><circle cx='50%' cy='50%' r='10%' fill='none' stroke='%23ffffff'/></svg>`;
      const drumBg = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
      return {
        background: `linear-gradient(to right, ${styles.bgGradientStart || "#990000"}, ${styles.bgGradientMiddle || styles.bgGradientStart || "#cc0000"}, ${styles.bgGradientEnd || "#800000"})`,
        backgroundImage: `${drumBg}, linear-gradient(to right, ${styles.bgGradientStart || "#990000"}, ${styles.bgGradientMiddle || styles.bgGradientStart || "#cc0000"}, ${styles.bgGradientEnd || "#800000"})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      };
    }
    if (styles.bgImage === "pattern-clouds") {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='30' opacity='0.05'><path d='M0 15 Q15 0, 30 15 T60 15' fill='none' stroke='%23ffffff' stroke-width='1.5'/></svg>`;
      const cloudsBg = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
      return {
        background: `linear-gradient(to right, ${styles.bgGradientStart || "#990000"}, ${styles.bgGradientMiddle || styles.bgGradientStart || "#cc0000"}, ${styles.bgGradientEnd || "#800000"})`,
        backgroundImage: `${cloudsBg}, linear-gradient(to right, ${styles.bgGradientStart || "#990000"}, ${styles.bgGradientMiddle || styles.bgGradientStart || "#cc0000"}, ${styles.bgGradientEnd || "#800000"})`,
        backgroundRepeat: "repeat"
      };
    }
  }

  if (styles.bgType === "image" && styles.bgImage && styles.bgImage.startsWith("http")) {
    const overlayOpacity = styles.bgOpacity !== undefined ? styles.bgOpacity : 0.45;
    return {
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${overlayOpacity})), url(${styles.bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    };
  }

  return {
    background: `linear-gradient(to right, ${styles.bgGradientStart || "#990000"}, ${styles.bgGradientMiddle || styles.bgGradientStart || "#cc0000"}, ${styles.bgGradientEnd || "#800000"})`
  };
};

export const renderBannerWatermark = (styles: any) => {
  const color = styles.starColor || "#ffff00";
  const opacity = styles.starOpacity !== undefined ? styles.starOpacity : 0.08;

  if (styles.watermarkType === "drum") {
    return (
      <svg className="w-56 h-56 transition-all duration-300" style={{ color, opacity }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="50" cy="50" r="48" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="40" />
        <circle cx="50" cy="50" r="32" strokeDasharray="6 3" />
        <circle cx="50" cy="50" r="24" />
        <circle cx="50" cy="50" r="16" />
        <polygon points="50,38 53,44 60,44 55,48 57,55 50,51 43,55 45,48 40,44 47,44" fill="currentColor" />
        <path d="M50,16 L50,24 M50,76 L50,84 M16,50 L24,50 M76,50 L84,50 M26,26 L32,32 M74,74 L68,68 M26,74 L32,68 M74,26 L68,32" />
      </svg>
    );
  }

  if (styles.watermarkType === "lotus") {
    return (
      <svg className="w-56 h-56 transition-all duration-300" style={{ color, opacity }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2C11.5,4 10,6 8,7.5C9.5,8 11,9 12,11C13,9 14.5,8 16,7.5C14,6 12.5,4 12,2M12,12C10.5,13.5 8,14 5,14C7,15.5 10,16 12,18C14,16 17,15.5 19,14C16,14 13.5,13.5 12,12M12,19C10.5,19.8 9,20.5 7,21C9,21.5 11,21.8 12,22C13,21.8 15,21.5 17,21C15,20.5 13.5,19.8 12,19Z" />
      </svg>
    );
  }

  if (styles.watermarkType === "custom" && styles.watermarkUrl) {
    return (
      <img 
        src={styles.watermarkUrl} 
        alt="Custom Watermark" 
        className="w-48 h-48 object-contain transition-all duration-300" 
        style={{ opacity, filter: `drop-shadow(0 0 8px ${color})` }} 
      />
    );
  }

  return (
    <svg className="w-56 h-56 transition-all duration-300" style={{ color, opacity }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
    </svg>
  );
};
