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
        'border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-[#0f172a] flex flex-col z-30 shrink-0 transition-all duration-300',
        'w-80'
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-md">
            <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
            Quản lý trang
          </h2>
        </div>
        <Button
          size="icon"
          onClick={openAddPageModal}
          className="w-8 h-8 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow dark:shadow-none transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar bg-white dark:bg-transparent">
        {pagesList.map((p) => {
          const isSelected = p.id === selectedPageId;

          return (
            <div
              key={p.id}
              onClick={() => {
                setSelectedPageId(p.id);
                setShowPagesSidebar(false);
              }}
              className={cn(
                'group relative flex flex-col gap-2 p-3 rounded-xl cursor-pointer transition-all duration-200 border overflow-hidden',
                isSelected
                  ? 'bg-indigo-50/80 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30'
                  : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700'
              )}
            >
              {/* Subtle Active Indicator */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-full" />
              )}

              {/* Title & Actions Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0 shadow-sm transition-colors',
                      p.isActive
                        ? 'bg-emerald-500 shadow-emerald-500/40'
                        : 'bg-slate-300 dark:bg-slate-600'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-semibold truncate',
                      isSelected
                        ? 'text-indigo-800 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                    )}
                  >
                    {p.title.vi || p.title[Object.keys(p.title)[0]] || 'Không có tiêu đề'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditPageModal(p);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                  {p.id !== 'about-page' && p.id !== 'contact-page' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(p.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Slug & Meta Row */}
              <div className="flex items-center justify-between pl-4.5 pr-1">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  /{p.id}
                </span>

                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                  <Globe className="w-3 h-3" />
                  <span className="text-[10px] font-medium uppercase truncate max-w-[90px]">
                    {Object.entries(p.title)
                      .filter(([k]) => k !== 'vi')
                      .map(([_, v]) => v)
                      .join(', ')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}