import { chain } from '~/helpers/promise';
import { isAuthenticated } from '~/services/auth';
import { findUsers, findUser } from '~/services/user';

// Current logged in user.
export const whoami = (currentUser) => {
  return chain
    .then(() => isAuthenticated(currentUser))
    .then(() => findUser(currentUser._id));
};

// Returns all users.
export const users = () => {
  return chain
    .then(() => findUsers());
};

// Returns the user that matches userId.
export const find = (userId) => {
  return chain
    .then(() => findUser(userId));
};