const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxLength: [100, 'Project name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Project location is required'],
    trim: true,
    maxLength: [200, 'Location cannot exceed 200 characters']
  },
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  }],
  notes: {
    type: String,
    trim: true,
    maxLength: [1000, 'Notes cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'planning'
  },
  totalCost: {
    type: Number,
    default: 0,
    min: [0, 'Total cost cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for material count
projectSchema.virtual('materialCount').get(function() {
  return this.materials ? this.materials.length : 0;
});

// Method to calculate total cost
projectSchema.methods.calculateTotalCost = async function() {
  await this.populate('materials');
  const total = this.materials.reduce((sum, material) => {
    return sum + (material.totalPrice || 0);
  }, 0);
  this.totalCost = total;
  return total;
};

// Pre-save middleware to calculate total cost
projectSchema.pre('save', async function(next) {
  if (this.isModified('materials') || this.isNew) {
    await this.calculateTotalCost();
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);