import { Schema, model } from "mongoose";

const meetingSchema = new Schema({
  name_id: { type: String }, // user_id ya username
  Meeting: { type: String, required: true }, // meeting code
  meeting_code: { type: String }, // alternative field name
  date: { type: Date, default: Date.now, required: true }
}, {
  timestamps: true // createdAt aur updatedAt automatically add ho jayega
});

const Meeting = model("Meeting", meetingSchema);

export { Meeting };