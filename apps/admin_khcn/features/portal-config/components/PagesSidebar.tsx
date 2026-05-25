import { cn } from '@/lib/utils';
import { Plus, Globe, Settings2, Trash2, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PagesSidebarProps {
  pagesList: any[];
  selectedPageId: string;
  setSelectedPageId: (id: string) => void;
  setShowPagesSidebar: (show: boolean) => void;
  openAddPageModal: () => void;
  openEditPageModal: (page: any) => void;
  handleDeletePage: (pageId: string) => void;
}

export default function PagesSidebar({
  pagesList,
  selectedPageId,
  setSelectedPageId,
  setShowPagesSidebar,
  openAddPageModal,
  openEditPageModal,
  handleDeletePage,
}: PagesSidebarProps) {
  return (
    <aside
      className={cn(
        'border-r border-slate-200/60 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col z-30 shrink-0 transition-all duration-300',
        'w-80'
      )}
    >
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-slate-400" />
          <h2 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Quản lý trang
          </h2>
        </div>
        <Button
          size="icon"
          onClick={openAddPageModal}
          className="w-8 h-8 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none transition-all hover:rotate-90"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {pagesList.map((p) => {
          const isSelected = p.id === selectedPageId;
          return (
            <div
              key={p.id}
              onClick={() => {
                setSelectedPageId(p.id);
                setShowPagesSidebar(false);
              }}
              className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${isSelected
                ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm'
                : 'border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col min-w-0">
                  <span className={`text-[11px] font-black uppercase tracking-tight truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{p.title.vi || p.title[Object.keys(p.title)[0]] || 'Không có tiêu đề'}</span>
                  <span className="text-[8px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                    Slug: /{p.id}
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${p.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                  <span className="text-[9px] font-bold italic text-slate-400 truncate max-w-[120px]">
                    {Object.entries(p.title).filter(([k]) => k !== 'vi').map(([_, v]) => v).join(' / ')}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditPageModal(p); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                  {p.id !== 'about-page' && p.id !== 'contact-page' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePage(p.id); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm border border-transparent hover:border-rose-100 dark:hover:border-rose-900"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-600 rounded-r-full shadow-lg shadow-indigo-500/50" />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
