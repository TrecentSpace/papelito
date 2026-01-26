import { BlockTypeMenu } from '@/components/block-type-menu';
import { EmojiPicker } from '@/components/emoji-picker';
import { NoteBlock } from '@/components/note-block';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { aiGateway } from '@/services/aiGateway';
import { noteStorage } from '@/services/noteStorage';
import { Block, BlockType, Note } from '@/types/note';
import { generateId } from '@/utils/uuid';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function NoteEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState<string>('');
  const [favorite, setFavorite] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const loadNote = useCallback(async () => {
    if (!id) return;
    const loadedNote = await noteStorage.getNote(id);
    if (loadedNote) {
      setNote(loadedNote);
      setTitle(loadedNote.title || '');
      setEmoji(loadedNote.emoji || '');
      setFavorite(loadedNote.favorite || false);
    } else {
      // Si no existe, crear una nueva
      const newNote: Note = {
        id: id,
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
      setNote(newNote);
      setTitle('Sin título');
      setEmoji('');
      setFavorite(false);
    }
  }, [id]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleSave = async () => {
    if (!note) return;
    
    setIsSaving(true);
    try {
      const updatedNote: Note = {
        ...note,
        title: title.trim() || 'Sin título',
        emoji: emoji,
        favorite: favorite,
        updatedAt: Date.now(),
      };
      await noteStorage.saveNote(updatedNote);
      setNote(updatedNote);
      Alert.alert('Éxito', 'Nota guardada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la nota');
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  const generateTitleWithAI = async () => {
    if (!note) return;

    // Verificar que AI Gateway esté configurado
    if (!aiGateway.isConfigured()) {
      Alert.alert(
        'AI Gateway no configurado',
        'Por favor, configura AI_GATEWAY_API_KEY en tu archivo .env para usar esta funcionalidad.'
      );
      return;
    }

    // Extraer el contenido de todos los bloques
    const content = note.blocks
      .map((block) => {
        // Filtrar bloques vacíos y formatear según el tipo
        if (!block.content.trim()) return '';
        
        switch (block.type) {
          case 'heading1':
            return `# ${block.content}`;
          case 'heading2':
            return `## ${block.content}`;
          case 'heading3':
            return `### ${block.content}`;
          case 'bulleted-list':
            return `• ${block.content}`;
          case 'numbered-list':
            return `1. ${block.content}`;
          case 'todo':
            return `${block.checked ? '✓' : '☐'} ${block.content}`;
          default:
            return block.content;
        }
      })
      .filter((text) => text.trim().length > 0)
      .join('\n');

    // Si no hay contenido, mostrar un mensaje
    if (!content.trim()) {
      Alert.alert(
        'Contenido vacío',
        'Agrega algún contenido a tu nota antes de generar un título con IA.'
      );
      return;
    }

    setIsGeneratingTitle(true);

    try {
      // Crear el prompt para la IA
      const prompt = `Basándote en el siguiente contenido de una nota, genera un título corto y descriptivo (máximo 60 caracteres). El título debe ser claro, conciso y reflejar el tema principal del contenido. Responde SOLO con el título, sin comillas ni explicaciones adicionales.

Contenido de la nota:
${content}`;

      const generatedTitle = await aiGateway.generateText(prompt, 'openai/gpt-4o-mini');
      
      // Limpiar el título (remover comillas, espacios extra, etc.)
      const cleanTitle = generatedTitle
        .trim()
        .replace(/^["']|["']$/g, '') // Remover comillas al inicio y final
        .trim()
        .slice(0, 60); // Limitar a 60 caracteres

      if (cleanTitle) {
        setTitle(cleanTitle);
        Alert.alert('¡Listo!', `Título generado: "${cleanTitle}"`);
      } else {
        Alert.alert('Error', 'No se pudo generar un título válido. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error generating title:', error);
      Alert.alert(
        'Error',
        error instanceof Error 
          ? error.message 
          : 'No se pudo generar el título. Verifica tu conexión y configuración de AI Gateway.'
      );
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const updateBlock = (blockId: string, updatedBlock: Block) => {
    if (!note) return;
    const updatedBlocks = note.blocks.map((block) =>
      block.id === blockId ? updatedBlock : block
    );
    setNote({ ...note, blocks: updatedBlocks });
  };

  const addBlock = (type: BlockType, afterIndex?: number) => {
    if (!note) return;
    const newBlock: Block = {
      id: generateId(),
      type,
      content: '',
      ...(type === 'todo' && { checked: false }),
    };

    const index = afterIndex !== undefined ? afterIndex + 1 : note.blocks.length;
    const updatedBlocks = [
      ...note.blocks.slice(0, index),
      newBlock,
      ...note.blocks.slice(index),
    ];
    setNote({ ...note, blocks: updatedBlocks });
    setFocusedBlockIndex(index);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const deleteBlock = (blockId: string) => {
    if (!note || note.blocks.length <= 1) return;
    const updatedBlocks = note.blocks.filter((block) => block.id !== blockId);
    setNote({ ...note, blocks: updatedBlocks });
  };

  if (!note) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Cargando...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          style={styles.emojiButton}
        >
          <ThemedText style={styles.emojiDisplay}>
            {emoji || '😀'}
          </ThemedText>
        </TouchableOpacity>
        <View style={styles.saveAndStarContainer}>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            disabled={isSaving}
          >
            <ThemedText style={styles.saveButtonText}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleFavorite}
            style={styles.favoriteButtonHeader}
          >
            <IconSymbol
              name={favorite ? 'star.fill' : 'star'}
              size={28}
              color={favorite ? '#FFD700' : colors.tabIconDefault}
            />
          </TouchableOpacity>
        </View>
      </View>

      {showEmojiPicker && (
        <View style={styles.emojiPickerContainer}>
          <EmojiPicker
            selectedEmoji={emoji}
            onSelect={(selectedEmoji) => {
              setEmoji(selectedEmoji);
              setShowEmojiPicker(false);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <TextInput
              style={[styles.titleInput, { color: colors.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Título de la nota"
              placeholderTextColor={colors.tabIconDefault}
              multiline
            />
            <TouchableOpacity
              onPress={generateTitleWithAI}
              style={[styles.magicButton, isGeneratingTitle && styles.magicButtonDisabled]}
              disabled={isGeneratingTitle}
            >
              <IconSymbol
                name="sparkles"
                size={20}
                color={isGeneratingTitle ? colors.tabIconDefault : '#9B59B6'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <ThemedText type="defaultSemiBold" style={styles.contentLabel}>
            Contenido
          </ThemedText>
          {note.blocks.map((block, index) => (
            <NoteBlock
              key={block.id}
              block={block}
              onUpdate={(updatedBlock) => updateBlock(block.id, updatedBlock)}
              onDelete={() => deleteBlock(block.id)}
              onAddBlock={(type) => addBlock(type, index)}
              isFocused={focusedBlockIndex === index}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.addBlockButton}
          onPress={() => setShowBlockMenu(!showBlockMenu)}
        >
          <IconSymbol
            name={showBlockMenu ? 'xmark' : 'plus.circle.fill'}
            size={24}
            color={colors.tint}
          />
          <ThemedText style={styles.addBlockText}>
            {showBlockMenu ? 'Cancelar' : 'Agregar bloque'}
          </ThemedText>
        </TouchableOpacity>

        {showBlockMenu && (
          <View style={styles.blockMenuContainer}>
            <BlockTypeMenu
              onSelect={(type) => {
                addBlock(type, focusedBlockIndex ?? undefined);
                setShowBlockMenu(false);
              }}
              onClose={() => setShowBlockMenu(false)}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
    flexWrap: 'nowrap',
  },
  backButton: {
    padding: 4,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  emojiDisplay: {
    fontSize: 24,
  },
  saveAndStarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  favoriteButtonHeader: {
    padding: 8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emojiPickerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    minHeight: 40,
    flex: 1,
  },
  magicButton: {
    padding: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    marginTop: 2,
  },
  magicButtonDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 16,
    gap: 8,
  },
  addBlockText: {
    fontSize: 16,
    opacity: 0.7,
  },
  blockMenuContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
