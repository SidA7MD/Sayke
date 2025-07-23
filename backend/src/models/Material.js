const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true,
    maxLength: [100, 'Material name cannot exceed 100 characters']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['sqm', 'kg', 'unit', 'm3', 'ton', 'liter', 'meter', 'piece'],
    lowercase: true
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price per unit cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  totalPrice: {
    type: Number,
    min: [0, 'Total price cannot be negative']
  },
  supplier: {
    type: String,
    trim: true,
    maxLength: [100, 'Supplier name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['construction', 'electrical', 'plumbing', 'finishing', 'other'],
    default: 'construction'
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate total price
materialSchema.pre('save', function(next) {
  this.totalPrice = this.pricePerUnit * this.quantity;
  next();
});

// Index for faster queries
materialSchema.index({ projectId: 1 });
materialSchema.index({ category: 1 });

module.exports = mongoose.model('Material', materialSchema);