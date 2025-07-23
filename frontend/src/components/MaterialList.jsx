// frontend/src/components/MaterialList.jsx
import React from 'react';

const MaterialList = ({ materials, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {materials.map((material) => (
            <tr key={material._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{material.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {material.quantity} {material.unit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ${material.pricePerUnit.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium">
                ${(material.quantity * material.pricePerUnit).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {material.supplier || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onDelete(material._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50">
            <td colSpan="3" className="px-6 py-4 text-right font-medium">Grand Total:</td>
            <td className="px-6 py-4 font-medium">
              ${materials.reduce((sum, material) => sum + (material.quantity * material.pricePerUnit), 0).toFixed(2)}
            </td>
            <td colSpan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default MaterialList;