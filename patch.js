const fs = require('fs');
const file = 'c:/Users/Admin/Desktop/daklak-workspace/apps/user-service/prisma/seeds/03-1-unit-types-new-model.seed.ts';
let data = fs.readFileSync(file, 'utf8');
const search = "    { code: 'CQ_DANG', name: 'Cơ quan Đảng', level: 1 },";
const replace = "    { code: 'CQ_DANG', name: 'Cơ quan Đảng', level: 1 },\n    { code: 'VAN_PHONG_DANG_UY', name: 'Văn phòng Đảng ủy', level: 3 },";
if (data.includes(search)) {
    data = data.replace(search, replace);
    fs.writeFileSync(file, data, 'utf8');
    console.log("Patched successfully!");
} else {
    console.log("Search string not found.");
}