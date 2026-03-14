export const getFormattedVietnameseDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dayOfWeek = date.getDay()

  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ]

  return `${days[dayOfWeek]}, ngày ${day} tháng ${month} năm ${year}`
}
// export const getVietnameseDayOfWeek = (date = new Date()) => {
//   const dayOfWeek = date.getDay()
//   const days = [
//     "Chủ Nhật",
//     "Thứ Hai",
//     "Thứ Ba",
//     "Thứ Tư",
//     "Thứ Năm",
//     "Thứ Sáu",          
//     "Thứ Bảy",
//     ]
//     return days[dayOfWeek]
// }