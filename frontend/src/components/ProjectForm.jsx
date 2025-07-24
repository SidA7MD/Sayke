// ProjectForm.jsx - Final Version - Mobile Responsive with Budget & Dates Support
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building, MapPin, Calendar, FileText, X, DollarSign } from 'lucide-react';

const ProjectForm = ({ onSubmit, onCancel, initialData = null }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: initialData || {
      nom: '',
      emplacement: '',
      description: '',
      statut: 'planning',
      budget: 0,
      dateDebut: '',
      dateFin: '',
      notes: ''
    }
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('📋 Form reset with data:', initialData);
      reset(initialData);
    }
  }, [initialData, reset]);

  const watchBudget = watch('budget', 0);
  const watchNom = watch('nom', '');
  const watchEmplacement = watch('emplacement', '');
  const watchDateDebut = watch('dateDebut', '');
  const watchDateFin = watch('dateFin', '');
  const watchStatut = watch('statut', 'planning');

  const onFormSubmit = (data, e) => {
    e?.preventDefault();
    
    console.log('📋 Form submitted with data:', data);
    
    // Transform data to match backend expectations
    const transformedData = {
      name: data.nom,
      location: data.emplacement,
      description: data.description || '',
      status: data.statut || 'planning',
      budget: Number(data.budget) || 0,         // ✅ Budget
      startDate: data.dateDebut || null,        // ✅ Start date
      endDate: data.dateFin || null,            // ✅ End date
      notes: data.notes || ''
    };
    
    console.log('💾 Transformed data for backend:', transformedData);
    
    // Validation
    if (!transformedData.name || !transformedData.location) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Date validation
    if (transformedData.startDate && transformedData.endDate) {
      if (new Date(transformedData.startDate) >= new Date(transformedData.endDate)) {
        alert('La date de fin doit être postérieure à la date de début');
        return;
      }
    }
    
    try {
      onSubmit(transformedData);
    } catch (error) {
      console.error('❌ Error submitting form:', error);
    }
  };

  // Calculate project duration
  const calculateDuration = () => {
    if (watchDateDebut && watchDateFin) {
      const start = new Date(watchDateDebut);
      const end = new Date(watchDateFin);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return null;
  };

  const projectDuration = calculateDuration();

  return (
    <div className="h-full max-w-5xl mx-auto bg-white sm:rounded-2xl sm:shadow-2xl">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 sm:hidden">
        <h2 className="text-lg font-bold text-gray-900">
          {initialData ? 'Modifier le Projet' : 'Créer un Projet'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 transition-colors hover:text-gray-600 rounded-xl"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Header - Hidden on mobile */}
      <div className="items-center justify-between hidden px-4 py-4 border-b border-gray-200 sm:flex sm:px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 shadow-lg bg-emerald-500 rounded-xl">
            <Building className="w-6 h-6 text-white" />
          </div>
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

      {/* Form Content */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 pb-20 sm:p-6 sm:pb-6">
        <div className="space-y-4 sm:space-y-6">
          
          {/* Informations de base */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
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
                className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
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
                className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              />
              {errors.emplacement && <span className="block mt-1 text-sm text-red-500">{errors.emplacement.message}</span>}
            </div>
          </div>

          {/* Statut et Budget */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                <Calendar className="inline w-4 h-4 mr-2" />
                Statut du projet
              </label>
              <select
                {...register('statut')}
                className="w-full px-4 py-4 text-base transition-all duration-200 bg-white border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              >
                <option value="planning">📋 Planification</option>
                <option value="in-progress">🔨 En cours</option>
                <option value="on-hold">⏸️ En attente</option>
                <option value="completed">✅ Terminé</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                <DollarSign className="inline w-4 h-4 mr-2" />
                Budget estimé (MRU)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('budget', { 
                  min: { value: 0, message: 'Le budget doit être positif' }
                })}
                placeholder="Ex: 500000"
                className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              />
              {errors.budget && <span className="block mt-1 text-sm text-red-500">{errors.budget.message}</span>}
              {watchBudget > 0 && (
                <p className="mt-1 text-sm font-medium text-emerald-600">
                  Budget formaté: {Number(watchBudget).toLocaleString()} MRU
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                💡 Budget estimé vs Coût réel (calculé des matériaux)
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                📅 Date de début
              </label>
              <input
                type="date"
                {...register('dateDebut')}
                className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
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
                  validate: (value) => {
                    if (value && watchDateDebut && new Date(value) <= new Date(watchDateDebut)) {
                      return "La date de fin doit être postérieure à la date de début";
                    }
                    return true;
                  }
                })}
                className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              />
              {errors.dateFin && <span className="block mt-1 text-sm text-red-500">{errors.dateFin.message}</span>}
              {projectDuration && (
                <p className="mt-1 text-sm font-medium text-emerald-600">
                  Durée estimée: {projectDuration} jours
                </p>
              )}
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
              placeholder="Décrivez les détails du projet, les spécifications techniques, les exigences particulières..."
              rows={4}
              className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 resize-none sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
            />
            {errors.description && <span className="block mt-1 text-sm text-red-500">{errors.description.message}</span>}
            <p className="mt-1 text-xs text-gray-500">
              Décrivez les objectifs, les contraintes et les spécifications du projet
            </p>
          </div>

          {/* Notes additionnelles */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              📝 Notes additionnelles
            </label>
            <textarea
              {...register('notes', { 
                maxLength: { value: 300, message: 'Les notes ne peuvent pas dépasser 300 caractères' }
              })}
              placeholder="Notes importantes, contacts, références..."
              rows={3}
              className="w-full px-4 py-4 text-base transition-all duration-200 border-2 border-gray-200 resize-none sm:py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
            />
            {errors.notes && <span className="block mt-1 text-sm text-red-500">{errors.notes.message}</span>}
          </div>

          {/* Preview Card - Shows project summary */}
          {(watchNom || watchEmplacement) && (
            <div className="p-4 border-2 sm:p-6 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl">
              <h3 className="mb-4 text-lg font-bold text-center text-emerald-900">
                📋 Aperçu du projet
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-emerald-700">
                    <Building className="inline w-4 h-4 mr-1" />
                    <strong>Nom:</strong> {watchNom || 'Non spécifié'}
                  </p>
                  <p className="text-sm text-emerald-700">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    <strong>Lieu:</strong> {watchEmplacement || 'Non spécifié'}
                  </p>
                  <p className="text-sm text-emerald-700">
                    <span className="inline-block w-4 h-4 mr-1">
                      {watchStatut === 'planning' && '📋'}
                      {watchStatut === 'in-progress' && '🔨'}
                      {watchStatut === 'on-hold' && '⏸️'}
                      {watchStatut === 'completed' && '✅'}
                    </span>
                    <strong>Statut:</strong> {
                      watchStatut === 'planning' ? 'Planification' :
                      watchStatut === 'in-progress' ? 'En cours' :
                      watchStatut === 'on-hold' ? 'En attente' :
                      watchStatut === 'completed' ? 'Terminé' : watchStatut
                    }
                  </p>
                </div>
                <div className="space-y-2">
                  {watchBudget > 0 && (
                    <p className="text-sm text-emerald-700">
                      <DollarSign className="inline w-4 h-4 mr-1" />
                      <strong>Budget:</strong> {Number(watchBudget).toLocaleString()} MRU
                    </p>
                  )}
                  {watchDateDebut && (
                    <p className="text-sm text-emerald-700">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      <strong>Début:</strong> {new Date(watchDateDebut).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {watchDateFin && (
                    <p className="text-sm text-emerald-700">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      <strong>Fin:</strong> {new Date(watchDateFin).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {projectDuration && (
                    <p className="text-sm text-emerald-700">
                      ⏱️ <strong>Durée:</strong> {projectDuration} jours
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions - Fixed at bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 sm:relative sm:border-t-0 sm:bg-transparent sm:p-0 sm:mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="order-2 px-6 py-4 font-medium text-gray-600 transition-all duration-200 sm:py-3 hover:text-gray-800 hover:bg-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-gray-100 sm:order-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="order-1 px-6 py-4 font-medium text-white transition-all duration-200 shadow-lg sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 hover:shadow-xl sm:order-2"
            >
              {initialData ? '💾 Mettre à jour le projet' : '🚀 Créer le projet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;