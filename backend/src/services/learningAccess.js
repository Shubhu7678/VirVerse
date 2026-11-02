import Membership from '../models/OrganizationMembership.js';
import Organization from '../models/Organization.js';
import OrganizationSubscription from '../models/OrganizationSubscription.js';

export async function hasOrganizationLearningAccess(user, organizationId) {
  return hasLanguageLearningAccess(user, organizationId, 'c');
}

export async function hasLanguageLearningAccess(user, organizationId, language) {
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
    features: language === 'c' ? 'c-programming' : 'multi-language',
  }).lean();
  if (!subscription) return false;
  const now = new Date();
  if (subscription.status === 'trial') return subscription.trialEndsAt > now;
  return !subscription.endsAt || subscription.endsAt > now;
}

export async function canAccessTask(user, task, organizationId) {
  if (user.isDemo) {
    const language = task.language ?? 'c';
    const firstCategory = language === 'javascript'
      ? 'js-basics'
      : language === 'python' ? 'python-basics' : 'basics';
    return task.category === firstCategory && task.questionOrder >= 1 && task.questionOrder <= 10;
  }
  const firstCategory = task.language === 'javascript'
    ? 'js-basics'
    : task.language === 'python' ? 'python-basics' : 'basics';
  if (task.category === firstCategory) return true;
  return hasLanguageLearningAccess(user, organizationId, task.language ?? 'c');
}
