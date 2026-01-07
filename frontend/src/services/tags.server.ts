import { Tag } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Serviço server-side para tags (Server Components)
export const tagsServerService = {
  async listar(): Promise<Tag[]> {
    const res = await fetch(`${API_URL}/tags`, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch tags: ${res.statusText}`);
    }
    
    return res.json();
  },
};
