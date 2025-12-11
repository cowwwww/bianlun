import pb from './pocketbase';

export interface Topic {
  id: string;
  text: string;
  explanation: string;
  area: string;
  language: string;
  tournament: string;
  ratings?: Record<string, number>;
  averageRating?: number;
  createdAt: string;
}

export const getTopics = async (): Promise<Topic[]> => {
  try {
    const records = await pb.collection('topics').getFullList({
      sort: '-created',
    });
    
    return records.map(record => ({
      id: record.id,
      text: record.text || '',
      explanation: record.explanation || '',
      area: record.area || '',
      language: record.language || '',
      tournament: record.tournament || '',
      ratings: record.ratings || {},
      averageRating: record.averageRating || 0,
      createdAt: record.created || '',
    }));
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
};

export const getTopicById = async (id: string): Promise<Topic | null> => {
  try {
    const record = await pb.collection('topics').getOne(id);
    
    return {
      id: record.id,
      text: record.text || '',
      explanation: record.explanation || '',
      area: record.area || '',
      language: record.language || '',
      tournament: record.tournament || '',
      ratings: record.ratings || {},
      averageRating: record.averageRating || 0,
      createdAt: record.created || '',
    };
  } catch (error) {
    console.error('Error fetching topic by ID:', error);
    return null;
  }
};

export const addTopic = async (topic: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> => {
  try {
    const record = await pb.collection('topics').create(topic);
    
    return {
      ...topic,
      id: record.id,
      createdAt: record.created,
    };
  } catch (error) {
    console.error('Error adding topic:', error);
    throw new Error('Failed to add topic');
  }
};

export const updateTopic = async (id: string, topic: Partial<Topic>): Promise<void> => {
  try {
    await pb.collection('topics').update(id, topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    throw new Error('Failed to update topic');
  }
};

export const deleteTopic = async (id: string): Promise<void> => {
  try {
    await pb.collection('topics').delete(id);
  } catch (error) {
    console.error('Error deleting topic:', error);
    throw new Error('Failed to delete topic');
  }
};
