import { configureApp } from './configureApp';

const { database } = configureApp();
module.exports = database;
