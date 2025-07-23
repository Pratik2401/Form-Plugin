const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = 'smartformbuilder';

let db, formsCollection, submissionsCollection;

async function connectDB() {
  const client = await MongoClient.connect(MONGO_URL);
  db = client.db(DB_NAME);
  formsCollection = db.collection('forms');
  submissionsCollection = db.collection('submissions');
  console.log('Connected to MongoDB');
}

module.exports = {
  connectDB,
  getDB: () => db,
  getFormsCollection: () => formsCollection,
  getSubmissionsCollection: () => submissionsCollection,
};
