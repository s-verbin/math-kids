class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Возвращаем функцию для отписки
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  once(event, callback) {
    const onceWrapper = (data) => {
      callback(data);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  clear(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Singleton instance
const eventBus = new EventBus();

export default eventBus;

// Event types для type safety
export const EVENTS = {
  // Animal events
  ANIMAL_FED: 'animal:fed',
  ANIMAL_PETTED: 'animal:petted',
  ANIMAL_PURCHASED: 'animal:purchased',
  ANIMAL_SOLD: 'animal:sold',
  
  // Resource events
  RESOURCE_PRODUCED: 'resource:produced',
  RESOURCE_COLLECTED: 'resource:collected',
  RESOURCE_READY: 'resource:ready',
  
  // Farm events
  ITEM_PURCHASED: 'item:purchased',
  ITEM_EQUIPPED: 'item:equipped',
  POOP_CREATED: 'poop:created',
  POOP_CLEANED: 'poop:cleaned',
  
  // Achievement events
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  COINS_EARNED: 'coins:earned',
  LEVEL_UP: 'level:up',
  
  // UI events
  NOTIFICATION_SHOW: 'notification:show',
  ANIMATION_TRIGGER: 'animation:trigger'
};
