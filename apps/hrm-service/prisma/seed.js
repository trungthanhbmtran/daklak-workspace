"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var PrismaClient;
try {
    PrismaClient = require('@generated/prisma/client').PrismaClient;
}
catch (e) {
    PrismaClient = require('../generated/prisma/client').PrismaClient;
}
var adapter_mariadb_1 = require("@prisma/adapter-mariadb");
var url = process.env.DATABASE_URL;
if (!url) {
    console.error('DATABASE_URL chưa được đặt. Tạo file .env với DATABASE_URL="mysql://..."');
    process.exit(1);
}
var adapter = new adapter_mariadb_1.PrismaMariaDb(url);
var prisma = new PrismaClient({ adapter: adapter });
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var startDate, units, jobTitles, categories, unitMap, jobMap, catMap, EMPLOYEES, count, _i, EMPLOYEES_1, e, error_1, _a, EMPLOYEES_2, e, staffing, staffingId, emptySlot, lastSlot, nextSlotOrder, newStaffing, error_2, RANK_TEMPLATES, kpiPeriods, kpiCriteria;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🔹 Seed HRM employees...');
                    startDate = new Date('2020-01-01');
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT id, code FROM admin_systems.organization_units"], ["SELECT id, code FROM admin_systems.organization_units"])))];
                case 1:
                    units = _b.sent();
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT id, code FROM admin_systems.job_titles"], ["SELECT id, code FROM admin_systems.job_titles"])))];
                case 2:
                    jobTitles = _b.sent();
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["SELECT id, code FROM admin_systems.sys_categories"], ["SELECT id, code FROM admin_systems.sys_categories"])))];
                case 3:
                    categories = _b.sent();
                    unitMap = Object.fromEntries(units.map(function (u) { return [u.code, u.id]; }));
                    jobMap = Object.fromEntries(jobTitles.map(function (j) { return [j.code, j.id]; }));
                    catMap = Object.fromEntries(categories.map(function (c) { return [c.code, c.id]; }));
                    if (!unitMap['H15.07'] || !jobMap['GIAM_DOC']) {
                        console.log('⚠️ Please run user-service seed first to create OrganizationUnits, JobTitles and Categories!');
                        return [2 /*return*/];
                    }
                    EMPLOYEES = [
                        // --- Lãnh đạo Sở KHCN ---
                        { fullName: 'Bùi Thanh Toàn', firstname: 'Bùi Thanh', lastname: 'Toàn', employeeCode: 'NV_001', email: 'buithanhtoan@daklak.gov.vn', phone: '0901000001', identityCard: '001000001', departmentId: unitMap['H15.07'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['SENIOR_SPECIALIST'], partyTitleId: jobMap['BI_THU_DANG_BO'] },
                        { fullName: 'Phạm Gia Việt', firstname: 'Phạm Gia', lastname: 'Việt', employeeCode: 'NV_002', email: 'phamgiaviet@daklak.gov.vn', phone: '0901000002', identityCard: '001000002', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
                        { fullName: 'Ra Lan Trương Thanh Hà', firstname: 'Ra Lan Trương', lastname: 'Thanh Hà', employeeCode: 'NV_003', email: 'ralantruongthanhha@daklak.gov.vn', phone: '0901000003', identityCard: '001000003', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'], partyTitleId: jobMap['PHO_BI_THU_DANG_BO'] },
                        { fullName: 'Trần Văn Sơn', firstname: 'Trần Văn', lastname: 'Sơn', employeeCode: 'NV_004', email: 'tranvanson@daklak.gov.vn', phone: '0901000004', identityCard: '001000004', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
                        { fullName: 'Lâm Vũ Mỹ Hạnh', firstname: 'Lâm Vũ Mỹ', lastname: 'Hạnh', employeeCode: 'NV_005', email: 'lamvumyhanh@daklak.gov.vn', phone: '0901000005', identityCard: '001000005', departmentId: unitMap['H15.07'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
                        // --- Lãnh đạo các phòng ban Sở KHCN (Khối Công chức) ---
                        { fullName: 'Nguyễn Chiến Thắng', firstname: 'Nguyễn Chiến', lastname: 'Thắng', employeeCode: 'NV_020', email: 'nguyenvana@daklak.gov.vn', phone: '0902000020', identityCard: '002000020', departmentId: unitMap['H15.07.05'], jobTitleId: jobMap['CHANH_VAN_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'], partyTitleId: jobMap['DANG_UY_VIEN'] },
                        { fullName: 'Lê Thị B', firstname: 'Lê Thị', lastname: 'B', employeeCode: 'NV_021', email: 'lethib@daklak.gov.vn', phone: '0902000021', identityCard: '002000021', departmentId: unitMap['H15.07.07'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
                        { fullName: 'Trần Văn C', firstname: 'Trần Văn', lastname: 'C', employeeCode: 'NV_022', email: 'tranvanc@daklak.gov.vn', phone: '0902000022', identityCard: '002000022', departmentId: unitMap['H15.07.08'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
                        { fullName: 'Phạm Thị D', firstname: 'Phạm Thị', lastname: 'D', employeeCode: 'NV_023', email: 'phamthid@daklak.gov.vn', phone: '0902000023', identityCard: '002000023', departmentId: unitMap['H15.07.09'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
                        { fullName: 'Hoàng Văn E', firstname: 'Hoàng Văn', lastname: 'E', employeeCode: 'NV_024', email: 'hoangvane@daklak.gov.vn', phone: '0902000024', identityCard: '002000024', departmentId: unitMap['H15.07.10'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
                        { fullName: 'Vũ Thị F', firstname: 'Vũ Thị', lastname: 'F', employeeCode: 'NV_025', email: 'vuthif@daklak.gov.vn', phone: '0902000025', identityCard: '002000025', departmentId: unitMap['H15.07.11'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['PRINCIPAL_SPECIALIST'] },
                        // Phó Trưởng phòng Sở KHCN
                        { fullName: 'Trương Văn Phó 1', firstname: 'Trương Văn', lastname: 'Phó 1', employeeCode: 'NV_036', email: 'phochvp_khcn@daklak.gov.vn', phone: '0902000036', identityCard: '002000036', departmentId: unitMap['H15.07.05'], jobTitleId: jobMap['PHO_CHANH_VAN_PHONG'], civilServantRankId: catMap['SPECIALIST'] },
                        { fullName: 'Ngô Thị Phó 2', firstname: 'Ngô Thị', lastname: 'Phó 2', employeeCode: 'NV_037', email: 'photp_khtc_khcn@daklak.gov.vn', phone: '0902000037', identityCard: '002000037', departmentId: unitMap['H15.07.07'], jobTitleId: jobMap['PHO_PHONG'], civilServantRankId: catMap['SPECIALIST'] },
                        // --- Lãnh đạo các Trung tâm khác thuộc Sở KHCN (Khối Viên chức) ---
                        { fullName: 'Đỗ Văn G', firstname: 'Đỗ Văn', lastname: 'G', employeeCode: 'NV_026', email: 'dovang@daklak.gov.vn', phone: '0902000026', identityCard: '002000026', departmentId: unitMap['H15.07.01'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['GRADE_2'] },
                        { fullName: 'Lý Văn I', firstname: 'Lý Văn', lastname: 'I', employeeCode: 'NV_028', email: 'lyvani@daklak.gov.vn', phone: '0902000028', identityCard: '002000028', departmentId: unitMap['H15.07.02'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['GRADE_2'] },
                        // Lãnh đạo các phòng thuộc các Trung tâm khác
                        { fullName: 'Hoàng Văn HC', firstname: 'Hoàng Văn', lastname: 'HC', employeeCode: 'NV_029', email: 'truongphonghc_dmsm@daklak.gov.vn', phone: '0902000029', identityCard: '002000029', departmentId: unitMap['H15.07.01.01'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Lê Thị UT', firstname: 'Lê Thị', lastname: 'UT', employeeCode: 'NV_030', email: 'truongphongut_dmsm@daklak.gov.vn', phone: '0902000030', identityCard: '002000030', departmentId: unitMap['H15.07.01.02'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Nguyễn Văn HC', firstname: 'Nguyễn Văn', lastname: 'HC', employeeCode: 'NV_033', email: 'truongphonghc_kttdc@daklak.gov.vn', phone: '0902000033', identityCard: '002000033', departmentId: unitMap['H15.07.02.01'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Đinh Thị DL', firstname: 'Đinh Thị', lastname: 'DL', employeeCode: 'NV_034', email: 'truongphongdl_kttdc@daklak.gov.vn', phone: '0902000034', identityCard: '002000034', departmentId: unitMap['H15.07.02.02'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Vũ Văn TN', firstname: 'Vũ Văn', lastname: 'TN', employeeCode: 'NV_035', email: 'truongphongtn_kttdc@daklak.gov.vn', phone: '0902000035', identityCard: '002000035', departmentId: unitMap['H15.07.02.03'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
                        // --- Cán bộ, nhân viên Trung tâm Giám sát, Điều hành Đô thị thông minh (IOC) ---
                        { fullName: 'Võ Nguyễn Hoàng Nam', firstname: 'Võ Nguyễn Hoàng', lastname: 'Nam', employeeCode: 'NV_100', email: 'vonguyenhoangnam@daklak.gov.vn', phone: '0903000100', identityCard: '003000100', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['GRADE_2'] },
                        { fullName: 'Lê Xuân Quang', firstname: 'Lê Xuân', lastname: 'Quang', employeeCode: 'NV_101', email: 'lexuanquang@daklak.gov.vn', phone: '0903000101', identityCard: '003000101', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['GRADE_2'] },
                        { fullName: 'Trần Duy Tân', firstname: 'Trần Duy', lastname: 'Tân', employeeCode: 'NV_102', email: 'tranduytan@daklak.gov.vn', phone: '0903000102', identityCard: '003000102', departmentId: unitMap['H15.07.04'], jobTitleId: jobMap['PHO_GIAM_DOC'], civilServantRankId: catMap['GRADE_2'] },
                        { fullName: 'Lê Anh Tuấn', firstname: 'Lê Anh', lastname: 'Tuấn', employeeCode: 'NV_103', email: 'leanhtuan@daklak.gov.vn', phone: '0903000103', identityCard: '003000103', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Lê Quang Thanh', firstname: 'Lê Quang', lastname: 'Thanh', employeeCode: 'NV_104', email: 'lequangthanh@daklak.gov.vn', phone: '0903000104', identityCard: '003000104', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Lê Trọng Vũ', firstname: 'Lê Trọng', lastname: 'Vũ', employeeCode: 'NV_105', email: 'letrongvu@daklak.gov.vn', phone: '0903000105', identityCard: '003000105', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['TRUONG_PHONG'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Châu Trọng Phát', firstname: 'Châu Trọng', lastname: 'Phát', employeeCode: 'NV_106', email: 'chautrongphat@daklak.gov.vn', phone: '0903000106', identityCard: '003000106', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['KE_TOAN'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Nguyễn Thị Kim Oanh', firstname: 'Nguyễn Thị Kim', lastname: 'Oanh', employeeCode: 'NV_107', email: 'nguyenthikimoanh@daklak.gov.vn', phone: '0903000107', identityCard: '003000107', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Võ Thị Hiền', firstname: 'Võ Thị', lastname: 'Hiền', employeeCode: 'NV_108', email: 'vothihien@daklak.gov.vn', phone: '0903000108', identityCard: '003000108', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['VAN_THU'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Phạm Thế Anh', firstname: 'Phạm Thế', lastname: 'Anh', employeeCode: 'NV_109', email: 'phamtheanh@daklak.gov.vn', phone: '0903000109', identityCard: '003000109', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Phan Đăng Việt Vinh Chuẩn', firstname: 'Phan Đăng Việt Vinh', lastname: 'Chuẩn', employeeCode: 'NV_110', email: 'phandangvietvinhchuan@daklak.gov.vn', phone: '0903000110', identityCard: '003000110', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Nguyễn Minh Hóa', firstname: 'Nguyễn Minh', lastname: 'Hóa', employeeCode: 'NV_111', email: 'nguyenminhhoa@daklak.gov.vn', phone: '0903000111', identityCard: '003000111', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Châu Hòa Khánh Tâm', firstname: 'Châu Hòa Khánh', lastname: 'Tâm', employeeCode: 'NV_112', email: 'chauhoakhanhtam@daklak.gov.vn', phone: '0903000112', identityCard: '003000112', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Lê Thị Thanh Kiều', firstname: 'Lê Thị Thanh', lastname: 'Kiều', employeeCode: 'NV_113', email: 'lethithanhkieu@daklak.gov.vn', phone: '0903000113', identityCard: '003000113', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['VIEN_CHUC'], civilServantRankId: catMap['GRADE_3'] },
                        { fullName: 'Nguyễn Kiều Trang', firstname: 'Nguyễn Kiều', lastname: 'Trang', employeeCode: 'NV_114', email: 'nguyenkieutrang@daklak.gov.vn', phone: '0903000114', identityCard: '003000114', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
                        { fullName: 'H Lisa Byă', firstname: 'H Lisa', lastname: 'Byă', employeeCode: 'NV_115', email: 'hlisabya@daklak.gov.vn', phone: '0903000115', identityCard: '003000115', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
                        { fullName: 'Nguyễn Thị Diễm Quyên', firstname: 'Nguyễn Thị Diễm', lastname: 'Quyên', employeeCode: 'NV_116', email: 'nguyenthidiemquyen@daklak.gov.vn', phone: '0903000116', identityCard: '003000116', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
                        { fullName: 'Y Sơm Êñuôl', firstname: 'Y Sơm', lastname: 'Êñuôl', employeeCode: 'NV_117', email: 'ysomenuol@daklak.gov.vn', phone: '0903000117', identityCard: '003000117', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
                        { fullName: 'Nguyễn Vũ Huy', firstname: 'Nguyễn Vũ', lastname: 'Huy', employeeCode: 'NV_118', email: 'nguyenvuhuy@daklak.gov.vn', phone: '0903000118', identityCard: '003000118', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
                        { fullName: 'Phùng Đình Hưng', firstname: 'Phùng Đình', lastname: 'Hưng', employeeCode: 'NV_119', email: 'phungdinhhung@daklak.gov.vn', phone: '0903000119', identityCard: '003000119', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
                        { fullName: 'Kiều Vũ Adrơng', firstname: 'Kiều Vũ', lastname: 'Adrơng', employeeCode: 'NV_120', email: 'kieuvuadrong@daklak.gov.vn', phone: '0903000120', identityCard: '003000120', departmentId: unitMap['H15.07.04.03'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
                        { fullName: 'Nguyễn Thị Quỳnh Mai', firstname: 'Nguyễn Thị Quỳnh', lastname: 'Mai', employeeCode: 'NV_121', email: 'nguyenthiquynhmai@daklak.gov.vn', phone: '0903000121', identityCard: '003000121', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
                        { fullName: 'Nguyễn Quang Tú', firstname: 'Nguyễn Quang', lastname: 'Tú', employeeCode: 'NV_122', email: 'nguyenquangtu@daklak.gov.vn', phone: '0903000122', identityCard: '003000122', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
                        { fullName: 'Trần Trung Thành', firstname: 'Trần Trung', lastname: 'Thành', employeeCode: 'NV_123', email: 'trantrungthanh@daklak.gov.vn', phone: '0903000123', identityCard: '003000123', departmentId: unitMap['H15.07.04.02'], jobTitleId: jobMap['NHAN_VIEN'], civilServantRankId: catMap['GRADE_4'] },
                        { fullName: 'Nguyễn Sỹ Hợp', firstname: 'Nguyễn Sỹ', lastname: 'Hợp', employeeCode: 'NV_124', email: 'nguyensyhop@daklak.gov.vn', phone: '0903000124', identityCard: '003000124', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['BAO_VE'], civilServantRankId: catMap['GRADE_4'] },
                        { fullName: 'Nguyễn Tiến Quang', firstname: 'Nguyễn Tiến', lastname: 'Quang', employeeCode: 'NV_125', email: 'nguyentienquang@daklak.gov.vn', phone: '0903000125', identityCard: '003000125', departmentId: unitMap['H15.07.04.01'], jobTitleId: jobMap['BAO_VE'], civilServantRankId: catMap['GRADE_4'] },
                        // --- Lãnh đạo các Sở khác (Khối Công chức cấp Tỉnh) ---
                        { fullName: 'Trương Ngọc Tuấn', firstname: 'Trương Ngọc', lastname: 'Tuấn', employeeCode: 'NV_010', email: 'truongngoctuan@daklak.gov.vn', phone: '0901000010', identityCard: '001000010', departmentId: unitMap['H15.13'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['SENIOR_SPECIALIST'] },
                        { fullName: 'Trần Văn Tân', firstname: 'Trần Văn', lastname: 'Tân', employeeCode: 'NV_011', email: 'tranvantan@daklak.gov.vn', phone: '0901000011', identityCard: '001000011', departmentId: unitMap['H15.11'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['SENIOR_SPECIALIST'] },
                        { fullName: 'Cao Đình Huy', firstname: 'Cao Đình', lastname: 'Huy', employeeCode: 'NV_012', email: 'caodinhhuy@daklak.gov.vn', phone: '0901000012', identityCard: '001000012', departmentId: unitMap['H15.14'], jobTitleId: jobMap['GIAM_DOC'], civilServantRankId: catMap['SENIOR_SPECIALIST'] }
                    ];
                    count = 0;
                    _i = 0, EMPLOYEES_1 = EMPLOYEES;
                    _b.label = 4;
                case 4:
                    if (!(_i < EMPLOYEES_1.length)) return [3 /*break*/, 7];
                    e = EMPLOYEES_1[_i];
                    if (!e.departmentId || !e.jobTitleId) {
                        console.log("Skipping ".concat(e.employeeCode, ": departmentId=").concat(!!e.departmentId, ", jobTitleId=").concat(!!e.jobTitleId));
                        return [3 /*break*/, 6];
                    }
                    count++;
                    return [4 /*yield*/, prisma.employee.upsert({
                            where: { employeeCode: e.employeeCode },
                            update: {
                                firstname: e.firstname,
                                lastname: e.lastname,
                                fullName: e.fullName,
                                email: e.email,
                                phone: e.phone,
                                identityCard: e.identityCard,
                                departmentId: e.departmentId,
                                jobTitleId: e.jobTitleId,
                                civilServantRankId: e.civilServantRankId || null,
                                partyTitleId: e.partyTitleId || null,
                            },
                            create: {
                                firstname: e.firstname,
                                lastname: e.lastname,
                                fullName: e.fullName,
                                employeeCode: e.employeeCode,
                                email: e.email,
                                phone: e.phone,
                                identityCard: e.identityCard,
                                departmentId: e.departmentId,
                                jobTitleId: e.jobTitleId,
                                civilServantRankId: e.civilServantRankId || null,
                                partyTitleId: e.partyTitleId || null,
                                startDate: startDate,
                            },
                        })];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    console.log("\u2705 \u0110\u00E3 seed ".concat(count, " nh\u00E2n vi\u00EAn HRM tr\u00EAn t\u1ED5ng s\u1ED1 ").concat(EMPLOYEES.length, "."));
                    _b.label = 8;
                case 8:
                    _b.trys.push([8, 10, , 11]);
                    console.log('🔹 Đồng bộ user_id từ admin_systems.users sang admin_hrm.employees...');
                    return [4 /*yield*/, prisma.$executeRawUnsafe("\n      UPDATE admin_hrm.employees e\n      JOIN admin_systems.users u ON e.email = u.email\n      SET e.user_id = u.id, e.updated_at = NOW();\n    ")];
                case 9:
                    _b.sent();
                    console.log('✅ Đã đồng bộ user_id thành công.');
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _b.sent();
                    console.error('❌ Lỗi khi đồng bộ user_id:', error_1);
                    return [3 /*break*/, 11];
                case 11:
                    _b.trys.push([11, 27, , 28]);
                    console.log('🔹 Gán mã nhân viên vào Vị trí định biên (admin_systems.staffing_slots)...');
                    // Xóa tất cả gán cũ trước khi gán mới từ HRM
                    // Chỉ xóa những slot mà mã nhân viên thuộc danh sách được seed trong HRM
                    return [4 /*yield*/, prisma.$executeRawUnsafe("\n      UPDATE admin_systems.staffing_slots\n      SET assigned_employee_code = NULL\n      WHERE assigned_employee_code IS NOT NULL;\n    ")];
                case 12:
                    // Xóa tất cả gán cũ trước khi gán mới từ HRM
                    // Chỉ xóa những slot mà mã nhân viên thuộc danh sách được seed trong HRM
                    _b.sent();
                    _a = 0, EMPLOYEES_2 = EMPLOYEES;
                    _b.label = 13;
                case 13:
                    if (!(_a < EMPLOYEES_2.length)) return [3 /*break*/, 26];
                    e = EMPLOYEES_2[_a];
                    if (!(e.departmentId && e.jobTitleId && e.employeeCode)) return [3 /*break*/, 25];
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n          SELECT id FROM admin_systems.org_staffing \n          WHERE unit_id = ", " AND job_title_id = ", " LIMIT 1\n        "], ["\n          SELECT id FROM admin_systems.org_staffing \n          WHERE unit_id = ", " AND job_title_id = ", " LIMIT 1\n        "])), e.departmentId, e.jobTitleId)];
                case 14:
                    staffing = _b.sent();
                    if (!(staffing.length > 0)) return [3 /*break*/, 21];
                    staffingId = staffing[0].id;
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n            SELECT id FROM admin_systems.staffing_slots \n            WHERE staffing_id = ", " AND assigned_employee_code IS NULL \n            ORDER BY slot_order ASC LIMIT 1\n          "], ["\n            SELECT id FROM admin_systems.staffing_slots \n            WHERE staffing_id = ", " AND assigned_employee_code IS NULL \n            ORDER BY slot_order ASC LIMIT 1\n          "])), staffingId)];
                case 15:
                    emptySlot = _b.sent();
                    if (!(emptySlot.length > 0)) return [3 /*break*/, 17];
                    return [4 /*yield*/, prisma.$executeRawUnsafe("\n              UPDATE admin_systems.staffing_slots \n              SET assigned_employee_code = '".concat(e.employeeCode, "',\n                  description = 'Ph\u1EE5 tr\u00E1ch b\u1EDFi ").concat(e.fullName, "'\n              WHERE id = ").concat(emptySlot[0].id, "\n            "))];
                case 16:
                    _b.sent();
                    return [3 /*break*/, 20];
                case 17: return [4 /*yield*/, prisma.$queryRaw(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n              SELECT slot_order FROM admin_systems.staffing_slots\n              WHERE staffing_id = ", "\n              ORDER BY slot_order DESC LIMIT 1\n            "], ["\n              SELECT slot_order FROM admin_systems.staffing_slots\n              WHERE staffing_id = ", "\n              ORDER BY slot_order DESC LIMIT 1\n            "])), staffingId)];
                case 18:
                    lastSlot = _b.sent();
                    nextSlotOrder = lastSlot.length > 0 ? lastSlot[0].slot_order + 1 : 1;
                    return [4 /*yield*/, prisma.$executeRawUnsafe("\n              INSERT INTO admin_systems.staffing_slots (staffing_id, slot_order, description, assigned_employee_code)\n              VALUES (".concat(staffingId, ", ").concat(nextSlotOrder, ", 'Ph\u1EE5 tr\u00E1ch b\u1EDFi ").concat(e.fullName, "', '").concat(e.employeeCode, "')\n            "))];
                case 19:
                    _b.sent();
                    _b.label = 20;
                case 20: return [3 /*break*/, 25];
                case 21: 
                // Tự động tạo staffing và slot nếu chưa có
                return [4 /*yield*/, prisma.$executeRawUnsafe("\n            INSERT INTO admin_systems.org_staffing (unit_id, job_title_id, quantity, created_at, updated_at)\n            VALUES (".concat(e.departmentId, ", ").concat(e.jobTitleId, ", 1, NOW(), NOW())\n          "))];
                case 22:
                    // Tự động tạo staffing và slot nếu chưa có
                    _b.sent();
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n            SELECT id FROM admin_systems.org_staffing \n            WHERE unit_id = ", " AND job_title_id = ", " LIMIT 1\n          "], ["\n            SELECT id FROM admin_systems.org_staffing \n            WHERE unit_id = ", " AND job_title_id = ", " LIMIT 1\n          "])), e.departmentId, e.jobTitleId)];
                case 23:
                    newStaffing = _b.sent();
                    if (!(newStaffing.length > 0)) return [3 /*break*/, 25];
                    return [4 /*yield*/, prisma.$executeRawUnsafe("\n              INSERT INTO admin_systems.staffing_slots (staffing_id, slot_order, description, assigned_employee_code)\n              VALUES (".concat(newStaffing[0].id, ", 1, 'Ph\u1EE5 tr\u00E1ch b\u1EDFi ").concat(e.fullName, "', '").concat(e.employeeCode, "')\n            "))];
                case 24:
                    _b.sent();
                    _b.label = 25;
                case 25:
                    _a++;
                    return [3 /*break*/, 13];
                case 26:
                    console.log('✅ Đã gán nhân sự vào vị trí định biên thành công.');
                    return [3 /*break*/, 28];
                case 27:
                    error_2 = _b.sent();
                    console.error('❌ Lỗi khi gán vị trí định biên:', error_2);
                    return [3 /*break*/, 28];
                case 28:
                    console.log('🔹 Seed TaskRankTemplates theo Nghị định 335/2025/NĐ-CP...');
                    return [4 /*yield*/, prisma.taskRankTemplate.deleteMany()];
                case 29:
                    _b.sent();
                    RANK_TEMPLATES = [
                        // KHỐI CÔNG CHỨC
                        // ==========================================
                        // KHỐI CÔNG CHỨC - QUẢN LÝ NHÀ NƯỚC & CHUYÊN MÔN
                        // Căn cứ pháp lý: Nghị định 170/2025/NĐ-CP & Nghị định 361/2025/NĐ-CP
                        // Nguyên tắc (Điều 21 NĐ 170): Giao việc phù hợp ngạch, đảm bảo tính phân cấp, phân quyền và khối lượng công việc.
                        // ==========================================
                        // 1. Ngạch Chuyên viên cao cấp (SENIOR_SPECIALIST) - Hoạch định chính sách, chiến lược
                        { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', rankNameVN: 'Chuyên viên cao cấp', taskName: 'Chủ trì nghiên cứu, xây dựng và trình ban hành Nghị quyết, Quyết định quy phạm pháp luật cấp Tỉnh', defaultUnit: 'Văn bản QPPL', defaultWeight: 30, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', rankNameVN: 'Chuyên viên cao cấp', taskName: 'Chủ trì thẩm định quy hoạch ngành, đề án phát triển kinh tế - xã hội, kiến trúc chính quyền điện tử', defaultUnit: 'Đề án/Quy hoạch', defaultWeight: 25, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        { classification: 'CONG_CHUC', rank: 'SENIOR_SPECIALIST', rankNameVN: 'Chuyên viên cao cấp', taskName: 'Chủ trì các chương trình đàm phán, ký kết thỏa thuận hợp tác liên ngành hoặc với đối tác quốc tế', defaultUnit: 'Chương trình', defaultWeight: 20, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        // 2. Ngạch Chuyên viên chính (PRINCIPAL_SPECIALIST) - Tổ chức thực hiện, hướng dẫn nghiệp vụ
                        { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Thẩm định hồ sơ chuyên ngành, đề án kỹ thuật công nghệ trọng điểm cấp cơ sở', defaultUnit: 'Hồ sơ', defaultWeight: 15, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Biên soạn tài liệu, ban hành văn bản hướng dẫn nghiệp vụ, quy chuẩn chuyên môn cho tuyến dưới', defaultUnit: 'Văn bản', defaultWeight: 15, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Chủ trì đoàn thanh tra, kiểm tra chuyên ngành; giải quyết khiếu nại, tố cáo phức tạp', defaultUnit: 'Vụ việc', defaultWeight: 15, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        { classification: 'CONG_CHUC', rank: 'PRINCIPAL_SPECIALIST', rankNameVN: 'Chuyên viên chính', taskName: 'Tham mưu tổng hợp, xây dựng kế hoạch công tác năm, báo cáo định kỳ quy mô Sở/Ngành', defaultUnit: 'Báo cáo/Kế hoạch', defaultWeight: 12, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        // 3. Ngạch Chuyên viên (SPECIALIST) - Thực thi tác nghiệp chuyên môn
                        { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Nghiên cứu, đề xuất xử lý các hồ sơ thủ tục hành chính, dịch vụ công trực tuyến', defaultUnit: 'Hồ sơ', defaultWeight: 10, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Soạn thảo tờ trình, công văn, quyết định cá biệt theo sự phân công của Lãnh đạo phòng', defaultUnit: 'Văn bản', defaultWeight: 8, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Tổng hợp số liệu, lập báo cáo chuyên đề, báo cáo tháng/quý về tình hình thực hiện nhiệm vụ', defaultUnit: 'Báo cáo', defaultWeight: 8, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        { classification: 'CONG_CHUC', rank: 'SPECIALIST', rankNameVN: 'Chuyên viên', taskName: 'Tham gia các tổ công tác, hội đồng chuyên môn, đoàn khảo sát thực tế', defaultUnit: 'Lượt tham gia', defaultWeight: 5, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        // 4. Ngạch Cán sự (OFFICER) - Hỗ trợ chuyên môn, thống kê
                        { classification: 'CONG_CHUC', rank: 'OFFICER', rankNameVN: 'Cán sự', taskName: 'Thu thập, cập nhật và chuẩn hóa dữ liệu vào các hệ thống thông tin quản lý', defaultUnit: 'Bản ghi/Bộ dữ liệu', defaultWeight: 5, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        { classification: 'CONG_CHUC', rank: 'OFFICER', rankNameVN: 'Cán sự', taskName: 'Kiểm tra tính hợp lệ, đầy đủ của hồ sơ đầu vào trước khi bàn giao cho bộ phận chuyên môn', defaultUnit: 'Hồ sơ', defaultWeight: 5, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        { classification: 'CONG_CHUC', rank: 'OFFICER', rankNameVN: 'Cán sự', taskName: 'Soạn thảo văn bản hành chính thông thường (giấy mời, thông báo, lịch công tác)', defaultUnit: 'Văn bản', defaultWeight: 4, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        // 5. Ngạch Nhân viên (STAFF) - Hành chính, quản trị, phục vụ
                        { classification: 'CONG_CHUC', rank: 'STAFF', rankNameVN: 'Nhân viên', taskName: 'Thực hiện công tác văn thư, lưu trữ, tiếp nhận, luân chuyển văn bản đi/đến (iDesk)', defaultUnit: 'Lượt', defaultWeight: 3, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        { classification: 'CONG_CHUC', rank: 'STAFF', rankNameVN: 'Nhân viên', taskName: 'Quản trị cơ sở vật chất, bảo trì trang thiết bị văn phòng, cấp phát văn phòng phẩm', defaultUnit: 'Lượt', defaultWeight: 3, legalBasis: 'NĐ 170/2025, NĐ 361/2025' },
                        // ==========================================
                        // KHỐI VIÊN CHỨC - ĐƠN VỊ SỰ NGHIỆP CÔNG LẬP (KHCN, CNTT, IOC...)
                        // Căn cứ pháp lý: Nghị định 115/2020/NĐ-CP & Nghị định 85/2023/NĐ-CP
                        // Phân loại: Nhóm chức danh nghề nghiệp chuyên ngành và dùng chung.
                        // ==========================================
                        // 1. Viên chức Hạng I (GRADE_1) - Tương đương Chuyên viên cao cấp
                        { classification: 'VIEN_CHUC', rank: 'GRADE_1', rankNameVN: 'Viên chức Hạng I', taskName: 'Chủ trì thực hiện các đề tài nghiên cứu khoa học, công nghệ trọng điểm cấp Bộ/Tỉnh', defaultUnit: 'Đề tài', defaultWeight: 30, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_1', rankNameVN: 'Viên chức Hạng I', taskName: 'Tư vấn chuyên gia, thẩm định thiết kế tổng thể các hệ thống công nghệ thông tin quy mô lớn', defaultUnit: 'Báo cáo thẩm định', defaultWeight: 25, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_1', rankNameVN: 'Viên chức Hạng I', taskName: 'Chủ biên tài liệu, giáo trình, quy chuẩn kỹ thuật quốc gia hoặc cấp ngành', defaultUnit: 'Bộ tài liệu', defaultWeight: 25, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        // 2. Viên chức Hạng II (GRADE_2) - Tương đương Chuyên viên chính
                        { classification: 'VIEN_CHUC', rank: 'GRADE_2', rankNameVN: 'Viên chức Hạng II', taskName: 'Chủ trì phân tích, thiết kế kiến trúc phần mềm, hệ thống tích hợp liên ngành (LGSP)', defaultUnit: 'Tài liệu thiết kế', defaultWeight: 20, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_2', rankNameVN: 'Viên chức Hạng II', taskName: 'Tổ chức triển khai thực hiện các dự án, đề án dịch vụ sự nghiệp công phức tạp', defaultUnit: 'Dự án/Hạng mục', defaultWeight: 15, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_2', rankNameVN: 'Viên chức Hạng II', taskName: 'Viết bài báo khoa học, chuyên đề nghiên cứu công bố trên các tạp chí chuyên ngành', defaultUnit: 'Bài báo', defaultWeight: 15, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_2', rankNameVN: 'Viên chức Hạng II', taskName: 'Đào tạo, chuyển giao công nghệ, hướng dẫn nghiệp vụ kỹ thuật cho viên chức hạng dưới', defaultUnit: 'Khóa/Lượt', defaultWeight: 10, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        // 3. Viên chức Hạng III (GRADE_3) - Tương đương Chuyên viên (Kỹ sư, Nghiên cứu viên...)
                        { classification: 'VIEN_CHUC', rank: 'GRADE_3', rankNameVN: 'Viên chức Hạng III', taskName: 'Vận hành kỹ thuật, trực giám sát an toàn thông tin tại Trung tâm điều hành (IOC)', defaultUnit: 'Ca trực', defaultWeight: 10, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_3', rankNameVN: 'Viên chức Hạng III', taskName: 'Phát triển, bảo trì mã nguồn, tích hợp API cho các hệ thống phần mềm dùng chung', defaultUnit: 'Module/Tính năng', defaultWeight: 12, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_3', rankNameVN: 'Viên chức Hạng III', taskName: 'Quản trị hệ thống máy chủ, mạng lưới, cấu hình hạ tầng đám mây (Cloud/K8s)', defaultUnit: 'Hệ thống/Yêu cầu', defaultWeight: 10, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_3', rankNameVN: 'Viên chức Hạng III', taskName: 'Thực hiện các phép đo lường, kiểm định, đánh giá chất lượng sản phẩm công nghệ', defaultUnit: 'Phiếu kiểm định', defaultWeight: 8, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_3', rankNameVN: 'Viên chức Hạng III', taskName: 'Triển khai cung cấp dịch vụ sự nghiệp công theo kế hoạch được duyệt', defaultUnit: 'Gói dịch vụ', defaultWeight: 10, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        // 4. Viên chức Hạng IV (GRADE_4) - Tương đương Cán sự (Kỹ thuật viên, Hỗ trợ)
                        { classification: 'VIEN_CHUC', rank: 'GRADE_4', rankNameVN: 'Viên chức Hạng IV', taskName: 'Tiếp nhận yêu cầu (Helpdesk), trực tổng đài hỗ trợ người dùng ứng dụng/hệ thống', defaultUnit: 'Phiếu hỗ trợ (Ticket)', defaultWeight: 5, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_4', rankNameVN: 'Viên chức Hạng IV', taskName: 'Kiểm tra, bảo dưỡng định kỳ các thiết bị đầu cuối, camera, máy móc thực hành', defaultUnit: 'Lượt', defaultWeight: 5, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_4', rankNameVN: 'Viên chức Hạng IV', taskName: 'Ghi chép nhật ký vận hành, xuất xuất dữ liệu báo cáo kỹ thuật định kỳ', defaultUnit: 'Bản ghi', defaultWeight: 4, legalBasis: 'NĐ 115/2020, NĐ 85/2023' },
                        { classification: 'VIEN_CHUC', rank: 'GRADE_4', rankNameVN: 'Viên chức Hạng IV', taskName: 'Hỗ trợ thiết lập môi trường, triển khai lắp đặt thiết bị tại hiện trường', defaultUnit: 'Lần triển khai', defaultWeight: 6, legalBasis: 'NĐ 115/2020, NĐ 85/2023' }
                    ];
                    return [4 /*yield*/, prisma.taskRankTemplate.createMany({ data: RANK_TEMPLATES })];
                case 30:
                    _b.sent();
                    console.log("\u2705 \u0110\u00E3 seed ".concat(RANK_TEMPLATES.length, " TaskRankTemplates."));
                    // --- Seed KPI Periods ---
                    console.log('🔹 Seed KPI Periods...');
                    kpiPeriods = [
                        { name: 'Tháng 1/2026', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31') },
                        { name: 'Tháng 2/2026', startDate: new Date('2026-02-01'), endDate: new Date('2026-02-28') },
                        { name: 'Tháng 3/2026', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-31') },
                        { name: 'Tháng 4/2026', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-30') },
                        { name: 'Tháng 5/2026', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-31') },
                        { name: 'Tháng 6/2026', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-30') },
                    ];
                    return [4 /*yield*/, prisma.kpiPeriod.createMany({ data: kpiPeriods })];
                case 31:
                    _b.sent();
                    console.log("\u2705 \u0110\u00E3 seed ".concat(kpiPeriods.length, " KPI Periods."));
                    // --- Seed KPI Criteria ---
                    console.log('🔹 Seed KPI Criteria...');
                    kpiCriteria = [
                        { name: 'Chất lượng công việc', description: 'Đánh giá mức độ hoàn thành, tính chính xác và hiệu quả của các công việc được giao', weight: 40, baseScore: 40, scoringMethod: 'AUTO', bonusPerDay: 2, penaltyPerDay: 5 },
                        { name: 'Tiến độ công việc', description: 'Đánh giá việc đảm bảo thời gian hoàn thành công việc so với kế hoạch', weight: 30, baseScore: 30, scoringMethod: 'AUTO', bonusPerDay: 3, penaltyPerDay: 4 },
                        { name: 'Kỷ luật lao động', description: 'Đánh giá việc chấp hành nội quy, quy chế làm việc của cơ quan', weight: 15, baseScore: 15, scoringMethod: 'MANUAL', bonusPerDay: 0, penaltyPerDay: 2 },
                        { name: 'Kỹ năng làm việc nhóm', description: 'Đánh giá khả năng phối hợp, hỗ trợ đồng nghiệp trong công việc', weight: 15, baseScore: 15, scoringMethod: 'MANUAL', bonusPerDay: 0, penaltyPerDay: 0 }
                    ];
                    return [4 /*yield*/, prisma.kpiCriteria.createMany({ data: kpiCriteria })];
                case 32:
                    _b.sent();
                    console.log("\u2705 \u0110\u00E3 seed ".concat(kpiCriteria.length, " KPI Criteria."));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return prisma.$disconnect(); })
    .catch(function (e) {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
