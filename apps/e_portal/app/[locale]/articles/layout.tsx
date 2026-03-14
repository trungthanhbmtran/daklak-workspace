import { Breadcrumb } from "@/components/common/Breadcrumb";


export default function ArticlesLayout({ children }: any) {
    return (
        <div className="w-full">
            <Breadcrumb />
            <div>{children}</div>
        </div>

    );
}
