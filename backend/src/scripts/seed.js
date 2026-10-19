import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { CATEGORIES } from '../config/categories.js';

const BUILT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/questions/built');
const PER_TOPIC = 20;

function loadBuilt() {
  const all = [];
  for (const topic of CATEGORIES) {
    const file = `${String(topic.order).padStart(2, '0')}-${topic.slug}.json`;
    const full = path.join(BUILT_DIR, file);
    if (!fs.existsSync(full)) throw new Error(`Missing ${file}. Run "npm run questions:build" first.`);
    const questions = JSON.parse(fs.readFileSync(full, 'utf8'));
    if (questions.length !== PER_TOPIC) throw new Error(`${file}: expected ${PER_TOPIC} questions, found ${questions.length}`);
    all.push(...questions);
  }
  const slugs = new Set(all.map((q) => q.slug));
  if (slugs.size !== all.length) throw new Error('Duplicate slugs across topics');
  return all;
}

// Upserts by slug: re-running never duplicates, never deletes, and keeps each task's _id,
// so existing submissions and completion records stay linked.
async function seed() {
  const questions = loadBuilt();
  await mongoose.connect(process.env.MONGO_URI);

  const ops = questions.map((q) => ({
    updateOne: {
      filter: { slug: q.slug },
      update: { $set: { ...q, order: q.topicOrder * 100 + q.questionOrder } },
      upsert: true,
    },
  }));

  const result = await Task.bulkWrite(ops);
  const total = await Task.countDocuments();
  console.log(`Seeded ${questions.length} questions: ${result.upsertedCount} created, ${result.modifiedCount} updated (${total} tasks in database)`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
