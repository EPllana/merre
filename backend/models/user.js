import mongoose from "mongoose";

// Sub-schema për reviews
const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Skema kryesore e përdoruesit
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  surname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    default: null
  },

  role: {
    type: String,
    enum: ["admin", "user", "worker"],
    default: "user"
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  verificationToken: {
    type: String
  },

  // Review nga klientët për punëtorin
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },

  // Lokacioni i punëtorit
  location: {
    city: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },

  // Dokumentet e identifikimit (për worker-at)
  idDocumentUrl: { type: String },
  selfieUrl: { type: String },

  isVerifiedByAdmin: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
