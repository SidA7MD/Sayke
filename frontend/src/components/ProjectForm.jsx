import React from 'react';
import { useForm } from 'react-hook-form';
import { Building, MapPin, Calendar, FileText, X } from 'lucide-react';

const ProjectForm = ({ onSubmit, onCancel, initialData = null }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: initialData || {}
  });

  const watchBudget = watch('budget', 0);

  const onFormSubmit = (data, e) => {
    e?.preventDefault();
    
    console.log('=== ProjectForm: Formulaire soumis ===');
    console.log('Données du formulaire:', data);
    
    // Transformer les données pour correspondre au backend
    const transformedData = {
      name: data.nom,
      location: data.emplacement,
      description: data.description || '',
      status: data.statut || 'planning',
      budget: Number(data.budget) || 0,
      startDate: data.dateDebut || null,
      endDate: data.dateFin || null,
      notes: data.notes || ''
    };
    
    console.log('Données transformées:', transformedData);
    
    // Validation des champs requis
    if (!transformedData.name || !transformedData.location) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Validation des dates
    if (transformedData.startDate && transformedData.endDate) {
      if (new Date(transformedData.startDate) > new Date(transformedData.endDate)) {
        alert('La date de fin doit être postérieure à la date de début');
        return;
      }
    }
    
    try {
      onSubmit(transformedData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const validateFutureDate = (date) => {
    if (!date) return true;
    return new Date(date) >= new Date() || "La date doit être dans le futur";
  };

  const validateEndDate = (endDate) => {
    const startDate = watch('dateDebut');
    if (!endDate || !startDate) return true;
    return new Date(endDate) > new Date(startDate) || "La date de fin doit être postérieure à la date de début";
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto">
      {/* En-tête du formulaire */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Modifier le Projet' : 'Créer un Nouveau Projet'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Corps du formulaire */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
        <div className="space-y-6">
          
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline h-4 w-4 mr-1" />
                Nom du projet *
              </label>
              <input
                {...register('nom', { 
                  required: 'Le nom du projet est requis',
                  minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' },
                  maxLength: { value: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
                })}
                placeholder="Ex: Construction Villa Moderne"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {errors.nom && <span className="text-red-500 text-sm mt-1 block">{errors.nom.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Emplacement *
              </label>
              <input
                {...register('emplacement', { 
                  required: 'L\'emplacement est requis',
                  minLength: { value: 2, message: 'L\'emplacement doit contenir au moins 2 caractères' }
                })}
                placeholder="Ex: Nouakchott, Tevragh Zeina"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {errors.emplacement && <span className="text-red-500 text-sm mt-1 block">{errors.emplacement.message}</span>}
            </div>
          </div>

          {/* Statut et Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Statut du projet
              </label>
              <select
                {...register('statut')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="planning">📋 Planification</option>
                <option value="in-progress">🔨 En cours</option>
                <option value="on-hold">⏸️ En attente</option>
                <option value="completed">✅ Terminé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💰 Budget estimé (MRU)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('budget', { 
                  min: { value: 0, message: 'Le budget doit être positif' }
                })}
                placeholder="Ex: 500000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {errors.budget && <span className="text-red-500 text-sm mt-1 block">{errors.budget.message}</span>}
              {watchBudget > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Budget formaté: {Number(watchBudget).toLocaleString()} MRU
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Date de début
              </label>
              <input
                type="date"
                {...register('dateDebut', {
                  validate: validateFutureDate
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {errors.dateDebut && <span className="text-red-500 text-sm mt-1 block">{errors.dateDebut.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏁 Date de fin prévue
              </label>
              <input
                type="date"
                {...register('dateFin', {
                  validate: validateEndDate
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {errors.dateFin && <span className="text-red-500 text-sm mt-1 block">{errors.dateFin.message}</span>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Description du projet
            </label>
            <textarea
              {...register('description', {
                maxLength: { value: 500, message: 'La description ne peut pas dépasser 500 caractères' }
              })}
              rows={4}
              placeholder="Décrivez brièvement votre projet de construction..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
            {errors.description && <span className="text-red-500 text-sm mt-1 block">{errors.description.message}</span>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 Notes additionnelles
            </label>
            <textarea
              {...register('notes', {
                maxLength: { value: 1000, message: 'Les notes ne peuvent pas dépasser 1000 caractères' }
              })}
              rows={3}
              placeholder="Ajoutez des notes spéciales, contraintes, ou informations importantes..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
            {errors.notes && <span className="text-red-500 text-sm mt-1 block">{errors.notes.message}</span>}
          </div>

          {/* Aperçu du projet */}
          {(watch('nom') || watch('emplacement')) && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">📋 Aperçu du projet :</h4>
              <div className="text-sm text-blue-800 space-y-1">
                {watch('nom') && <p><strong>Nom:</strong> {watch('nom')}</p>}
                {watch('emplacement') && <p><strong>Lieu:</strong> {watch('emplacement')}</p>}
                {watch('budget') && <p><strong>Budget:</strong> {Number(watch('budget')).toLocaleString()} MRU</p>}
                {watch('statut') && <p><strong>Statut:</strong> {
                  {
                    'planning': '📋 Planification',
                    'in-progress': '🔨 En cours',
                    'on-hold': '⏸️ En attente',
                    'completed': '✅ Terminé'
                  }[watch('statut')]
                }</p>}
              </div>
            </div>
          )}

        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
          >
            <Building className="h-4 w-4" />
            {initialData ? 'Mettre à jour le Projet' : 'Créer le Projet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;