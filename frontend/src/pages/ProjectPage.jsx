// frontend/src/pages/ProjectPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI } from '../api/axios';
import { Building, MapPin, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import MaterialForm from '../components/MaterialForm';
import MaterialList from '../components/MaterialList';
import toast from 'react-hot-toast';

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMaterialForm, setShowMaterialForm] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchMaterials();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.get(id);
      setProject(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch project');
      console.error('Error fetching project:', error);
      navigate('/');
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await projectAPI.getMaterials(id);
      setMaterials(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch materials');
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialCreate = async (materialData) => {
    try {
      await projectAPI.addMaterial(id, materialData);
      toast.success('Material added successfully');
      setShowMaterialForm(false);
      fetchMaterials();
      fetchProject(); // Refresh project to update total cost
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add material');
      console.error('Error adding material:', error);
    }
  };

  const handleMaterialDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await projectAPI.deleteMaterial(id, materialId);
      toast.success('Material deleted successfully');
      fetchMaterials();
      fetchProject(); // Refresh project to update total cost
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete material');
      console.error('Error deleting material:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      'on-hold': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Projects
      </button>

      {project && (
        <>
          {/* Project Header */}
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Building className="h-6 w-6 text-blue-600" />
                {project.name}
              </h2>
            </div>
            <div className="card-content grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{project.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="font-medium">
                    ${project.totalCost ? project.totalCost.toLocaleString() : '0'}
                  </p>
                </div>
              </div>
              
              {project.notes && (
                <div className="md:col-span-3">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-700 whitespace-pre-line">{project.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Materials Section */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Materials</h3>
              <button
                onClick={() => setShowMaterialForm(true)}
                className="btn btn-primary"
              >
                Add Material
              </button>
            </div>
            
            <div className="card-content">
              {materials.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No materials added yet</p>
                  <button
                    onClick={() => setShowMaterialForm(true)}
                    className="btn btn-primary"
                  >
                    Add First Material
                  </button>
                </div>
              ) : (
                <MaterialList
                  materials={materials}
                  onDelete={handleMaterialDelete}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Material Form Modal */}
      {showMaterialForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <MaterialForm
              onSubmit={handleMaterialCreate}
              onCancel={() => setShowMaterialForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;