import { BlockType } from '@/types/note';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface BlockTypeMenuProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

const blockTypes: { type: BlockType; label: string; icon: string }[] = [
  { type: 'paragraph', label: 'Texto', icon: '📝' },
  { type: 'heading1', label: 'Título 1', icon: 'H1' },
  { type: 'heading2', label: 'Título 2', icon: 'H2' },
  { type: 'heading3', label: 'Título 3', icon: 'H3' },
  { type: 'bulleted-list', label: 'Lista con viñetas', icon: '•' },
  { type: 'numbered-list', label: 'Lista numerada', icon: '1.' },
  { type: 'todo', label: 'Tarea', icon: '☐' },
];

export function BlockTypeMenu({ onSelect, onClose }: BlockTypeMenuProps) {
  return (
    <ThemedView style={styles.container}>
      {blockTypes.map((item) => (
        <TouchableOpacity
          key={item.type}
          style={styles.menuItem}
          onPress={() => {
            onSelect(item.type);
            onClose();
          }}
        >
          <ThemedText style={styles.menuIcon}>{item.icon}</ThemedText>
          <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  menuLabel: {
    fontSize: 16,
  },
});
