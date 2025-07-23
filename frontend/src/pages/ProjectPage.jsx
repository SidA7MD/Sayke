import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Download, Edit, MapPin, Calendar } from 'lucide-react'; // Lucide icons
import toast from 'react-hot-toast'; // React Hot Toast for notifications
import axios from 'axios'; // For placeholder API

// --- Placeholder for axios.js content (simulated API) ---
// In your actual project, this would be in `frontend/src/api/axios.js`
const instance = axios.create({
  baseURL: 'http://localhost:5000', // Default if REACT_APP_API_URL is not set
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const projectAPI = {
  getById: async (id) => {
    console.log(`Simulating projectAPI.getById(${id})`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    if (id === 'sample-project-id' || id === '1') { // Use '1' as a common placeholder ID
      return {
        data: {
          data: {
            _id: id,
            name: 'Sample Construction Project',
            status: 'in-progress',
            location: 'New York, USA',
            deadline: '2025-12-31',
            budget: 1500000,
            description: 'A large-scale commercial building project in the heart of the city.',
            totalMaterialCost: 12500 // Simulated total material cost
          }
        }
      };
    }
    throw new Error('Project not found (simulated)');
  },
  // Add other project API methods if needed for other components
};

const materialAPI = {
  getByProject: async (projectId) => {
    console.log(`Simulating materialAPI.getByProject(${projectId})`);
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      data: {
        data: [
          { _id: 'mat1', name: 'Cement Bags', quantity: 500, unitPrice: 8.50 },
          { _id: 'mat2', name: 'Steel Rebars (tons)', quantity: 20, unitPrice: 1200.00 },
          { _id: 'mat3', name: 'Wooden Planks (sq ft)', quantity: 1500, unitPrice: 2.10 },
          { _id: 'mat4', name: 'Electrical Wires (meters)', quantity: 1000, unitPrice: 0.75 },
        ]
      }
    };
  },
  getStats: async (projectId) => {
    console.log(`Simulating materialAPI.getStats(${projectId})`);
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      data: {
        data: {
          totalItems: 4,
          totalCost: 30000.00 // This would be dynamically calculated from materials in a real backend
        }
      }
    };
  },
  create: async (materialData) => {
    console.log('Simulating materialAPI.create:', materialData);
    await new Promise(resolve => setTimeout(resolve, 100));
    return { data: { data: { ...materialData, _id: `new-mat-${Date.now()}` } } };
  },
  update: async (materialId, materialData) => {
    console.log('Simulating materialAPI.update:', materialId, materialData);
    await new Promise(resolve => setTimeout(resolve, 100));
    return { data: { data: { ...materialData, _id: materialId } } };
  },
  delete: async (materialId) => {
    console.log('Simulating materialAPI.delete:', materialId);
    await new Promise(resolve => setTimeout(resolve, 100));
    return { data: { message: 'Material deleted' } };
  },
};

// --- End Placeholder for axios.js content ---


// --- Placeholder Components ---
// These are minimal versions to allow the main app to render.
// You should replace these with your actual component implementations.

const MaterialForm = ({ projectId, onMaterialSubmit, onCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || '');
  const [unitPrice, setUnitPrice] = useState(initialData?.unitPrice || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !quantity || !unitPrice) {
      toast.error('Please fill all fields.');
      return;
    }
    onMaterialSubmit({ name, quantity: parseInt(quantity), unitPrice: parseFloat(unitPrice) });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{initialData ? 'Edit Material' : 'Add New Material'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="material-name" className="block text-sm font-medium text-gray-700">Material Name</label>
          <input type="text" id="material-name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
          <input type="number" id="quantity" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="unit-price" className="block text-sm font-medium text-gray-700">Unit Price</label>
          <input type="number" id="unit-price" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required />
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
          <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">{initialData ? 'Update Material' : 'Add Material'}</button>
        </div>
      </form>
    </div>
  );
};

const MaterialList = ({ materials, onEdit, onDelete }) => {
  if (materials.length === 0) {
    return <div className="text-center py-8 text-gray-500">No materials added yet.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {materials.map(material => (
        <div key={material._id} className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800">{material.name}</h4>
            <p className="text-sm text-gray-600">Quantity: {material.quantity}</p>
            <p className="text-sm text-gray-600">Unit Price: ${material.unitPrice.toFixed(2)}</p>
            <p className="text-sm text-gray-700 font-medium">Total: ${(material.quantity * material.unitPrice).toFixed(2)}</p>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={() => onEdit(material)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"><Edit size={16} /></button>
            <button onClick={() => onDelete(material._id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

const SummaryView = ({ materialStats, project }) => {
  if (!materialStats || !project) {
    return <div className="text-center py-8 text-gray-500">Loading summary...</div>;
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Overall Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="info-item">
          <label className="block text-sm font-medium text-gray-600">Project Budget:</label>
          <span className="text-base font-semibold">${project.budget?.toLocaleString() || 'N/A'}</span>
        </div>
        <div className="info-item">
          <label className="block text-sm font-medium text-gray-600">Total Material Items:</label>
          <span className="text-base font-semibold">{materialStats.totalItems}</span>
        </div>
        <div className="info-item">
          <label className="block text-sm font-medium text-gray-600">Total Material Cost:</label>
          <span className="text-base font-semibold">${materialStats.totalCost?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="info-item">
          <label className="block text-sm font-medium text-gray-600">Remaining Budget:</label>
          <span className="text-base font-semibold">${(project.budget - materialStats.totalCost)?.toFixed(2) || 'N/A'}</span>
        </div>
      </div>
      {/* Add more summary details as needed */}
    </div>
  );
};

const ExportButton = ({ projectId, projectName }) => {
  const handleExport = async () => {
    try {
      // Simulate API call for PDF export
      console.log(`Simulating export for project: ${projectName} (ID: ${projectId})`);
      toast.success(`Exporting PDF for ${projectName}... (Simulated)`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF.');
    }
  };
  return (
    <button onClick={handleExport} className="px-4 py-2 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700 transition duration-200 flex items-center space-x-2">
      <Download size={18} /><span>Export PDF</span>
    </button>
  );
};

// --- Custom Confirmation Modal Component (from provided immersive) ---
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <p className="text-lg font-semibold mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Confirm</button>
        </div>
      </div>
    </div>
  );
};
// --- End Confirmation Modal Component ---


/**
 * ProjectPage component displays the details of a specific project
 * and allows management of its materials.
 */
const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [materialStats, setMaterialStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null); // State to hold material being edited
  const [activeTab, setActiveTab] = useState('materials'); // State for tab selection
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State for confirmation modal
  const [materialIdToDelete, setMaterialIdToDelete] = useState(null); // State to hold material ID for deletion

  useEffect(() => {
    fetchProject();
    fetchMaterials();
    fetchMaterialStats();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.getById(id);
      setProject(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch project');
      console.error('Error fetching project:', error);
      navigate('/'); // Navigate back to dashboard on error
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await materialAPI.getByProject(id);
      setMaterials(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch materials');
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialStats = async () => {
    try {
      const response = await materialAPI.getStats(id);
      setMaterialStats(response.data.data);
    } catch (error) {
      console.error('Error fetching material stats:', error);
    }
  };

  const handleMaterialCreate = async (materialData) => {
    try {
      await materialAPI.create({ ...materialData, projectId: id });
      toast.success('Material added successfully');
      setShowMaterialForm(false);
      fetchMaterials();
      fetchProject(); // Refresh to update total cost
      fetchMaterialStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add material');
      console.error('Error creating material:', error);
    }
  };

  const handleMaterialUpdate = async (materialId, materialData) => {
    try {
      await materialAPI.update(materialId, { ...materialData, projectId: id });
      toast.success('Material updated successfully');
      setEditingMaterial(null);
      setShowMaterialForm(false); // Close form after update
      fetchMaterials();
      fetchProject(); // Refresh to update total cost
      fetchMaterialStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update material');
      console.error('Error updating material:', error);
    }
  };

  const handleMaterialDeleteClick = (materialId) => {
    setMaterialIdToDelete(materialId);
    setShowConfirmModal(true);
  };

  const confirmMaterialDelete = async () => {
    setShowConfirmModal(false);
    if (!materialIdToDelete) return; // Should not happen if modal is shown correctly

    try {
      await materialAPI.delete(materialIdToDelete);
      toast.success('Material deleted successfully');
      fetchMaterials();
      fetchProject(); // Refresh to update total cost
      fetchMaterialStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete material');
      console.error('Error deleting material:', error);
    } finally {
      setMaterialIdToDelete(null);
    }
  };

  const cancelMaterialDelete = () => {
    setShowConfirmModal(false);
    setMaterialIdToDelete(null);
  };


  // FIX APPLIED HERE: Removed the extra semicolon
  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      'on-hold': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowMaterialForm(true);
  };

  if (loading) {
    return (
      <div className="loading-container min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner text-2xl font-semibold text-gray-700">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="error-container min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700 p-6">
        <h2 className="text-3xl font-bold mb-4">Project not found</h2>
        <p className="mb-6">The project you are looking for does not exist or an error occurred.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-200">
          <ArrowLeft size={20} className="inline-block mr-2" /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="project-page min-h-screen bg-gray-50 p-6 font-inter antialiased">
      <header className="project-header bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
        <button onClick={() => navigate('/')} className="back-btn px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200 flex items-center space-x-2">
          <ArrowLeft size={18} /> <span>Back to Dashboard</span>
        </button>

        <div className="project-title-section flex-grow text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
          <span className={`status-badge text-sm font-semibold px-3 py-1 rounded-full mt-2 inline-block ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>

        <div className="project-actions-header flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto justify-end">
          <button onClick={() => { setEditingMaterial(null); setShowMaterialForm(true); }} className="add-material-btn px-5 py-2.5 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition duration-200 flex items-center space-x-2">
            <Plus size={20} /> <span>Add Material</span>
          </button>
          <ExportButton projectId={id} projectName={project.name} />
        </div>
      </header>

      <div className="project-details-section grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="project-info-card bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Project Information</h3>
          <div className="project-info-grid grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div className="info-item flex items-center space-x-2">
              <MapPin size={18} className="text-gray-500" />
              <div>
                <label className="block text-sm font-medium text-gray-600">Location:</label>
                <span className="text-base">{project.location}</span>
              </div>
            </div>
            <div className="info-item flex items-center space-x-2">
              <Calendar size={18} className="text-gray-500" />
              <div>
                <label className="block text-sm font-medium text-gray-600">Deadline:</label>
                <span className="text-base">{project.deadline}</span>
              </div>
            </div>
            <div className="info-item">
              <label className="block text-sm font-medium text-gray-600">Budget:</label>
              <span className="text-base">${project.budget?.toLocaleString() || '0'}</span>
            </div>
            <div className="info-item">
              <label className="block text-sm font-medium text-gray-600">Status:</label>
              <span className="text-base">{project.status}</span>
            </div>
          </div>
          {project.description && (
            <div className="project-description mt-6">
              <label className="block text-sm font-medium text-gray-600">Description:</label>
              <p className="text-base text-gray-800">{project.description}</p>
            </div>
          )}
        </div>

        <div className="materials-summary-card bg-white rounded-lg shadow-md p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Materials Summary</h3>
          <div className="summary-stats flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0">
            <div className="summary-item">
              <span className="summary-number text-5xl font-extrabold text-indigo-600">{materialStats?.totalItems || 0}</span>
              <span className="summary-label block text-gray-600 mt-1">Total Items</span>
            </div>
            <div className="summary-item">
              <span className="summary-number text-5xl font-extrabold text-indigo-600">${materialStats?.totalCost?.toFixed(2) || '0.00'}</span>
              <span className="summary-label block text-gray-600 mt-1">Total Cost</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Materials and Summary */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'materials' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('materials')}
          >
            Materials
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'summary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
        </div>
      </div>

      {/* Conditional Rendering based on activeTab */}
      {activeTab === 'materials' && (
        <div className="materials-section bg-white rounded-lg shadow-md p-6">
          <div className="materials-header flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Materials List</h2>
            <button onClick={() => { setEditingMaterial(null); setShowMaterialForm(true); }} className="add-material-btn-secondary px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition duration-200 text-sm flex items-center space-x-2">
              <Plus size={16} /> <span>Add Material</span>
            </button>
          </div>
          <MaterialList
            materials={materials}
            onEdit={handleEditMaterial}
            onDelete={handleMaterialDeleteClick} // Use the new handler for modal
          />
        </div>
      )}

      {activeTab === 'summary' && (
        <SummaryView materialStats={materialStats} project={project} />
      )}

      {showMaterialForm && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="modal-content">
            <MaterialForm
              projectId={id}
              onMaterialSubmit={editingMaterial ? handleMaterialUpdate.bind(null, editingMaterial._id) : handleMaterialCreate}
              onCancel={() => { setShowMaterialForm(false); setEditingMaterial(null); }}
              initialData={editingMaterial}
            />
          </div>
        </div>
      )}

      {showConfirmModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this material? This action cannot be undone."
          onConfirm={confirmMaterialDelete}
          onCancel={cancelMaterialDelete}
        />
      )}
    </div>
  );
};

export default ProjectPage;
