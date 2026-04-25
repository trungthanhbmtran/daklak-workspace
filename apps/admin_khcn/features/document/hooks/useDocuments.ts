import { useState } from 'react';
import { toast } from 'sonner';

export function useDocuments() {
  const [isLoading, setIsLoading] = useState(false);

  const createDocument = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/admin/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const result = await response.json();
      toast.success('Văn bản đã được lưu vào sổ thành công!');
      return result;
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi lưu văn bản');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createDocument,
    isLoading,
  };
}
