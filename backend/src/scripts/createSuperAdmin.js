import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

// Usage: SUPERADMIN_EMAIL=you@example.com npm run create-superadmin
// The account must already exist (sign up normally first). This is the only
// way to grant the super admin role.
const email = (process.env.SUPERADMIN_EMAIL || process.argv[2] || '').toLowerCase().trim();
if (!email) {
  console.error('Provide SUPERADMIN_EMAIL or pass the email as an argument.');
  process.exit(1);
}

await connectDB();
const user = await User.findOneAndUpdate({ email }, { platformRole: 'super_admin' });
console.log(user ? `Granted super_admin to ${email}` : `No user found with email ${email}`);
await mongoose.disconnect();
process.exit(user ? 0 : 1);
