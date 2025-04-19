// События для обмена данными между компонентами
export const eventBus = {
  listeners: new Map<string, Function[]>(),
  
  /**
   * Подписка на событие
   * @param event Название события
   * @param callback Функция-обработчик
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  },
  
  /**
   * Отписка от события
   * @param event Название события
   * @param callback Функция-обработчик для отписки
   */
  off(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      const handlers = this.listeners.get(event) || [];
      const index = handlers.indexOf(callback);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  },
  
  /**
   * Вызов события
   * @param event Название события
   * @param data Данные, передаваемые обработчикам
   */
  emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event handler:`, error);
        }
      });
    }
  }
}; 