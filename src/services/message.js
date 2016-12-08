import validator from 'validator';

import store from '~/store';
import Message from '~/models/Message';

/**
 * Given an existing userId and chatId, save a new message with the given string
 * content.
 */
export function createMessage(userId, chatId, content, contentType, contentTypeSpecifics) {
  const sanitizedContent = validator.trim(content);

  if (validator.isEmpty(content)) {
    throw 'Message cannot be empty.';
  }

  const newMessage = new Message();
  newMessage.owner = userId;
  newMessage.chat = chatId;
  newMessage.content = sanitizedContent;
  newMessage.contentType = contentType;
  newMessage.contentTypeSpecifics = contentTypeSpecifics;

  return newMessage.save();
}

/**
 * Emit a message to everyone in the room.
 * Emission will run in background.
 */
export function emitMessage(roomId, message) {
  const membersList = store.getState().room[roomId];
  if (membersList) {
    membersList.forEach((socket) => {
      setTimeout(() => socket.emit('ReceiveMessage', message), 0);
    });
  }
  return message;
}