// backend/src/controllers/project.controller.js - Final Version with Budget & Dates Support
const Project = require('../models/Project');
const Material = require('../models/Material');
const { validationResult } = require('express-validator');
const { generateProjectPDF } = require('../utils/pdfGenerator');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    console.log('📋 Getting all projects...');
    
    const projects = await Project.find()
      .populate('materials')
      .sort({ createdAt: -1 });

    // Add material count for each project
    const projectsWithExtras = projects.map(project => {
      const projectObj = project.toObject();
      projectObj.materialsCount = project.materials.length;
      
      // Log budget and dates for debugging
      console.log(`📋 Project ${project.name}:`, {
        budget: projectObj.budget,
        startDate: projectObj.startDate,
        endDate: projectObj.endDate,
        totalCost: projectObj.totalCost
      });
      
      return projectObj;
    });

    console.log(`✅ Retrieved ${projectsWithExtras.length} projects`);
    res.status(200).json({ 
      success: true,
      data: projectsWithExtras 
    });
  } catch (error) {
    console.error('❌ Error getting projects:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    console.log('📋 Getting project:', req.params.id);
    
    const project = await Project.findById(req.params.id).populate('materials');
    
    if (!project) {
      console.log('❌ Project not found:', req.params.id);
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }

    const projectObj = project.toObject();
    projectObj.materialsCount = project.materials.length;

    console.log('✅ Project retrieved:', {
      id: project._id,
      name: project.name,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      totalCost: project.totalCost
    });

    res.status(200).json({ 
      success: true,
      data: projectObj 
    });
  } catch (error) {
    console.error('❌ Error getting project:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    console.log('📋 Creating project with data:', req.body);
    
    const {
      name,
      location,
      description,
      status,
      budget,        // ✅ Extract budget
      startDate,     // ✅ Extract start date  
      endDate,       // ✅ Extract end date
      notes
    } = req.body;

    // Create project with all fields including budget and dates
    const projectData = {
      name,
      location,
      description,
      status: status || 'planning',
      budget: Number(budget) || 0,           // ✅ Save budget
      startDate: startDate ? new Date(startDate) : null,  // ✅ Save start date
      endDate: endDate ? new Date(endDate) : null,        // ✅ Save end date
      notes: notes || ''
    };

    console.log('💾 Project data to save:', projectData);

    const project = new Project(projectData);
    await project.save();

    console.log('✅ Project created successfully:', {
      id: project._id,
      name: project.name,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate
    });

    res.status(201).json({ 
      success: true,
      data: project 
    });
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    console.log('📋 Updating project:', req.params.id);
    console.log('📋 Update data:', req.body);
    
    const {
      name,
      location,
      description,
      status,
      budget,        // ✅ Extract budget
      startDate,     // ✅ Extract start date
      endDate,       // ✅ Extract end date
      notes
    } = req.body;

    // Prepare update data with all fields including budget and dates
    const updateData = {
      name,
      location,
      description,
      status,
      budget: Number(budget) || 0,           // ✅ Update budget
      startDate: startDate ? new Date(startDate) : null,  // ✅ Update start date
      endDate: endDate ? new Date(endDate) : null,        // ✅ Update end date
      notes: notes || ''
    };

    console.log('💾 Update data to save:', updateData);

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('materials');
    
    if (!project) {
      console.log('❌ Project not found for update:', req.params.id);
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    // Recalculate total cost
    await calculateProjectTotal(project._id);
    
    // Get updated project
    const updatedProject = await Project.findById(project._id).populate('materials');
    
    console.log('✅ Project updated successfully:', {
      id: updatedProject._id,
      name: updatedProject.name,
      budget: updatedProject.budget,
      startDate: updatedProject.startDate,
      endDate: updatedProject.endDate,
      totalCost: updatedProject.totalCost
    });

    res.status(200).json({ 
      success: true,
      data: updatedProject 
    });
  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    console.log('📋 Deleting project:', req.params.id);
    
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      console.log('❌ Project not found for deletion:', req.params.id);
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    // Delete associated materials
    await Material.deleteMany({ project: req.params.id });
    
    console.log('✅ Project and associated materials deleted successfully');
    res.status(200).json({ 
      success: true,
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get project statistics
exports.getProjectStats = async (req, res) => {
  try {
    console.log('📊 Getting project statistics...');
    
    const totalProjects = await Project.countDocuments();
    const projects = await Project.find().populate('materials');
    
    const totalValue = projects.reduce((sum, project) => {
      return sum + (project.totalCost || 0);
    }, 0);

    // ✅ Calculate total estimated budget
    const totalBudget = projects.reduce((sum, project) => {
      return sum + (project.budget || 0);
    }, 0);
    
    const statusBreakdown = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // ✅ Additional statistics with budget and dates
    const projectsWithBudget = projects.filter(p => p.budget && p.budget > 0).length;
    const projectsWithDates = projects.filter(p => p.startDate && p.endDate).length;
    
    const stats = {
      totalProjects,
      totalValue,
      totalBudget,              // ✅ Total estimated budget
      projectsWithBudget,       // ✅ Projects with budget set
      projectsWithDates,        // ✅ Projects with dates set
      statusBreakdown
    };

    console.log('✅ Statistics calculated:', stats);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Add material to project
exports.addMaterial = async (req, res) => {
  try {
    console.log('🧱 Adding material to project:', req.params.id);
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    const material = new Material({
      ...req.body,
      project: req.params.id
    });
    
    await material.save();
    
    // Add material to project and recalculate total
    project.materials.push(material._id);
    await project.save();
    await calculateProjectTotal(project._id);
    
    console.log('✅ Material added successfully');
    res.status(201).json({ 
      success: true,
      data: material 
    });
  } catch (error) {
    console.error('❌ Error adding material:', error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get project materials
exports.getMaterials = async (req, res) => {
  try {
    console.log('🧱 Getting materials for project:', req.params.id);
    
    const materials = await Material.find({ project: req.params.id });
    
    console.log(`✅ Retrieved ${materials.length} materials`);
    res.status(200).json({ 
      success: true,
      data: materials 
    });
  } catch (error) {
    console.error('❌ Error getting materials:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
  try {
    console.log('🧱 Deleting material:', req.params.materialId);
    
    const material = await Material.findByIdAndDelete(req.params.materialId);
    if (!material) {
      return res.status(404).json({ 
        success: false,
        error: 'Material not found' 
      });
    }
    
    // Remove material from project and recalculate total
    await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { materials: req.params.materialId } }
    );
    await calculateProjectTotal(req.params.id);
    
    console.log('✅ Material deleted successfully');
    res.status(200).json({ 
      success: true,
      message: 'Material deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting material:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Export project to PDF
exports.exportProjectPDF = async (req, res) => {
  try {
    console.log('📄 Exporting project PDF:', req.params.id);
    
    const project = await Project.findById(req.params.id)
      .populate('materials');
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }

    const pdfBuffer = await generateProjectPDF(project);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=project-${project._id}-report.pdf`,
      'Access-Control-Expose-Headers': 'Content-Disposition'
    });
    
    console.log('✅ Project PDF exported successfully');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to export PDF' 
    });
  }
};

// Helper function to calculate project total cost
async function calculateProjectTotal(projectId) {
  try {
    console.log('💰 Calculating total cost for project:', projectId);
    
    const materials = await Material.find({ project: projectId });
    const totalCost = materials.reduce((sum, material) => {
      return sum + (material.quantity * material.pricePerUnit);
    }, 0);
    
    await Project.findByIdAndUpdate(projectId, { totalCost });
    
    console.log('✅ Total cost calculated:', totalCost);
    return totalCost;
  } catch (error) {
    console.error('❌ Error calculating total cost:', error);
    throw error;
  }
}

console.log('🚀 Project controller loaded with enhanced budget and dates support');

module.exports = {
  getAllProjects: exports.getAllProjects,
  getProject: exports.getProject,
  createProject: exports.createProject,
  updateProject: exports.updateProject,
  deleteProject: exports.deleteProject,
  getProjectStats: exports.getProjectStats,
  addMaterial: exports.addMaterial,
  getMaterials: exports.getMaterials,
  deleteMaterial: exports.deleteMaterial,
  exportProjectPDF: exports.exportProjectPDF,
  calculateProjectTotal
};