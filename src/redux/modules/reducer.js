import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as form } from 'redux-form';

import auth from './auth';
import room from './room';
import chat from './chat';
import message from './message';

export default combineReducers({
  routing: routerReducer,
  auth,
  room,
  chat,
  message,
  form
});