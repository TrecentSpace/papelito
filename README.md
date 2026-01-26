# Papelito - Aplicación de Notas Estilo Notion

Una aplicación de notas moderna inspirada en Notion, construida con React Native y Expo.

## Características

- ✏️ **Bloques editables**: Crea notas con diferentes tipos de bloques (texto, encabezados, listas, tareas)
- 📝 **Múltiples tipos de contenido**: 
  - Texto normal
  - Títulos (H1, H2, H3)
  - Listas con viñetas
  - Listas numeradas
  - Tareas pendientes (checkboxes)
- 🔍 **Búsqueda**: Busca entre todas tus notas
- 💾 **Almacenamiento local**: Tus notas se guardan automáticamente en el dispositivo
- 🌓 **Modo claro/oscuro**: Soporte automático para temas claro y oscuro
- 📱 **Multiplataforma**: Funciona en iOS, Android y Web

## Instalación

```bash
npm install
```

## Uso

1. Inicia la aplicación:
```bash
npm start
```

2. Presiona `w` para abrir en web, `i` para iOS, o `a` para Android

3. Crea tu primera nota tocando el botón "+" en la pantalla principal

4. Edita tus notas tocando en cualquier nota de la lista

5. Agrega nuevos bloques usando el botón "+" en el editor

## Estructura del Proyecto

- `app/` - Pantallas y navegación
  - `(tabs)/index.tsx` - Lista principal de notas
  - `note/[id].tsx` - Editor de notas
- `components/` - Componentes reutilizables
  - `note-block.tsx` - Componente para bloques editables
  - `block-type-menu.tsx` - Menú para seleccionar tipo de bloque
- `types/` - Definiciones de TypeScript
- `services/` - Servicios de almacenamiento
- `utils/` - Utilidades

## Tecnologías

- React Native
- Expo Router
- TypeScript
- AsyncStorage
- AI Gateway (Vercel) - Para funcionalidades de IA

## Configuración de AI Gateway

Para usar las funcionalidades de IA, necesitas configurar AI Gateway:

1. Obtén tu API key desde el [AI Gateway Dashboard](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai&title=Go+to+AI+Gateway)
2. Crea un archivo `.env` en la raíz del proyecto
3. Agrega tu API key: `AI_GATEWAY_API_KEY=tu_api_key_aqui`
4. Reinicia la aplicación

Para más detalles, consulta [docs/AI_GATEWAY_SETUP.md](./docs/AI_GATEWAY_SETUP.md)
