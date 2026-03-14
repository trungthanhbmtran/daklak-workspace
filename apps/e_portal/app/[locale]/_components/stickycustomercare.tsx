'use client'
// import { XMarkIcon } from '@heroicons/react/24/outline'; // Import the XIcon from Heroicons
import { useState } from 'react';
// import { ChatBubbleOvalLeftIcon  } from "@heroicons/react/24/outline";
import Image from 'next/image';

const ComponentForm = ({ isFormVisible,setFormVisible }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    content: '',
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle form submission here, you can use formData
    alert('Form submitted with data: ' + JSON.stringify(formData));
    setFormVisible(!isFormVisible);
  };


  return (
    <div className="bg-white p-4 mt-4 rounded-md">
      {/* <div  className="flex justify-end">
        <XMarkIcon className="h-6 w-6" />
      </div> */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="rounded-md border border-gray-300 p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="rounded-md border border-gray-300 p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="rounded-md border border-gray-300 p-2 w-full h-32"
          ></textarea>
        </div>
        <div>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}
const StickyCustomerCare = () => {
  // const [isFormVisible, setFormVisible] = useState(false);

  // const toggleForm = () => {
  //   setFormVisible(true);
  // };

  const handlePhoneIconClick = () => {
    window.location.href = `https://chat.zalo.me/`;
  };




  return (
    <div onClick={handlePhoneIconClick}  className=" fixed cursor-pointer rounded-full bottom-4 right-4 z-50 flex  items-center justify-center p-2 gap-4  ">
    <div className="relative " >
      <div  className="zalo-chat-widget " data-oaid="449920414322054086" data-welcome-message="Rất vui khi được hỗ trợ bạn!" data-autopopup="5" data-width="300" data-height="300"></div>
      {/* <Image src={'/images/icons8-zalo-96.png'} alt="logo-png-20210316111301NoUwY3GnHp.png" width={80} height={80} className=" w-auto h-auto text-white animate-bounce"></Image> */}
      {/* <div className="absolute inset-0 flex items-center justify-center rounded-full border-2  border-red-700 animate-ping"></div> */}
    </div>
  </div>
    // <div
    //   className={`fixed p-4 rounded-md cursor-pointer bottom-0 right-4  z-50 w-72 bg-cyan-900 ${isFormVisible ? 'scale-105 ' : ''
    //     }`}
    //   onClick={toggleForm}
    // >
    //   <p className="text-white text-lg">Gửi tin nhắn</p>
    //   {isFormVisible && <ComponentForm isFormVisible={isFormVisible} setFormVisible={setFormVisible} />}
    // </div>
  );
};

export default StickyCustomerCare;
