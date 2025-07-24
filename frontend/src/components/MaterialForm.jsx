// MaterialForm.jsx - Mobile Responsive with Green Theme
import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

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
    
    if (!projectId) {
      console.error('ERROR: Project ID is missing!');
      alert('Erreur: ID du projet manquant');
      return;
    }
    
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
    
    if (!transformedData.name || !transformedData.category || !transformedData.quantity || !transformedData.unit || !transformedData.pricePerUnit) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
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
    <div className="h-full max-w-4xl mx-auto bg-white sm:rounded-2xl sm:shadow-xl">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 sm:hidden">
        <h3 className="text-lg font-bold text-gray-900">
          Ajouter un Matériau
        </h3>
        <button
          onClick={() => {
            if (typeof onCancel === 'function') {
              onCancel();
            }
          }}
          className="p-2 text-gray-400 transition-colors hover:text-gray-600 rounded-xl"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden sm:block">
        <h3 className="p-4 mb-6 text-xl font-bold text-center text-gray-900 sm:text-2xl sm:p-6">
          Ajouter un Nouveau Matériau
        </h3>
      </div>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 pb-20 space-y-4 sm:space-y-6 sm:p-6 sm:pb-6">
        
        {/* Nom du matériau */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Nom du matériau *
          </label>
          <input
            {...register('nom', { required: 'Le nom est requis' })}
            placeholder="Entrez le nom du matériau"
            className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
          />
          {errors.nom && <span className="block mt-1 text-sm text-red-500">{errors.nom.message}</span>}
        </div>

        {/* Catégorie */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Catégorie *
          </label>
          <select
            {...register('categorie', { required: 'La catégorie est requise' })}
            className="w-full px-4 py-4 text-base transition-all duration-200 bg-white border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
          >
            <option value="">Sélectionnez une catégorie</option>
            <option value="construction">Construction</option>
            <option value="electrical">Électrique</option>
            <option value="plumbing">Plomberie</option>
            <option value="finishing">Finition</option>
            <option value="other">Autre</option>
          </select>
          {errors.categorie && <span className="block mt-1 text-sm text-red-500">{errors.categorie.message}</span>}
        </div>

        {/* Quantité et Unité */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
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
              className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
            />
            {errors.quantite && <span className="block mt-1 text-sm text-red-500">{errors.quantite.message}</span>}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Unité *
            </label>
            <select
              {...register('unite', { required: "L'unité est requise" })}
              className="w-full px-4 py-4 text-base transition-all duration-200 bg-white border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
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
            {errors.unite && <span className="block mt-1 text-sm text-red-500">{errors.unite.message}</span>}
          </div>
        </div>

        {/* Prix par unité */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
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
            className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
          />
          {errors.prixUnitaire && <span className="block mt-1 text-sm text-red-500">{errors.prixUnitaire.message}</span>}
        </div>

        {/* Fournisseur */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Fournisseur
          </label>
          <input
            {...register('fournisseur')}
            placeholder="Entrez le nom du fournisseur (optionnel)"
            className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
          />
        </div>

        {/* Calcul du coût total */}
        <div className="p-4 border-2 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-emerald-100">
          <p className="mb-3 font-bold text-center text-emerald-900">Calcul du coût total :</p>
          <div className="text-lg text-center sm:text-xl">
            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
              <span className="font-semibold text-emerald-700">{watchQuantite || 0}</span>
              <span className="text-2xl text-emerald-600">×</span>
              <span className="font-semibold text-emerald-700">{watchPrixUnitaire || 0} MRU</span>
              <span className="text-2xl text-emerald-600">=</span>
              <span className="text-xl font-bold break-all text-emerald-900 sm:text-2xl">
                {((watchQuantite || 0) * (watchPrixUnitaire || 0)).toFixed(2)} MRU
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Description / Notes
          </label>
          <textarea
            {...register('description')}
            className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 resize-none sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
            rows={4}
            placeholder="Ajoutez une description ou des notes supplémentaires (optionnel)"
          />
        </div>

        {/* Boutons - Fixed at bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 sm:relative sm:border-t-0 sm:bg-transparent sm:p-0">
          <div className="flex flex-col justify-end gap-3 sm:flex-row sm:pt-6 sm:border-t sm:border-gray-200">
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
              className="w-full sm:w-auto px-6 py-4 sm:py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200 text-base font-medium min-h-[52px] sm:min-h-[48px]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-4 sm:py-3 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-200 text-base font-medium min-h-[52px] sm:min-h-[48px] shadow-lg hover:shadow-xl"
            >
              Ajouter le Matériau
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MaterialForm;