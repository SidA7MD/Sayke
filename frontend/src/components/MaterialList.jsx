import React from 'react';
import { Trash2, Package, User, FileText, Tag } from 'lucide-react';

const MaterialList = ({ materials, onDelete }) => {
  const getCategoryIcon = (category) => {
    const icons = {
      construction: '🏗️',
      electrical: '⚡',
      plumbing: '🔧',
      finishing: '🎨',
      other: '📦'
    };
    return icons[category] || '📦';
  };

  const getCategoryText = (category) => {
    const categories = {
      construction: 'Construction',
      electrical: 'Électrique',
      plumbing: 'Plomberie',
      finishing: 'Finition',
      other: 'Autre'
    };
    return categories[category] || category;
  };

  const getUnitText = (unit) => {
    const units = {
      sqm: 'm²',
      kg: 'kg',
      unit: 'unité',
      m3: 'm³',
      ton: 'tonne',
      liter: 'litre',
      meter: 'mètre',
      piece: 'pièce'
    };
    return units[unit] || unit;
  };

  if (materials.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg text-gray-600">Aucun matériau ajouté</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {materials.map((material) => (
        <div
          key={material._id}
          className="p-4 transition-all duration-300 bg-white border-2 border-gray-100 rounded-2xl sm:p-6 hover:shadow-xl hover:border-emerald-200"
        >
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            {/* Informations principales */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{getCategoryIcon(material.category)}</span>
                <h3 className="flex-1 text-lg font-bold text-gray-900 sm:text-xl">{material.name}</h3>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap">
                  {getCategoryText(material.category)}
                </span>
              </div>

              {/* Détails du matériau - Mobile First Grid */}
              <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Package className="flex-shrink-0 w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-600">Quantité</p>
                    <p className="font-bold text-gray-900">
                      {material.quantity} {getUnitText(material.unit)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Tag className="flex-shrink-0 w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-600">Prix unitaire</p>
                    <p className="font-bold text-gray-900">{material.pricePerUnit} MRU</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                  <span className="flex-shrink-0 text-xl">💰</span>
                  <div>
                    <p className="text-xs font-medium text-emerald-700">Prix total</p>
                    <p className="text-lg font-bold text-emerald-800">
                      {(material.quantity * material.pricePerUnit).toFixed(2)} MRU
                    </p>
                  </div>
                </div>

                {material.supplier && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <User className="flex-shrink-0 w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-600">Fournisseur</p>
                      <p className="text-sm font-bold text-gray-900">{material.supplier}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {material.description && (
                <div className="flex items-start gap-3 p-4 mt-4 bg-gray-50 rounded-xl">
                  <FileText className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="mb-1 text-sm font-medium text-gray-600">Description</p>
                    <p className="text-sm leading-relaxed text-gray-800">{material.description}</p>
                  </div>
                </div>
              )}

              {/* Date d'ajout */}
              {material.createdAt && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500">
                    Ajouté le {new Date(material.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>

            {/* Bouton de suppression */}
            <button
              onClick={() => onDelete(material._id)}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-100 min-h-[48px] w-full sm:w-auto sm:min-w-[48px] flex items-center justify-center"
              title="Supprimer ce matériau"
            >
              <Trash2 className="w-5 h-5" />
              <span className="ml-2 sm:hidden">Supprimer</span>
            </button>
          </div>
        </div>
      ))}

      {/* Résumé total */}
      <div className="p-4 mt-8 border-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 rounded-2xl sm:p-6">
        <h4 className="mb-4 text-lg font-bold text-center text-emerald-900 sm:text-xl">📊 Résumé des matériaux</h4>
        <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
          <div className="p-4 bg-white shadow-sm rounded-xl">
            <p className="mb-1 text-sm font-medium text-emerald-700">Nombre total d'articles</p>
            <p className="text-2xl font-bold text-emerald-900 sm:text-3xl">{materials.length}</p>
          </div>
          <div className="p-4 bg-white shadow-sm rounded-xl">
            <p className="mb-1 text-sm font-medium text-emerald-700">Coût total des matériaux</p>
            <p className="text-xl font-bold text-emerald-900 sm:text-2xl">
              {materials.reduce((total, material) => 
                total + (material.quantity * material.pricePerUnit), 0
              ).toFixed(2)} MRU
            </p>
          </div>
          <div className="p-4 bg-white shadow-sm rounded-xl">
            <p className="mb-1 text-sm font-medium text-emerald-700">Catégories représentées</p>
            <p className="text-2xl font-bold text-emerald-900 sm:text-3xl">
              {new Set(materials.map(m => m.category)).size}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialList;