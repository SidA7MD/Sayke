import React, { useState } from 'react';
import { Eye, Edit, Trash2, MapPin, Calendar, DollarSign } from 'lucide-react';
import ProjectForm from './ProjectForm';

const ProjectList = ({ projects, onEdit, onDelete, onView, getStatusColor }) => {
  const [editingProject, setEditingProject] = useState(null);

  const handleEdit = (project) => {
    setEditingProject(project);
  };

  const handleEditSubmit = async (data) => {
    await onEdit(editingProject._id, data);
    setEditingProject(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project._id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="card-content">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
                    {project.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">{project.location}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-semibold text-green-600">
                    ${project.totalCost.toLocaleString()}
                  </span>
                </div>

                {project.materialCount > 0 && (
                  <div className="text-sm text-gray-600">
                    {project.materialCount} material{project.materialCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Notes Preview */}
              {project.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {project.notes.length > 100 
                      ? `${project.notes.substring(0, 100)}...` 
                      : project.notes
                    }
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => onView(project._id)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                
                <button
                  onClick={() => handleEdit(project)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                
                <button
                  onClick={() => onDelete(project._id)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProjectForm
              project={editingProject}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingProject(null)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectList;