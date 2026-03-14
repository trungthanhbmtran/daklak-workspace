export interface CategoryItem {
    id: number;
    group: string;
    code: string;
    name: string;
    sort: number;
    active: number;
  }
  
  export interface CategoryPayload {
    group?: string;
    code?: string;
    name?: string;
    order?: number;
    active?: number;
  }
