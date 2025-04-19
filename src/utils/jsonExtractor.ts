import { SchemaData } from '@/types/api';
import { eventBus } from './eventBus';
import { EVENTS } from '@/constants/api';

/**
 * Извлекает JSON схему из текстового ответа
 * @param text Текст, содержащий JSON
 * @returns Объект с извлеченной схемой и объяснением или null
 */
export function extractSchemaFromResponse(text: string): SchemaData | null {
  console.log('Extracting schema from:', text.substring(0, 100) + '...');
  
  // Проверяем, что текст не пустой
  if (!text || typeof text !== 'string') {
    console.error('Invalid text input:', text);
    return null;
  }
  
  // Стратегия 1: Ищем JSON между маркерами ```json и ```
  if (text.includes('```json')) {
    // Ищем JSON в ответе (между ```json и ```)
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
    const jsonMatches = [...text.matchAll(jsonRegex)];
    
    if (jsonMatches.length > 0) {
      try {
        // Получаем текст JSON из первого совпадения
        const jsonText = jsonMatches[0][1];
        console.log('Found JSON text with markers:', jsonText.substring(0, 100) + '...');
        
        // Парсим JSON
        const schema = JSON.parse(jsonText);
        console.log('Parsed schema with markers:', schema);
        
        // Удаляем JSON из текста
        const explanation = text.replace(/```json[\s\S]*?```/g, '')
          .trim();
        
        // Отправляем событие об обновлении схемы
        eventBus.emit(EVENTS.SCHEMA_UPDATE, { explanation, schema });
        
        return { explanation, schema };
      } catch (error) {
        console.error('Error parsing JSON from response with markers:', error);
      }
    }
  }
  
  // Стратегия 2: Ищем текст, который похож на большой JSON-объект
  try {
    // Ищем что-то, что выглядит как JSON объект
    const jsonPattern = /\{(?:[^{}]|(\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g;
    const matches = [...text.matchAll(jsonPattern)];
    
    // Берем самое длинное совпадение (предположительно самый большой JSON-объект)
    if (matches.length > 0) {
      const jsonTexts = matches.map(m => m[0]);
      const longestJsonText = jsonTexts.reduce((prev, current) => 
        (current.length > prev.length) ? current : prev
      );
      
      if (longestJsonText.length > 50) { // Минимальная длина для "настоящего" JSON
        console.log('Found longest JSON text without markers:', longestJsonText.substring(0, 100) + '...');
        const schema = JSON.parse(longestJsonText);
        
        // Удаляем этот JSON из текста
        const explanation = text.replace(longestJsonText, '').trim();
        
        // Отправляем событие об обновлении схемы
        eventBus.emit(EVENTS.SCHEMA_UPDATE, { explanation, schema });
        
        return { explanation, schema };
      }
    }
  } catch (error) {
    console.error('Error finding JSON without markers strategy 2:', error);
  }
  
  // Стратегия 3: Ищем от первой { до последней } в тексте
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
      const jsonText = text.substring(firstBrace, lastBrace + 1);
      if (jsonText.length > 50) { // Минимальная длина для "настоящего" JSON
        console.log('Found JSON text using strategy 3:', jsonText.substring(0, 100) + '...');
        const schema = JSON.parse(jsonText);
        
        // Создаем текст объяснения, удалив JSON
        const beforeJson = text.substring(0, firstBrace).trim();
        const afterJson = text.substring(lastBrace + 1).trim();
        const explanation = (beforeJson + ' ' + afterJson).trim();
        
        // Отправляем событие об обновлении схемы
        eventBus.emit(EVENTS.SCHEMA_UPDATE, { explanation, schema });
        
        return { explanation, schema };
      }
    }
  } catch (error) {
    console.error('Error finding JSON without markers strategy 3:', error);
  }
  
  console.log('No valid JSON found in response');
  return null;
} 