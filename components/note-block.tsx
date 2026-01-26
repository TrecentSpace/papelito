import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Block, BlockType } from '@/types/note';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface NoteBlockProps {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete?: () => void;
  onAddBlock?: (type: BlockType) => void;
  isFocused?: boolean;
}

export function NoteBlock({ block, onUpdate, onDelete, onAddBlock, isFocused }: NoteBlockProps) {
  const colorScheme = useColorScheme();
  const [isEditing, setIsEditing] = useState(false);
  const colors = Colors[colorScheme ?? 'light'];

  const handleContentChange = (text: string) => {
    onUpdate({ ...block, content: text });
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      if (onAddBlock) {
        onAddBlock('paragraph');
      }
    }
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'heading1':
        return (
          <TextInput
            style={[styles.heading1, { color: colors.text }]}
            value={block.content}
            onChangeText={handleContentChange}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Título 1"
            placeholderTextColor={colors.tabIconDefault}
            multiline
            onKeyPress={handleKeyPress}
          />
        );
      case 'heading2':
        return (
          <TextInput
            style={[styles.heading2, { color: colors.text }]}
            value={block.content}
            onChangeText={handleContentChange}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Título 2"
            placeholderTextColor={colors.tabIconDefault}
            multiline
            onKeyPress={handleKeyPress}
          />
        );
      case 'heading3':
        return (
          <TextInput
            style={[styles.heading3, { color: colors.text }]}
            value={block.content}
            onChangeText={handleContentChange}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Título 3"
            placeholderTextColor={colors.tabIconDefault}
            multiline
            onKeyPress={handleKeyPress}
          />
        );
      case 'bulleted-list':
        return (
          <View style={styles.listRow}>
            <ThemedText style={styles.bullet}>•</ThemedText>
            <TextInput
              style={[styles.listItem, { color: colors.text }]}
              value={block.content}
              onChangeText={handleContentChange}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              placeholder="Lista con viñetas"
              placeholderTextColor={colors.tabIconDefault}
              multiline
              onKeyPress={handleKeyPress}
            />
          </View>
        );
      case 'numbered-list':
        return (
          <View style={styles.listRow}>
            <ThemedText style={styles.number}>1.</ThemedText>
            <TextInput
              style={[styles.listItem, { color: colors.text }]}
              value={block.content}
              onChangeText={handleContentChange}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              placeholder="Lista numerada"
              placeholderTextColor={colors.tabIconDefault}
              multiline
              onKeyPress={handleKeyPress}
            />
          </View>
        );
      case 'todo':
        return (
          <View style={styles.listRow}>
            <TouchableOpacity
              style={[styles.checkbox, block.checked && styles.checkboxChecked]}
              onPress={() => onUpdate({ ...block, checked: !block.checked })}
            >
              {block.checked && <ThemedText style={styles.checkmark}>✓</ThemedText>}
            </TouchableOpacity>
            <TextInput
              style={[
                styles.todoItem,
                { color: colors.text },
                block.checked && styles.todoItemChecked,
              ]}
              value={block.content}
              onChangeText={handleContentChange}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              placeholder="Tarea pendiente"
              placeholderTextColor={colors.tabIconDefault}
              multiline
              onKeyPress={handleKeyPress}
            />
          </View>
        );
      default: // paragraph
        return (
          <TextInput
            style={[styles.paragraph, { color: colors.text }]}
            value={block.content}
            onChangeText={handleContentChange}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Escribe algo..."
            placeholderTextColor={colors.tabIconDefault}
            multiline
            onKeyPress={handleKeyPress}
          />
        );
    }
  };

  return (
    <ThemedView style={[styles.blockContainer, isEditing && styles.blockContainerFocused]}>
      {renderBlock()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  blockContainer: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    minHeight: 32,
  },
  blockContainerFocused: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 24,
  },
  heading1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    marginVertical: 8,
    minHeight: 40,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    marginVertical: 6,
    minHeight: 32,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    marginVertical: 4,
    minHeight: 28,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  bullet: {
    fontSize: 20,
    marginRight: 8,
    marginTop: 2,
  },
  number: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
    minWidth: 20,
  },
  listItem: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 24,
  },
  todoItem: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 24,
  },
  todoItemChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    marginRight: 8,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
