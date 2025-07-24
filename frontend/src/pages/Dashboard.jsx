// Dashboard.jsx - Mobile Responsive with Green Theme
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building, MapPin, Calendar, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { projectAPI } from '../api/axios';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-MR', options);
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

  const handleProjectEdit = (id, project) => {
    // Transform project data to match form fields
    const projectForEditing = {
      nom: project.name || project.nom || '',
      emplacement: project.location || project.emplacement || '',
      description: project.description || '',
      statut: project.status || project.statut || 'planning',
      budget: project.budget || 0,
      dateDebut: project.startDate ? project.startDate.split('T')[0] : '',
      dateFin: project.endDate ? project.endDate.split('T')[0] : '',
      notes: project.notes || ''
    };
    
    setEditingProject({ id, data: projectForEditing });
    setShowForm(true);
  };

  const handleProjectUpdate = async (projectData) => {
    if (!editingProject) return;
    
    try {
      await projectAPI.update(editingProject.id, projectData);
      toast.success('Projet mis à jour avec succès');
      setShowForm(false);
      setEditingProject(null);
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

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleFormSubmit = (projectData) => {
    if (editingProject) {
      handleProjectUpdate(projectData);
    } else {
      handleProjectCreate(projectData);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-emerald-100 text-emerald-800',
      completed: 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full animate-spin border-emerald-500 border-t-transparent"></div>
          <p className="font-medium text-emerald-700">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-8">
        {/* Dashboard Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <h1 className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                <div className="p-2 shadow-lg bg-emerald-500 rounded-xl">
                  <Building className="w-6 h-6 text-white sm:h-8 sm:w-8" />
                </div>
                <span className="break-words">Tableau de Bord des Projets</span>
              </h1>
              <p className="text-sm text-gray-600 sm:text-base">Gérez tous vos projets de construction en un seul endroit</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium min-h-[48px] w-full lg:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau Projet</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:mb-8">
            <div className="p-4 bg-white border-2 border-gray-100 shadow-lg rounded-2xl sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium text-gray-600">Nombre Total de Projets</p>
                  <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{stats.totalProjects}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Building className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white border-2 border-gray-100 shadow-lg rounded-2xl sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="mb-1 text-sm font-medium text-gray-600">Valeur Totale des Projets</p>
                  <p className="text-xl font-bold text-gray-900 break-words sm:text-2xl">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white border-2 border-gray-100 shadow-lg rounded-2xl sm:col-span-2 lg:col-span-1 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium text-gray-600">Projets en Cours</p>
                  <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {stats.statusBreakdown?.find(s => s._id === 'in-progress')?.count || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="bg-white border-2 border-gray-100 shadow-lg rounded-2xl">
          <div className="flex flex-col items-start justify-between gap-4 p-4 border-b border-gray-200 sm:p-6 sm:flex-row sm:items-center">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 sm:text-xl">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              Liste des Projets
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors font-medium min-h-[40px] w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Projet</span>
            </button>
          </div>
          
          <div className="p-0 sm:p-6">
            {projects.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-bold text-gray-900">Aucun projet enregistré</h3>
                <p className="mb-6 text-gray-600">Commencez par créer votre premier projet de construction</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white transition-colors shadow-lg bg-emerald-600 hover:bg-emerald-700 rounded-xl hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Créer un Nouveau Projet
                </button>
              </div>
            ) : (
              <ProjectList
                projects={projects}
                onEdit={handleProjectEdit}
                onDelete={handleProjectDelete}
                onView={(id) => navigate(`/project/${id}`)}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            )}
          </div>
        </div>

        {/* Project Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black bg-opacity-50 sm:items-center sm:p-4">
            <div className="bg-white w-full h-full sm:h-auto sm:rounded-2xl sm:w-full sm:max-w-5xl sm:max-h-[95vh] overflow-y-auto">
              <ProjectForm
                initialData={editingProject?.data}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;