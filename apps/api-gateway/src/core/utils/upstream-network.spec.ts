import { upstreamUrl, assertUpstreamAddress } from './upstream-network';

describe('upstream-network utils', () => {
  describe('upstreamUrl', () => {
    it('cho phép URL có pathname (đường dẫn subpath) chuẩn xác', () => {
      const url = upstreamUrl('https://lgsp.daklak.gov.vn/api/v1', 'external');
      expect(url.origin).toBe('https://lgsp.daklak.gov.vn');
      expect(url.pathname).toBe('/api/v1');
    });

    it('cho phép URL chứa đường dẫn kết thúc bằng dấu gạch chéo', () => {
      const url = upstreamUrl('https://dichvucong.gov.vn/services/', 'external');
      expect(url.origin).toBe('https://dichvucong.gov.vn');
      expect(url.pathname).toBe('/services/');
    });

    it('cho phép URL dạng IP có subpath và port', () => {
      const url = upstreamUrl('http://113.184.220.82:8080/api/v1', 'internal');
      expect(url.origin).toBe('http://113.184.220.82:8080');
      expect(url.pathname).toBe('/api/v1');
    });

    it('cho phép URL chỉ có origin không có subpath', () => {
      const url = upstreamUrl('https://api.example.com', 'external');
      expect(url.origin).toBe('https://api.example.com');
      expect(url.pathname).toBe('/');
    });

    it('tự động chuẩn hóa và chấp nhận vùng mạng không phân biệt hoa thường hoặc thiếu', () => {
      const url1 = upstreamUrl('https://api.example.com/v1', 'EXTERNAL');
      expect(url1.pathname).toBe('/v1');

      const url2 = upstreamUrl('https://api.example.com/v1', 'Internal');
      expect(url2.pathname).toBe('/v1');

      const url3 = upstreamUrl('https://api.example.com/v1', '');
      expect(url3.pathname).toBe('/v1');
    });

    it('từ chối URL có chứa thông tin đăng nhập username:password', () => {
      expect(() =>
        upstreamUrl('https://admin:secret@api.example.com/v1', 'external'),
      ).toThrow('URL không được chứa tài khoản hoặc mật khẩu');
    });

    it('từ chối URL có chứa hash fragment', () => {
      expect(() =>
        upstreamUrl('https://api.example.com/v1#section', 'external'),
      ).toThrow('URL không được chứa mã phân đoạn hash (#)');
    });

    it('từ chối giao thức không phải HTTP/HTTPS', () => {
      expect(() => upstreamUrl('ftp://api.example.com/v1', 'external')).toThrow(
        'Giao thức URL phải là http:// hoặc https://',
      );
    });

    it('từ chối URL rỗng', () => {
      expect(() => upstreamUrl('', 'external')).toThrow(
        'Base URL không được để trống',
      );
    });
  });

  describe('assertUpstreamAddress SSRF Protection', () => {
    it('chặn địa chỉ loopback 127.0.0.1 ở mọi vùng mạng', () => {
      expect(() => assertUpstreamAddress('127.0.0.1', 'internal')).toThrow(
        'Prohibited upstream network destination',
      );
      expect(() => assertUpstreamAddress('127.0.0.1', 'external')).toThrow(
        'Prohibited upstream network destination',
      );
    });

    it('chặn địa chỉ cloud metadata 169.254.169.254', () => {
      expect(() =>
        assertUpstreamAddress('169.254.169.254', 'internal'),
      ).toThrow('Prohibited upstream network destination');
    });

    it('chặn dải IP private cho vùng mạng external', () => {
      expect(() => assertUpstreamAddress('10.0.0.1', 'external')).toThrow(
        'Prohibited upstream network destination',
      );
      expect(() => assertUpstreamAddress('192.168.1.1', 'external')).toThrow(
        'Prohibited upstream network destination',
      );
    });

    it('cho phép dải IP private cho vùng mạng internal hợp lệ', () => {
      expect(() =>
        assertUpstreamAddress('10.50.1.6', 'internal'),
      ).not.toThrow();
      expect(() =>
        assertUpstreamAddress('192.168.10.50', 'internal'),
      ).not.toThrow();
    });

    it('cho phép IP public hợp lệ cho vùng mạng external', () => {
      expect(() =>
        assertUpstreamAddress('113.184.220.82', 'external'),
      ).not.toThrow();
    });
  });
});
