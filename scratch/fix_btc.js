const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

async function main() {
  const dbUrl = 'mariadb://root:mypassword@localhost:3306/admin_workflow';
  const adapter = new PrismaMariaDb(dbUrl);
  const prisma = new PrismaClient({ adapter });

  try {
    const id = 'cmsbwupme000001s1e478hr4i';
    const record = await prisma.integrationConnection.findUnique({ where: { id } });
    if (!record) throw new Error('Record not found');

    const authConfig = typeof record.authConfig === 'string' ? JSON.parse(record.authConfig) : (record.authConfig || {});
    authConfig.clientId = 'FzrjcMAfdzJOPs6WwJXCW_Fl9KUa';
    authConfig.clientSecret = '_PO6wzmftVSL4Q2juiqzP44n6I74VgxCgHzfchAw0Yka';

    const metadata = typeof record.metadata === 'string' ? JSON.parse(record.metadata) : (record.metadata || {});
    if (metadata._parsedEndpoints) {
      metadata._parsedEndpoints = metadata._parsedEndpoints.map(ep => {
        if (ep.path === '/apiBTC_IOC/1.1/nsnn_thu' || ep.path === '/apiBTC_IOC/1.1/nsnn_chi') {
          ep.headers = [
            { key: "Content-Type", value: "application/xml" },
            { key: "SystemCode", value: "000.00.00.VNPT" }
          ];
          ep.params = [{ key: "Page_Number", value: "0" }];
          ep.body = `<?xml version="1.0" encoding="UTF-8"?>\n<Data>\n    <Header>\n        <Receiver_Code>H15</Receiver_Code>\n    </Header>\n    <BODY>\n        <DATA>\n            <CHAN_DATE>20260724</CHAN_DATE>\n            <DT></DT>\n        </DATA>\n    </BODY>\n</Data>`;
        }
        else if (ep.path === '/apiBTC_IOC/1.1/dtc_giaingan_tuan') {
          ep.headers = [
            { key: "Content-Type", value: "application/xml" },
            { key: "SystemCode", value: "000.00.00.VNPT" }
          ];
          ep.params = [{ key: "Page_Number", value: "0" }];
          ep.body = `<?xml version="1.0" encoding="UTF-8"?>\n<element>\n</element>`;
        }
        else if (ep.path === '/apiBTC_IOC/1.1/hhxnk' || ep.path === '/apiBTC_IOC/1.1/qldt') {
          ep.headers = [
            { key: "Content-Type", value: "application/xml" },
            { key: "SystemCode", value: "000.00.00.VNPT" }
          ];
          ep.params = [{ key: "Page_Number", value: "0" }];
          ep.body = `<?xml version="1.0" encoding="UTF-8"?>\n<element>\n</element>`;
        }
        else if (ep.path === '/apiBTC_IOC/1.1/hddn') {
          ep.headers = [
            { key: "Content-Type", value: "application/xml" },
            { key: "SystemCode", value: "000.00.00.VNPT" }
          ];
          ep.params = [{ key: "Page_Number", value: "0" }];
          ep.body = `<?xml version="1.0" encoding="UTF-8"?>\n<Data>\n    <Header>\n        <Receiver_Code>H15</Receiver_Code>\n    </Header>\n    <BODY>\n        <DATA>\n            <CHAN_DATE></CHAN_DATE>\n            <YEAR>2026</YEAR>\n            <MONTH>7</MONTH>\n        </DATA>\n    </BODY>\n</Data>`;
        }
        else if (ep.path === '/apiBTC_IOC/1.1/htx') {
          ep.headers = [
            { key: "Content-Type", value: "application/xml" },
            { key: "SystemCode", value: "000.00.00.VNPT" }
          ];
          ep.params = [{ key: "Page_Number", value: "1" }];
          ep.body = `<?xml version="1.0" encoding="UTF-8"?>\n<Data>\n    <Header>\n        <Receiver_Code>H15</Receiver_Code>\n    </Header>\n    <BODY>\n        <DATA>\n            <CHAN_DATE></CHAN_DATE>\n            <YEAR>2026</YEAR>\n            <MONTH>7</MONTH>\n        </DATA>\n    </BODY>\n</Data>`;
        }
        return ep;
      });
    }

    await prisma.integrationConnection.update({
      where: { id },
      data: {
        authConfig,
        metadata
      }
    });
    console.log('Update successful');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
