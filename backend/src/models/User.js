import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    // Set only by the create-superadmin script; never by any API.
    platformRole: { type: String, enum: ['super_admin', null], default: null },
    // Languages the admin has fully unlocked for this student. The first 10 questions of every language are always free.
    unlockedLanguages: { type: [{ type: String, enum: ['c', 'javascript', 'python'] }], default: [] },
    // Disabled accounts cannot sign in. Data is kept, so an admin can enable the account again.
    disabled: { type: Boolean, default: false },
    passwordResetHash: { type: String, default: null, select: false },
    passwordResetExpiresAt: { type: Date, default: null, select: false },
    // Sessions issued before this moment stop working (set when the password is reset).
    passwordChangedAt: { type: Date, default: null },
    // Refreshed at most once a minute while the student is using the app.
    lastActiveAt: { type: Date, default: null },
    isDemo: { type: Boolean, default: false },
    demoExpiresAt: { type: Date, default: null },
    points: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    completedTaskIds: { type: [mongoose.Schema.Types.ObjectId], default: [], select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    platformRole: this.platformRole ?? null,
    isAdmin: this.platformRole === 'super_admin',
    unlockedLanguages: this.unlockedLanguages ?? [],
    points: this.points ?? 0,
    level: this.level ?? 1,
    isDemo: this.isDemo,
    demoExpiresAt: this.isDemo ? this.demoExpiresAt : null,
    createdAt: this.createdAt,
  };
};

userSchema.index(
  { demoExpiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { isDemo: true } },
);

export default mongoose.model('User', userSchema);
