import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <svg
            className="h-16 w-16 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-3xl font-bold">Không tìm thấy trang</h1>
        <p className="mb-6 text-muted-foreground">
          Trang bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là một lỗi.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
