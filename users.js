const { trimStr } = require("./utils");
const pool = require('./database');

let users = [];

const findUser = (user) => {
  if (user && user.name) { // Проверка на undefined и на наличие свойства name
    const userName = trimStr(user.name);
    const userRoom = trimStr(user.room);

    return users.find(
      (u) => trimStr(u.name) === userName && trimStr(u.room) === userRoom
    );
  } else {
    return null;
  }
};


const addUser = (user) => {
  const trimmedUser = {
    name: trimStr(user.name),
    room: trimStr(user.room),
    
  };
  const isExist = findUser(trimmedUser);

  if (!isExist) {
    trimmedUser.isTyping = false; 
    users.push(trimmedUser); 
  }

  const currentUser = isExist || trimmedUser;

  return { isExist: !!isExist, user: currentUser };
};

const getRoomUsers = (room) => users.filter((u) => u.room === room);

const removeUser = (user) => {
  const userName = trimStr(user.name);
  const userRoom = trimStr(user.room);

  const index = users.findIndex(
    ({ room, name }) =>
      room === userRoom && trimStr(name) === userName
  );

  if (index !== -1) {
    users.splice(index, 1);
  }

  return findUser(user); // Возвращаем найденного пользователя
};

const saveMessage = async (room, sender, message) => {
  try {
    const query = {
      text: 'INSERT INTO chat_messages (room, sender, message) VALUES ($1, $2, $3)',
      values: [room, sender, message],
    };
    await pool.query(query);
  } catch (error) {
    console.error('Ошибка при записи сообщения в базу данных:', error);
  }
};


const getRoomMessages = async (room) => {
  try {
    const query = {
      text: 'SELECT * FROM chat_messages WHERE room = $1 ORDER BY timestamp ASC',
      values: [room],
    };
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Ошибка при получении сообщений из базы данных:', error);
  }
};



const updateUserTypingStatus = (user, isTyping) => {
  const updatedUser = { ...user, isTyping };
  return updatedUser;
};

module.exports = { addUser, findUser, getRoomUsers, removeUser, updateUserTypingStatus, saveMessage, getRoomMessages };