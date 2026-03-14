import CategoriesList from "../_components/CategoriesList";


async function CategoriesListPage({params} : any) {
    const { id }: any =  await params;
  
  return (
    <CategoriesList id={id}/>
  )
}

export default CategoriesListPage