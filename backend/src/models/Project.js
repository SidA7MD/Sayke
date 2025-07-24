// backend/src/models/Project.js - Final Version with Budget & Dates Support
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
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'planning'
  },
  // ✅ Budget field - estimated budget for the project
  budget: {
    type: Number,
    default: 0,
    min: [0, 'Budget cannot be negative'],
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'Budget must be a positive number'
    }
  },
  // ✅ Start date field
  startDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // If both startDate and endDate exist, startDate should be before endDate
        if (value && this.endDate) {
          return value < this.endDate;
        }
        return true;
      },
      message: 'Start date must be before end date'
    }
  },
  // ✅ End date field
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // If both startDate and endDate exist, endDate should be after startDate
        if (value && this.startDate) {
          return value > this.startDate;
        }
        return true;
      },
      message: 'End date must be after start date'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [1000, 'Notes cannot exceed 1000 characters']
  },
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  }],
  // Total cost calculated from materials
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

// ✅ Virtual for project duration in days
projectSchema.virtual('durationInDays').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// ✅ Virtual for budget vs actual cost comparison
projectSchema.virtual('budgetStatus').get(function() {
  if (this.budget && this.budget > 0) {
    const difference = this.totalCost - this.budget;
    const percentage = (this.totalCost / this.budget) * 100;
    
    return {
      difference: difference,
      percentage: percentage,
      status: difference > 0 ? 'over-budget' : difference < 0 ? 'under-budget' : 'on-budget',
      isOverBudget: difference > 0,
      isUnderBudget: difference < 0,
      isOnBudget: difference === 0
    };
  }
  return null;
});

// ✅ Virtual for project progress (if dates are set)
projectSchema.virtual('progress').get(function() {
  if (this.startDate && this.endDate) {
    const now = new Date();
    const start = this.startDate;
    const end = this.endDate;
    
    if (now < start) {
      return { percentage: 0, status: 'not-started' };
    } else if (now > end) {
      return { percentage: 100, status: 'overdue' };
    } else {
      const total = end - start;
      const elapsed = now - start;
      const percentage = Math.round((elapsed / total) * 100);
      return { percentage, status: 'in-progress' };
    }
  }
  return null;
});

// Method to calculate total cost from materials
projectSchema.methods.calculateTotalCost = async function() {
  await this.populate('materials');
  const total = this.materials.reduce((sum, material) => {
    return sum + ((material.quantity || 0) * (material.pricePerUnit || 0));
  }, 0);
  this.totalCost = total;
  return total;
};

// ✅ Method to check if project is on schedule
projectSchema.methods.isOnSchedule = function() {
  if (!this.startDate || !this.endDate) {
    return null; // Cannot determine without dates
  }
  
  const now = new Date();
  const start = this.startDate;
  const end = this.endDate;
  
  if (now < start) {
    return { status: 'not-started', message: 'Project has not started yet' };
  } else if (now > end && this.status !== 'completed') {
    return { status: 'delayed', message: 'Project is past its end date' };
  } else if (now <= end) {
    return { status: 'on-schedule', message: 'Project is on schedule' };
  } else {
    return { status: 'completed', message: 'Project is completed' };
  }
};

// ✅ Method to get budget utilization
projectSchema.methods.getBudgetUtilization = function() {
  if (!this.budget || this.budget <= 0) {
    return null;
  }
  
  const utilization = (this.totalCost / this.budget) * 100;
  const remaining = this.budget - this.totalCost;
  
  return {
    budgetAmount: this.budget,
    spentAmount: this.totalCost,
    remainingAmount: remaining,
    utilizationPercentage: utilization,
    isOverBudget: utilization > 100,
    isNearBudget: utilization > 90 && utilization <= 100,
    isUnderBudget: utilization < 90
  };
};

// Pre-save middleware to calculate total cost
projectSchema.pre('save', async function(next) {
  // Only recalculate if materials array is modified or it's a new document
  if (this.isModified('materials') || this.isNew) {
    try {
      await this.calculateTotalCost();
    } catch (error) {
      console.error('Error calculating total cost:', error);
      // Don't block save if calculation fails
    }
  }
  next();
});

// ✅ Pre-save validation for dates
projectSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    if (this.startDate >= this.endDate) {
      const error = new Error('Start date must be before end date');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Index for better query performance
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ startDate: 1, endDate: 1 });
projectSchema.index({ budget: 1 });

// ✅ Static method to get projects by budget range
projectSchema.statics.findByBudgetRange = function(minBudget, maxBudget) {
  return this.find({
    budget: {
      $gte: minBudget || 0,
      $lte: maxBudget || Number.MAX_SAFE_INTEGER
    }
  });
};

// ✅ Static method to get projects by date range
projectSchema.statics.findByDateRange = function(startDate, endDate) {
  const query = {};
  
  if (startDate) {
    query.startDate = { $gte: new Date(startDate) };
  }
  
  if (endDate) {
    query.endDate = { $lte: new Date(endDate) };
  }
  
  return this.find(query);
};

// ✅ Static method to get overdue projects
projectSchema.statics.findOverdueProjects = function() {
  const now = new Date();
  return this.find({
    endDate: { $lt: now },
    status: { $ne: 'completed' }
  });
};

// ✅ Static method to get projects over budget
projectSchema.statics.findOverBudgetProjects = function() {
  return this.find({
    $expr: { $gt: ['$totalCost', '$budget'] },
    budget: { $gt: 0 }
  });
};

console.log('🚀 Project model loaded with enhanced budget and dates support');

module.exports = mongoose.model('Project', projectSchema);