import mongoose from 'mongoose';

// Configurable product plan. No prices: billing is attached later via a provider.
const planSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    durationDays: { type: Number, default: null }, // null = no fixed term
    studentSeats: { type: Number, required: true },
    teacherSeats: { type: Number, required: true },
    features: [{ type: String }],
    isTrial: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('SubscriptionPlan', planSchema);
