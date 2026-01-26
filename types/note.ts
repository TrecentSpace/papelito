export type BlockType = 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulleted-list' | 'numbered-list' | 'todo';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // Para bloques de tipo todo
}

export interface Note {
  id: string;
  title: string;
  emoji?: string;
  favorite?: boolean;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
}
