import { Note } from '@/types/note';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_KEY = '@papelito_notes';

export const noteStorage = {
  async getAllNotes(): Promise<Note[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(NOTES_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error reading notes:', e);
      return [];
    }
  },

  async getNote(id: string): Promise<Note | null> {
    try {
      const notes = await this.getAllNotes();
      return notes.find(note => note.id === id) || null;
    } catch (e) {
      console.error('Error reading note:', e);
      return null;
    }
  },

  async saveNote(note: Note): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const index = notes.findIndex(n => n.id === note.id);

      if (index >= 0) {
        notes[index] = note;
      } else {
        notes.push(note);
      }

      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving note:', e);
    }
  },

  async deleteNote(id: string): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(note => note.id !== id);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filteredNotes));
    } catch (e) {
      console.error('Error deleting note:', e);
    }
  },
};
