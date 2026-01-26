import { useState, useCallback } from 'react';
import { aiGateway } from '@/services/aiGateway';
import { ChatMessage } from '@/types/ai';

interface UseAIGatewayOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Hook personalizado para usar AI Gateway en componentes React
 * 
 * @example
 * ```tsx
 * const { generateText, isGenerating, error } = useAIGateway();
 * 
 * const handleGenerate = async () => {
 *   const text = await generateText('Escribe un poema sobre el océano');
 *   console.log(text);
 * };
 * ```
 */
export function useAIGateway(options: UseAIGatewayOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateText = useCallback(async (prompt: string): Promise<string> => {
    if (!aiGateway.isConfigured()) {
      const errorMsg = 'AI Gateway no está configurado. Por favor, configura AI_GATEWAY_API_KEY en tu archivo .env';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsGenerating(true);
    setError(null);

    try {
      const model = options.model || 'openai/gpt-4o-mini';
      const result = await aiGateway.generateText(prompt, model);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al generar texto';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [options.model]);

  const generateTextStream = useCallback(async function* (prompt: string): AsyncGenerator<string, void, unknown> {
    if (!aiGateway.isConfigured()) {
      const errorMsg = 'AI Gateway no está configurado. Por favor, configura AI_GATEWAY_API_KEY en tu archivo .env';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsGenerating(true);
    setError(null);

    try {
      const model = options.model || 'openai/gpt-4o-mini';
      yield* aiGateway.generateTextStream(prompt, model);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al generar texto';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [options.model]);

  const chatCompletion = useCallback(async (messages: ChatMessage[]): Promise<string> => {
    if (!aiGateway.isConfigured()) {
      const errorMsg = 'AI Gateway no está configurado. Por favor, configura AI_GATEWAY_API_KEY en tu archivo .env';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsGenerating(true);
    setError(null);

    try {
      const model = options.model || 'openai/gpt-4o-mini';
      const response = await aiGateway.createChatCompletion({
        model,
        messages,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      });
      return response.choices[0]?.message?.content || '';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido en la completación de chat';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [options.model, options.temperature, options.maxTokens]);

  return {
    generateText,
    generateTextStream,
    chatCompletion,
    isGenerating,
    error,
    isConfigured: aiGateway.isConfigured(),
  };
}
