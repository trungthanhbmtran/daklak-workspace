/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building, Calendar, FileText, Sparkles, Phone
} from "lucide-react";

interface CardProps {
  langCode: string;
  activeLangs: any[];
  trans: any;
  isCompareMode: boolean;
  onUpdate: (lang: string, field: string, value: string) => void;
}

const cardClass = (langCode: string, isCompareMode: boolean) =>
  `border border-border shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md bg-card ${langCode === 'vi' && isCompareMode ? 'bg-muted/50 border-r-2 border-r-primary' : ''}`;

const LangBadge = ({ langCode, activeLangs, labelPrefix }: { langCode: string; activeLangs: any[]; labelPrefix?: string }) => {
  const lang = activeLangs.find(l => l.code === langCode) || { code: langCode, name: langCode === 'vi' ? 'Tiếng Việt' : 'English' };
  return (
    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${langCode === 'vi' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
      {lang.name} {labelPrefix}
    </span>
  );
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">{children}</Label>
);

const fieldClass = "rounded-lg border-input bg-background focus:border-primary focus:ring-primary/20 text-xs font-semibold";

// ──────────────────────────────────────────────────────────────────────────────
// 1. BrandingCard — Nhận diện & Bản quyền
// ──────────────────────────────────────────────────────────────────────────────
export const BrandingCard = memo(({ langCode, activeLangs, trans, isCompareMode, onUpdate }: CardProps) => (
  <Card className={cardClass(langCode, isCompareMode)}>
    <CardHeader className="bg-muted/30 border-b border-border py-4 px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-primary" />
          <CardTitle className="text-xs font-black text-foreground uppercase tracking-wider">
            Nhận diện &amp; Bản quyền Đơn vị (2 Cấp)
          </CardTitle>
        </div>
        <LangBadge langCode={langCode} activeLangs={activeLangs} />
      </div>
    </CardHeader>
    <CardContent className="p-5 space-y-4">
      {[
        { field: "unitName",          label: "Tên đơn vị cấp Xã (Đơn vị trực tiếp)",              viPh: "Ví dụ: UBND XÃ DANG KANG",                    enPh: "Enter commune agency name..." },
        { field: "unitIdentifier",    label: "Đơn vị quản lý cấp Huyện (Quản lý cấp trên)",        viPh: "Ví dụ: HUYỆN KRÔNG BÔNG - TỈNH ĐẮK LẮK",      enPh: "Enter supervising district..." },
        { field: "unitTitle",         label: "Tiêu đề phụ của Cổng (Hàng trên cùng banner)",        viPh: "Ví dụ: TRANG THÔNG TIN ĐIỆN TỬ",               enPh: "Enter portal top subtitle..." },
        { field: "responsiblePerson", label: "Người chịu trách nhiệm nội dung (Chân trang)",         viPh: "Ví dụ: Ông Trần Văn Minh - Chủ tịch UBND xã",  enPh: "Enter editor-in-chief name..." },
      ].map(({ field, label, viPh, enPh }) => (
        <div key={field} className="space-y-1.5">
          <FieldLabel>{label}</FieldLabel>
          <Input
            className={fieldClass}
            placeholder={langCode === 'vi' ? viPh : enPh}
            value={trans[field] || ""}
            onChange={(e) => onUpdate(langCode, field, e.target.value)}
          />
        </div>
      ))}
    </CardContent>
  </Card>
));
BrandingCard.displayName = "BrandingCard";

// ──────────────────────────────────────────────────────────────────────────────
// 2. ScheduleCard — Lịch tiếp công dân
// ──────────────────────────────────────────────────────────────────────────────
export const ScheduleCard = memo(({ langCode, activeLangs, trans, isCompareMode, onUpdate }: CardProps) => (
  <Card className={cardClass(langCode, isCompareMode)}>
    <CardHeader className="bg-muted/30 border-b border-border py-4 px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <CardTitle className="text-xs font-black text-foreground uppercase tracking-wider">
            Lịch tiếp công dân định kỳ
          </CardTitle>
        </div>
        <LangBadge langCode={langCode} activeLangs={activeLangs} />
      </div>
    </CardHeader>
    <CardContent className="p-5">
      <div className="space-y-1.5">
        <FieldLabel>Nội dung chi tiết thời gian tiếp công dân</FieldLabel>
        <Textarea
          rows={4}
          className={fieldClass + " leading-relaxed"}
          placeholder={langCode === 'vi' ? "Ví dụ: Thứ 5 hàng tuần • 08:00 - 11:30" : "Enter reception hours description..."}
          value={trans.citizenSchedule || ""}
          onChange={(e) => onUpdate(langCode, "citizenSchedule", e.target.value)}
        />
      </div>
    </CardContent>
  </Card>
));
ScheduleCard.displayName = "ScheduleCard";

// ──────────────────────────────────────────────────────────────────────────────
// 3. AddressLicenseCard — Địa chỉ & Giấy phép
// ──────────────────────────────────────────────────────────────────────────────
export const AddressLicenseCard = memo(({ langCode, activeLangs, trans, isCompareMode, onUpdate }: CardProps) => (
  <Card className={cardClass(langCode, isCompareMode)}>
    <CardHeader className="bg-muted/30 border-b border-border py-4 px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <CardTitle className="text-xs font-black text-foreground uppercase tracking-wider">
            Địa chỉ &amp; Giấy phép hoạt động
          </CardTitle>
        </div>
        <LangBadge langCode={langCode} activeLangs={activeLangs} />
      </div>
    </CardHeader>
    <CardContent className="p-5 space-y-4">
      <div className="space-y-1.5">
        <FieldLabel>Địa chỉ trụ sở chính cơ quan</FieldLabel>
        <Input
          className={fieldClass}
          placeholder={langCode === 'vi' ? "Ví dụ: Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk" : "Enter office address..."}
          value={trans.address || ""}
          onChange={(e) => onUpdate(langCode, "address", e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Thông tin Giấy phép hoạt động</FieldLabel>
        <Textarea
          rows={3}
          className={fieldClass + " leading-relaxed"}
          placeholder={langCode === 'vi' ? "Ví dụ: Giấy phép số: 45/GP-TTĐT do Sở..." : "Enter operating license info..."}
          value={trans.licenseInfo || ""}
          onChange={(e) => onUpdate(langCode, "licenseInfo", e.target.value)}
        />
      </div>
    </CardContent>
  </Card>
));
AddressLicenseCard.displayName = "AddressLicenseCard";

// ──────────────────────────────────────────────────────────────────────────────
// 4. CustomLabelsCard — Tiêu đề & Nhãn hiển thị
// ──────────────────────────────────────────────────────────────────────────────
export const CustomLabelsCard = memo(({ langCode, activeLangs, trans, isCompareMode, onUpdate }: CardProps) => (
  <Card className={cardClass(langCode, isCompareMode)}>
    <CardHeader className="bg-muted/30 border-b border-border py-4 px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <CardTitle className="text-xs font-black text-foreground uppercase tracking-wider">
            Các tiêu đề và Nhãn hiển thị phụ
          </CardTitle>
        </div>
        <LangBadge langCode={langCode} activeLangs={activeLangs} />
      </div>
    </CardHeader>
    <CardContent className="p-5 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {[
          { field: "footerPortalTitle",    label: "Tiêu đề Cổng Dịch vụ công (Footer)", viPh: "CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN", enPh: "Enter DVC portal title..." },
          { field: "footerPortalSubtitle", label: "Mô tả phụ Cổng Dịch vụ công (Footer)", viPh: "Tiếp nhận giải quyết TTHC...", enPh: "Enter DVC subtitle..." },
        ].map(({ field, label, viPh, enPh }) => (
          <div key={field} className="space-y-1.5">
            <FieldLabel>{label}</FieldLabel>
            <Input
              className={fieldClass}
              placeholder={langCode === 'vi' ? `Ví dụ: ${viPh}` : enPh}
              value={trans[field] || ""}
              onChange={(e) => onUpdate(langCode, field, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { field: "contactFormTitle", label: "Tiêu đề Biểu mẫu (Trang liên hệ)", viPh: "GỬI PHẢN ÁNH / GÓP Ý", enPh: "Enter feedback form title..." },
          { field: "contactMapTitle",  label: "Tiêu đề Bản đồ (Trang liên hệ)",    viPh: "BẢN ĐỒ HÀNH CHÍNH",     enPh: "Enter map title..." },
        ].map(({ field, label, viPh, enPh }) => (
          <div key={field} className="space-y-1.5">
            <FieldLabel>{label}</FieldLabel>
            <Input
              className={fieldClass}
              placeholder={langCode === 'vi' ? `Ví dụ: ${viPh}` : enPh}
              value={trans[field] || ""}
              onChange={(e) => onUpdate(langCode, field, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <FieldLabel>Thông điệp gửi thành công (Trang liên hệ)</FieldLabel>
        <Textarea
          rows={2}
          className={fieldClass + " leading-relaxed"}
          placeholder={langCode === 'vi' ? "Ví dụ: Cảm ơn bạn đã gửi phản ánh..." : "Success message after form submission..."}
          value={trans.contactFormSuccessDesc || ""}
          onChange={(e) => onUpdate(langCode, "contactFormSuccessDesc", e.target.value)}
        />
      </div>
    </CardContent>
  </Card>
));
CustomLabelsCard.displayName = "CustomLabelsCard";

// ──────────────────────────────────────────────────────────────────────────────
// 5. ContactDetailsCard — Thông tin liên hệ
// ──────────────────────────────────────────────────────────────────────────────
export const ContactDetailsCard = memo(({ langCode, activeLangs, trans, isCompareMode, onUpdate }: CardProps) => (
  <Card className={cardClass(langCode, isCompareMode)}>
    <CardHeader className="bg-muted/30 border-b border-border py-4 px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          <CardTitle className="text-xs font-black text-foreground uppercase tracking-wider">
            Thông tin liên hệ
          </CardTitle>
        </div>
        <LangBadge langCode={langCode} activeLangs={activeLangs} />
      </div>
    </CardHeader>
    <CardContent className="p-5 space-y-4">
      {[
        { field: "hotline", label: "Số điện thoại / Hotline",  ph: langCode === 'vi' ? "Ví dụ: 0262 3....." : "Enter phone number..." },
        { field: "fax",     label: "Số Fax",                   ph: langCode === 'vi' ? "Ví dụ: 0262 3....." : "Enter fax number..." },
        { field: "email",   label: "Địa chỉ Email chính thức", ph: langCode === 'vi' ? "Ví dụ: ubnd@dangkang.daklak.gov.vn" : "Enter official email..." },
      ].map(({ field, label, ph }) => (
        <div key={field} className="space-y-1.5">
          <FieldLabel>{label}</FieldLabel>
          <Input
            className={fieldClass}
            placeholder={ph}
            value={trans[field] || ""}
            onChange={(e) => onUpdate(langCode, field, e.target.value)}
          />
        </div>
      ))}
    </CardContent>
  </Card>
));
ContactDetailsCard.displayName = "ContactDetailsCard";
