import React, { useEffect } from 'react';
import { useForm, watch } from 'react-hook-form';
import { X } from 'lucide-react';

const MaterialForm = ({ material, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    watch: watchFields,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: material || {
      name: '',
      unit: 'sqm',
      pricePerUnit: 0,
      quantity: 0,
      supplier: '',
      description: '',
      category: 'construction'
    }
  });

  const quantity = watchFields('quantity');
  const pricePerUnit = watchFields('pricePerUnit');
  const totalPrice = (parseFloat(quantity) || 0) * (parseFloat(pricePerUnit) || 0);

  const unitOptions = [
    { value: 'sqm', label: 'Square Meters (sqm)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'unit', label: 'Units' },
    { value: 'm3', label: 'Cubic Meters (m³)' },
    { value: 'ton', label: 'Tons' },
    { value: 'liter', label: 'Liters' },
    { value: 'meter', label: 'Meters' },
    { value: 'piece', label: 'Pieces' }
  ];

  const categoryOptions = [
    { value: 'construction', label: 'Construction' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'finishing', label: 'Finishing' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {material ? 'Edit Material' : 'Add New Material'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Material Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Material Name *
          </label>
          <input
            type="text"
            id="name"
            {...register('name', {
              required: 'Material name is required',
              maxLength: {
                value: 100,
                message: 'Material name cannot exceed 100 characters'
              }
            })}
            className={`input ${errors.name ? 'border-red-500' : ''}`}
            placeholder="e.g., Glass, Cement, Steel"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            {...register('category')}
            className="input"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Unit and Quantity Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit *
            </label>
            <select
              id="unit"
              {...register('unit', { required: 'Unit is required' })}
              className={`input ${errors.unit ? 'border-red-500' : ''}`}
            >
              {unitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.unit && (
              <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="quantity"
              {...register('quantity', {
                required: 'Quantity is required',
                min: {
                  value: 0,
                  message: 'Quantity must be positive'
                }
              })}
              className={`input ${errors.quantity ? 'border-red-500' : ''}`}
              placeholder="0"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
            )}
          </div>
        </div>

        {/* Price Per Unit */}
        <div>
          <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-1">
            Price Per Unit *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              id="pricePerUnit"
              {...register('pricePerUnit', {
                required: 'Price per unit is required',
                min: {
                  value: 0,
                  message: 'Price must be positive'
                }
              })}
              className={`input pl-8 ${errors.pricePerUnit ? 'border-red-500' : ''}`}
              placeholder="0.00"
            />
          </div>
          {errors.pricePerUnit && (
            <p className="text-red-500 text-sm mt-1">{errors.pricePerUnit.message}</p>
          )}
        </div>

        {/* Total Price Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Price:</span>
            <span className="text-lg font-bold text-green-600">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Supplier */}
        <div>
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
            Supplier
          </label>
          <input
            type="text"
            id="supplier"
            {...register('supplier', {
              maxLength: {
                value: 100,
                message: 'Supplier name cannot exceed 100 characters'
              }
            })}
            className={`input ${errors.supplier ? 'border-red-500' : ''}`}
            placeholder="Supplier name (optional)"
          />
          {errors.supplier && (
            <p className="text-red-500 text-sm mt-1">{errors.supplier.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description', {
              maxLength: {
                value: 500,
                message: 'Description cannot exceed 500 characters'
              }
            })}
            className={`input ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Additional notes about this material..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary flex-1"
          >
            {isSubmitting ? 'Saving...' : material ? 'Update Material' : 'Add Material'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialForm;