import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Chức năng thử nghiệm xác thực tạm thời không khả dụng trong quá trình nâng cấp hệ thống (bảo vệ SSRF).' 
    },
    { status: 503 }
  );
}
