import React, { useState } from 'react';
import { Download, FileText, Loader, List } from 'lucide-react';
import { projectAPI } from '../api/axios';
import toast from 'react-hot-toast';

const ExportButton = ({ projectId, projectName }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);

  const downloadFile = (blob, filename) => {
    try {
      // Check if blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('Invalid file data received');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
      return true;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

  const handleExport = async (type = 'project-report') => {
    if (!projectId || !projectName) {
      toast.error('Missing project information');
      return;
    }

    setIsExporting(true);
    setExportType(type);
    
    try {
      let response;
      let filename;
      const timestamp = new Date().toISOString().split('T')[0];
      const cleanProjectName = projectName.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_').toLowerCase();
      
      console.log(`Starting ${type} export for project:`, projectId);
      
      if (type === 'materials-list') {
        response = await projectAPI.exportMaterialsPDF(projectId);
        filename = `${cleanProjectName}_materials_${timestamp}.pdf`;
      } else {
        response = await projectAPI.exportProjectPDF(projectId);
        filename = `${cleanProjectName}_report_${timestamp}.pdf`;
      }
      
      console.log('Export response received:', {
        status: response.status,
        contentType: response.headers['content-type'],
        dataSize: response.data?.size || 'unknown'
      });
      
      // Verify we got a PDF blob
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      if (response.data.type && !response.data.type.includes('pdf')) {
        console.warn('Unexpected content type:', response.data.type);
      }
      
      // Download the file
      downloadFile(response.data, filename);
      
      toast.success(`${type === 'materials-list' ? 'Materials list' : 'Project report'} exported successfully`);
      
    } catch (error) {
      console.error('Export error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      
      let errorMessage = 'Failed to export PDF';
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = 'Project not found';
            break;
          case 500:
            errorMessage = 'Server error during PDF generation';
            break;
          case 408:
            errorMessage = 'Export timeout - try again';
            break;
          default:
            errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'Network error - check your connection';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Project Report Export */}
      <button
        onClick={() => handleExport('project-report')}
        disabled={isExporting}
        data-export-type="project"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed text-sm font-medium"
      >
        {isExporting && exportType === 'project-report' ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {isExporting && exportType === 'project-report' ? 'Exporting...' : 'Export Report'}
      </button>

      {/* Materials List Export */}
      <button
        onClick={() => handleExport('materials-list')}
        disabled={isExporting}
        data-export-type="materials"
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed text-sm font-medium"
      >
        {isExporting && exportType === 'materials-list' ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <List className="h-4 w-4" />
        )}
        {isExporting && exportType === 'materials-list' ? 'Exporting...' : 'Export Materials'}
      </button>
    </div>
  );
};

export default ExportButton;