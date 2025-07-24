const express = require('express');
const { body, param, validationResult } = require('express-validator');
const materialController = require('../controllers/material.controller');

const router = express.Router();

// Enhanced validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('❌ Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Enhanced validation rules with better error messages
const materialValidation = [
  body('projectId')
    .isMongoId()
    .withMessage('Valid project ID is required')
    .bail(), // Stop validation chain if this fails
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Material name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Material name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,()]+$/)
    .withMessage('Material name contains invalid characters'),
  
  body('unit')
    .isIn(['sqm', 'kg', 'unit', 'm3', 'ton', 'liter', 'meter', 'piece', 'box', 'roll', 'bag'])
    .withMessage('Unit must be one of: sqm, kg, unit, m3, ton, liter, meter, piece, box, roll, bag'),
  
  body('pricePerUnit')
    .isFloat({ min: 0 })
    .withMessage('Price per unit must be a positive number')
    .custom(value => {
      if (value > 1000000) {
        throw new Error('Price per unit seems unusually high (max: 1,000,000)');
      }
      return true;
    }),
  
  body('quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0')
    .custom(value => {
      if (value > 100000) {
        throw new Error('Quantity seems unusually high (max: 100,000)');
      }
      return true;
    }),
  
  body('supplier')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Supplier name cannot exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,()&]*$/)
    .withMessage('Supplier name contains invalid characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('category')
    .optional()
    .isIn(['construction', 'electrical', 'plumbing', 'finishing', 'tools', 'safety', 'other'])
    .withMessage('Category must be one of: construction, electrical, plumbing, finishing, tools, safety, other'),
  
  // Custom validation to calculate and validate totalPrice
  body().custom((value, { req }) => {
    const { pricePerUnit, quantity } = req.body;
    if (pricePerUnit && quantity) {
      const calculatedTotal = parseFloat(pricePerUnit) * parseFloat(quantity);
      req.body.totalPrice = Math.round(calculatedTotal * 100) / 100; // Round to 2 decimal places
      
      if (calculatedTotal > 10000000) {
        throw new Error('Total cost seems unusually high (max: 10,000,000)');
      }
    }
    return true;
  })
];

// Project ID validation for route parameters
const projectIdValidation = [
  param('projectId')
    .isMongoId()
    .withMessage('Valid project ID is required')
];

// Material ID validation for route parameters
const materialIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid material ID is required')
];

// Enhanced route handlers with better error handling and logging
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ========== CORE CRUD ROUTES ==========

// Get materials by project
router.get('/project/:projectId', 
  projectIdValidation, 
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('📋 Getting materials for project:', req.params.projectId);
      await materialController.getMaterialsByProject(req, res, next);
    } catch (error) {
      console.error('❌ Error getting materials by project:', error);
      next(error);
    }
  })
);

// Get material statistics for a project
router.get('/project/:projectId/stats', 
  projectIdValidation, 
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('📊 Getting material stats for project:', req.params.projectId);
      await materialController.getMaterialStats(req, res, next);
    } catch (error) {
      console.error('❌ Error getting material stats:', error);
      next(error);
    }
  })
);

// Get single material
router.get('/:id', 
  materialIdValidation, 
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('📋 Getting material:', req.params.id);
      await materialController.getMaterial(req, res, next);
    } catch (error) {
      console.error('❌ Error getting material:', error);
      next(error);
    }
  })
);

// Create new material
router.post('/', 
  materialValidation, 
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('📋 Creating material:', {
        name: req.body.name,
        projectId: req.body.projectId,
        quantity: req.body.quantity,
        pricePerUnit: req.body.pricePerUnit,
        totalPrice: req.body.totalPrice
      });
      await materialController.createMaterial(req, res, next);
    } catch (error) {
      console.error('❌ Error creating material:', error);
      next(error);
    }
  })
);

// Update existing material
router.put('/:id', 
  materialIdValidation,
  materialValidation, 
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('📋 Updating material:', req.params.id, {
        name: req.body.name,
        quantity: req.body.quantity,
        pricePerUnit: req.body.pricePerUnit,
        totalPrice: req.body.totalPrice
      });
      await materialController.updateMaterial(req, res, next);
    } catch (error) {
      console.error('❌ Error updating material:', error);
      next(error);
    }
  })
);

// Delete material
router.delete('/:id', 
  materialIdValidation, 
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('📋 Deleting material:', req.params.id);
      await materialController.deleteMaterial(req, res, next);
    } catch (error) {
      console.error('❌ Error deleting material:', error);
      next(error);
    }
  })
);

// ========== ENHANCED FEATURES ==========

