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

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucun projet trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project._id}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
        >
          <div className="flex justify-between items-start">
            {/* Informations principales */}
            <div className="flex-1">
              {/* En-tête du projet */}
              <div className="flex items-center gap-3 mb-3">
                <Building className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  {project.name || project.nom}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status || project.statut)}`}>
                  {getStatusIcon(project.status || project.statut)} {getStatusText(project.status || project.statut)}
                </span>
              </div>

              {/* Détails du projet */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Emplacement</p>
                    <p className="font-medium">{project.location || project.emplacement}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Coût total</p>
                    <p className="font-medium text-green-700">
                      {(project.totalCost || project.coutTotal || 0).toLocaleString()} MRU
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Date de création</p>
                    <p className="font-medium">
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
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  {project.startDate && (
                    <div className="flex items-center gap-1">
                      <span>🚀</span>
                      <span className="text-gray-600">Début:</span>
                      <span className="font-medium">
                        {new Date(project.startDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="flex items-center gap-1">
                      <span>🏁</span>
                      <span className="text-gray-600">Fin prévue:</span>
                      <span className="font-medium">
                        {new Date(project.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {(project.description || project.notes) && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {project.description || project.notes}
                  </p>
                </div>
              )}

              {/* Statistiques rapides */}
              {project.materialsCount !== undefined && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📦 {project.materialsCount || 0} matériaux</span>
                  {project.budget && (
                    <span>💰 Budget: {project.budget.toLocaleString()} MRU</span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={() => onView(project._id)}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Voir le projet"
              >
                <Eye className="h-4 w-4" />
                <span className="text-sm">Voir</span>
              </button>

              <button
                onClick={() => onEdit(project._id, project)}
                className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Modifier le projet"
              >
                <Edit3 className="h-4 w-4" />
                <span className="text-sm">Modifier</span>
              </button>

              <button
                onClick={() => onDelete(project._id)}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Supprimer le projet"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">Supprimer</span>
              </button>
            </div>
          </div>

          {/* Barre de progression (si applicable) */}
          {project.status === 'in-progress' && project.startDate && project.endDate && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progression estimée</span>
                <span>{calculateProgress(project.startDate, project.endDate)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${calculateProgress(project.startDate, project.endDate)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Résumé global */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">📊 Résumé des projets</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total des projets</p>
            <p className="font-bold text-gray-900 text-lg">{projects.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Valeur totale</p>
            <p className="font-bold text-green-700 text-lg">
              {projects.reduce((total, project) => 
                total + (project.totalCost || project.coutTotal || 0), 0
              ).toLocaleString()} MRU
            </p>
          </div>
          <div>
            <p className="text-gray-600">Projets actifs</p>
            <p className="font-bold text-blue-700 text-lg">
              {projects.filter(p => (p.status || p.statut) === 'in-progress').length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Projets terminés</p>
            <p className="font-bold text-green-700 text-lg">
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