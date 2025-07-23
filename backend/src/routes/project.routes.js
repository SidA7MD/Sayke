const express = require('express');
const { body } = require('express-validator');
const projectController = require('../controllers/project.controller');
const pdfGenerator = require('../utils/pdfGenerator');
const router = express.Router();

// Validation rules
const projectValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['planning', 'in-progress', 'completed', 'on-hold'])
    .withMessage('Status must be one of: planning, in-progress, completed, on-hold')
];

// Standard CRUD Routes
router.get('/', projectController.getAllProjects);
router.get('/stats', projectController.getProjectStats);
router.get('/:id', projectController.getProject);
router.post('/', projectValidation, projectController.createProject);
router.put('/:id', projectValidation, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// PDF Export Routes - Fixed routing structure
router.get('/:id/export', async (req, res) => {
  try {
    const projectId = req.params.id;
    const pdfBuffer = await pdfGenerator.generateProjectPDF(projectId);
    
    // Set response headers for project report
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=project_report_${projectId}.pdf`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache'
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting project report:', error);
    
    if (error.message === 'Project not found') {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate project report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get('/:id/export/materials', async (req, res) => {
  try {
    const projectId = req.params.id;
    const pdfBuffer = await pdfGenerator.generateMaterialsPDF(projectId);
    
    // Set response headers for materials list
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=materials_list_${projectId}.pdf`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache'
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting materials list:', error);
    
    if (error.message === 'Project not found') {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate materials list',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Alternative endpoint for project report (for backward compatibility)
router.get('/:id/export/project-report', async (req, res) => {
  try {
    const projectId = req.params.id;
    const pdfBuffer = await pdfGenerator.generateProjectPDF(projectId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=project_report_${projectId}.pdf`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache'
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting project report:', error);
    
    if (error.message === 'Project not found') {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate project report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Alternative endpoint for materials list (for backward compatibility)
router.get('/:id/export/materials-list', async (req, res) => {
  try {
    const projectId = req.params.id;
    const pdfBuffer = await pdfGenerator.generateMaterialsPDF(projectId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=materials_list_${projectId}.pdf`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache'
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting materials list:', error);
    
    if (error.message === 'Project not found') {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate materials list',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;