// ProjectList.jsx - Final Version - Mobile Responsive with Budget & Dates Support
import React from 'react';
import { Eye, Edit3, Trash2, MapPin, Calendar, DollarSign, Building, Hammer, CheckCircle } from 'lucide-react';

const ProjectList = ({ projects, onEdit, onDelete, onView, getStatusColor }) => {
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
    return new Date(dateString).toLocaleDateString('fr-FR');
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

  const getStatusIcon = (status) => {
    const icons = {
      planning: '📋',
      'in-progress': <Hammer className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
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
          {/* Project Header */}
          <div className="flex flex-col items-start justify-between gap-3 mb-6 sm:flex-row sm:items-center">
            <div className="flex items-center flex-1 gap-3">
              <Building className="flex-shrink-0 w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-bold text-gray-900 break-words sm:text-xl">
                {project.name || project.nom}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(project.status || project.statut)}
              <span className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColorClass(project.status || project.statut)}`}>
                {getStatusText(project.status || project.statut)}
              </span>
            </div>
          </div>

          {/* Project Details Grid - Responsive */}
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Location */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-gray-600">Emplacement</span>
              </div>
              <p className="text-sm font-bold text-gray-900 break-words">
                {project.location || project.emplacement || 'Non spécifié'}
              </p>
            </div>

            {/* Budget estimé */}
            {project.budget && project.budget > 0 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600">💰</span>
                  <span className="text-xs font-medium text-blue-700">Budget estimé</span>
                </div>
                <p className="text-sm font-bold text-blue-800">
                  {formatCurrency(project.budget)}
                </p>
              </div>
            )}

            {/* Coût réel */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Coût réel</span>
              </div>
              <p className="text-sm font-bold text-emerald-800">
                {formatCurrency(project.totalCost || project.coutTotal || 0)}
              </p>
            </div>

            {/* Nombre de matériaux */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-600">📦</span>
                <span className="text-xs font-medium text-gray-600">Matériaux</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {project.materials?.length || project.materialsCount || 0}
              </p>
            </div>

            {/* Date de début */}
            {project.startDate && (
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Date de début</span>
                </div>
                <p className="text-sm font-bold text-blue-900">
                  {formatDate(project.startDate)}
                </p>
              </div>
            )}

            {/* Date de fin */}
            {project.endDate && (
              <div className="p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-700">Date de fin</span>
                </div>
                <p className="text-sm font-bold text-orange-900">
                  {formatDate(project.endDate)}
                </p>
              </div>
            )}

            {/* Durée du projet */}
            {project.startDate && project.endDate && (
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-600">⏱️</span>
                  <span className="text-xs font-medium text-purple-700">Durée</span>
                </div>
                <p className="text-sm font-bold text-purple-900">
                  {Math.ceil(
                    (new Date(project.endDate) - new Date(project.startDate)) / 
                    (1000 * 60 * 60 * 24)
                  )} jours
                </p>
              </div>
            )}

            {/* Date de création */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">Créé le</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {formatDate(project.createdAt)}
              </p>
            </div>
          </div>

          {/* Comparaison budgétaire - si budget existe */}
          {project.budget && project.budget > 0 && (
            <div className="p-4 mb-6 border border-blue-200 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
              <div className="flex flex-col items-start justify-between gap-3 mb-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Utilisation du budget:</span>
                  <span className="px-2 py-1 font-medium text-blue-700 bg-blue-100 rounded">
                    {formatCurrency(project.budget)} (estimé)
                  </span>
                  <span className="text-gray-500">vs</span>
                  <span className="px-2 py-1 font-medium rounded text-emerald-700 bg-emerald-100">
                    {formatCurrency(project.totalCost || 0)} (réel)
                  </span>
                </div>
                <div className="text-sm font-bold">
                  {(project.totalCost || 0) > project.budget ? (
                    <span className="px-2 py-1 text-red-600 rounded bg-red-50">
                      Dépassement: +{formatCurrency((project.totalCost || 0) - project.budget)}
                    </span>
                  ) : (project.totalCost || 0) < project.budget ? (
                    <span className="px-2 py-1 text-green-600 rounded bg-green-50">
                      Économie: -{formatCurrency(project.budget - (project.totalCost || 0))}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-gray-600 rounded bg-gray-50">Équilibré</span>
                  )}
                </div>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    (project.totalCost || 0) > project.budget 
                      ? 'bg-gradient-to-r from-red-400 to-red-600' 
                      : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                  }`}
                  style={{ 
                    width: `${Math.min(((project.totalCost || 0) / project.budget) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                <span>0%</span>
                <span className="font-medium">
                  {(((project.totalCost || 0) / project.budget) * 100).toFixed(1)}% utilisé
                </span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Description */}
          {(project.description || project.notes) && (
            <div className="p-4 mb-6 bg-gray-50 rounded-xl">
              <p className="mb-2 text-sm font-medium text-gray-600">Description</p>
              <p className="text-sm leading-relaxed text-gray-800 line-clamp-3">
                {project.description || project.notes}
              </p>
            </div>
          )}

          {/* Barre de progression temporelle pour projets en cours */}
          {project.status === 'in-progress' && project.startDate && project.endDate && (
            <div className="pt-4 mb-6 border-t border-gray-200">
              <div className="flex justify-between mb-2 text-sm text-gray-600">
                <span className="font-medium">Progression temporelle</span>
                <span className="font-bold">{calculateProgress(project.startDate, project.endDate)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div
                  className="h-3 transition-all duration-500 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${calculateProgress(project.startDate, project.endDate)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <span>{formatDate(project.startDate)}</span>
                <span>{formatDate(project.endDate)}</span>
              </div>
            </div>
          )}

          {/* Boutons d'action - Mobile Responsive */}
          <div className="flex flex-col justify-end gap-3 pt-4 border-t border-gray-200 sm:flex-row">
            <button
              onClick={() => onView(project._id)}
              className="flex items-center justify-center gap-2 px-4 py-3 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 min-h-[48px] font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Voir les détails</span>
            </button>

            <button
              onClick={() => onEdit(project._id, project)}
              className="flex items-center justify-center gap-2 px-4 py-3 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-100 min-h-[48px] font-medium"
            >
              <Edit3 className="w-4 h-4" />
              <span>Modifier</span>
            </button>

            <button
              onClick={() => onDelete(project._id)}
              className="flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-100 min-h-[48px] font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </button>
          </div>
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
              {formatCurrency(projects.reduce((total, project) => 
                total + (project.totalCost || project.coutTotal || 0), 0
              ))}
            </p>
          </div>
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <p className="mb-1 text-sm font-medium text-emerald-700">Projets actifs</p>
            <p className="text-xl font-bold text-emerald-900 sm:text-2xl">
              {projects.filter(p => (p.status || p.statut) === 'in-progress').length}
            </p>
          </div>
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <p className="mb-1 text-sm font-medium text-emerald-700">Budget total estimé</p>
            <p className="text-lg font-bold text-blue-800 sm:text-xl">
              {formatCurrency(projects.reduce((total, project) => 
                total + (project.budget || 0), 0
              ))}
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