export interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  type: string;
  folder: string;
}

export const uploadToCPanel = async (file: File, folder: string): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch(process.env.NEXT_PUBLIC_UPLOAD_API_URL || '/uploads/upload.php', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Upload failed');
  return data;
};