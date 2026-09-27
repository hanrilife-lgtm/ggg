const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// ===== ТЕМЫ =====
const THEMES = {
  cartoons: {
    name: 'Мультфильмы',
    cards: [
      { id: 'c1',  name: 'Микки Маус',   img: '1.jpg' },
      { id: 'c2',  name: 'Том и Джерри', img: '2.jpg' },
      { id: 'c3',  name: 'Лунтик',       img: '3.jpg' },
      { id: 'c4',  name: 'Спанч Боб',    img: '4.jpg' },
      { id: 'c5',  name: 'Николя',       img: '5.jpg' },
      { id: 'c6',  name: 'Шрек',         img: '6.jpg' },
      { id: 'c7',  name: 'Простоквашено',img: '10.jpg' },
      { id: 'c8',  name: 'Симба',        img: '7.jpg' },
      { id: 'c9',  name: 'Барт Симпсон', img: '8.jpg' },
      { id: 'c10', name: 'Карлосон',     img: '9.jpg' },
    ],
  },
  artists: {
    name: 'Исполнители',
    cards: [
      { id: 'a1',  name: 'Майкл Джексон', img: 'https://placehold.co/200x200?text=MJ' },
      { id: 'a2',  name: 'Мадонна',       img: 'https://placehold.co/200x200?text=Madonna' },
      { id: 'a3',  name: 'Эминем',        img: 'https://placehold.co/200x200?text=Eminem' },
      { id: 'a4',  name: 'Билли Айлиш',   img: 'https://placehold.co/200x200?text=Billie' },
      { id: 'a5',  name: 'Тейлор Свифт',  img: 'https://placehold.co/200x200?text=Taylor' },
      { id: 'a6',  name: 'Дрейк',         img: 'https://placehold.co/200x200?text=Drake' },
      { id: 'a7',  name: 'Rihanna',       img: 'https://placehold.co/200x200?text=Rihanna' },
      { id: 'a8',  name: 'Beyoncé',       img: 'https://placehold.co/200x200?text=Beyonce' },
      { id: 'a9',  name: 'The Weeknd',    img: 'https://placehold.co/200x200?text=Weeknd' },
      { id: 'a10', name: 'Ариана Гранде', img: 'https://placehold.co/200x200?text=Ariana' },
    ],
  },
  games: {
    name: 'Игры',
    cards: [
      { id: 'g1',  name: 'Minecraft',   img: 'https://placehold.co/200x200?text=Minecraft' },
      { id: 'g2',  name: 'Fortnite',    img: 'https://placehold.co/200x200?text=Fortnite' },
      { id: 'g3',  name: 'GTA V',       img: 'https://placehold.co/200x200?text=GTA5' },
      { id: 'g4',  name: 'CS2',         img: 'https://placehold.co/200x200?text=CS2' },
      { id: 'g5',  name: 'Dota 2',      img: 'https://placehold.co/200x200?text=Dota2' },
      { id: 'g6',  name: 'Among Us',    img: 'https://placehold.co/200x200?text=AmongUs' },
      { id: 'g7',  name: 'Roblox',      img: 'https://placehold.co/200x200?text=Roblox' },
      { id: 'g8',  name: 'Zelda',       img: 'https://placehold.co/200x200?text=Zelda' },
      { id: 'g9',  name: 'Mario',       img: 'https://placehold.co/200x200?text=Mario' },
      { id: 'g10', name: 'Cyberpunk',   img: 'https://placehold.co/200x200?text=Cyberpunk' },
    ],
  },
  movies: {
    name: 'Фильмы',
    cards: [
      { id: 'm1',  name: 'Гарри Поттер', img: 'https://placehold.co/200x200?text=Harry' },
      { id: 'm2',  name: 'Джокер',       img: 'https://placehold.co/200x200?text=Joker' },
      { id: 'm3',  name: 'Мстители',     img: 'https://placehold.co/200x200?text=Avengers' },
      { id: 'm4',  name: 'Титаник',      img: 'https://placehold.co/200x200?text=Titanic' },
      { id: 'm5',  name: 'Матрица',      img: 'https://placehold.co/200x200?text=Matrix' },
      { id: 'm6',  name: 'Аватар',       img: 'https://placehold.co/200x200?text=Avatar' },
      { id: 'm7',  name: 'Форрест Гамп', img: 'https://placehold.co/200x200?text=Gump' },
      { id: 'm8',  name: 'Леон',         img: 'https://placehold.co/200x200?text=Leon' },
      { id: 'm9',  name: 'Интерстеллар', img: 'https://placehold.co/200x200?text=Interstellar' },
      { id: 'm10', name: 'Пираты',       img: 'https://placehold.co/200x200?text=Pirates' },
    ],
  },
};

const rooms = {};

function makeRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

io.on('connection', (socket) => {
  console.log('connected', socket.id);

  socket.on('createRoom', ({ playerName }, cb) => {
    let code;
    do { code = makeRoomCode(); } while (rooms[code]);

    rooms[code] = {
      code,
      hostId: socket.id,
      players: [{ id: socket.id, name: playerName, cardId: null }],
      themeKey: null,
      started: false,
      winnerId: null,
    };
    socket.join(code);
    cb({ ok: true, code });
    io.to(code).emit('roomUpdate', publicRoom(rooms[code]));
  });

  socket.on('joinRoom', ({ code, playerName }, cb) => {
    const room = rooms[code];
    if (!room) return cb({ ok: false, error: 'Комната не найдена' });
    if (room.started) return cb({ ok: false, error: 'Игра уже началась' });
    if (room.players.length >= 8) return cb({ ok: false, error: 'Комната переполнена' });

    room.players.push({ id: socket.id, name: playerName, cardId: null });
    socket.join(code);
    cb({ ok: true, code });
    io.to(code).emit('roomUpdate', publicRoom(room));
  });

  socket.on('selectTheme', ({ code, themeKey }) => {
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return;
    if (!THEMES[themeKey]) return;
    room.themeKey = themeKey;
    io.to(code).emit('roomUpdate', publicRoom(room));
  });

  socket.on('startGame', ({ code }, cb) => {
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return cb?.({ ok: false });
    if (!room.themeKey) return cb?.({ ok: false, error: 'Сначала выберите тему' });
    if (room.players.length < 2) return cb?.({ ok: false, error: 'Нужно минимум 2 игрока' });

    const theme = THEMES[room.themeKey];
    const shuffledCards = shuffle(theme.cards);
    room.players.forEach((p, i) => {
      p.cardId = shuffledCards[i % shuffledCards.length].id;
    });
    room.started = true;

    room.players.forEach((p) => {
      io.to(p.id).emit('gameStarted', {
        theme,
        myCardId: p.cardId,
        players: room.players.map(x => ({ id: x.id, name: x.name })),
      });
    });
    io.to(code).emit('roomUpdate', publicRoom(room));
    cb?.({ ok: true });
  });

  socket.on('claimWin', ({ code, guessedPlayerId }) => {
    const room = rooms[code];
    if (!room) return;
    const target = room.players.find(p => p.id === guessedPlayerId);
    if (!target) return;

    room.winnerId = socket.id;
    const winner = room.players.find(p => p.id === socket.id);

    io.to(code).emit('gameOver', {
      winnerName: winner.name,
      targetName: target.name,
      targetCardId: target.cardId,
      theme: THEMES[room.themeKey],
    });
  });

  socket.on('restart', ({ code }) => {
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return;
    room.started = false;
    room.winnerId = null;
    room.players.forEach(p => (p.cardId = null));
    io.to(code).emit('roomUpdate', publicRoom(room));
    io.to(code).emit('backToLobby');
  });

  socket.on('disconnect', () => {
    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        if (room.players.length === 0) {
          delete rooms[code];
        } else {
          if (room.hostId === socket.id) room.hostId = room.players[0].id;
          io.to(code).emit('roomUpdate', publicRoom(room));
        }
      }
    }
  });
});

function publicRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    players: room.players.map(p => ({ id: p.id, name: p.name })),
    themeKey: room.themeKey,
    started: room.started,
    themes: Object.fromEntries(
      Object.entries(THEMES).map(([k, v]) => [k, v.name])
    ),
  };
}

server.listen(3000, () => console.log('http://localhost:3000'));