import pb from './pocketbase';

export interface TimerProject {
  id: string;
  name: string;
  description: string;
  type: 'countdown' | 'stopwatch';
  duration?: number; // in seconds for countdown
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Support both the new collection name ("timers") and the old one ("timer_projects")
const COLLECTION_CANDIDATES = ['timers', 'timer_projects'];
let resolvedCollection: string | null = null;

const resolveCollectionName = async (): Promise<string> => {
  if (resolvedCollection) return resolvedCollection;

  for (const name of COLLECTION_CANDIDATES) {
    try {
      await pb.collection(name).getList(1, 1);
      resolvedCollection = name;
      return name;
    } catch (error: any) {
      if (error?.status !== 404) {
        // Non-404 errors mean the collection exists but auth/rules blocked; still use it.
        resolvedCollection = name;
        return name;
      }
    }
  }

  // Fallback to the expected name
  resolvedCollection = COLLECTION_CANDIDATES[0];
  return resolvedCollection;
};

export const getTimerProjects = async (): Promise<TimerProject[]> => {
  try {
    const collectionName = await resolveCollectionName();
    const records = await pb.collection(collectionName).getFullList({
      sort: '-created',
    });
    
    return records.map(record => ({
      id: record.id,
      name: record.name || '',
      description: record.description || '',
      type: (record.type as TimerProject['type']) || 'stopwatch',
      duration: typeof record.duration === 'number' ? record.duration : 0,
      createdBy: record.createdBy || '',
      createdAt: record.created || '',
      updatedAt: record.updated || '',
    }));
  } catch (error) {
    console.error('Error fetching timer projects:', error);
    // Return empty array if collection doesn't exist yet
    return [];
  }
};

export const getTimerProjectById = async (id: string): Promise<TimerProject | null> => {
  try {
    const collectionName = await resolveCollectionName();
    const record = await pb.collection(collectionName).getOne(id);
    
    return {
      id: record.id,
      name: record.name || '',
      description: record.description || '',
      type: (record.type as TimerProject['type']) || 'stopwatch',
      duration: typeof record.duration === 'number' ? record.duration : 0,
      createdBy: record.createdBy || '',
      createdAt: record.created || '',
      updatedAt: record.updated || '',
    };
  } catch (error) {
    console.error('Error fetching timer project by ID:', error);
    return null;
  }
};

export const createTimerProject = async (project: Omit<TimerProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimerProject> => {
  try {
    const collectionName = await resolveCollectionName();
    const record = await pb.collection(collectionName).create(project);
    
    return {
      ...project,
      id: record.id,
      createdAt: record.created,
      updatedAt: record.updated,
    };
  } catch (error: any) {
    console.error('Error creating timer project:', error);
    throw new Error(error?.message || 'Failed to create timer project');
  }
};

export const updateTimerProject = async (id: string, project: Partial<TimerProject>): Promise<void> => {
  try {
    const collectionName = await resolveCollectionName();
    await pb.collection(collectionName).update(id, project);
  } catch (error) {
    console.error('Error updating timer project:', error);
    throw new Error('Failed to update timer project');
  }
};

export const deleteTimerProject = async (id: string): Promise<void> => {
  try {
    const collectionName = await resolveCollectionName();
    await pb.collection(collectionName).delete(id);
  } catch (error) {
    console.error('Error deleting timer project:', error);
    throw new Error('Failed to delete timer project');
  }
};

