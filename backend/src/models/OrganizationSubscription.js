import mongoose from 'mongoose';

export const SUBSCRIPTION_STATUSES = ['trial', 'active', 'expired', 'cancelled'];

const subscriptionSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, unique: true },
    plan: { type: String, required: true }, // SubscriptionPlan.key
    status: { type: String, enum: SUBSCRIPTION_STATUSES, required: true },
    startsAt: { type: Date, default: Date.now },
    trialEndsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    studentSeats: { type: Number, required: true, min: 0 },
    teacherSeats: { type: Number, required: true, min: 0 },
    features: [{ type: String }],
    // Reserved for a future payment provider integration.
    provider: { type: String, default: null },
    providerRef: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('OrganizationSubscription', subscriptionSchema);
