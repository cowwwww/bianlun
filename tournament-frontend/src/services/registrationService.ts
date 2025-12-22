import pb from './pocketbase';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Registration {
  id: string;
  tournamentId: string;
  teamName: string;
  participants: string[];
  wechatId?: string;
  contact?: string;
  category?: string;
  notes?: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  // Optional fields to align with legacy structures
  email?: string;
  phone?: string;
  school?: string;
  experience?: string;
  // File uploads
  documents?: string[]; // File URLs or IDs
  resumes?: string[]; // File URLs or IDs
  judgeResume?: string; // For accompanying judge
  // Team composition
  teamComposition?: Array<{
    name: string;
    role: string;
    email?: string;
    phone?: string;
  }>;
  // Accompanying judge info
  needsAccompanyingJudge?: boolean;
  accompanyingJudge?: {
    name: string;
    experience: string;
    contact: string;
  };
}

const staticRegistrations: Registration[] = [
];

const sortRegs = (items: Registration[]) =>
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const mapRecord = (record: any): Registration => ({
  id: record.id,
  tournamentId: record.tournamentId || record.tournament || '',
  teamName: record.teamName || record.name || '',
  participants: record.participants || [],
  wechatId: record.wechatId || record.wechat_id,
  contact: record.contact,
  category: record.category,
  notes: record.notes,
  status: (record.status as RegistrationStatus) || 'pending',
  paymentStatus: (record.paymentStatus as PaymentStatus) || 'pending',
  createdBy: record.createdBy || record.owner || record.expand?.createdBy?.id,
  createdAt: record.created || '',
  updatedAt: record.updated || '',
});

export const listRegistrationsByTournament = async (tournamentId: string): Promise<Registration[]> => {
  try {
    const records = await pb.collection('registrations').getFullList({
      sort: '-created',
      filter: `tournamentId="${tournamentId}"`,
    });
    const mapped = records.map(mapRecord);
    const merged = [
      ...staticRegistrations.filter((s) => s.tournamentId === tournamentId && !mapped.find((m) => m.id === s.id)),
      ...mapped,
    ];
    return sortRegs(merged);
  } catch (error) {
    console.error('Error listing registrations:', error);
    return sortRegs(staticRegistrations.filter((s) => s.tournamentId === tournamentId));
  }
};

export const listAllRegistrations = async (): Promise<Registration[]> => {
  try {
    const records = await pb.collection('registrations').getFullList({
      sort: '-created',
    });
    const mapped = records.map(mapRecord);
    const merged = [
      ...staticRegistrations.filter((s) => !mapped.find((m) => m.id === s.id)),
      ...mapped,
    ];
    return sortRegs(merged);
  } catch (error) {
    console.error('Error listing all registrations:', error);
    return sortRegs(staticRegistrations);
  }
};

export const createRegistration = async (
  registration: Omit<Registration, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'paymentStatus'>
): Promise<Registration> => {
  const payload = {
    ...registration,
    status: 'pending',
    paymentStatus: 'pending',
    createdBy: pb.authStore.model?.id,
  };

  const record = await pb.collection('registrations').create(payload);
  return mapRecord(record);
};

export const updateRegistrationStatus = async (id: string, status: RegistrationStatus) => {
  await pb.collection('registrations').update(id, { status });
};

export const updateRegistrationPayment = async (id: string, paymentStatus: PaymentStatus) => {
  await pb.collection('registrations').update(id, { paymentStatus });
};

export const updateRegistration = async (id: string, updates: Partial<Pick<Registration, 'teamName' | 'category' | 'contact' | 'wechatId' | 'notes' | 'needsAccompanyingJudge'>>) => {
  await pb.collection('registrations').update(id, updates);
};

export const deleteRegistration = async (id: string) => {
  await pb.collection('registrations').delete(id);
};

export const uploadFile = async (file: File, collection: string = 'files'): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const record = await pb.collection(collection).create(formData);
    return record.id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('File upload failed');
  }
};

export const uploadMultipleFiles = async (files: FileList | File[], collection: string = 'files'): Promise<string[]> => {
  const fileArray = Array.from(files);
  const uploadPromises = fileArray.map(file => uploadFile(file, collection));
  return Promise.all(uploadPromises);
};

export const getFileUrl = (fileId: string, collection: string = 'files'): string => {
  return pb.files.getUrl({ collection, id: fileId, file: fileId }, fileId);
};

export const deleteFile = async (fileId: string, collection: string = 'files'): Promise<void> => {
  try {
    await pb.collection(collection).delete(fileId);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

