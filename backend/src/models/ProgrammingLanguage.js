import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    monacoId: { type: String, required: true },
    extension: { type: String, required: true },
    starterCode: { type: String, default: '' },
    runtime: { type: String, required: true }, // executor key
    enabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('ProgrammingLanguage', languageSchema);
