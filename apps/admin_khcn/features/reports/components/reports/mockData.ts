export const MOCK_DATA = {
  "api-1": [
    { date: "Thứ 2", requests: 120, success_rate: 98 },
    { date: "Thứ 3", requests: 250, success_rate: 95 },
    { date: "Thứ 4", requests: 180, success_rate: 99 },
    { date: "Thứ 5", requests: 300, success_rate: 92 },
    { date: "Thứ 6", requests: 280, success_rate: 97 },
    { date: "Thứ 7", requests: 400, success_rate: 88 },
    { date: "CN", requests: 150, success_rate: 99 },
  ],
  "api-2": [
    { month: "Jan", records_synced: 1500, errors: 12 },
    { month: "Feb", records_synced: 2300, errors: 5 },
    { month: "Mar", records_synced: 1800, errors: 8 },
    { month: "Apr", records_synced: 3200, errors: 2 },
  ],
  "db-users": [
    { department: "Kế toán", user_count: 15, active: 12 },
    { department: "Kỹ thuật", user_count: 45, active: 40 },
    { department: "Nhân sự", user_count: 8, active: 8 },
    { department: "Kinh doanh", user_count: 60, active: 55 },
  ],
  "db-workflows": [
    { type: "Chuyển tiền", amount: 1500000, count: 120 },
    { type: "Thanh toán", amount: 850000, count: 350 },
    { type: "Rút tiền", amount: 400000, count: 45 },
  ]
};

export const generateMockDataForSource = (sourceName?: string) => {
  return [
    { label: "Jan", total_calls: Math.floor(Math.random() * 5000), error_rate: Math.floor(Math.random() * 10) },
    { label: "Feb", total_calls: Math.floor(Math.random() * 5000), error_rate: Math.floor(Math.random() * 10) },
    { label: "Mar", total_calls: Math.floor(Math.random() * 5000), error_rate: Math.floor(Math.random() * 10) },
    { label: "Apr", total_calls: Math.floor(Math.random() * 5000), error_rate: Math.floor(Math.random() * 10) },
  ];
};
