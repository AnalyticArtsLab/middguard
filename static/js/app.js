import io from 'socket.io-client';

import AppView from './views/app-view';
import Graphs from './collections/graphs';

export var socket = io()

new AppView();
