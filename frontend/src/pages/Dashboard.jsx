import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building, MapPin, Calendar, DollarSign } from 'lucide-react';
import { projectAPI } from '../api/axios';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await projectAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProjectCreate = async (projectData) => {
    try {
      await projectAPI.create(projectData);
      toast.success('Project created successfully');
      setShowForm(false);
      fetchProjects();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create project');
      console.error('Error creating project:', error);
    }
  };

  const handleProjectUpdate = async (id, projectData) => {
    try {
      await projectAPI.update(id, projectData);
      toast.success('Project updated successfully');
      fetchProjects();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update project');
      console.error('Error updating project:', error);
    }
  };

  const handleProjectDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated materials.')) {
      return;
    }

    try {
      await projectAPI.delete(id);
      toast.success('Project deleted successfully');
      fetchProjects();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete project');
      console.error('Error deleting project:', error);
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-600" />
              Construction Manager
            </h1>
            <p className="text-gray-600 mt-2">Manage your construction projects and materials</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.totalValue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.statusBreakdown.find(s => s._id === 'in-progress')?.count || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        </div>
        <div className="card-content">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first construction project</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Create Project
              </button>
            </div>
          ) : (
            <ProjectList
              projects={projects}
              onEdit={handleProjectUpdate}
              onDelete={handleProjectDelete}
              onView={(id) => navigate(`/project/${id}`)}
              getStatusColor={getStatusColor}
            />
          )}
        </div>
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProjectForm
              onSubmit={handleProjectCreate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;