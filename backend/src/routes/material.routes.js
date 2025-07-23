const express = require('express');
const { body, param } = require('express-validator');
const materialController = require('../controllers/material.controller');

const router = express.Router();

// Validation rules
const materialValidation = [
  body('projectId')
    .isMongoId()
    .withMessage('Valid project ID is required'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Material name must be between 1 and 100 characters'),
  body('unit')
    .isIn(['sqm', 'kg', 'unit', 'm3', 'ton', 'liter', 'meter', 'piece'])
    .withMessage('Unit must be one of: sqm, kg, unit, m3, ton, liter, meter, piece'),
  body('pricePerUnit')
    .isFloat({ min: 0 })
    .withMessage('Price per unit must be a positive number'),
  body('quantity')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('supplier')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Supplier name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['construction', 'electrical', 'plumbing', 'finishing', 'other'])
    .withMessage('Category must be one of: construction, electrical, plumbing, finishing, other')
];

const projectIdValidation = [
  param('projectId')
    .isMongoId()
    .withMessage('Valid project ID is required')
];

// Routes
router.get('/project/:projectId', projectIdValidation, materialController.getMaterialsByProject);
router.get('/project/:projectId/stats', projectIdValidation, materialController.getMaterialStats);
router.get('/:id', materialController.getMaterial);
router.post('/', materialValidation, materialController.createMaterial);
router.put('/:id', materialValidation, materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;