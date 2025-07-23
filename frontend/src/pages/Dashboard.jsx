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
      toast.error('Échec du chargement des projets');
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
      toast.success('Projet créé avec succès');
      setShowForm(false);
      fetchProjects();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Échec de la création du projet');
      console.error('Error creating project:', error);
    }
  };

  const handleProjectUpdate = async (id, projectData) => {
    try {
      await projectAPI.update(id, projectData);
      toast.success('Projet mis à jour avec succès');
      fetchProjects();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Échec de la mise à jour du projet');
      console.error('Error updating project:', error);
    }
  };

  const handleProjectDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cela supprimera également tous les matériaux associés.')) {
      return;
    }

    try {
      await projectAPI.delete(id);
      toast.success('Projet supprimé avec succès');
      fetchProjects();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Échec de la suppression du projet');
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

  const getStatusText = (status) => {
    const statusTexts = {
      planning: 'Planification',
      'in-progress': 'En cours',
      completed: 'Terminé',
      'on-hold': 'En attente'
    };
    return statusTexts[status] || status;
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
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-600" />
              Gestionnaire de Construction
            </h1>
            <p className="text-gray-600 mt-2">Gérez vos projets de construction et matériaux</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nouveau Projet
          </button>
        </div>
      </div>

      {/* Cartes de Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total des Projets</p>
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
                  <p className="text-sm text-gray-600">Valeur Totale</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalValue.toLocaleString()} MRU
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
                  <p className="text-sm text-gray-600">Projets Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.statusBreakdown?.find(s => s._id === 'in-progress')?.count || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des Projets */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Projets</h2>
        </div>
        <div className="card-content">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet pour le moment</h3>
              <p className="text-gray-600 mb-4">Commencez par créer votre premier projet de construction</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Créer un Projet
              </button>
            </div>
          ) : (
            <ProjectList
              projects={projects}
              onEdit={handleProjectUpdate}
              onDelete={handleProjectDelete}
              onView={(id) => navigate(`/project/${id}`)}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          )}
        </div>
      </div>

      {/* Modal du Formulaire de Projet */}
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