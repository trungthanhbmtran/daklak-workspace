import { ImportParserService } from './apps/api-gateway/src/modules/api-management/import.service';

const parser = new ImportParserService();

const curlString = `curl --location 'http://10.50.1.6:3166/api/document-statistics' \\
--header 'Content-Type: application/json' \\
--data '{
    "from_organ_id": "H15.01",
    "document_type": "8",
    "trang_thai_tiep_nhan": "success",
    "subject": "minh",
    "searchKeyword": [
        {
            "filter": "document_id",
            "value": "r",
            "type": "like"
        },
        {
            "filter": "type_edoc",
            "value": "edoc",
            "type": "="
        }
    ],
    "start_date": "2026-10-01",
    "end_date": "2026-09-30"
}'`;

async function test() {
  const result = await parser.parseFileOrText(curlString);
  console.log(JSON.stringify(result, null, 2));
}

test();
