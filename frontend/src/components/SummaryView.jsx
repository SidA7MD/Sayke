import React from 'react';
import { DollarSign, Package, TrendingUp, PieChart } from 'lucide-react';

const SummaryView = ({ project, materials, materialStats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTopMaterials = () => {
    return materials
      .sort((a, b) => b.totalPrice - a.totalPrice)
      .slice(0, 5);
  };

  const getCategoryStats = () => {
    if (!materialStats || !materialStats.categoryBreakdown) return [];
    return materialStats.categoryBreakdown;
  };

  const topMaterials = getTopMaterials();
  const categoryStats = getCategoryStats();

  return (
    <div className="space-y-8">
      {/* Project Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Project Overview</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
              <p className="text-sm text-gray-600">Total Materials</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(project.totalCost)}
              </p>
              <p className="text-sm text-gray-600">Total Cost</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{categoryStats.length}</p>
              <p className="text-sm text-gray-600">Categories</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {materials.length > 0 ? formatCurrency(project.totalCost / materials.length) : '$0'}
              </p>
              <p className="text-sm text-gray-600">Avg Cost/Material</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown by Category */}
      {categoryStats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown by Category</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {categoryStats.map(category => {
                const percentage = ((category.totalCost / project.totalCost) * 100).toFixed(1);
                return (
                  <div key={category._id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {category._id}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(category.totalCost)} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {category.count} material{category.count !== 1 ? 's' : ''} • 
                        Avg: {formatCurrency(category.avgPricePerUnit)}/unit
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top Materials by Cost */}
      {topMaterials.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Most Expensive Materials</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {topMaterials.map((material, index) => (
                <div key={material._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{material.name}</h4>
                      <p className="text-sm text-gray-600">
                        {material.quantity} {material.unit} • {formatCurrency(material.pricePerUnit)}/unit
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(material.totalPrice)}</p>
                    <p className="text-xs text-gray-500 capitalize">{material.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project Details */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{project.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{project.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{project.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Financial Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Materials:</span>
                  <span className="font-medium">{materials.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="font-medium text-green-600">{formatCurrency(project.totalCost)}</span>
                </div>
                {materials.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cheapest Material:</span>
                      <span className="font-medium">
                        {formatCurrency(Math.min(...materials.map(m => m.totalPrice)))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Most Expensive:</span>
                      <span className="font-medium">
                        {formatCurrency(Math.max(...materials.map(m => m.totalPrice)))}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {project.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{project.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryView;