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

  // Format currency for MRU (Mauritanian Ouguiya)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MR', {
      style: 'currency',
      currency: 'MRU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Translate status to French
  const getStatusText = (status) => {
    const statusMap = {
      'planning': 'Planification',
      'in-progress': 'En Cours',
      'completed': 'Terminé',
      'on-hold': 'En Attente'
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data.data || response.data);
    } catch (error) {
      toast.error('Échec du chargement des projets');
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await projectAPI.getStats();
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
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
      console.error('Erreur lors de la création du projet:', error);
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
      console.error('Erreur lors de la mise à jour du projet:', error);
    }
  };

  const handleProjectDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action supprimera également tous les matériaux associés et est irréversible.')) {
      return;
    }

    try {
      await projectAPI.delete(id);
      toast.success('Projet supprimé avec succès');
      fetchProjects();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Échec de la suppression du projet');
      console.error('Erreur lors de la suppression du projet:', error);
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
      {/* En-tête du tableau de bord */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-600" />
              Tableau de Bord des Projets
            </h1>
            <p className="text-gray-600 mt-2">Gérez tous vos projets de construction en un seul endroit</p>
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

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nombre Total de Projets</p>
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
                  <p className="text-sm text-gray-600">Valeur Totale des Projets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalValue)}
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
                  <p className="text-sm text-gray-600">Projets en Cours</p>
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
        <div className="card-header flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Liste des Projets</h2>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un Projet
          </button>
        </div>
        <div className="card-content">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet enregistré</h3>
              <p className="text-gray-600 mb-4">Commencez par créer votre premier projet de construction</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Créer un Nouveau Projet
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
              formatCurrency={formatCurrency}
            />
          )}
        </div>
      </div>

      {/* Modal de création/modification de projet */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
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