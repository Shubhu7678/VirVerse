import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Task from '../models/Task.js';
import { PYTHON_QUESTIONS } from '../data/pythonQuestions.js';

await connectDB();
const operations = PYTHON_QUESTIONS.map((question) => ({
  updateOne: {
    filter: { slug: question.slug },
    update: { $set: question },
    upsert: true,
  },
}));
const result = await Task.bulkWrite(operations);
console.log(`Seeded Python questions: ${result.upsertedCount} created, ${result.modifiedCount} updated.`);
await mongoose.disconnect();
