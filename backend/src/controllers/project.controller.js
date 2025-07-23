const Project = require('../models/Project');
const Material = require('../models/Material');
const { validationResult } = require('express-validator');

const projectController = {
  // Get all projects
  getAllProjects: async (req, res) => {
    try {
      const projects = await Project.find()
        .populate('materials')
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        data: projects,
        count: projects.length
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch projects'
      });
    }
  },

  // Get single project
  getProject: async (req, res) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate('materials');
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project'
      });
    }
  },

  // Create new project
  createProject: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const project = new Project({
        name: req.body.name,
        location: req.body.location,
        notes: req.body.notes,
        status: req.body.status
      });

      const savedProject = await project.save();
      
      res.status(201).json({
        success: true,
        data: savedProject,
        message: 'Project created successfully'
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create project'
      });
    }
  },

  // Update project
  updateProject: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const project = await Project.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          location: req.body.location,
          notes: req.body.notes,
          status: req.body.status
        },
        { new: true, runValidators: true }
      ).populate('materials');

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      res.json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update project'
      });
    }
  },

  // Delete project
  deleteProject: async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Delete all materials associated with this project
      await Material.deleteMany({ projectId: req.params.id });
      
      // Delete the project
      await Project.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Project and associated materials deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete project'
      });
    }
  },

  // Get project statistics
  getProjectStats: async (req, res) => {
    try {
      const stats = await Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalCost: { $sum: '$totalCost' }
          }
        }
      ]);

      const totalProjects = await Project.countDocuments();
      const totalValue = await Project.aggregate([
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]);

      res.json({
        success: true,
        data: {
          totalProjects,
          totalValue: totalValue[0]?.total || 0,
          statusBreakdown: stats
        }
      });
    } catch (error) {
      console.error('Error fetching project stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project statistics'
      });
    }
  }
};

module.exports = projectController;