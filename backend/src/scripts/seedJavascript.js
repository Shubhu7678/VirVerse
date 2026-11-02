import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Task from '../models/Task.js';
import { JAVASCRIPT_QUESTIONS } from '../data/javascriptQuestions.js';

await connectDB();
const operations = JAVASCRIPT_QUESTIONS.map((question) => ({
  updateOne: {
    filter: { slug: question.slug },
    update: { $set: { ...question, language: 'javascript' } },
    upsert: true,
  },
}));
const result = await Task.bulkWrite(operations);
console.log(`Seeded JavaScript questions: ${result.upsertedCount} created, ${result.modifiedCount} updated.`);
await mongoose.disconnect();
