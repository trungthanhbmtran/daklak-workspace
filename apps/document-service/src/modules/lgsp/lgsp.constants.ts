export const LGSP_SYSTEM_CODE = '0400101394-CTDL-012';

export const LGSP_ENDPOINTS = {
  TOKEN: 'https://lifesso.daklak.gov.vn:9445/oauth2/token',
  BASE: 'https://lifelgsp.daklak.gov.vn:8243',
  AGENCIES_LIST: 'https://lifelgsp.daklak.gov.vn:8243/dvlt/1.0.0/getAgenciesList',
  SEND_EDOC: 'https://lifelgsp.daklak.gov.vn:8243/guivb/1.0.0/sendEdoc',
  RECEIVED_EDOC_LIST: 'https://lifelgsp.daklak.gov.vn:8243/dhvb/1.0.0/getReceivedEdocList',
  GET_EDOC: 'https://lifelgsp.daklak.gov.vn:8243/dhvb/1.0.0/getEdoc',
  SENT_EDOC_LIST: 'https://lifelgsp.daklak.gov.vn:8243/guivb/1.0.0/getSentEdocList',
  UPDATE_STATUS: 'https://lifelgsp.daklak.gov.vn:8243/guivb/1.0.0/updateStatus',
  REGISTER_AGENCIES: 'https://lifelgsp.daklak.gov.vn:8243/dvlt/1.0.0/registerAgencies',
};

export const LGSP_SCOPES = {
  READ_DOCS: 'read:docs', // Dùng cho gửi vb (4.1.2), ds trạng thái gửi (4.1.5), cập nhật trạng thái gói tin (4.1.6)
  READ_DOC: 'read:doc',   // Dùng cho lấy ds gói tin nhận (4.1.3), lấy vb edoc (4.1.4)
  READ_DVLT: 'Read:dvlt', // Dùng cho lấy ds đơn vị liên thông (4.1.1), đăng ký đơn vị liên thông (4.1.7)
};
