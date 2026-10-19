import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Membership from '../models/OrganizationMembership.js';
import AuditLog from '../models/AuditLog.js';
import Subscription from '../models/OrganizationSubscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Invitation from '../models/OrganizationInvitation.js';
import ProgrammingLanguage from '../models/ProgrammingLanguage.js';
import { seedPlatformData } from '../services/bootstrapData.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import ClassSection from '../models/ClassSection.js';
import ClassEnrollment from '../models/ClassEnrollment.js';
import TeacherAssignment from '../models/TeacherAssignment.js';
import Assignment from '../models/Assignment.js';
import AssignmentTask from '../models/AssignmentTask.js';

// Additive and safe to rerun: it only builds the new collections' indexes and
// normalizes users' platformRole to null where missing. No data is dropped or
// rewritten; existing users stay standalone learners (no membership).
await connectDB();
for (const model of [
  Organization,
  Membership,
  AuditLog,
  Subscription,
  SubscriptionPlan,
  Invitation,
  ProgrammingLanguage,
  Department,
  Course,
  ClassSection,
  ClassEnrollment,
  TeacherAssignment,
  Assignment,
  AssignmentTask,
]) {
  await model.createIndexes();
  console.log(`Indexes ready: ${model.modelName}`);
}
const res = await User.updateMany({ platformRole: { $exists: false } }, { $set: { platformRole: null } });
await seedPlatformData();
console.log('Default plans and languages ensured');
console.log(`Users normalized: ${res.modifiedCount}`);
await mongoose.disconnect();
