'use client'
import { useFetch } from '@/hooks/useFetch'

function ArticlesDetails({ slug }: any) {
  const { data, isLoading, error } : any = useFetch(`/posts/${slug}`, {});
  // console.log("post", data)

  if (isLoading) return <div>Đang tải bài viết...</div>
  if (error) return <div>Lỗi khi tải bài viết</div>
  if (!data?.data) return <div>Không tìm thấy bài viết</div>

  const post = data.data

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      {post.description && (
        <p className="text-default-500 text-lg">{post.description}</p>
      )}
      <div
        className="prose prose-stone dark:prose-invert mt-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  )
}

export default ArticlesDetails