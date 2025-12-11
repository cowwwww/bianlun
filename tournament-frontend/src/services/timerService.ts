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

export const getTimerProjects = async (): Promise<TimerProject[]> => {
  try {
    const records = await pb.collection('timer_projects').getFullList({
      sort: '-created',
    });
    
    return records.map(record => ({
      id: record.id,
      name: record.name || '',
      description: record.description || '',
      type: record.type || 'stopwatch',
      duration: record.duration || 0,
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
    const record = await pb.collection('timer_projects').getOne(id);
    
    return {
      id: record.id,
      name: record.name || '',
      description: record.description || '',
      type: record.type || 'stopwatch',
      duration: record.duration || 0,
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
    const record = await pb.collection('timer_projects').create(project);
    
    return {
      ...project,
      id: record.id,
      createdAt: record.created,
      updatedAt: record.updated,
    };
  } catch (error) {
    console.error('Error creating timer project:', error);
    throw new Error('Failed to create timer project');
  }
};

export const updateTimerProject = async (id: string, project: Partial<TimerProject>): Promise<void> => {
  try {
    await pb.collection('timer_projects').update(id, project);
  } catch (error) {
    console.error('Error updating timer project:', error);
    throw new Error('Failed to update timer project');
  }
};

export const deleteTimerProject = async (id: string): Promise<void> => {
  try {
    await pb.collection('timer_projects').delete(id);
  } catch (error) {
    console.error('Error deleting timer project:', error);
    throw new Error('Failed to delete timer project');
  }
};

