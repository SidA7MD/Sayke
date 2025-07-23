import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, materialAPI } from '../api/axios';
import { Building, MapPin, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import MaterialForm from '../components/MaterialForm';
import MaterialList from '../components/MaterialList';
import toast from 'react-hot-toast';
import ExportButton from '../components/ExportButton';

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMaterialForm, setShowMaterialForm] = useState(false);

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
    if (id) {
      fetchProject();
      fetchMaterials();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.get(id);
      setProject(response.data.data || response.data);
    } catch (error) {
      toast.error('Échec du chargement du projet');
      console.error('Erreur lors du chargement du projet:', error);
      navigate('/');
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await materialAPI.getByProject(id);
      
      if (Array.isArray(response.data)) {
        setMaterials(response.data);
      } else if (response.data.data) {
        setMaterials(response.data.data);
      } else {
        setMaterials([]);
      }
    } catch (error) {
      toast.error('Échec du chargement des matériaux');
      console.error('Erreur lors du chargement des matériaux:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialCreate = async (materialData) => {
    try {
      const dataWithProject = {
        ...materialData,
        projectId: id
      };
      
      await materialAPI.create(dataWithProject);
      toast.success('Matériau ajouté avec succès');
      setShowMaterialForm(false);
      fetchMaterials();
      fetchProject();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du matériau:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error('Erreurs de validation: ' + errorMessages);
      } else if (error.response?.data?.message) {
        toast.error('Erreur: ' + error.response.data.message);
      } else {
        toast.error('Échec de l\'ajout du matériau');
      }
    }
  };

  const handleMaterialDelete = async (materialId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce matériau ? Cette action est irréversible.')) {
      return;
    }

    try {
      await materialAPI.delete(materialId);
      toast.success('Matériau supprimé avec succès');
      fetchMaterials();
      fetchProject();
    } catch (error) {
      toast.error('Échec de la suppression du matériau');
      console.error('Erreur lors de la suppression du matériau:', error);
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

  if (!id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erreur:</strong> Aucun identifiant de projet trouvé dans l'URL
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-800 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Retour à la liste des projets
      </button>

      {project && (
        <>
          {/* En-tête du projet */}
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Building className="h-6 w-6 text-blue-600" />
                {project.name || project.nom}
              </h2>
            </div>
            <div className="card-content grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Emplacement</p>
                  <p className="font-medium">{project.location || project.emplacement}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status || project.statut)}`}>
                    {getStatusText(project.status || project.statut || 'planning')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Coût Total</p>
                  <p className="font-medium">
                    {formatCurrency(project.totalCost || project.coutTotal)}
                  </p>
                </div>
              </div>
              
              {(project.notes || project.description) && (
                <div className="md:col-span-3">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-700 whitespace-pre-line">{project.notes || project.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <ExportButton projectId={id} />
            <button
              onClick={() => setShowMaterialForm(true)}
              className="btn btn-primary"
            >
              + Ajouter un Matériau
            </button>
          </div>

          {/* Section des matériaux */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Liste des Matériaux</h3>
              <button
                onClick={() => setShowMaterialForm(true)}
                className="btn btn-primary"
              >
                + Nouveau Matériau
              </button>
            </div>
            
            <div className="card-content">
              {materials.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Aucun matériau n'a été ajouté à ce projet</p>
                  <button
                    onClick={() => setShowMaterialForm(true)}
                    className="btn btn-primary"
                  >
                    Ajouter le premier matériau
                  </button>
                </div>
              ) : (
                <MaterialList
                  materials={materials}
                  onDelete={handleMaterialDelete}
                  formatCurrency={formatCurrency}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal du formulaire de matériau */}
      {showMaterialForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <MaterialForm
              projectId={id}
              onSubmit={handleMaterialCreate}
              onCancel={() => setShowMaterialForm(false)}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;