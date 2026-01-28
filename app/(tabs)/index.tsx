import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConvexReady } from '@/hooks/use-convex-ready';
import { Note } from '@/types/note';
import { generateId } from '@/utils/uuid';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

export default function HomeScreen() {
  const { isReady, isLoading } = useConvexReady();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const notes = useQuery(api.notes.getAll) ?? [];
  const saveNote = useMutation(api.notes.save);
  const deleteNoteMutation = useMutation(api.notes.deleteNote);

  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

  if (!isReady) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Cargando notas...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const toggleFavorite = async (note: Note) => {
    const updatedNote = { ...note, favorite: !note.favorite };
    await saveNote({ note: updatedNote });
  };

  const createNewNote = async () => {
    const newNote: Note = {
      id: generateId(),
      title: 'Sin título',
      emoji: '',
      favorite: false,
      blocks: [
        {
          id: generateId(),
          type: 'paragraph',
          content: '',
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveNote({ note: newNote });
    router.push(`/note/${newNote.id}`);
  };

  const deleteNote = async (noteId: string) => {
    Alert.alert('Eliminar nota', '¿Estás seguro de que quieres eliminar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteNoteMutation({ id: noteId });
        },
      },
    ]);
  };

  const filteredNotes = sortedNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.blocks.some((block) =>
        block.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Papelito
        </ThemedText>
        <TouchableOpacity onPress={createNewNote} style={styles.newNoteButton}>
          <IconSymbol name="plus.circle.fill" size={28} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.tabIconDefault} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar notas..."
          placeholderTextColor={colors.tabIconDefault}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.noteCard, { backgroundColor: colors.background }]}
            onPress={() => router.push(`/note/${item.id}`)}
            onLongPress={() => deleteNote(item.id)}
          >
            <View style={styles.noteHeader}>
              {item.emoji && (
                <ThemedText style={styles.noteEmoji}>{item.emoji}</ThemedText>
              )}
              <ThemedText type="defaultSemiBold" style={styles.noteTitle}>
                {item.title || 'Sin título'}
              </ThemedText>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item);
                }}
                style={styles.favoriteButton}
              >
                <IconSymbol
                  name={item.favorite ? 'heart.fill' : 'heart'}
                  size={20}
                  color={item.favorite ? '#FF3B30' : colors.tabIconDefault}
                />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.notePreview} numberOfLines={2}>
              {item.blocks
                .map((block) => block.content)
                .join(' ')
                .trim() || 'Nota vacía'}
            </ThemedText>
            <ThemedText style={styles.noteDate}>{formatDate(item.updatedAt)}</ThemedText>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="note.text" size={64} color={colors.tabIconDefault} />
            <ThemedText style={styles.emptyText}>
              {searchQuery ? 'No se encontraron notas' : 'No hay notas todavía'}
            </ThemedText>
            {!searchQuery && (
              <TouchableOpacity onPress={createNewNote} style={styles.emptyButton}>
                <ThemedText style={styles.emptyButtonText}>Crear primera nota</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  newNoteButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  noteEmoji: {
    fontSize: 24,
  },
  noteTitle: {
    fontSize: 18,
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  notePreview: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
