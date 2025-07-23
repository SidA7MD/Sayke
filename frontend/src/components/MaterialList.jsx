import React from 'react';
import { Edit, Trash2, Package } from 'lucide-react';
import styles from '../styles/MaterialCard.module.css';

const MaterialList = ({ materials, onEdit, onDelete }) => {
  const getCategoryStyle = (category) => {
    const categoryStyles = {
      construction: styles.categoryConstruction,
      electrical: styles.categoryElectrical,
      plumbing: styles.categoryPlumbing,
      finishing: styles.categoryFinishing,
      other: styles.categoryOther
    };
    return categoryStyles[category] || categoryStyles.other;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const groupedMaterials = materials.reduce((acc, material) => {
    const category = material.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(material);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.keys(groupedMaterials).map(category => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize flex items-center gap-2">
            <Package className="h-5 w-5" />
            {category} Materials ({groupedMaterials[category].length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedMaterials[category].map(material => (
              <div key={material._id} className={styles.materialCard}>
                {/* Header */}
                <div className={styles.materialHeader}>
                  <h4 className={styles.materialName}>{material.name}</h4>
                  <span className={`${styles.materialCategory} ${getCategoryStyle(material.category)}`}>
                    {material.category}
                  </span>
                </div>

                {/* Details */}
                <div className={styles.materialDetails}>
                  <div className={styles.materialRow}>
                    <span className={styles.materialLabel}>Quantity:</span>
                    <span className={styles.materialValue}>
                      {material.quantity} {material.unit}
                    </span>
                  </div>
                  
                  <div className={styles.materialRow}>
                    <span className={styles.materialLabel}>Price/Unit:</span>
                    <span className={styles.materialValue}>
                      {formatCurrency(material.pricePerUnit)}
                    </span>
                  </div>
                  
                  <div className={styles.materialRow}>
                    <span className={styles.materialLabel}>Total:</span>
                    <span className={`${styles.materialValue} ${styles.totalPrice}`}>
                      {formatCurrency(material.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Supplier Info */}
                {material.supplier && (
                  <div className={styles.supplierInfo}>
                    <strong>Supplier:</strong> {material.supplier}
                  </div>
                )}

                {/* Description */}
                {material.description && (
                  <div className={styles.supplierInfo}>
                    <strong>Description:</strong> {material.description}
                  </div>
                )}

                {/* Actions */}
                <div className={styles.materialActions}>
                  <button
                    onClick={() => onEdit(material)}
                    className={`${styles.actionButton} ${styles.editButton}`}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => onDelete(material._id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {materials.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No materials added</h3>
          <p className="text-gray-600">Start by adding your first material to this project</p>
        </div>
      )}
    </div>
  );
};

export default MaterialList;