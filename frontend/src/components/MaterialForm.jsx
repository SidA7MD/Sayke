// frontend/src/components/MaterialForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';

const MaterialForm = ({ onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <h3 className="text-xl font-semibold mb-4">Add New Material</h3>
      
      <div className="mb-4">
        <label className="block mb-1">Name:</label>
        <input
          {...register('name', { required: 'Name is required' })}
          placeholder="Enter material name"
          className="w-full p-2 border rounded"
        />
        {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1">Quantity:</label>
          <input
            type="number"
            {...register('quantity', { 
              required: 'Quantity is required',
              min: { value: 1, message: 'Quantity must be at least 1' }
            })}
            placeholder="Enter quantity"
            className="w-full p-2 border rounded"
          />
          {errors.quantity && <span className="text-red-500 text-sm">{errors.quantity.message}</span>}
        </div>

        <div>
          <label className="block mb-1">Unit:</label>
          <select
            {...register('unit', { required: 'Unit is required' })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select unit</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="lb">lb</option>
            <option value="pieces">pieces</option>
            <option value="liters">liters</option>
            <option value="gallons">gallons</option>
            <option value="meters">meters</option>
            <option value="feet">feet</option>
          </select>
          {errors.unit && <span className="text-red-500 text-sm">{errors.unit.message}</span>}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Price per Unit:</label>
        <input
          type="number"
          step="0.01"
          {...register('pricePerUnit', { 
            required: 'Price is required',
            min: { value: 0.01, message: 'Price must be greater than 0' }
          })}
          placeholder="Enter price per unit"
          className="w-full p-2 border rounded"
        />
        {errors.pricePerUnit && <span className="text-red-500 text-sm">{errors.pricePerUnit.message}</span>}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Supplier:</label>
        <input
          {...register('supplier')}
          placeholder="Enter supplier name"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Add Material
        </button>
      </div>
    </form>
  );
};

export default MaterialForm;