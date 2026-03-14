// import { Language } from '@/types'
import { Fragment, use } from 'react';
// import FAQ from '@/components/portal/IndexPage/FAQ';
// import CarouselImage from '@/components/index/Carousel';

export default function Mandates({
  params: { lang }
}: any) {
  // const data = use(getNestedPortalCategories())

  // console.log('data',data)
  // const tabs = [
  //   {
  //     id: 'tab1',
  //     label: 'Cơ cấu Tổ Chức ',
  //     content: 'Content for Tab 1',
  //   },
  //   {
  //     id: 'tab2',
  //     label: 'Chức Năng Nhiệm Vụ',
  //     content: 'Content for Tab 2',
  //   },
  //   {
  //     id: 'tab3',
  //     label: 'Quá Trình Phát Triển',
  //     content: 'Content for Tab 3',
  //   },
  // ];


  return (
    <div className="text-primary">
      <h1>Chức năng - nhiệm vụ  </h1>
      <h2>I. Chức Năng</h2>
      <ul className=' pl-6 list-disc'>
        <li>
          Thực hiện đăng ký đất đai, nhà ở và tài sản khác gắn liền với đất;
        </li>
        <li>
          xây dựng, quản lý, cập nhật, chỉnh lý thống nhất hồ sơ địa chính và cơ sở dữ liệu đất
          đai;
        </li>
        <li>
          thống kê, kiểm kê đất đai và cung cấp thông tin đất đai cho tổ chức,
          cá nhân theo quy định của pháp luật.
        </li>
      </ul>
      <h2>II. Nhiệm vụ, quyền hạn:</h2>
      <ul className='pl-6 list-decimal'>
        <li>
          Thực hiện việc đăng ký đất được Nhà nước giao quản lý, đăng ký quyền sử
          dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất;
        </li>
        <li>
          Thực hiện việc cấp lần đầu, cấp đổi, cấp lại Giấy chứng nhận quyền sử
          dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất (sau đây gọi
          là Giấy chứng nhận);
        </li>
        <li>
          Thực hiện việc đăng ký biến động đối với đất được Nhà nước giao quản lý,
          quyền sử dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất;
        </li>
        <li>
          Lập, chỉnh lý, cập nhật, lưu trữ và quản lý hồ sơ địa chính; tiếp nhận,
          quản lý việc sử dụng phôi Giấy chứng nhận theo quy định của pháp luật;
        </li>
        <li>
          Cập nhật, chỉnh lý, đồng bộ hóa, khai thác dữ liệu đất đai; xây dựng,
          quản lý hệ thống thông tin đất đai theo quy định của pháp luật;
        </li>
        <li>
          Thực hiện việc thống kê, kiểm kê đất đai và lập bản đồ hiện trạng sử dụng
          đất; chỉnh lý bản đồ địa chính; trích lục bản đồ địa chính;
        </li>
        <li>
          Kiểm tra bản trích đo địa chính thửa đất; kiểm tra, xác nhận sơ đồ nhà
          ở và tài sản khác gắn liền với đất do tổ chức, cá nhân cung cấp phục vụ
          đăng ký, cấp Giấy chứng nhận;
        </li>
        <li>
          Thực hiện đăng ký giao dịch bảo đảm bằng quyền sử dụng đất, quyền sở hữu
          nhà ở và tài sản khác gắn liền với đất theo quy định của pháp luật;
        </li>
        <li>
          Cung cấp hồ sơ, bản đồ, thông tin, số liệu đất đai, nhà ở và tài sản
          khác gắn liền với đất cho các tổ chức, cá nhân theo quy định của pháp luật;
        </li>
        <li>
          Thực hiện việc thu phí, lệ phí theo quy định của pháp luật;
        </li>
        <li>
          Thực hiện các dịch vụ trên cơ sở chức năng, nhiệm vụ phù hợp với năng lực
          theo quy định của pháp luật;
        </li>
        <li>
          Quản lý viên chức, người lao động, tài chính và tài sản thuộc Văn phòng
          đăng ký đất đai theo quy định của pháp luật; thực hiện chế độ báo cáo theo
          quy định hiện hành và tình hình thực hiện, nhiệm vụ về các lĩnh vực công
          tác được giao;
        </li>
        <li>
          Thực hiện các nhiệm vụ khác do Giám đốc Sở Tài nguyên và Môi trường giao
          theo quy định của pháp luật.
        </li>
      </ul>
    </div>
    // <Tabs tabs={tabs} />
  )
}
