import ArticlesDetails from "./_components/ArticlesDetails";

export default async function ArticlesDetailsPage({
  params,
}: {
  params: Promise<{ itemId: string }>
}) {
  const { itemId } = await params

  return <ArticlesDetails slug={itemId} />;
  // return (
  //   <h1> chi tiét{itemId}</h1>
  // )
  // return (
  //   <h1>test</h1>
  // )
}
