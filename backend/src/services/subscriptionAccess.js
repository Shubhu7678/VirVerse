import OrganizationSubscription from '../models/OrganizationSubscription.js';

export async function hasFeatureAccess(organizationId, features) {
  const subscription = await OrganizationSubscription.findOne({ organization: organizationId }).lean();
  if (!subscription) return false;

  const now = new Date();
  const current = subscription.status === 'trial'
    ? subscription.trialEndsAt && subscription.trialEndsAt > now
    : subscription.status === 'active' && (!subscription.endsAt || subscription.endsAt > now);
  if (!current) return false;

  const enabled = subscription.features ?? [];
  return features.some((feature) => enabled.includes(feature));
}
