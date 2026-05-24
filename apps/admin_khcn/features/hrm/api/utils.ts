export function unwrapData(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res.data)) return res.data;
  if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
}

export function unwrapMeta(res: any): any {
  return res?.meta || res?.data?.meta;
}
