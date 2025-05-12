class GameSessionManager {
  constructor() {
    if (typeof window !== 'undefined') {
      this.gameSession = JSON.parse(sessionStorage.getItem('gameSession')) || {};
    }
  }

  // Function to set data in the session
  set(key, value) {
    if (typeof window !== 'undefined') {
      this.gameSession[key] = value;
      sessionStorage.setItem('gameSession', JSON.stringify(this.gameSession));
    }
  }

  // Function to get data from the session
  get(key) {
    if (typeof window !== 'undefined') {
      return this.gameSession[key];
    }
    return null;
  }

  // Function to remove data from the session
  remove(key) {
    if (typeof window !== 'undefined') {
      delete this.gameSession[key];
      sessionStorage.setItem('gameSession', JSON.stringify(this.gameSession));
    }
  }

  // Function to clear all data from the session
  clear() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('gameSession');
      this.gameSession = {};
    }
  }
}

const gameSessionManager = new GameSessionManager();
export default gameSessionManager;
