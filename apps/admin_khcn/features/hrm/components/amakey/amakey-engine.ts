/**
 * AmaKey Engine - Bộ gõ đa nền tảng Tiếng Việt & Tiếng Êđê (Đắk Lắk)
 * Triển khai trực tiếp từ kiến trúc mã nguồn mở AmaKey (https://github.com/thuyenvinh/AmaKey)
 * Hỗ trợ 4 kiểu gõ:
 * 1. Telex Tiếng Êđê (telexEde)
 * 2. VNI Tiếng Êđê (vniEde)
 * 3. Telex Tiếng Việt (telexVi)
 * 4. VNI Tiếng Việt (vniVi)
 */

export type AmaKeyMode = 'off' | 'telexEde' | 'vniEde' | 'telexVi' | 'vniVi';

export interface AmaKeyAction {
  daXuLy: boolean;
  vanBanSoan: string;
  soKyTuThayThe: number;
  daDatLai: boolean;
}

export interface EdeCharDefinition {
  upper: string;
  lower: string;
  name: string;
  telex: string;
  vni: string;
  unicodeUpper: string;
  unicodeLower: string;
}

// Bảng ký tự đặc trưng ngôn ngữ Êđê (Rhade) - Tỉnh Đắk Lắk
export const EDE_SPECIAL_CHARS: EdeCharDefinition[] = [
  { upper: 'Ƀ', lower: 'ƀ', name: 'B gạch ngang (B-bar)', telex: 'bb / BB', vni: 'b9 / B9', unicodeUpper: 'U+0243', unicodeLower: 'U+0180' },
  { upper: 'Č', lower: 'č', name: 'C mũ ngược (C-caron)', telex: 'cc / CC', vni: 'c9 / C9', unicodeUpper: 'U+010C', unicodeLower: 'U+010D' },
  { upper: 'Đ', lower: 'đ', name: 'Đ gạch ngang (D-stroke)', telex: 'dd / DD', vni: 'd9 / D9', unicodeUpper: 'U+0110', unicodeLower: 'U+0111' },
  { upper: 'Ĕ', lower: 'ĕ', name: 'E dấu trăng (E-breve)', telex: 'ex / EX', vni: 'e8 / E8', unicodeUpper: 'U+0114', unicodeLower: 'U+0115' },
  { upper: 'Ê̆', lower: 'ê̆', name: 'Ê dấu trăng (Ê-breve)', telex: 'eex / EEX', vni: 'e68 / E68', unicodeUpper: 'U+00CA+U+0306', unicodeLower: 'U+00EA+U+0306' },
  { upper: 'Ĭ', lower: 'ĭ', name: 'I dấu trăng (I-breve)', telex: 'ix / IX', vni: 'i8 / I8', unicodeUpper: 'U+012C', unicodeLower: 'U+012D' },
  { upper: 'Ñ', lower: 'ñ', name: 'N dấu ngã (N-tilde)', telex: 'nn / NN', vni: 'n9 / N9', unicodeUpper: 'U+00D1', unicodeLower: 'U+00F1' },
  { upper: 'Ŏ', lower: 'ŏ', name: 'O dấu trăng (O-breve)', telex: 'ox / OX', vni: 'o8 / O8', unicodeUpper: 'U+014E', unicodeLower: 'U+014F' },
  { upper: 'Ô̆', lower: 'ô̆', name: 'Ô dấu trăng (Ô-breve)', telex: 'oox / OOX', vni: 'o68 / O68', unicodeUpper: 'U+00D4+U+0306', unicodeLower: 'U+00F4+U+0306' },
  { upper: 'Ơ̆', lower: 'ơ̆', name: 'Ơ dấu trăng (Ơ-breve)', telex: 'owx / OWX', vni: 'o78 / O78', unicodeUpper: 'U+01A0+U+0306', unicodeLower: 'U+01A1+U+0306' },
  { upper: 'Ŭ', lower: 'ŭ', name: 'U dấu trăng (U-breve)', telex: 'ux / UX', vni: 'u8 / U8', unicodeUpper: 'U+016C', unicodeLower: 'U+016D' },
  { upper: 'Ư̆', lower: 'ư̆', name: 'Ư dấu trăng (Ư-breve)', telex: 'uwx / UWX', vni: 'u78 / U78', unicodeUpper: 'U+01AF+U+0306', unicodeLower: 'U+01B0+U+0306' },
];

