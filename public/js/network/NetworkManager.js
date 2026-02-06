class NetworkManager {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.roomCode = null;
    this.playerNumber = 0;
    this.callbacks = {};
  }

  connect() {
    this.socket = io();
    this.connected = true;

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
    });

    // Register all event handlers
    const events = [
      'room_created', 'room_joined', 'opponent_joined',
      'opponent_selected', 'both_ready', 'game_start',
      'opponent_input', 'opponent_disconnected', 'opponent_reconnected',
      'room_error', 'rematch_requested', 'rematch_accepted'
    ];

    events.forEach(event => {
      this.socket.on(event, (data) => {
        if (this.callbacks[event]) {
          this.callbacks[event](data);
        }
      });
    });
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  off(event) {
    delete this.callbacks[event];
  }

  createRoom() {
    this.socket.emit('create_room');
  }

  joinRoom(code) {
    this.socket.emit('join_room', { code: code.toUpperCase() });
  }

  selectCharacter(character) {
    this.socket.emit('select_character', { character });
  }

  ready() {
    this.socket.emit('ready');
  }

  sendInput(frame, inputs) {
    this.socket.emit('game_input', { frame, inputs });
  }

  requestRematch() {
    this.socket.emit('rematch_request');
  }

  acceptRematch() {
    this.socket.emit('rematch_accept');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

// Global singleton
const networkManager = new NetworkManager();
