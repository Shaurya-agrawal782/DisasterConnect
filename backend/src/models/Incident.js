const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  note: {
    type: String,
    trim: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const incidentSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      index: true,
      immutable: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    type: {
      type: String,
      required: [true, 'Please select an incident type'],
      enum: ['fire', 'flood', 'medical', 'accident', 'crowd', 'rescue', 'other']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['reported', 'verified', 'assigned', 'in-progress', 'resolved', 'closed'],
      default: 'reported'
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Please provide location coordinates [longitude, latitude]']
      },
      address: {
        type: String,
        required: [true, 'Please provide a location address'],
        trim: true
      }
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedResponder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedResources: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    }],
    statusHistory: [statusHistorySchema],
    aiTriage: {
      type: {
        shortSummary: String,
        riskScore: Number,
        recommendedPriority: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical']
        },
        likelyRisks: {
          type: [String],
          default: undefined
        },
        immediateActions: {
          type: [String],
          default: undefined
        },
        responderChecklist: {
          type: [String],
          default: undefined
        },
        citizenSafetyNote: String,
        confidence: {
          type: String,
          enum: ['low', 'medium', 'high']
        },
        disclaimer: String,
        generatedAt: Date,
        provider: String
      },
      default: undefined
    }
  },
  {
    timestamps: true,
    collection: 'mern_incidents'
  }
);

// Indexes
incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ status: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ type: 1 });
incidentSchema.index({ reportedBy: 1 });
incidentSchema.index({ assignedResponder: 1 });
incidentSchema.index({ assignedResources: 1 });
incidentSchema.index({ createdAt: -1 });

// Pre-save hook: On new incident, add initial statusHistory entry
incidentSchema.pre('save', function () {
  if (this.isNew) {
    if (!this.statusHistory || this.statusHistory.length === 0) {
      this.statusHistory = [{
        status: this.status,
        note: 'Incident reported and created.'
      }];
    }
  }
});

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;
