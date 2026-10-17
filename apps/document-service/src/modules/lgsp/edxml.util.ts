import { Logger } from '@nestjs/common';

const logger = new Logger('EdxmlUtil');

export interface ParsedEdxmlDocument {
  documentNumber: string;
  notation?: string;
  abstract: string;
  content?: string;
  issuerName?: string;
  issuingAuthorityId?: string;
  signerName?: string;
  signerPosition?: string;
  issueDate?: Date;
  urgency?: string;
  securityLevel?: string;
  rawXml?: string;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe?: string | null): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Simple regex-based tag extractor for XML fields
 */
function extractTagContent(xml: string, tagName: string): string | undefined {
  const regex = new RegExp(`<(?:[a-zA-Z0-9_]+:)?${tagName}[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_]+:)?${tagName}>`, 'i');
  const match = xml.match(regex);
  if (!match) return undefined;
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

/**
 * Xây dựng gói tin edXML chuẩn gửi lên trục liên thông LGSP
 */
export function buildEdxml(
  document: {
    documentNumber: string;
    notation?: string | null;
    abstract: string;
    content?: string | null;
    issuerName?: string | null;
    signerName?: string | null;
    signerPosition?: string | null;
    issueDate?: Date | string | null;
    urgency?: string | null;
    securityLevel?: string | null;
  },
  options: {
    senderCode: string;
    receiverCode: string;
    requestId?: string;
  },
): string {
  const reqId = options.requestId || `EDOC-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const issueDateStr = document.issueDate
    ? new Date(document.issueDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<edxml:Edoc xmlns:edxml="http://daklak.gov.vn/edxml/1.0" version="1.0">
  <edxml:Header>
    <edxml:MessageId>${escapeXml(reqId)}</edxml:MessageId>
    <edxml:Sender>
      <edxml:OrganId>${escapeXml(options.senderCode)}</edxml:OrganId>
      <edxml:OrganName>${escapeXml(document.issuerName || 'Tỉnh Đắk Lắk')}</edxml:OrganName>
    </edxml:Sender>
    <edxml:Receiver>
      <edxml:OrganId>${escapeXml(options.receiverCode)}</edxml:OrganId>
    </edxml:Receiver>
    <edxml:CreatedTime>${nowIso}</edxml:CreatedTime>
  </edxml:Header>
  <edxml:Body>
    <edxml:DocumentInfo>
      <edxml:CodeNumber>${escapeXml(document.documentNumber)}</edxml:CodeNumber>
      <edxml:CodeNotation>${escapeXml(document.notation || '')}</edxml:CodeNotation>
      <edxml:PromulgationDate>${issueDateStr}</edxml:PromulgationDate>
      <edxml:Subject>${escapeXml(document.abstract)}</edxml:Subject>
      <edxml:SignerName>${escapeXml(document.signerName || '')}</edxml:SignerName>
      <edxml:SignerPosition>${escapeXml(document.signerPosition || '')}</edxml:SignerPosition>
      <edxml:Priority>${escapeXml(document.urgency || 'NORMAL')}</edxml:Priority>
      <edxml:Security>${escapeXml(document.securityLevel || 'NORMAL')}</edxml:Security>
      <edxml:Content>${escapeXml(document.content || '')}</edxml:Content>
    </edxml:DocumentInfo>
  </edxml:Body>
</edxml:Edoc>`;
}

/**
 * Trích xuất và giải mã gói tin edxml (hỗ trợ cả Base64 và XML thuần)
 */
export function parseEdxml(rawPayload: string | Buffer): ParsedEdxmlDocument {
  let xmlStr: string;

  if (Buffer.isBuffer(rawPayload)) {
    xmlStr = rawPayload.toString('utf-8');
  } else {
    const trimmed = rawPayload.trim();
    // Kiểm tra nếu là Base64
    if (!trimmed.startsWith('<') && !trimmed.startsWith('<?xml')) {
      try {
        xmlStr = Buffer.from(trimmed, 'base64').toString('utf-8');
      } catch (error: any) {
        logger.warn(`parseEdxml: failed to decode base64 payload, falling back to raw text — ${error?.message}`);
        xmlStr = trimmed;
      }
    } else {
      xmlStr = trimmed;
    }
  }

  const documentNumber =
    extractTagContent(xmlStr, 'CodeNumber') ||
    extractTagContent(xmlStr, 'document_number') ||
    extractTagContent(xmlStr, 'Code') ||
    `VB-DEN-${Date.now()}`;

  const notation =
    extractTagContent(xmlStr, 'CodeNotation') ||
    extractTagContent(xmlStr, 'notation') ||
    extractTagContent(xmlStr, 'DocumentCode');

  const abstractText =
    extractTagContent(xmlStr, 'Subject') ||
    extractTagContent(xmlStr, 'abstract') ||
    extractTagContent(xmlStr, 'Title') ||
    'Văn bản liên thông từ trục LGSP';

  const content =
    extractTagContent(xmlStr, 'Content') ||
    extractTagContent(xmlStr, 'content');

  const issuerName =
    extractTagContent(xmlStr, 'OrganName') ||
    extractTagContent(xmlStr, 'OrganId') ||
    extractTagContent(xmlStr, 'FromOrganName');

  const issuingAuthorityId =
    extractTagContent(xmlStr, 'OrganId') ||
    extractTagContent(xmlStr, 'FromOrganId');

  const signerName =
    extractTagContent(xmlStr, 'SignerName') ||
    extractTagContent(xmlStr, 'Signer');

  const signerPosition =
    extractTagContent(xmlStr, 'SignerPosition') ||
    extractTagContent(xmlStr, 'Position');

  const dateStr =
    extractTagContent(xmlStr, 'PromulgationDate') ||
    extractTagContent(xmlStr, 'IssueDate') ||
    extractTagContent(xmlStr, 'CreatedTime');

  let issueDate: Date | undefined;
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      issueDate = d;
    }
  }

  const urgency =
    extractTagContent(xmlStr, 'Priority') ||
    extractTagContent(xmlStr, 'Urgency') ||
    'NORMAL';

  const securityLevel =
    extractTagContent(xmlStr, 'Security') ||
    extractTagContent(xmlStr, 'SecurityLevel') ||
    'NORMAL';

  return {
    documentNumber,
    notation: notation || undefined,
    abstract: abstractText,
    content: content || undefined,
    issuerName: issuerName || undefined,
    issuingAuthorityId: issuingAuthorityId || undefined,
    signerName: signerName || undefined,
    signerPosition: signerPosition || undefined,
    issueDate,
    urgency,
    securityLevel,
    rawXml: xmlStr,
  };
}
