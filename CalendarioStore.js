// CalendarioStore.js - A simple global store without context

// Create a simple store object
const CalendarioStore = {
    // The actual data
    data: {},
    
    // Listeners to notify when data changes
    listeners: [],
    
    // Set data and notify listeners
    setData(newData) {
      // Make sure we're not trying to parse a string that's already an object
      if (typeof newData === 'string') {
        try {
          this.data = JSON.parse(newData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          this.data = {};
        }
      } else {
        this.data = newData;
      } 
      
      this.notifyListeners();
    },
    
    // Get the current data
    getData() {
      return this.data;
    },
    
    // Add a listener (function to call when data changes)
    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        // Return unsubscribe function
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    },
    
    // Notify all listeners
    notifyListeners() {
      this.listeners.forEach(listener => listener(this.data));
    }
  };
  
  export default CalendarioStore;
