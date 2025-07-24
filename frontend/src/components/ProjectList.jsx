import React from 'react';
import { Eye, Edit3, Trash2, MapPin, Calendar, DollarSign, Building } from 'lucide-react';

const ProjectList = ({ projects, onEdit, onDelete, onView, getStatusColor }) => {
  const getStatusText = (status) => {
    const statusTexts = {
      planning: 'Planification',
      'in-progress': 'En cours',
      completed: 'Terminé',
      'on-hold': 'En attente'
    };
    return statusTexts[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      planning: '📋',
      'in-progress': '🔨',
      completed: '✅',
      'on-hold': '⏸️'
    };
    return icons[status] || '📋';
  };

  const getStatusColorClass = (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-emerald-100 text-emerald-800',
      completed: 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (projects.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg text-gray-600">Aucun projet trouvé</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {projects.map((project) => (
        <div
          key={project._id}
          className="p-4 transition-all duration-300 bg-white border-2 border-gray-100 rounded-2xl sm:p-6 hover:shadow-xl hover:border-emerald-200"
        >
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
            {/* Informations principales */}
            <div className="flex-1 w-full">
              {/* En-tête du projet */}
              <div className="flex flex-col items-start gap-3 mb-4 sm:flex-row sm:items-center">
                <div className="flex items-center flex-1 gap-3">
                  <Building className="flex-shrink-0 w-6 h-6 text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900 break-words sm:text-xl">
                    {project.name || project.nom}
                  </h3>
                </div>
                <span className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColorClass(project.status || project.statut)}`}>
                  {getStatusIcon(project.status || project.statut)} {getStatusText(project.status || project.statut)}
                </span>
              </div>

              {/* Détails du projet - Mobile First Grid */}
              <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="flex-shrink-0 w-5 h-5 text-emerald-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600">Emplacement</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{project.location || project.emplacement}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                  <DollarSign className="flex-shrink-0 w-5 h-5 text-emerald-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-emerald-700">Coût total</p>
                    <p className="text-sm font-bold text-emerald-800">
                      {(project.totalCost || project.coutTotal || 0).toLocaleString()} MRU
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl sm:col-span-2 lg:col-span-1">
                  <Calendar className="flex-shrink-0 w-5 h-5 text-emerald-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600">Date de création</p>
                    <p className="text-sm font-bold text-gray-900">
                      {project.createdAt 
                        ? new Date(project.createdAt).toLocaleDateString('fr-FR')
                        : 'Non définie'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates du projet */}
              {(project.startDate || project.endDate) && (
                <div className="flex flex-col gap-2 mb-4 text-sm sm:flex-row sm:gap-4">
                  {project.startDate && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
                      <span>🚀</span>
                      <span className="font-medium text-blue-700">Début:</span>
                      <span className="font-bold text-blue-900">
                        {new Date(project.startDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50">
                      <span>🏁</span>
                      <span className="font-medium text-orange-700">Fin prévue:</span>
                      <span className="font-bold text-orange-900">
                        {new Date(project.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {(project.description || project.notes) && (
                <div className="p-3 mb-4 bg-gray-50 rounded-xl">
                  <p className="mb-1 text-sm font-medium text-gray-600">Description</p>
                  <p className="text-sm leading-relaxed text-gray-800 line-clamp-2">
                    {project.description || project.notes}
                  </p>
                </div>
              )}

              {/* Statistiques rapides */}
              {project.materialsCount !== undefined && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    📦 <span className="font-medium">{project.materialsCount || 0} matériaux</span>
                  </span>
                  {project.budget && (
                    <span className="flex items-center gap-1">
                      💰 <span className="font-medium">Budget: {project.budget.toLocaleString()} MRU</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-row w-full gap-2 lg:flex-col lg:w-auto">
              <button
                onClick={() => onView(project._id)}
                className="flex items-center justify-center gap-2 px-4 py-3 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 min-h-[48px] flex-1 lg:flex-initial lg:min-w-[120px]"
                title="Voir le projet"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Voir</span>
              </button>

              <button
                onClick={() => onEdit(project._id, project)}
                className="flex items-center justify-center gap-2 px-4 py-3 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-100 min-h-[48px] flex-1 lg:flex-initial lg:min-w-[120px]"
                title="Modifier le projet"
              >
                <Edit3 className="w-4 h-4" />
                <span className="text-sm font-medium">Modifier</span>
              </button>

              <button
                onClick={() => onDelete(project._id)}
                className="flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-100 min-h-[48px] flex-1 lg:flex-initial lg:min-w-[120px]"
                title="Supprimer le projet"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Supprimer</span>
              </button>
            </div>
          </div>

          {/* Barre de progression (si applicable) */}
          {project.status === 'in-progress' && project.startDate && project.endDate && (
            <div className="pt-4 mt-6 border-t border-gray-200">
              <div className="flex justify-between mb-2 text-sm text-gray-600">
                <span className="font-medium">Progression estimée</span>
                <span className="font-bold">{calculateProgress(project.startDate, project.endDate)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div
                  className="h-3 transition-all duration-500 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${calculateProgress(project.startDate, project.endDate)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Résumé global */}
      <div className="p-4 mt-8 border-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 rounded-2xl sm:p-6">
        <h4 className="mb-4 text-lg font-bold text-center text-emerald-900 sm:text-xl">📊 Résumé des projets</h4>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <p className="mb-1 text-sm font-medium text-emerald-700">Total des projets</p>
            <p className="text-xl font-bold text-emerald-900 sm:text-2xl">{projects.length}</p>
          </div>
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <p className="mb-1 text-sm font-medium text-emerald-700">Valeur totale</p>
            <p className="text-lg font-bold text-emerald-800 sm:text-xl">
              {projects.reduce((total, project) => 
                total + (project.totalCost || project.coutTotal || 0), 0
              ).toLocaleString()} MRU
            </p>
          </div>
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <p className="mb-1 text-sm font-medium text-emerald-700">Projets actifs</p>
            <p className="text-xl font-bold text-emerald-900 sm:text-2xl">
              {projects.filter(p => (p.status || p.statut) === 'in-progress').length}
            </p>
          </div>
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <p className="mb-1 text-sm font-medium text-emerald-700">Projets terminés</p>
            <p className="text-xl font-bold text-emerald-900 sm:text-2xl">
              {projects.filter(p => (p.status || p.statut) === 'completed').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fonction utilitaire pour calculer la progression
const calculateProgress = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const total = end - start;
  const elapsed = now - start;
  
  return Math.round((elapsed / total) * 100);
};

export default ProjectList;