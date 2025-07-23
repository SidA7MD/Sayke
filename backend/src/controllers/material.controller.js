const Material = require('../models/Material');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const materialController = {
  // Get all materials for a project
  getMaterialsByProject: async (req, res) => {
    try {
      const { projectId } = req.params;
      const materials = await Material.find({ projectId }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: materials,
        count: materials.length
      });
    } catch (error) {
      console.error('Error fetching materials:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch materials'
      });
    }
  },

  // Get single material
  getMaterial: async (req, res) => {
    try {
      const material = await Material.findById(req.params.id)
        .populate('projectId', 'name location');

      if (!material) {
        return res.status(404).json({
          success: false,
          error: 'Material not found'
        });
      }

      res.json({
        success: true,
        data: material
      });
    } catch (error) {
      console.error('Error fetching material:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch material'
      });
    }
  },

  // Create new material
  createMaterial: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { projectId, name, unit, pricePerUnit, quantity, supplier, description, category } = req.body;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const totalPrice = pricePerUnit * quantity;

      const material = new Material({
        projectId,
        name,
        unit,
        pricePerUnit,
        quantity,
        supplier,
        description,
        category,
        totalPrice
      });

      const savedMaterial = await material.save();

      await Project.findByIdAndUpdate(
        projectId,
        { $push: { materials: savedMaterial._id } }
      );

      res.status(201).json({
        success: true,
        data: savedMaterial,
        message: 'Material created successfully'
      });
    } catch (error) {
      console.error('Error creating material:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create material'
      });
    }
  },

  // Update material
  updateMaterial: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
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
          supplier,
          description,
          category,
          totalPrice
        },
        { new: true, runValidators: true }
      );

      if (!material) {
        return res.status(404).json({
          success: false,
          error: 'Material not found'
        });
      }

      res.json({
        success: true,
        data: material,
        message: 'Material updated successfully'
      });
    } catch (error) {
      console.error('Error updating material:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update material'
      });
    }
  },

  // Delete material
  deleteMaterial: async (req, res) => {
    try {
      const material = await Material.findById(req.params.id);

      if (!material) {
        return res.status(404).json({
          success: false,
          error: 'Material not found'
        });
      }

      await Project.findByIdAndUpdate(
        material.projectId,
        { $pull: { materials: material._id } }
      );

      await Material.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Material deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting material:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete material'
      });
    }
  },

  // Get material statistics by category
  getMaterialStats: async (req, res) => {
    try {
      const { projectId } = req.params;
      const objectId = new mongoose.Types.ObjectId(projectId);

      const stats = await Material.aggregate([
        { $match: { projectId: objectId } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalCost: { $sum: '$totalPrice' },
            avgPricePerUnit: { $avg: '$pricePerUnit' }
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
          categoryBreakdown: stats
        }
      });
    } catch (error) {
      console.error('Error fetching material stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch material statistics'
      });
    }
  }
};

module.exports = materialController;
