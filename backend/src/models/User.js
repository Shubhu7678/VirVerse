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
    isDemo: { type: Boolean, default: false },
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
    points: this.points ?? 0,
    level: this.level ?? 1,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
