import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, materialAPI } from '../api/axios';
import { Building, MapPin, Calendar, DollarSign, ArrowLeft, Plus, Package } from 'lucide-react';
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
          <p className="font-medium text-emerald-700">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="px-6 py-4 text-red-800 border-2 border-red-200 bg-red-50 rounded-2xl">
          <strong>Erreur:</strong> Aucun identifiant de projet trouvé dans l'URL
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-emerald-600 mb-6 hover:text-emerald-800 transition-all duration-200 bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour à la liste des projets</span>
        </button>

        {project && (
          <>
            {/* Project Header */}
            <div className="mb-6 bg-white border-2 border-gray-100 shadow-lg rounded-2xl sm:mb-8">
              <div className="p-4 border-b border-gray-200 sm:p-6">
                <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 break-words sm:text-2xl">
                  <Building className="flex-shrink-0 w-6 h-6 sm:h-8 sm:w-8 text-emerald-600" />
                  {project.name || project.nom}
                </h2>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="flex-shrink-0 w-6 h-6 text-emerald-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">Emplacement</p>
                      <p className="font-bold text-gray-900 break-words">{project.location || project.emplacement}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="flex-shrink-0 w-6 h-6 text-emerald-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600">Statut</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(project.status || project.statut)}`}>
                        {getStatusText(project.status || project.statut || 'planning')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl sm:col-span-2 lg:col-span-1">
                    <DollarSign className="flex-shrink-0 w-6 h-6 text-emerald-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-emerald-700">Coût Total</p>
                      <p className="text-lg font-bold break-words text-emerald-800">
                        {formatCurrency(project.totalCost || project.coutTotal)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {(project.notes || project.description) && (
                  <div className="p-4 mt-6 bg-gray-50 rounded-xl">
                    <p className="mb-2 text-sm font-medium text-gray-600">Notes</p>
                    <p className="leading-relaxed text-gray-800 whitespace-pre-line">{project.notes || project.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:mb-8">
              <ExportButton projectId={id} projectName={project.name || project.nom} />
              <button
                onClick={() => setShowMaterialForm(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium min-h-[48px] w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter un Matériau</span>
              </button>
            </div>

            {/* Materials Section */}
            <div className="bg-white border-2 border-gray-100 shadow-lg rounded-2xl">
              <div className="flex flex-col items-start justify-between gap-4 p-4 border-b border-gray-200 sm:p-6 sm:flex-row sm:items-center">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 sm:text-xl">
                  <Package className="w-6 h-6 text-emerald-600" />
                  Liste des Matériaux
                </h3>
                <button
                  onClick={() => setShowMaterialForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors font-medium min-h-[40px] w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Matériau</span>
                </button>
              </div>
              
              <div className="p-0 sm:p-6">
                {materials.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h4 className="mb-2 text-lg font-bold text-gray-900">Aucun matériau ajouté</h4>
                    <p className="mb-6 text-gray-600">Commencez par ajouter votre premier matériau à ce projet</p>
                    <button
                      onClick={() => setShowMaterialForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white transition-colors shadow-lg bg-emerald-600 hover:bg-emerald-700 rounded-xl hover:shadow-xl"
                    >
                      <Plus className="w-5 h-5" />
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

        {/* Material Form Modal */}
        {showMaterialForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
    </div>
  );
};
export default ProjectPage;