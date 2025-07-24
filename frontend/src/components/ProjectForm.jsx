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
    
    if (!transformedData.name || !transformedData.location) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
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
    <div className="max-w-5xl m-4 mx-auto bg-white shadow-2xl rounded-2xl">
      {/* En-tête du formulaire */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 sm:px-6">
        <div className="flex items-center gap-3">
          <Building className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
            {initialData ? 'Modifier le Projet' : 'Créer un Nouveau Projet'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 transition-colors hover:text-gray-600 hover:bg-gray-100 rounded-xl"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Corps du formulaire */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 sm:p-6">
        <div className="space-y-6">
          
          {/* Informations de base */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                <Building className="inline w-4 h-4 mr-2" />
                Nom du projet *
              </label>
              <input
                {...register('nom', { 
                  required: 'Le nom du projet est requis',
                  minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' },
                  maxLength: { value: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
                })}
                placeholder="Ex: Construction Villa Moderne"
                className="w-full px-4 py-3 text-base transition-all duration-200 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              />
              {errors.nom && <span className="block mt-1 text-sm text-red-500">{errors.nom.message}</span>}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                <MapPin className="inline w-4 h-4 mr-2" />
                Emplacement *
              </label>
              <input
                {...register('emplacement', { 
                  required: 'L\'emplacement est requis',
                  minLength: { value: 2, message: 'L\'emplacement doit contenir au moins 2 caractères' }
                })}
                placeholder="Ex: Nouakchott, Tevragh Zeina"
                className="w-full px-4 py-3 text-base transition-all duration-200 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              />
              {errors.emplacement && <span className="block mt-1 text-sm text-red-500">{errors.emplacement.message}</span>}
            </div>
          </div>

          {/* Statut et Budget */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                <Calendar className="inline w-4 h-4 mr-2" />
                Statut du projet
              </label>
              <select
                {...register('statut')}
                className="w-full px-4 py-3 text-base transition-all duration-200 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              >
                <option value="planning">📋 Planification</option>
                <option value="in-progress">🔨 En cours</option>
                <option value="on-hold">⏸️ En attente</option>
                <option value="completed">✅ Terminé</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                💰 Budget estimé (MRU)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('budget', { 
                  min: { value: 0, message: 'Le budget doit être positif' }
                })}
                placeholder="Ex: 500000"
                className="w-full px-4 py-3 text-base transition-all duration-200 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              />
              {errors.budget && <span className="block mt-1 text-sm text-red-500">{errors.budget.message}</span>}
              {watchBudget > 0 && (
                <p className="mt-1 text-sm font-medium text-emerald-600">
                  Budget formaté: {Number(watchBudget).toLocaleString()} MRU
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                📅 Date de début
              </label>
              <input
                type="date"
                {...register('dateDebut', {
                  validate: validateFutureDate
                })}
                className="w-full px-4 py-3 text-base transition-all duration-200 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              />
              {errors.dateDebut && <span className="block mt-1 text-sm text-red-500">{errors.dateDebut.message}</span>}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                🏁 Date de fin prévue
              </label>
              <input
                type="date"
                {...register('dateFin', {
                  validate: validateEndDate
                })}
                className="w-full px-4 py-3 text-base transition-all duration-200 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              />
              {errors.dateFin && <span className="block mt-1 text-sm text-red-500">{errors.dateFin.message}</span>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              <FileText className="inline w-4 h-4 mr-2" />
              Description du projet
            </label>
            <textarea
              {...register('description', {
                maxLength: { value: 500, message: 'La description ne peut pas dépasser 500 caractères' }
              })}
              rows={4}
              placeholder="Décrivez brièvement votre projet de construction..."
              className="w-full px-4 py-3 text-base transition-all duration-200 border-2 border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
            />
            {errors.description && <span className="block mt-1 text-sm text-red-500">{errors.description.message}</span>}
          </div>

          {/* Notes */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              📝 Notes additionnelles
            </label>
            <textarea
              {...register('notes', {
                maxLength: { value: 1000, message: 'Les notes ne peuvent pas dépasser 1000 caractères' }
              })}
              rows={3}
              placeholder="Ajoutez des notes spéciales, contraintes, ou informations importantes..."
              className="w-full px-4 py-3 text-base transition-all duration-200 border-2 border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
            />
            {errors.notes && <span className="block mt-1 text-sm text-red-500">{errors.notes.message}</span>}
          </div>

          {/* Aperçu du projet */}
          {(watch('nom') || watch('emplacement')) && (
            <div className="p-4 border-2 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-emerald-200">
              <h4 className="mb-3 font-bold text-center text-emerald-900">📋 Aperçu du projet :</h4>
              <div className="space-y-2 text-sm text-emerald-800">
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
        <div className="flex flex-col justify-end gap-4 pt-6 mt-8 border-t border-gray-200 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200 text-base font-medium min-h-[48px]"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-200 flex items-center justify-center gap-2 text-base font-medium min-h-[48px] shadow-lg hover:shadow-xl"
          >
            <Building className="w-4 h-4" />
            {initialData ? 'Mettre à jour le Projet' : 'Créer le Projet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;