export const VIETNAMESE_VOWELS = [
  { upper: 'Ă', lower: 'ă', telex: 'aw', vni: 'a8' },
  { upper: 'Â', lower: 'â', telex: 'aa', vni: 'a6' },
  { upper: 'Ê', lower: 'ê', telex: 'ee', vni: 'e6' },
  { upper: 'Ô', lower: 'ô', telex: 'oo', vni: 'o6' },
  { upper: 'Ơ', lower: 'ơ', telex: 'ow', vni: 'o7' },
  { upper: 'Ư', lower: 'ư', telex: 'uw', vni: 'u7' },
];

// Bảng nguyên âm tiếng Việt kèm 5 dấu thanh (ngang, sắc, huyền, hỏi, ngã, nặng)
const BANG_NGUYEN_AM: Record<string, string[]> = {
  a: ['a', 'á', 'à', 'ả', 'ã', 'ạ'],
  ă: ['ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ'],
  â: ['â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ'],
  e: ['e', 'é', 'è', 'ẻ', 'ẽ', 'ẹ'],
  ê: ['ê', 'ế', 'ề', 'ể', 'ễ', 'ệ'],
  i: ['i', 'í', 'ì', 'ỉ', 'ĩ', 'ị'],
  o: ['o', 'ó', 'ò', 'ỏ', 'õ', 'ọ'],
  ô: ['ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ'],
  ơ: ['ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ'],
  u: ['u', 'ú', 'ù', 'ủ', 'ũ', 'ụ'],
  ư: ['ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự'],
  y: ['y', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'],
};

// Quy tắc Telex Êđê từ đặc tả AmaKey (QUY_TAC_TELEX_EDE)
const QUY_TAC_TELEX_EDE: [string, string, string][] = [
  ['ê', 'x', 'ê\u0306'],
  ['ĕ', 'e', 'ê\u0306'],
  ['ô', 'x', 'ô\u0306'],
  ['ŏ', 'o', 'ô\u0306'],
  ['ơ', 'x', 'ơ\u0306'],
  ['ŏ', 'w', 'ơ\u0306'],
  ['ư', 'x', 'ư\u0306'],
  ['ŭ', 'w', 'ư\u0306'],
  ['a', 'a', 'â'],
  ['a', 'w', 'ă'],
  ['a', 'x', 'ă'],
  ['b', 'b', 'ƀ'],
  ['c', 'c', 'č'],
  ['d', 'd', 'đ'],
  ['e', 'e', 'ê'],
  ['e', 'x', 'ĕ'],
  ['i', 'x', 'ĭ'],
  ['n', 'n', 'ñ'],
  ['o', 'o', 'ô'],
  ['o', 'x', 'ŏ'],
  ['o', 'w', 'ơ'],
  ['u', 'x', 'ŭ'],
  ['u', 'w', 'ư'],
];

// Quy tắc VNI Êđê từ đặc tả AmaKey (QUY_TAC_VNI_EDE)
const QUY_TAC_VNI_EDE: [string, string, string][] = [
  ['ê', '8', 'ê\u0306'],
  ['ĕ', '6', 'ê\u0306'],
  ['ô', '8', 'ô\u0306'],
  ['ŏ', '6', 'ô\u0306'],
  ['ơ', '8', 'ơ\u0306'],
  ['ŏ', '7', 'ơ\u0306'],
  ['ư', '8', 'ư\u0306'],
  ['ŭ', '7', 'ư\u0306'],
  ['a', '6', 'â'],
  ['a', '8', 'ă'],
  ['b', '9', 'ƀ'],
  ['c', '9', 'č'],
  ['d', '9', 'đ'],
  ['e', '6', 'ê'],
  ['e', '8', 'ĕ'],
  ['i', '8', 'ĭ'],
  ['n', '9', 'ñ'],
  ['o', '6', 'ô'],
  ['o', '7', 'ơ'],
  ['o', '8', 'ŏ'],
  ['u', '7', 'ư'],
  ['u', '8', 'ŭ'],
];

interface BienDoiEde {
  phim: string;
  viTriChu: number;
  truoc: string;
  sau: string;
  chuoiGoTre?: [string, string];
}

export class AmaKeySession {
  private vanBanSoan = '';
  private theHeNguCanh = 0;
  private boQuaBienDoiDenKhiDatLai = false;
  private wDonDangCho = false;
  private dauThanhHoaChoXacNhan: [string, string] | null = null;
  private bienDoiEde: BienDoiEde[] = [];
  private lichSuTruocDauCach: Array<{
    tieng: string;
    boQua: boolean;
    bienDoi: BienDoiEde[];
  }> = [];

  constructor(public mode: AmaKeyMode = 'telexEde') {}

  setMode(mode: AmaKeyMode) {
    this.mode = mode;
    this.datLai(this.theHeNguCanh + 1);
  }

  datLai(theHeNguCanh = 0) {
    this.vanBanSoan = '';
    this.theHeNguCanh = theHeNguCanh;
    this.boQuaBienDoiDenKhiDatLai = false;
    this.wDonDangCho = false;
    this.dauThanhHoaChoXacNhan = null;
    this.bienDoiEde = [];
    this.lichSuTruocDauCach = [];
  }

  getBuffer(): string {
    return this.vanBanSoan;
  }

  ketThucBangDauCach(theHeNguCanh: number) {
    if (theHeNguCanh !== this.theHeNguCanh) {
      this.datLai(theHeNguCanh);
    }
    if (this.lichSuTruocDauCach.length >= 32) {
      this.lichSuTruocDauCach.shift();
    }
    this.lichSuTruocDauCach.push({
      tieng: this.vanBanSoan,
      boQua: this.boQuaBienDoiDenKhiDatLai,
      bienDoi: [...this.bienDoiEde],
    });
    this.vanBanSoan = '';
    this.boQuaBienDoiDenKhiDatLai = false;
    this.wDonDangCho = false;
    this.dauThanhHoaChoXacNhan = null;
    this.bienDoiEde = [];
  }

  xoaKyTu(theHeNguCanh: number): AmaKeyAction {
    if (theHeNguCanh !== this.theHeNguCanh) {
      this.datLai(theHeNguCanh);
      return { daXuLy: false, vanBanSoan: '', soKyTuThayThe: 0, daDatLai: true };
    }
    this.wDonDangCho = false;
    this.dauThanhHoaChoXacNhan = null;

    if (this.vanBanSoan.length === 0 && this.lichSuTruocDauCach.length > 0) {
      const truoc = this.lichSuTruocDauCach.pop()!;
      this.vanBanSoan = truoc.tieng;
      this.boQuaBienDoiDenKhiDatLai = truoc.boQua;
      this.bienDoiEde = truoc.bienDoi;
      return { daXuLy: false, vanBanSoan: '', soKyTuThayThe: 0, daDatLai: false };
    }

    const vanBanCu = this.vanBanSoan;
    if ((this.mode === 'telexEde' || this.mode === 'vniEde') && this.vanBanSoan.endsWith('\u0306')) {
      this.vanBanSoan = this.vanBanSoan.slice(0, -1);
    }
    if (this.vanBanSoan.length > 0) {
      this.vanBanSoan = this.vanBanSoan.slice(0, -1);
    }
    if (this.mode === 'telexEde' || this.mode === 'vniEde') {
      this.bienDoiEde = [];
      this.boQuaBienDoiDenKhiDatLai = false;
    }
    if (this.vanBanSoan.length === 0) {
      this.boQuaBienDoiDenKhiDatLai = false;
    }
    return taoHanhDongChenhLech(vanBanCu, this.vanBanSoan);
  }

  xuLy(kyTuNhap: string, theHeNguCanh: number): AmaKeyAction {
    if (this.mode === 'off') {
      return { daXuLy: false, vanBanSoan: kyTuNhap, soKyTuThayThe: 0, daDatLai: false };
    }
    if (theHeNguCanh !== this.theHeNguCanh) {
      this.datLai(theHeNguCanh);
      return { daXuLy: false, vanBanSoan: '', soKyTuThayThe: 0, daDatLai: true };
    }

    // Nếu gõ khoảng trắng hoặc dấu phân tách từ, kết thúc tiếng
    if (/[\s\.,;:\?!'"\(\)\[\]\{\}\/\\><=\+\-_`~@#\$%\^&\*]/.test(kyTuNhap)) {
      this.ketThucBangDauCach(theHeNguCanh);
      return { daXuLy: false, vanBanSoan: kyTuNhap, soKyTuThayThe: 0, daDatLai: false };
    }

    const vanBanCu = this.vanBanSoan;
    const vanBanKhongBienDoi = vanBanCu + kyTuNhap;

    for (const kyTu of kyTuNhap) {
      switch (this.mode) {
        case 'telexEde': {
          if (this.boQuaBienDoiDenKhiDatLai) {
            this.vanBanSoan += kyTu;
          } else {
            this.xuLyPhimTelexEde(kyTu);
          }
          break;
        }
        case 'vniEde': {
          if (this.boQuaBienDoiDenKhiDatLai) {
            this.vanBanSoan += kyTu;
          } else {
            this.xuLyPhimVniEde(kyTu);
          }
          break;
        }
        case 'telexVi': {
          if (this.boQuaBienDoiDenKhiDatLai) {
            this.vanBanSoan += kyTu;
          } else {
            this.xuLyPhimTelexVi(kyTu);
          }
          break;
        }
        case 'vniVi': {
          if (this.boQuaBienDoiDenKhiDatLai) {
            this.vanBanSoan += kyTu;
          } else {
            this.xuLyPhimVniVi(kyTu);
          }
          break;
        }
        default:
          this.vanBanSoan += kyTu;
      }
    }

    // Chuẩn hóa Unicode NFC
    this.vanBanSoan = this.vanBanSoan.normalize('NFC');

    if (this.vanBanSoan === vanBanKhongBienDoi) {
      return { daXuLy: false, vanBanSoan: kyTuNhap, soKyTuThayThe: 0, daDatLai: false };
    }

    return taoHanhDongChenhLech(vanBanCu, this.vanBanSoan);
  }

  // -------------------------------------------------------------
  // Xử lý TELEX ÊĐÊ
  // -------------------------------------------------------------
  private xuLyPhimTelexEde(kyTu: string) {
    this.khoiPhucNguyenAmEde(kyTu);
    const phimBienDoi = kyTu.toLowerCase();

    // 1. Kiểm tra ký tự liền kề cuối cùng trước
    const cuoi = this.vanBanSoan.slice(-1);
    if (cuoi) {
      const quyTac = timQuyTacTelexEde(cuoi, phimBienDoi);
      if (quyTac) {
        const dauRa = cuoi === cuoi.toUpperCase() ? quyTac.toUpperCase() : quyTac;
        this.bienDoiEde.push({
          phim: phimBienDoi,
          viTriChu: this.vanBanSoan.length - 1,
          truoc: cuoi,
          sau: dauRa,
        });
        this.vanBanSoan = this.vanBanSoan.slice(0, -1) + dauRa;
        return;
      }
    }

    // 2. Biến đổi trễ (phụ âm hoặc nguyên âm đứng trước)
    const laPhimPhuAm = ['b', 'c', 'd', 'n'].includes(phimBienDoi);
    const doiPhuAmDau =
      ['b', 'c', 'd'].includes(phimBienDoi) &&
      this.vanBanSoan.length > 0 &&
      this.vanBanSoan[0].toLowerCase() === kyTu.toLowerCase();

    const chuCuoi = this.vanBanSoan.replace(/\u0306/g, '').slice(-1);
    const coTheBienDoiTre =
      doiPhuAmDau ||
      ['w', 'x', 'a', 'e', 'o', 'u'].includes(phimBienDoi) ||
      (laPhimPhuAm && chuCuoi && !laNguyenAmEde(chuCuoi));

    if (coTheBienDoiTre) {
      const chars = Array.from(this.vanBanSoan);
      let foundIdx = -1;
      let targetRule = '';

      if (laPhimPhuAm) {
        for (let i = 0; i < chars.length; i++) {
          const c = chars[i];
          const next = chars[i + 1];
          if (next === '\u0306') continue;
          const rule = timQuyTacTelexEde(c, phimBienDoi);
          if (rule) {
            foundIdx = i;
            targetRule = rule;
            break;
          }
        }
      } else {
        for (let i = chars.length - 1; i >= 0; i--) {
          const c = chars[i];
          const next = chars[i + 1];
          if (next === '\u0306') continue;
          const rule = timQuyTacTelexEde(c, phimBienDoi);
          if (rule) {
            foundIdx = i;
            targetRule = rule;
            break;
          }
        }
      }

      if (foundIdx >= 0 && targetRule) {
        const chuGoc = chars[foundIdx];
        const dauRa = chuGoc === chuGoc.toUpperCase() ? targetRule.toUpperCase() : targetRule;
        const chuoiNguyenDang = this.vanBanSoan + kyTu;
        const chuoiBienDoi =
          chars.slice(0, foundIdx).join('') + dauRa + chars.slice(foundIdx + 1).join('');

        this.bienDoiEde.push({
          phim: phimBienDoi,
          viTriChu: foundIdx,
          truoc: chuGoc,
          sau: dauRa,
          chuoiGoTre: ['a', 'e', 'o', 'u'].includes(phimBienDoi)
            ? [chuoiNguyenDang, chuoiBienDoi]
            : undefined,
        });

        this.vanBanSoan = chuoiBienDoi;
        return;
      }
    }

    // 3. Hoàn nguyên phím khi gõ lặp lại
    if (this.hoanNguyenPhimTelexEde(kyTu)) {
      this.boQuaBienDoiDenKhiDatLai = true;
      return;
    }

    this.vanBanSoan += kyTu;
  }

  private khoiPhucNguyenAmEde(kyTu: string) {
    const lanDoi = this.bienDoiEde[this.bienDoiEde.length - 1];
    if (!lanDoi || !lanDoi.chuoiGoTre) return;
    const [nguyenDang, daDoi] = lanDoi.chuoiGoTre;
    if (this.vanBanSoan !== daDoi) return;

    const chars = Array.from(nguyenDang);
    const nguyenAmMoi = chars[chars.length - 1];
    const chuTruoc = chars[chars.length - 2];
    if (!chuTruoc || laNguyenAmEde(chuTruoc)) return;

    const phim = kyTu.toLowerCase();
    const tiepTucChuLap = kyTu.toLowerCase() === chuTruoc.toLowerCase();
    const datDauLenChuMoi =
      ['w', 'x'].includes(phim) &&
      Boolean(timQuyTacTelexEde(nguyenAmMoi, phim)) &&
      !timQuyTacTelexEde(lanDoi.sau.charAt(0), phim);

    if (tiepTucChuLap || datDauLenChuMoi) {
      this.vanBanSoan = nguyenDang;
      this.bienDoiEde.pop();
    }
  }

  private hoanNguyenPhimTelexEde(kyTu: string): boolean {
    const phimLower = kyTu.toLowerCase();
    for (let i = this.bienDoiEde.length - 1; i >= 0; i--) {
      const lan = this.bienDoiEde[i];
      if (lan.phim !== phimLower) continue;

      const idx = this.vanBanSoan.lastIndexOf(lan.sau);
      if (idx !== -1) {
        this.vanBanSoan =
          this.vanBanSoan.slice(0, idx) + lan.truoc + this.vanBanSoan.slice(idx + lan.sau.length) + kyTu;
        this.bienDoiEde.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  // -------------------------------------------------------------
  // Xử lý VNI ÊĐÊ
  // -------------------------------------------------------------
  private xuLyPhimVniEde(kyTu: string) {
    if (!['6', '7', '8', '9'].includes(kyTu)) {
      this.vanBanSoan += kyTu;
      return;
    }

    const chars = Array.from(this.vanBanSoan);

    // Ký tự liền kề cuối cùng trước
    const cuoi = chars[chars.length - 1];
    if (cuoi) {
      const rule = timQuyTacVniEde(cuoi, kyTu);
      if (rule) {
        const dauRa = cuoi === cuoi.toUpperCase() ? rule.toUpperCase() : rule;
        this.bienDoiEde.push({
          phim: kyTu,
          viTriChu: chars.length - 1,
          truoc: cuoi,
          sau: dauRa,
        });
        chars[chars.length - 1] = dauRa;
        this.vanBanSoan = chars.join('');
        return;
      }
    }

    // Biến đổi trễ cho VNI Êđê
    const laPhimPhuAm = kyTu === '9';
    let foundIdx = -1;
    let targetRule = '';

    if (laPhimPhuAm) {
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (chars[i + 1] === '\u0306') continue;
        const rule = timQuyTacVniEde(c, kyTu);
        if (rule && ['b', 'c', 'd', 'n'].includes(c.toLowerCase())) {
          foundIdx = i;
          targetRule = rule;
          break;
        }
      }
    } else {
      for (let i = chars.length - 1; i >= 0; i--) {
        const c = chars[i];
        if (chars[i + 1] === '\u0306') continue;
        const rule = timQuyTacVniEde(c, kyTu);
        if (rule) {
          foundIdx = i;
          targetRule = rule;
          break;
        }
      }
    }

    if (foundIdx >= 0 && targetRule) {
      const chuGoc = chars[foundIdx];
      const dauRa = chuGoc === chuGoc.toUpperCase() ? targetRule.toUpperCase() : targetRule;
      this.bienDoiEde.push({
        phim: kyTu,
        viTriChu: foundIdx,
        truoc: chuGoc,
        sau: dauRa,
      });
      chars[foundIdx] = dauRa;
      this.vanBanSoan = chars.join('');
      return;
    }

    // Hoàn nguyên phím lặp
    if (this.hoanNguyenPhimTelexEde(kyTu)) {
      this.boQuaBienDoiDenKhiDatLai = true;
      return;
    }

    this.vanBanSoan += kyTu;
  }

  // -------------------------------------------------------------
  // Xử lý TELEX TIẾNG VIỆT
  // -------------------------------------------------------------
  private xuLyPhimTelexVi(kyTu: string) {
    if (kyTu === '[') {
      this.vanBanSoan += 'ư';
      return;
    }
    if (kyTu === ']') {
      this.vanBanSoan += 'ơ';
      return;
    }
    if (kyTu.toLowerCase() === 'z') {
      if (this.xoaDauThanh()) return;
      this.vanBanSoan += kyTu;
      return;
    }

    const maDau = maDauTelex(kyTu);
    if (maDau !== null) {
      const hoanNguyen = this.datDauThanh(maDau, kyTu);
      if (hoanNguyen !== null) {
        this.boQuaBienDoiDenKhiDatLai = hoanNguyen;
        return;
      }
      this.vanBanSoan += kyTu;
      return;
    }

    const kyTuThuong = kyTu.toLowerCase();
    const kyTuCuoi = this.vanBanSoan.slice(-1);
    const inHoa = Boolean(kyTu === kyTu.toUpperCase() || (kyTuCuoi && kyTuCuoi === kyTuCuoi.toUpperCase()));

    // Phím lặp (aa, ee, oo, dd, aw, ow, uw)
    if (kyTuThuong === 'w') {
      if (this.chuyenUaCuoiThanhUaMoc()) return;
      if (this.bienDoiWTelex()) return;
      this.vanBanSoan += inHoa ? 'Ư' : 'ư';
      return;
    }

    const thayThe: Record<string, string> = {
      'a+a': 'â',
      'e+e': 'ê',
      'o+o': 'ô',
      'd+d': 'đ',
    };
    const key = `${kyTuCuoi.toLowerCase()}+${kyTuThuong}`;
    if (thayThe[key]) {
      const res = inHoa ? thayThe[key].toUpperCase() : thayThe[key];
      this.vanBanSoan = this.vanBanSoan.slice(0, -1) + res;
      this.capNhatViTriDau();
      return;
    }

    // Biến đổi nguyên âm cơ sở lùi
    if (['a', 'e', 'o', 'd'].includes(kyTuThuong)) {
      const chars = Array.from(this.vanBanSoan);
      let foundIdx = -1;
      for (let i = chars.length - 1; i >= 0; i--) {
        if (kyTuCoSo(chars[i]) === kyTuThuong) {
          foundIdx = i;
          break;
        }
      }
      if (foundIdx >= 0) {
        const mucTieu: Record<string, string> = { a: 'â', e: 'ê', o: 'ô', d: 'đ' };
        chars[foundIdx] = themDauPhu(chars[foundIdx], mucTieu[kyTuThuong], inHoa);
        this.vanBanSoan = chars.join('');
        this.capNhatViTriDau();
        return;
      }
    }

    this.vanBanSoan += kyTu;
    this.chuyenUoMocThanhUoHaiMoc();
    this.capNhatViTriDau();
  }

  private chuyenUaCuoiThanhUaMoc(): boolean {
    const chars = Array.from(this.vanBanSoan);
    if (chars.length < 2) return false;
    const uIdx = chars.length - 2;
    const isU = kyTuCoSo(chars[uIdx]) === 'u';
    const isA = kyTuCoSo(chars[uIdx + 1]) === 'a';
    if (!isU || !isA) return false;
    if (uIdx > 0 && chars[uIdx - 1].toLowerCase() === 'q') return false;

    const maDau = maDauCuaKyTu(chars[uIdx]) || 0;
    const uMoc = vietDau('ư', maDau) || 'ư';
    chars[uIdx] = chars[uIdx] === chars[uIdx].toUpperCase() ? uMoc.toUpperCase() : uMoc;
    this.vanBanSoan = chars.join('');
    return true;
  }

  private bienDoiWTelex(): boolean {
    const chars = Array.from(this.vanBanSoan);
    for (let i = chars.length - 1; i >= 0; i--) {
      const base = kyTuCoSo(chars[i]);
      if (['a', 'o', 'u'].includes(base)) {
        const map: Record<string, string> = { a: 'ă', o: 'ơ', u: 'ư' };
        const inHoa = chars[i] === chars[i].toUpperCase();
        chars[i] = themDauPhu(chars[i], map[base], inHoa);
        this.vanBanSoan = chars.join('');
        this.capNhatViTriDau();
        return true;
      }
    }
    return false;
  }

  // -------------------------------------------------------------
  // Xử lý VNI TIẾNG VIỆT
  // -------------------------------------------------------------
  private xuLyPhimVniVi(kyTu: string) {
    if (['1', '2', '3', '4', '5'].includes(kyTu)) {
      const maDau = parseInt(kyTu, 10);
      const hoanNguyen = this.datDauThanh(maDau, kyTu);
      if (hoanNguyen !== null) {
        this.boQuaBienDoiDenKhiDatLai = hoanNguyen;
        return;
      }
      this.vanBanSoan += kyTu;
      return;
    }
    if (kyTu === '0') {
      if (!this.xoaDauThanh()) {
        this.vanBanSoan += kyTu;
      }
      return;
    }
    if (['6', '7', '8', '9'].includes(kyTu)) {
      if (this.datDauPhuVni(kyTu)) {
        this.chuyenUoMocThanhUoHaiMoc();
        this.capNhatViTriDau();
        return;
      }
      this.vanBanSoan += kyTu;
      return;
    }
    this.vanBanSoan += kyTu;
    this.chuyenUoMocThanhUoHaiMoc();
    this.capNhatViTriDau();
  }

  private datDauPhuVni(phim: string): boolean {
    const coSoMap: Record<string, string[]> = {
      '6': ['a', 'e', 'o'],
      '7': ['o', 'u'],
      '8': ['a'],
      '9': ['d'],
    };
    const targetMap: Record<string, Record<string, string>> = {
      '6': { a: 'â', e: 'ê', o: 'ô' },
      '7': { o: 'ơ', u: 'ư' },
      '8': { a: 'ă' },
      '9': { d: 'đ' },
    };

    const coSo = coSoMap[phim];
    if (!coSo) return false;

    const chars = Array.from(this.vanBanSoan);
    for (let i = chars.length - 1; i >= 0; i--) {
      const base = kyTuCoSo(chars[i]);
      if (coSo.includes(base)) {
        const target = targetMap[phim][base];
        if (target) {
          chars[i] = themDauPhu(chars[i], target, chars[i] === chars[i].toUpperCase());
          this.vanBanSoan = chars.join('');
          return true;
        }
      }
    }
    return false;
  }

  // -------------------------------------------------------------
  // Dấu thanh & Vị trí đặt dấu chuẩn Tiếng Việt
  // -------------------------------------------------------------
  private xoaDauThanh(): boolean {
    const viTri = timViTriDatDau(this.vanBanSoan);
    if (viTri === null) return false;
    const chars = Array.from(this.vanBanSoan);
    const maDau = maDauCuaKyTu(chars[viTri]);
    if (!maDau) return false;
    chars[viTri] = vietDau(chars[viTri], 0) || chars[viTri];
    this.vanBanSoan = chars.join('');
    return true;
  }

  private datDauThanh(maDau: number, phim: string): boolean | null {
    const viTri = timViTriDatDau(this.vanBanSoan);
    if (viTri === null) return null;
    const chars = Array.from(this.vanBanSoan);
    const maDauHienTai = maDauCuaKyTu(chars[viTri]) || 0;
    const laHoanNguyen = maDauHienTai === maDau;

    chars[viTri] = vietDau(chars[viTri], laHoanNguyen ? 0 : maDau) || chars[viTri];
    if (laHoanNguyen) {
      chars.push(phim);
    }
    this.vanBanSoan = chars.join('');
    return laHoanNguyen;
  }

  private capNhatViTriDau() {
    const chars = Array.from(this.vanBanSoan);
    let viTriDauCu = -1;
    let maDau = 0;

    for (let i = 0; i < chars.length; i++) {
      const d = maDauCuaKyTu(chars[i]);
      if (d && d !== 0) {
        viTriDauCu = i;
        maDau = d;
        break;
      }
    }
    if (viTriDauCu === -1) return;

    const viTriDauMoi = timViTriDatDau(this.vanBanSoan);
    if (viTriDauMoi === null || viTriDauCu === viTriDauMoi) return;

    chars[viTriDauCu] = vietDau(chars[viTriDauCu], 0) || chars[viTriDauCu];
    chars[viTriDauMoi] = vietDau(chars[viTriDauMoi], maDau) || chars[viTriDauMoi];
    this.vanBanSoan = chars.join('');
  }

  private chuyenUoMocThanhUoHaiMoc() {
    const chars = Array.from(this.vanBanSoan);
    for (let i = 0; i < chars.length - 1; i++) {
      if (chars[i].toLowerCase() === 'u' && kyTuCoSo(chars[i + 1]) === 'ơ') {
        const isUpper = chars[i] === chars[i].toUpperCase();
        chars[i] = isUpper ? 'Ư' : 'ư';
        this.vanBanSoan = chars.join('');
        return;
      }
    }
  }
}

// -----------------------------------------------------------------
// Helpers tra cứu & Phép tính ngôn ngữ
// -----------------------------------------------------------------

function laNguyenAmEde(chu: string): boolean {
  return 'aăâeĕêiĭoŏôơuŭư'.includes(chu.toLowerCase());
}

function timQuyTacTelexEde(chuGoc: string, phim: string): string | null {
  const c = chuGoc.toLowerCase();
  const rule = QUY_TAC_TELEX_EDE.find(([g, p]) => g === c && p === phim);
  return rule ? rule[2] : null;
}

function timQuyTacVniEde(chuGoc: string, phim: string): string | null {
  const c = chuGoc.toLowerCase();
  const rule = QUY_TAC_VNI_EDE.find(([g, p]) => g === c && p === phim);
  return rule ? rule[2] : null;
}

function kyTuCoSo(kyTu: string): string {
  const base = vietDau(kyTu, 0) || kyTu;
  return base.toLowerCase();
}

function vietDau(kyTu: string, maDau: number): string | null {
  const lower = kyTu.toLowerCase();
  const isUpper = kyTu === kyTu.toUpperCase() && kyTu !== kyTu.toLowerCase();

  for (const [_, hang] of Object.entries(BANG_NGUYEN_AM)) {
    if (hang.includes(lower)) {
      const res = hang[maDau] || hang[0];
      return isUpper ? res.toUpperCase() : res;
    }
  }
  return null;
}

function maDauCuaKyTu(kyTu: string): number | null {
  const lower = kyTu.toLowerCase();
  for (const [_, hang] of Object.entries(BANG_NGUYEN_AM)) {
    const idx = hang.indexOf(lower);
    if (idx !== -1) return idx;
  }
  return null;
}

function themDauPhu(kyTuCu: string, kyTuMoi: string, inHoa: boolean): string {
  const maDau = maDauCuaKyTu(kyTuCu) || 0;
  const isUpper = kyTuCu === kyTuCu.toUpperCase() || inHoa;
  const target = isUpper ? kyTuMoi.toUpperCase() : kyTuMoi.toLowerCase();
  return vietDau(target, maDau) || target;
}

function maDauTelex(kyTu: string): number | null {
  switch (kyTu.toLowerCase()) {
    case 's':
      return 1;
    case 'f':
      return 2;
    case 'r':
      return 3;
    case 'x':
      return 4;
    case 'j':
      return 5;
    default:
      return null;
  }
}

function timViTriDatDau(vanBan: string): number | null {
  const chars = Array.from(vanBan);
  const nguyenAm: number[] = [];

  for (let i = 0; i < chars.length; i++) {
    if (vietDau(chars[i], 0) !== null) {
      nguyenAm.push(i);
    }
  }
  if (nguyenAm.length === 0) return null;

  // Lọc trường hợp "qu" hoặc "gi"
  const filtered = nguyenAm.filter((pos) => {
    const coSo = kyTuCoSo(chars[pos]);
    if (pos === 1 && chars[0].toLowerCase() === 'q' && coSo === 'u') return false;
    if (pos === 1 && chars[0].toLowerCase() === 'g' && coSo === 'i' && nguyenAm.length > 1) return false;
    return true;
  });
  const candidates = filtered.length > 0 ? filtered : nguyenAm;

  // Ưu tiên nguyên âm kép mang dấu (ă, â, ê, ô, ơ, ư)
  for (let i = candidates.length - 1; i >= 0; i--) {
    const base = vietDau(chars[candidates[i]], 0) || chars[candidates[i]];
    if ('ăâêôơưĂÂÊÔƠƯ'.includes(base)) {
      return candidates[i];
    }
  }

  const viTriCuoi = candidates[candidates.length - 1];
  if (candidates.length >= 2 && viTriCuoi + 1 === chars.length) {
    return candidates[candidates.length - 2];
  }
  return viTriCuoi;
}

function taoHanhDongChenhLech(vanBanCu: string, vanBanMoi: string): AmaKeyAction {
  let soKyTuChung = 0;
  const charsCu = Array.from(vanBanCu);
  const charsMoi = Array.from(vanBanMoi);
  const minLen = Math.min(charsCu.length, charsMoi.length);

  while (soKyTuChung < minLen && charsCu[soKyTuChung] === charsMoi[soKyTuChung]) {
    soKyTuChung++;
  }

  return {
    daXuLy: true,
    vanBanSoan: charsMoi.slice(soKyTuChung).join(''),
    soKyTuThayThe: charsCu.length - soKyTuChung,
    daDatLai: false,
  };
}

/**
 * Biến đổi một chuỗi văn bản gõ liên tục qua AmaKey theo mode
 */
export function processTextWithAmaKey(input: string, mode: AmaKeyMode): string {
  if (mode === 'off' || !input) return input;
  const session = new AmaKeySession(mode);
  let result = '';

  for (const ch of input) {
    if (/[\s\.,;:\?!'"\(\)\[\]\{\}\/\\><=\+\-_`~@#\$%\^&\*]/.test(ch)) {
      session.ketThucBangDauCach(0);
      result += ch;
    } else {
      const act = session.xuLy(ch, 0);
      if (act.daXuLy) {
        if (act.soKyTuThayThe > 0) {
          result = result.slice(0, -act.soKyTuThayThe);
        }
        result += act.vanBanSoan;
      } else {
        result += ch;
      }
    }
  }
  return result.normalize('NFC');
}
