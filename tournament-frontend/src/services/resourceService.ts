import pb from './pocketbase';
import { auth } from './authService';

export type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  topic?: string;
  file?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  author?: string;
  createdAt: string;
  updatedAt: string;
};

const staticResources: Resource[] = [
];

const mapRecord = (record: any): Resource => ({
  id: record.id,
  title: record.title || record.file || '未命名资源',
  description: record.description || '',
  category: record.category || '',
  topic: record.topic,
  file: record.file,
  fileUrl: record.file ? pb.files.getUrl(record, record.file) : record.fileUrl || '',
  fileType: record.fileType,
  fileSize: record.fileSize,
  author: record.author,
  createdAt: record.created || '',
  updatedAt: record.updated || '',
});

export const listResources = async (): Promise<Resource[]> => {
  try {
    const records = await pb.collection('resources').getFullList({ sort: '-created' });
    const mapped = records.map(mapRecord);
    const merged = [
      ...staticResources.filter((s) => !mapped.find((m) => m.id === s.id)),
      ...mapped,
    ];
    return merged;
  } catch (error) {
    console.error('Error listing resources:', error);
    return staticResources;
  }
};

export const createResource = async (input: {
  title: string;
  description: string;
  category: string;
  topic?: string;
  file?: File | null;
}): Promise<Resource> => {
  const fd = new FormData();
  fd.append('title', input.title);
  fd.append('description', input.description);
  fd.append('category', input.category);
  if (input.topic) fd.append('topic', input.topic);
  if (input.file) fd.append('file', input.file);
  if (auth.getCurrentUser()?.id) fd.append('author', auth.getCurrentUser()!.id);

  const record = await pb.collection('resources').create(fd);
  return mapRecord(record);
};



