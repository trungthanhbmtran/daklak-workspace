import { useState } from 'react';
import { toast } from 'sonner';

export function useDocuments() {
  const [isLoading, setIsLoading] = useState(false);

  const getCategories = async (type: string) => {
    try {
      const response = await fetch(`/api/v1/admin/documents/categories?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

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

  const createMinutes = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/admin/documents/minutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create minutes');
      }

      const result = await response.json();
      toast.success('Biên bản đã được lưu thành công!');
      return result;
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi lưu biên bản');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createDocument,
    createMinutes,
    getCategories,
    isLoading,
  };
}
