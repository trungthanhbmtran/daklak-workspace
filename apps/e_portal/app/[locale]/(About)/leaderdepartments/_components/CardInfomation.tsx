import Image from 'next/image';

const CardInformation = ({ name, position, responsibilities,image }: any) =>{
    return (
        <div className="bg-white w-full rounded-md overflow-hidden shadow-md my-4 p-6 flex gap-2 items-center">
        <div className=" w-1/5 sm:w-1/12">
          <Image src={image} width={50} height={50} alt="Hinh Anh" className="h-auto w-auto object-cover" />
        </div>
        <div className=" w-4/5 sm:w-11/12">
          <h2 className="text-xl font-semibold mb-2">{name}</h2>
          <p className="text-gray-600 mb-2">{position}</p>
          <p className="text-gray-700"><strong>Thẩm quyền:</strong> {responsibilities}</p>
        </div>
      </div>
    )
}

export default CardInformation