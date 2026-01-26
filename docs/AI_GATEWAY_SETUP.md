# Configuración de AI Gateway

Esta guía te ayudará a configurar AI Gateway en tu aplicación Papelito.

## Pasos de Configuración

### 1. Obtener tu API Key

1. Ve a [AI Gateway Dashboard](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai&title=Go+to+AI+Gateway)
2. Selecciona **"API Keys"** en la barra lateral izquierda
3. Haz clic en **"Create key"** y procede con **"Create key"** desde el diálogo
4. Copia tu API key (se verá algo como: `vercel_ai_gateway_xxxxx`)

### 2. Configurar el archivo .env

1. En la raíz del proyecto, crea un archivo llamado `.env` (si no existe)
2. Agrega la siguiente línea con tu API key:

```env
AI_GATEWAY_API_KEY=tu_api_key_aqui
```

**Importante:** 
- El archivo `.env` ya está en `.gitignore` para proteger tu API key
- Nunca compartas tu API key públicamente
- Si trabajas en equipo, cada desarrollador debe tener su propia API key

### 3. Reiniciar la aplicación

Después de agregar la API key, reinicia tu aplicación Expo:

```bash
npm start
```

## Uso del Servicio

### Ejemplo básico: Generar texto

```typescript
import { aiGateway } from '@/services/aiGateway';

// Generar texto simple
const text = await aiGateway.generateText('Escribe un poema corto');
console.log(text);
```

### Ejemplo con streaming

```typescript
import { aiGateway } from '@/services/aiGateway';

// Generar texto con streaming (para mostrar progreso en tiempo real)
for await (const chunk of aiGateway.generateTextStream('Escribe una historia')) {
  console.log(chunk); // Cada chunk es una parte del texto generado
}
```

### Ejemplo usando el hook React

```typescript
import { useAIGateway } from '@/hooks/use-ai-gateway';

function MyComponent() {
  const { generateText, isGenerating, error } = useAIGateway();

  const handleGenerate = async () => {
    try {
      const result = await generateText('Escribe un resumen sobre...');
      console.log(result);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <View>
      <Button 
        title="Generar" 
        onPress={handleGenerate} 
        disabled={isGenerating}
      />
      {error && <Text>Error: {error}</Text>}
    </View>
  );
}
```

### Ejemplo con chat completions

```typescript
import { aiGateway } from '@/services/aiGateway';
import { ChatMessage } from '@/types/ai';

const messages: ChatMessage[] = [
  { role: 'system', content: 'Eres un asistente útil.' },
  { role: 'user', content: '¿Cuál es la capital de Francia?' },
];

const response = await aiGateway.createChatCompletion({
  model: 'openai/gpt-4o-mini',
  messages,
  temperature: 0.7,
});

console.log(response.choices[0].message.content);
```

## Modelos Disponibles

AI Gateway soporta múltiples modelos. Algunos ejemplos:

- `openai/gpt-4o-mini` - Rápido y económico (recomendado)
- `openai/gpt-4o` - Más potente pero más costoso
- `openai/gpt-3.5-turbo` - Alternativa económica
- `anthropic/claude-3-5-sonnet` - Modelo de Anthropic
- `anthropic/claude-3-haiku` - Modelo rápido de Anthropic

Consulta la [documentación de AI Gateway](https://vercel.com/docs/ai-gateway) para ver todos los modelos disponibles.

## Solución de Problemas

### Error: "AI Gateway API key no está configurada"

1. Verifica que el archivo `.env` existe en la raíz del proyecto
2. Verifica que `AI_GATEWAY_API_KEY` está definida en el archivo
3. Asegúrate de haber reiniciado la aplicación después de crear el archivo `.env`
4. Verifica que no hay espacios extra en la API key

### Error: "401 Unauthorized"

- Tu API key es inválida o ha expirado
- Verifica que copiaste la API key correctamente
- Genera una nueva API key desde el dashboard

### Error de red

- Verifica tu conexión a internet
- AI Gateway requiere conexión a internet para funcionar

## Recursos Adicionales

- [Documentación oficial de AI Gateway](https://vercel.com/docs/ai-gateway)
- [AI SDK Documentation](https://ai-sdk.dev)
- [OpenAI-Compatible API](https://vercel.com/docs/ai-gateway/openai-compat)
