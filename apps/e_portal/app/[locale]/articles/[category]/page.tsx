import ArticleFeed from "../_components/ArticleFeed";

// Hàm giả lập lấy dữ liệu


export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  // console.log("Category Page Params:", category);
  // const articles = await getArticles(slug);

  return (
    <main className="container mx-auto max-w-7xl px-6 py-12">
      {/* Header của Page */}
      <div className="mb-10 text-center">
         <h1 className="text-4xl font-bold mb-4 capitalize">Chủ đề: {category}</h1>
         <p className="text-default-500">Danh sách các bài viết được chọn lọc kỹ càng.</p>
      </div>

      {/* Component hiển thị danh sách (Client Component) */}
      <ArticleFeed category={category} />
    </main>
  );
}