const fs = require('fs');
const path = 'apps/admin_khcn/features/reports/components/reports/ReportWorkspace.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const dialogStart = lines.findIndex(line => line.includes('className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"'));

if (dialogStart > -1) {
  const replacement = [
    '        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">',
    '          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">',
    '            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">',
    '              <h3 className="font-semibold text-lg text-slate-800">Chia sẻ Báo cáo</h3>',
    '              <button onClick={() => setSharingReport(null)} className="text-slate-400 hover:text-slate-600">',
    '                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
    '              </button>',
    '            </div>',
    '            <form ',
    '              className="p-6 space-y-4"',
    '              onSubmit={async (e) => {',
    '                e.preventDefault();',
    '                if (!sharingReport) return;',
    '                const formData = new FormData(e.currentTarget);',
    '                try {',
    '                  await assignMutation.mutateAsync({',
    '                    templateId: sharingReport,',
    '                    assigneeType: formData.get(\'assigneeType\') as string,',
    '                    assigneeId: formData.get(\'assigneeId\') as string,',
    '                    permissions: \'VIEW\'',
    '                  });',
    '                  alert(\'Gán báo cáo thành công!\');',
    '                  setSharingReport(null);',
    '                } catch(err) {',
    '                  alert(\'Có lỗi xảy ra khi gán báo cáo.\');',
    '                }',
    '              }}',
    '            >',
    '              <div>',
    '                <label className="block text-sm font-medium text-slate-700 mb-1">Loại đối tượng</label>',
    '                <select name="assigneeType" className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border">',
    '                  <option value="USER">Cá nhân (User ID)</option>',
    '                  <option value="UNIT">Đơn vị (Unit ID)</option>',
    '                </select>',
    '              </div>',
    '              <div>',
    '                <label className="block text-sm font-medium text-slate-700 mb-1">ID (User hoặc Unit)</label>',
    '                <input required type="text" name="assigneeId" placeholder="Nhập ID..." className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />',
    '              </div>',
    '              <div className="pt-4 flex gap-3">',
    '                <Button type="button" variant="outline" className="flex-1" onClick={() => setSharingReport(null)}>Hủy</Button>',
    '                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={assignMutation.isPending}>',
    '                  {assignMutation.isPending ? \'Đang xử lý...\' : \'Xác nhận Gán\'}',
    '                </Button>',
    '              </div>',
    '            </form>',
    '          </div>'
  ];

  lines.splice(dialogStart, 46, ...replacement);
  fs.writeFileSync(path, lines.join('\\n'), 'utf8');
  console.log('Fixed dialog.');
} else {
  console.log('Could not find dialog.');
}
