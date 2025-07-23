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
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucun matériau ajouté</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materials.map((material) => (
        <div
          key={material._id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex justify-between items-start">
            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getCategoryIcon(material.category)}</span>
                <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {getCategoryText(material.category)}
                </span>
              </div>

              {/* Détails du matériau */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Quantité</p>
                    <p className="font-medium">
                      {material.quantity} {getUnitText(material.unit)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Prix unitaire</p>
                    <p className="font-medium">{material.pricePerUnit} MRU</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="text-sm text-gray-600">Prix total</p>
                    <p className="font-bold text-green-700">
                      {(material.quantity * material.pricePerUnit).toFixed(2)} MRU
                    </p>
                  </div>
                </div>

                {material.supplier && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Fournisseur</p>
                      <p className="font-medium">{material.supplier}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {material.description && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-gray-50 rounded-md">
                  <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-700 text-sm">{material.description}</p>
                  </div>
                </div>
              )}

              {/* Date d'ajout */}
              {material.createdAt && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Ajouté le {new Date(material.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>

            {/* Bouton de suppression */}
            <button
              onClick={() => onDelete(material._id)}
              className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Supprimer ce matériau"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}

      {/* Résumé total */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-blue-900 mb-2">📊 Résumé des matériaux</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Nombre total d'articles</p>
            <p className="font-bold text-blue-900 text-lg">{materials.length}</p>
          </div>
          <div>
            <p className="text-blue-700">Coût total des matériaux</p>
            <p className="font-bold text-blue-900 text-lg">
              {materials.reduce((total, material) => 
                total + (material.quantity * material.pricePerUnit), 0
              ).toFixed(2)} MRU
            </p>
          </div>
          <div>
            <p className="text-blue-700">Catégories représentées</p>
            <p className="font-bold text-blue-900 text-lg">
              {new Set(materials.map(m => m.category)).size}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialList;