const Project = require('../models/Project');
const Material = require('../models/Material');
const { generateProjectPDF } = require('../utils/pdfGenerator');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('materials');
    res.status(200).json({ data: projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('materials');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json({ data: project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json({ data: project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('materials');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Recalculate total cost
    await calculateProjectTotal(project._id);
    
    res.status(200).json({ data: project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    // Delete associated materials
    await Material.deleteMany({ project: req.params.id });
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get project statistics
exports.getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const projects = await Project.find().populate('materials');
    
    const totalValue = projects.reduce((sum, project) => {
      return sum + (project.totalCost || 0);
    }, 0);
    
    const statusBreakdown = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      data: {
        totalProjects,
        totalValue,
        statusBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add material to project
exports.addMaterial = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
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
    
    res.status(201).json({ data: material });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get project materials
exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ project: req.params.id });
    res.status(200).json({ data: materials });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.materialId);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    // Remove material from project and recalculate total
    await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { materials: req.params.materialId } }
    );
    await calculateProjectTotal(req.params.id);
    
    res.status(200).json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export project to PDF
exports.exportProjectPDF = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('materials');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const pdfBuffer = await generateProjectPDF(project);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=project-${project._id}-report.pdf`
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
};

// Helper function to calculate project total cost
async function calculateProjectTotal(projectId) {
  const materials = await Material.find({ project: projectId });
  const totalCost = materials.reduce((sum, material) => {
    return sum + (material.quantity * material.pricePerUnit);
  }, 0);
  
  await Project.findByIdAndUpdate(projectId, { totalCost });
}