// Bulk create materials
router.post('/bulk', 
  [
    body('materials')
      .isArray({ min: 1, max: 50 })
      .withMessage('Materials array must contain 1-50 items'),
    body('materials.*')
      .custom((material) => {
        // Validate each material in the array
        const required = ['projectId', 'name', 'unit', 'pricePerUnit', 'quantity'];
        for (const field of required) {
          if (!material[field]) {
            throw new Error(`Material missing required field: ${field}`);
          }
        }
        
        // Validate data types
        if (typeof material.name !== 'string' || material.name.trim().length === 0) {
          throw new Error('Material name must be a non-empty string');
        }
        
        if (isNaN(parseFloat(material.pricePerUnit)) || parseFloat(material.pricePerUnit) < 0) {
          throw new Error('Price per unit must be a positive number');
        }
        
        if (isNaN(parseFloat(material.quantity)) || parseFloat(material.quantity) <= 0) {
          throw new Error('Quantity must be greater than 0');
        }
        
        return true;
      })
  ],
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('📋 Creating bulk materials:', req.body.materials.length, 'items');
      
      // Calculate total prices for bulk materials
      req.body.materials = req.body.materials.map(material => ({
        ...material,
        totalPrice: Math.round(parseFloat(material.pricePerUnit) * parseFloat(material.quantity) * 100) / 100
      }));
      
      await materialController.createBulkMaterials(req, res, next);
    } catch (error) {
      console.error('❌ Error creating bulk materials:', error);
      next(error);
    }
  })
);

// Export materials as CSV
router.get('/project/:projectId/export/csv',
  projectIdValidation,
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('📄 Exporting materials as CSV for project:', req.params.projectId);
      await materialController.exportMaterialsCSV(req, res, next);
    } catch (error) {
      console.error('❌ Error exporting materials CSV:', error);
      next(error);
    }
  })
);

// Search materials
router.get('/search/:query',
  [
    param('query')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Search query must be between 2 and 50 characters')
      .matches(/^[a-zA-Z0-9\s\-_.,()]+$/)
      .withMessage('Search query contains invalid characters')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('🔍 Searching materials:', req.params.query);
      await materialController.searchMaterials(req, res, next);
    } catch (error) {
      console.error('❌ Error searching materials:', error);
      next(error);
    }
  })
);

// Get materials by category
router.get('/category/:category',
  [
    param('category')
      .isIn(['construction', 'electrical', 'plumbing', 'finishing', 'tools', 'safety', 'other'])
      .withMessage('Invalid category. Must be one of: construction, electrical, plumbing, finishing, tools, safety, other')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('📂 Getting materials by category:', req.params.category);
      await materialController.getMaterialsByCategory(req, res, next);
    } catch (error) {
      console.error('❌ Error getting materials by category:', error);
      next(error);
    }
  })
);

// Get low stock materials (quantity < threshold)
router.get('/project/:projectId/low-stock',
  [
    ...projectIdValidation,
    body('threshold')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Threshold must be a positive number')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      const threshold = req.query.threshold || 5; // Default threshold of 5
      console.log('⚠️ Getting low stock materials for project:', req.params.projectId, 'threshold:', threshold);
      req.stockThreshold = threshold;
      await materialController.getLowStockMaterials(req, res, next);
    } catch (error) {
      console.error('❌ Error getting low stock materials:', error);
      next(error);
    }
  })
);

// Get materials summary by supplier
router.get('/project/:projectId/suppliers',
  projectIdValidation,
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('🏢 Getting supplier summary for project:', req.params.projectId);
      await materialController.getSupplierSummary(req, res, next);
    } catch (error) {
      console.error('❌ Error getting supplier summary:', error);
      next(error);
    }
  })
);

// Duplicate material
router.post('/:id/duplicate',
  materialIdValidation,
  [
    body('projectId')
      .optional()
      .isMongoId()
      .withMessage('Valid project ID is required if changing project'),
    body('quantity')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Quantity must be greater than 0')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    try {
      console.log('📋 Duplicating material:', req.params.id);
      await materialController.duplicateMaterial(req, res, next);
    } catch (error) {
      console.error('❌ Error duplicating material:', error);
      next(error);
    }
  })
);

// ========== ERROR HANDLING ==========

// Global error handler for this router
router.use((error, req, res, next) => {
  console.error('🚨 Material route error:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    timestamp: new Date().toISOString()
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Default error status and message
  let status = error.status || 500;
  let message = error.message || 'Internal server error';
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    status = 409;
    message = 'Duplicate entry';
  }
  
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };
  
  if (isDevelopment) {
    response.stack = error.stack;
    response.details = error.details;
  }
  
  res.status(status).json(response);
});

// ========== DOCUMENTATION ==========

// Log loaded routes for debugging
console.log('🚀 Enhanced material routes loaded with endpoints:');
console.log('  📋 CRUD Operations:');
console.log('    GET    /materials/project/:projectId');
console.log('    GET    /materials/project/:projectId/stats');
console.log('    GET    /materials/:id');
console.log('    POST   /materials');
console.log('    PUT    /materials/:id');
console.log('    DELETE /materials/:id');
console.log('');
console.log('  🔧 Enhanced Features:');
console.log('    POST   /materials/bulk');
console.log('    GET    /materials/project/:projectId/export/csv');
console.log('    GET    /materials/search/:query');
console.log('    GET    /materials/category/:category');
console.log('    GET    /materials/project/:projectId/low-stock');
console.log('    GET    /materials/project/:projectId/suppliers');
console.log('    POST   /materials/:id/duplicate');
console.log('');
console.log('  📊 Supported Categories: construction, electrical, plumbing, finishing, tools, safety, other');
console.log('  📦 Supported Units: sqm, kg, unit, m3, ton, liter, meter, piece, box, roll, bag');

module.exports = router;