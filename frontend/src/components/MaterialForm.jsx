import React from 'react';
import { useForm } from 'react-hook-form';

const MaterialForm = ({ onSubmit, onCancel, projectId }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const watchQuantite = watch('quantite', 1);
  const watchPrixUnitaire = watch('prixUnitaire', 0);

  const onFormSubmit = (data, e) => {
    e?.preventDefault();
    
    console.log('=== MaterialForm: Form submitted ===');
    console.log('Raw form data:', data);
    console.log('Project ID:', projectId);
    
    // Check if projectId exists
    if (!projectId) {
      console.error('ERROR: Project ID is missing!');
      alert('Erreur: ID du projet manquant');
      return;
    }
    
    // Transform data to match backend expectations (English field names)
    const transformedData = {
      projectId: projectId,
      name: data.nom,
      category: data.categorie,
      quantity: Number(data.quantite),
      unit: data.unite,
      pricePerUnit: Number(data.prixUnitaire),
      supplier: data.fournisseur || '',
      description: data.description || ''
    };
    
    console.log('Transformed data being sent:', transformedData);
    
    // Validate required fields
    if (!transformedData.name || !transformedData.category || !transformedData.quantity || !transformedData.unit || !transformedData.pricePerUnit) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Check if onSubmit function exists
    if (typeof onSubmit !== 'function') {
      console.error('ERROR: onSubmit is not a function!');
      alert('Erreur: fonction onSubmit manquante');
      return;
    }
    
    try {
      onSubmit(transformedData);
    } catch (error) {
      console.error('ERROR in onSubmit:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Ajouter un Nouveau Matériau</h3>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        
        {/* Nom du matériau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du matériau *
          </label>
          <input
            {...register('nom', { required: 'Le nom est requis' })}
            placeholder="Entrez le nom du matériau"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.nom && <span className="text-red-500 text-sm mt-1">{errors.nom.message}</span>}
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie *
          </label>
          <select
            {...register('categorie', { required: 'La catégorie est requise' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionnez une catégorie</option>
            <option value="construction">Construction</option>
            <option value="electrical">Électrique</option>
            <option value="plumbing">Plomberie</option>
            <option value="finishing">Finition</option>
            <option value="other">Autre</option>
          </select>
          {errors.categorie && <span className="text-red-500 text-sm mt-1">{errors.categorie.message}</span>}
        </div>

        {/* Quantité et Unité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité *
            </label>
            <input
              type="number"
              {...register('quantite', { 
                required: 'La quantité est requise',
                min: { value: 0.01, message: 'La quantité doit être supérieure à 0' }
              })}
              placeholder="Entrez la quantité"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.quantite && <span className="text-red-500 text-sm mt-1">{errors.quantite.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unité *
            </label>
            <select
              {...register('unite', { required: "L'unité est requise" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez une unité</option>
              <option value="sqm">m² (mètres carrés)</option>
              <option value="kg">kg (kilogrammes)</option>
              <option value="unit">unité</option>
              <option value="m3">m³ (mètres cubes)</option>
              <option value="ton">tonne</option>
              <option value="liter">litre</option>
              <option value="meter">mètre</option>
              <option value="piece">pièce</option>
            </select>
            {errors.unite && <span className="text-red-500 text-sm mt-1">{errors.unite.message}</span>}
          </div>
        </div>

        {/* Prix par unité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix par unité (MRU) *
          </label>
          <input
            type="number"
            step="0.01"
            {...register('prixUnitaire', { 
              required: 'Le prix est requis',
              min: { value: 0.01, message: 'Le prix doit être supérieur à 0' }
            })}
            placeholder="Entrez le prix par unité"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.prixUnitaire && <span className="text-red-500 text-sm mt-1">{errors.prixUnitaire.message}</span>}
        </div>

        {/* Fournisseur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fournisseur
          </label>
          <input
            {...register('fournisseur')}
            placeholder="Entrez le nom du fournisseur (optionnel)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Calcul du coût total */}
        <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
          <p className="font-medium text-blue-900 mb-1">Calcul du coût total :</p>
          <div className="text-lg">
            <span className="text-blue-700">{watchQuantite || 0}</span>
            <span className="text-blue-600 mx-2">×</span>
            <span className="text-blue-700">{watchPrixUnitaire || 0} MRU</span>
            <span className="text-blue-600 mx-2">=</span>
            <span className="font-bold text-blue-900">
              {((watchQuantite || 0) * (watchPrixUnitaire || 0)).toFixed(2)} MRU
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description / Notes
          </label>
          <textarea
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ajoutez une description ou des notes supplémentaires (optionnel)"
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              console.log('Cancel button clicked');
              if (typeof onCancel === 'function') {
                onCancel();
              } else {
                console.error('onCancel is not a function');
              }
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Ajouter le Matériau
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialForm;