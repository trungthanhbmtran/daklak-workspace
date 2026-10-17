import { KpiXmlPrinterUtil } from './kpi-xml-printer.util';

describe('KpiXmlPrinterUtil (api-gateway)', () => {
  it('should parse and render HTML for Form 01', () => {
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<KpiFormDocument xmlns="http://btctu.daklak.gov.vn/kpi/v1" formCode="01" schemaVersion="1.0">
  <Header>
    <AgencyName>TỈNH ỦY ĐẮK LẮK</AgencyName>
    <OrganizationName>BAN TỔ CHỨC TỈNH ỦY</OrganizationName>
    <DocumentTitle>BẢN ĐĂNG KÝ DANH MỤC CÔNG VIỆC</DocumentTitle>
  </Header>
  <Body>
    <PersonalInformation>
      <FullName>Nguyễn Văn A</FullName>
      <Position>Trưởng phòng</Position>
      <Department>Phòng Tổ chức cán bộ</Department>
    </PersonalInformation>
    <RegisteredTasks>
      <TaskItem>
        <OrderNumber>1</OrderNumber>
        <TaskName>Tham mưu đề án vị trí việc làm</TaskName>
        <StandardOutput>Đề án hoàn chỉnh</StandardOutput>
        <TargetProgress>30/06/2026</TargetProgress>
        <AssignedWeight>30</AssignedWeight>
      </TaskItem>
    </RegisteredTasks>
  </Body>
  <Footer>
    <EvaluationDate>2026-06-30</EvaluationDate>
    <Signatures>
      <SelfEvaluatorSignature>
        <FullName>Nguyễn Văn A</FullName>
      </SelfEvaluatorSignature>
      <UnitLeaderSignature>
        <FullName>Trần Văn B</FullName>
      </UnitLeaderSignature>
    </Signatures>
  </Footer>
</KpiFormDocument>`;

    const html = KpiXmlPrinterUtil.generatePrintableHtml(sampleXml, '01');
    expect(html).toBeDefined();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('@page');
    expect(html).toContain('BẢN ĐĂNG KÝ DANH MỤC CÔNG VIỆC');
    expect(html).toContain('Nguyễn Văn A');
    expect(html).toContain('Tham mưu đề án vị trí việc làm');
  });

  it('should parse and render HTML for Scorecard Form 03', () => {
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<KpiFormDocument xmlns="http://btctu.daklak.gov.vn/kpi/v1" formCode="M03_SCORECARD_KPI" schemaVersion="1.0">
  <Header>
    <AgencyName>TỈNH ỦY ĐẮK LẮK</AgencyName>
    <OrganizationName>BAN TỔ CHỨC TỈNH ỦY</OrganizationName>
    <DocumentTitle>PHIẾU CHẤM ĐIỂM KPI HẰNG QUÝ</DocumentTitle>
  </Header>
  <Body>
    <SectionA_GeneralCriteria>
      <Item>
        <Index>1</Index>
        <CriterionName>Tư tưởng chính trị</CriterionName>
        <MaxScore>10</MaxScore>
        <SelfScore>10</SelfScore>
        <LeaderScore>10</LeaderScore>
      </Item>
    </SectionA_GeneralCriteria>
  </Body>
</KpiFormDocument>`;

    const html = KpiXmlPrinterUtil.generatePrintableHtml(sampleXml, 'M03_SCORECARD_KPI');
    expect(html).toBeDefined();
    expect(html).toContain('BẢN TỰ ĐÁNH GIÁ VÀ SCORECARD KPI HẰNG QUÝ');
    expect(html).toContain('Thang điểm 100');
  });

  it('should gracefully handle empty or invalid xml without throwing uncaught exceptions', () => {
    expect(() => {
      const html = KpiXmlPrinterUtil.generatePrintableHtml('', 'INVALID');
      expect(html).toBeDefined();
      expect(html).toContain('<!DOCTYPE html>');
    }).not.toThrow();
  });
});
