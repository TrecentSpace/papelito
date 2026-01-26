import { AIGatewayConfig, StreamTextOptions, ChatCompletionOptions, ChatCompletionResponse, ChatMessage } from '@/types/ai';
import { AI_GATEWAY_API_KEY, isConfigured as checkConfig } from '@/config/aiGatewayConfig';

const AI_GATEWAY_BASE_URL = 'https://ai-gateway.vercel.sh/v1';

/**
 * Servicio para interactuar con Vercel AI Gateway
 * Compatible con React Native usando fetch nativo
 */
class AIGatewayService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Obtener la API key desde la configuración (solución temporal)
    const apiKey = AI_GATEWAY_API_KEY;
    
    if (!checkConfig()) {
      console.warn('⚠️ AI Gateway no está configurado.');
      console.warn('📝 SOLUCIÓN TEMPORAL:');
      console.warn('   1. Abre: config/aiGatewayConfig.ts');
      console.warn('   2. Reemplaza "TU_API_KEY_AQUI" con tu API key real');
      console.warn('   3. Guarda el archivo y reinicia la app');
    } else {
      console.log('✅ AI Gateway configurado correctamente');
    }

    this.apiKey = apiKey;
    this.baseUrl = AI_GATEWAY_BASE_URL;
  }

  /**
   * Verifica si la API key está configurada
   */
  isConfigured(): boolean {
    return checkConfig();
  }

  /**
   * Crea una completación de chat usando AI Gateway
   * Compatible con la API de OpenAI
   */
  async createChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    if (!this.isConfigured()) {
      throw new Error('AI Gateway API key no está configurada. Por favor, configura AI_GATEWAY_API_KEY en tu archivo .env');
    }

    // AI Gateway usa el formato: https://ai-gateway.vercel.sh/v1/chat/completions
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: options.stream ?? false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Gateway error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Crea una completación de chat con streaming
   * Retorna un stream de texto
   */
  async *streamChatCompletion(options: ChatCompletionOptions): AsyncGenerator<string, void, unknown> {
    if (!this.isConfigured()) {
      throw new Error('AI Gateway API key no está configurada. Por favor, configura AI_GATEWAY_API_KEY en tu archivo .env');
    }

    // AI Gateway usa el formato: https://ai-gateway.vercel.sh/v1/chat/completions
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Gateway error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No se pudo obtener el stream de respuesta');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Ignorar errores de parsing en líneas vacías
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Método de alto nivel para generar texto usando un prompt simple
   * Similar a streamText del AI SDK pero adaptado para React Native
   */
  async generateText(prompt: string, model: string = 'openai/gpt-4o-mini'): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await this.createChatCompletion({
      model,
      messages,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Método de alto nivel para generar texto con streaming
   */
  async *generateTextStream(prompt: string, model: string = 'openai/gpt-4o-mini'): AsyncGenerator<string, void, unknown> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    yield* this.streamChatCompletion({
      model,
      messages,
    });
  }
}

// Exportar una instancia singleton
export const aiGateway = new AIGatewayService();
