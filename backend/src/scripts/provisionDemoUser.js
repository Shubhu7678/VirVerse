import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../config/demo.js';

async function provisionDemoUser() {
  await mongoose.connect(process.env.MONGO_URI);
  let user = await User.findOne({ email: DEMO_EMAIL }).select('+password +isDemo');
  if (user && !user.isDemo) {
    throw new Error('DEMO_EMAIL belongs to a non-demo account; choose a dedicated email address.');
  }
  if (!user) {
    user = new User({ name: 'VirVerse Demo', email: DEMO_EMAIL, isDemo: true, password: DEMO_PASSWORD });
  } else {
    user.password = DEMO_PASSWORD;
  }

  await user.save();
  console.log(`Demo account ready: ${DEMO_EMAIL} (first 10 C Basics questions only)`);
}

provisionDemoUser()
  .catch((error) => {
    console.error('Demo account provisioning failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
