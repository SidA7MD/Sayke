const Material = require('../models/Material');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper function outside the controller (this fixes the 'this' issue)
const updateProjectTotalCost = async (projectId) => {
  try {
    const result = await Material.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const totalCost = result[0]?.total || 0;

    // Try to update project total cost (field name might vary)
    try {
      await Project.findByIdAndUpdate(projectId, { totalCost });
    } catch (updateError) {
      // Try alternative field names
      try {
        await Project.findByIdAndUpdate(projectId, { total: totalCost });
      } catch (altUpdateError) {
        console.log('Note: Could not update project total cost (field may not exist)');
      }
    }
  } catch (error) {
    console.error('Error updating project total cost:', error);
    throw error;
  }
};

const materialController = {
  // Get all materials for a project
  getMaterialsByProject: async (req, res) => {
    try {
      const { projectId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID'
        });
      }

      const materials = await Material.find({ projectId }).sort({ createdAt: -1 });

      res.json(materials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch materials'
      });
    }
  },

  // Get a specific material
  getMaterial: async (req, res) => {
    try {
      const material = await Material.findById(req.params.id)
        .populate('projectId', 'name location');

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found'
        });
      }

      res.json(material);
    } catch (error) {
      console.error('Error fetching material:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch material'
      });
    }
  },

  // Create a new material
  createMaterial: async (req, res) => {
    try {
      console.log('=== CREATE MATERIAL CALLED ===');
      console.log('Request body:', req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { projectId, name, unit, pricePerUnit, quantity, supplier, description, category } = req.body;

      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID'
        });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const totalPrice = pricePerUnit * quantity;

      const newMaterial = new Material({
        projectId,
        name,
        unit,
        pricePerUnit,
        quantity,
        supplier: supplier || '',
        description: description || '',
        category: category || 'other',
        totalPrice
      });

      console.log('Saving material:', newMaterial);
      const savedMaterial = await newMaterial.save();
      console.log('Material saved successfully');

      // Update project with new material (if your Project model has materials array)
      try {
        await Project.findByIdAndUpdate(
          projectId,
          { $push: { materials: savedMaterial._id } }
        );
      } catch (updateError) {
        // If materials field doesn't exist in Project model, ignore this error
        console.log('Note: Could not update project materials array (field may not exist)');
      }

      // Update project total cost - FIXED: Use the helper function instead of this.updateProjectTotalCost
      console.log('Updating project total cost...');
      await updateProjectTotalCost(projectId);

      console.log('Material created successfully:', savedMaterial._id);
      res.status(201).json(savedMaterial);
    } catch (error) {
      console.error('Error creating material:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create material'
      });
    }
  },

  // Update a material
  updateMaterial: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, unit, pricePerUnit, quantity, supplier, description, category } = req.body;
      const totalPrice = pricePerUnit * quantity;

      const material = await Material.findByIdAndUpdate(
        req.params.id,
        {
          name,
          unit,
          pricePerUnit,
          quantity,
          supplier: supplier || '',
          description: description || '',
          category: category || 'other',
          totalPrice
        },
        { new: true, runValidators: true }
      );

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found'
        });
      }

      // Update project total cost - FIXED: Use the helper function
      await updateProjectTotalCost(material.projectId);

      res.json(material);
    } catch (error) {
      console.error('Error updating material:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update material'
      });
    }
  },

  // Delete a material
  deleteMaterial: async (req, res) => {
    try {
      const material = await Material.findById(req.params.id);

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found'
        });
      }

      const projectId = material.projectId;

      // Remove material from project (if your Project model has materials array)
      try {
        await Project.findByIdAndUpdate(
          projectId,
          { $pull: { materials: material._id } }
        );
      } catch (updateError) {
        // If materials field doesn't exist in Project model, ignore this error
        console.log('Note: Could not update project materials array (field may not exist)');
      }

      await Material.findByIdAndDelete(req.params.id);

      // Update project total cost - FIXED: Use the helper function
      await updateProjectTotalCost(projectId);

      res.json({
        success: true,
        message: 'Material deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting material:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete material'
      });
    }
  },

  // Get material statistics by category
  getMaterialStats: async (req, res) => {
    try {
      const { projectId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID'
        });
      }

      const objectId = new mongoose.Types.ObjectId(projectId);

      const stats = await Material.aggregate([
        { $match: { projectId: objectId } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalCost: { $sum: '$totalPrice' },
            averagePrice: { $avg: '$pricePerUnit' }
          }
        },
        { $sort: { totalCost: -1 } }
      ]);

      const totalMaterials = await Material.countDocuments({ projectId });
      const totalCostAggregate = await Material.aggregate([
        { $match: { projectId: objectId } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);

      res.json({
        success: true,
        data: {
          totalMaterials,
          totalCost: totalCostAggregate[0]?.total || 0,
          categoryBreakdown: stats.map(stat => ({
            category: stat._id,
            count: stat.count,
            totalCost: stat.totalCost,
            averagePrice: stat.averagePrice
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching material stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch material statistics'
      });
    }
  }
};

module.exports = materialController;