import React from 'react';
import { DollarSign, Package, TrendingUp, PieChart } from 'lucide-react';

const SummaryView = ({ project, materials, materialStats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MR', {
      style: 'currency',
      currency: 'MRU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTopMaterials = () => {
    return materials
      .sort((a, b) => b.totalPrice - a.totalPrice)
      .slice(0, 5);
  };

  const getCategoryStats = () => {
    if (!materialStats || !materialStats.categoryBreakdown) return [];
    return materialStats.categoryBreakdown;
  };

  const getStatusText = (status) => {
    const statusMap = {
      'planning': 'Planification',
      'in-progress': 'En cours',
      'completed': 'Terminé',
      'on-hold': 'En attente'
    };
    return statusMap[status] || status;
  };

  const getCategoryName = (category) => {
    const categoryMap = {
      'construction': 'Construction',
      'electrical': 'Électrique',
      'plumbing': 'Plomberie',
      'finishing': 'Finition',
      'other': 'Autre'
    };
    return categoryMap[category] || category;
  };

  const topMaterials = getTopMaterials();
  const categoryStats = getCategoryStats();

  return (
    <div className="p-4 space-y-6">
      {/* Aperçu du projet */}
      <div className="bg-white border-2 border-gray-100 shadow-lg rounded-2xl">
        <div className="p-4 border-b border-gray-200 sm:p-6">
          <h3 className="text-lg font-bold text-center text-gray-900 sm:text-xl">Aperçu du Projet</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="p-4 text-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 shadow-lg bg-emerald-500 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{materials.length}</p>
              <p className="text-sm font-medium text-gray-600">Matériaux Totaux</p>
            </div>
            
            <div className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-500 shadow-lg rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-900 break-words sm:text-xl">
                {formatCurrency(project.totalCost)}
              </p>
              <p className="text-sm font-medium text-gray-600">Coût Total</p>
            </div>
            
            <div className="p-4 text-center bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-teal-500 shadow-lg rounded-xl">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{categoryStats.length}</p>
              <p className="text-sm font-medium text-gray-600">Catégories</p>
            </div>
            
            <div className="p-4 text-center bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 shadow-lg bg-cyan-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-900 break-words sm:text-xl">
                {materials.length > 0 ? formatCurrency(project.totalCost / materials.length) : formatCurrency(0)}
              </p>
              <p className="text-sm font-medium text-gray-600">Coût Moyen/Matériau</p>
            </div>
          </div>
        </div>
      </div>

      {/* Répartition des coûts par catégorie */}
      {categoryStats.length > 0 && (
        <div className="bg-white border-2 border-gray-100 shadow-lg rounded-2xl">
          <div className="p-4 border-b border-gray-200 sm:p-6">
            <h3 className="text-lg font-bold text-center text-gray-900 sm:text-xl">Répartition des Coûts par Catégorie</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {categoryStats.map(category => {
                const percentage = ((category.totalCost / project.totalCost) * 100).toFixed(1);
                return (
                  <div key={category._id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex flex-col items-start justify-between gap-2 mb-3 sm:flex-row sm:items-center">
                      <span className="text-base font-bold text-gray-900">
                        {getCategoryName(category._id)}
                      </span>
                      <span className="px-3 py-1 text-sm font-medium rounded-full text-emerald-700 bg-emerald-100">
                        {formatCurrency(category.totalCost)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 mb-2 bg-gray-200 rounded-full">
                      <div
                        className="h-3 transition-all duration-500 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs font-medium text-gray-600">
                      {category.count} matériau{category.count !== 1 ? 'x' : ''} • 
                      Moyenne: {formatCurrency(category.avgPricePerUnit)}/unité
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Matériaux les plus chers */}
      {topMaterials.length > 0 && (
        <div className="bg-white border-2 border-gray-100 shadow-lg rounded-2xl">
          <div className="p-4 border-b border-gray-200 sm:p-6">
            <h3 className="text-lg font-bold text-center text-gray-900 sm:text-xl">Matériaux les Plus Chers</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {topMaterials.map((material, index) => (
                <div key={material._id} className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl">
                  <div className="flex items-center flex-1 gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 shadow-md bg-emerald-500 rounded-xl">
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-gray-900 truncate">{material.name}</h4>
                      <p className="text-sm font-medium text-gray-600">
                        {material.quantity} {material.unit} • {formatCurrency(material.pricePerUnit)}/unité
                      </p>
                    </div>
                  </div>
                  <div className="w-full text-left sm:text-right sm:w-auto">
                    <p className="text-lg font-bold text-emerald-800">{formatCurrency(material.totalPrice)}</p>
                    <p className="text-xs font-medium text-emerald-600">{getCategoryName(material.category)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Détails du projet */}
      <div className="bg-white border-2 border-gray-100 shadow-lg rounded-2xl">
        <div className="p-4 border-b border-gray-200 sm:p-6">
          <h3 className="text-lg font-bold text-center text-gray-900 sm:text-xl">Détails du Projet</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
              <h4 className="mb-4 font-bold text-center text-emerald-900">Informations de Base</h4>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-medium text-emerald-700">Nom:</span>
                  <span className="font-bold text-gray-900 break-words">{project.name}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-medium text-emerald-700">Emplacement:</span>
                  <span className="font-bold text-gray-900 break-words">{project.location}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-medium text-emerald-700">Statut:</span>
                  <span className="font-bold text-gray-900">{getStatusText(project.status)}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-medium text-emerald-700">Créé le:</span>
                  <span className="font-bold text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <h4 className="mb-4 font-bold text-center text-green-900">Résumé Financier</h4>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-medium text-green-700">Total Matériaux:</span>
                  <span className="font-bold text-gray-900">{materials.length}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-medium text-green-700">Coût Total:</span>
                  <span className="font-bold text-green-800">{formatCurrency(project.totalCost)}</span>
                </div>
                {materials.length > 0 && (
                  <>
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                      <span className="font-medium text-green-700">Matériau le Moins Cher:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(Math.min(...materials.map(m => m.totalPrice)))}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                      <span className="font-medium text-green-700">Matériau le Plus Cher:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(Math.max(...materials.map(m => m.totalPrice)))}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {project.notes && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <h4 className="mb-3 font-bold text-center text-gray-900">Notes</h4>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm leading-relaxed text-gray-700">{project.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryView;