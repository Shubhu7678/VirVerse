import SubscriptionPlan from '../models/SubscriptionPlan.js';
import ProgrammingLanguage from '../models/ProgrammingLanguage.js';

export const DEFAULT_PLANS = [
  {
    key: 'trial', name: 'Trial', durationDays: 30, studentSeats: 50, teacherSeats: 5, isTrial: true,
    features: ['c-programming', 'basic-assignments', 'basic-analytics'],
  },
  {
    key: 'standard', name: 'Standard', durationDays: null, studentSeats: 500, teacherSeats: 25,
    features: ['c-programming', 'assignments', 'analytics', 'exports', 'teacher-dashboard'],
  },
  {
    key: 'premium', name: 'Premium', durationDays: null, studentSeats: 5000, teacherSeats: 250,
    features: ['c-programming', 'assignments', 'analytics', 'advanced-analytics', 'exports', 'teacher-dashboard', 'branding', 'multi-language'],
  },
]

export const DEFAULT_LANGUAGES = [
  {
    key: 'c', name: 'C', monacoId: 'c', extension: 'c', runtime: 'c', enabled: true,
    starterCode: '#include <stdio.h>\n\nint main(void) {\n    return 0;\n}\n',
  },
]

// Insert-only: admin edits to existing plans/languages are never overwritten.
export async function seedPlatformData() {
  for (const p of DEFAULT_PLANS) {
    await SubscriptionPlan.updateOne({ key: p.key }, { $setOnInsert: p }, { upsert: true });
  }
  for (const l of DEFAULT_LANGUAGES) {
    await ProgrammingLanguage.updateOne({ key: l.key }, { $setOnInsert: l }, { upsert: true });
  }
}
