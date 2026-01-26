import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, TextInput } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface EmojiPickerProps {
  selectedEmoji?: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const emojiCategories = {
  'Frecuentes': ['📝', '💡', '📌', '⭐', '🔥', '✅', '📅', '🎯', '💼', '📚', '🏠', '❤️'],
  'Emociones': ['😀', '😊', '😍', '🤔', '😴', '😎', '🥳', '😢', '😡', '🤯', '😱', '😇'],
  'Objetos': ['📱', '💻', '📷', '🎵', '🎬', '📺', '🎮', '⚽', '🎨', '🎭', '🎪', '🎁'],
  'Comida': ['🍕', '🍔', '🍟', '🍰', '🍎', '🍌', '🍇', '🍓', '🥑', '🍞', '🥐', '☕'],
  'Naturaleza': ['🌱', '🌲', '🌳', '🌴', '🌵', '🌷', '🌸', '🌹', '🌺', '🌻', '🌼', '🌾'],
  'Viajes': ['✈️', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻'],
  'Símbolos': ['⭐', '✨', '💫', '🌟', '💥', '💢', '💤', '💨', '🔥', '💧', '🌊', '☀️'],
};

export function EmojiPicker({ selectedEmoji, onSelect, onClose }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const allEmojis = Object.values(emojiCategories).flat();
  const filteredEmojis = searchQuery
    ? allEmojis.filter((emoji) => emoji.includes(searchQuery))
    : allEmojis;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
          Seleccionar Emoji
        </ThemedText>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <ThemedText style={styles.closeButtonText}>✕</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar emoji..."
          placeholderTextColor={colors.tabIconDefault}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!searchQuery && (
          <>
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <View key={category} style={styles.category}>
                <ThemedText type="defaultSemiBold" style={styles.categoryTitle}>
                  {category}
                </ThemedText>
                <View style={styles.emojiGrid}>
                  {emojis.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.emojiButton,
                        selectedEmoji === emoji && styles.emojiButtonSelected,
                      ]}
                      onPress={() => {
                        onSelect(emoji);
                        onClose();
                      }}
                    >
                      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
        {searchQuery && (
          <View style={styles.emojiGrid}>
            {filteredEmojis.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiButton,
                  selectedEmoji === emoji && styles.emojiButtonSelected,
                ]}
                onPress={() => {
                  onSelect(emoji);
                  onClose();
                }}
              >
                <ThemedText style={styles.emoji}>{emoji}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    opacity: 0.6,
  },
  searchContainer: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  scrollView: {
    maxHeight: 300,
  },
  category: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  emojiButtonSelected: {
    backgroundColor: '#007AFF',
  },
  emoji: {
    fontSize: 24,
  },
});
