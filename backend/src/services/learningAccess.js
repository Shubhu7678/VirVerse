import Membership from '../models/OrganizationMembership.js';
import Organization from '../models/Organization.js';
import OrganizationSubscription from '../models/OrganizationSubscription.js';

export async function hasOrganizationLearningAccess(user, organizationId) {
  if (user.isDemo) return false;
  if (user.platformRole === 'super_admin') return true;
  if (!organizationId) return false;
  const membership = await Membership.findOne({
    user: user._id,
    organization: organizationId,
    status: 'active',
  }).lean();
  if (!membership) return false;
  const organization = await Organization.findOne({ _id: organizationId, status: 'active' }).select('_id').lean();
  if (!organization) return false;

  const subscription = await OrganizationSubscription.findOne({
    organization: organizationId,
    status: { $in: ['active', 'trial'] },
    features: 'c-programming',
  }).lean();
  if (!subscription) return false;
  const now = new Date();
  if (subscription.status === 'trial') return subscription.trialEndsAt > now;
  return !subscription.endsAt || subscription.endsAt > now;
}

export async function canAccessTask(user, task, organizationId) {
  if (user.isDemo) {
    return task.category === 'basics' && task.questionOrder >= 1 && task.questionOrder <= 10;
  }
  if (task.category === 'basics') return true;
  return hasOrganizationLearningAccess(user, organizationId);
}
