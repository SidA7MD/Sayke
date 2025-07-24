const PDFDocument = require('pdfkit');
const Project = require('../models/Project');
const Material = require('../models/Material');

class PDFExporter {
  // Utility methods for text processing and formatting
  static utils = {
    // Clean and truncate text
    sanitizeText(text, maxLength = 200) {
      if (!text) return 'N/A';
      
      const cleaned = text.trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s.,!?()-]/g, '');
      
      return cleaned.length > maxLength 
        ? cleaned.substring(0, maxLength) + '...' 
        : cleaned;
    },

    // Format currency with minimal formatting
    formatCurrency(amount) {
      if (amount == null) return '0.00 MRU';
      const num = parseFloat(amount);
      return isNaN(num) ? '0.00 MRU' : `${num.toFixed(2)} MRU`;
    },

    // Simple date formatting
    formatDate(date) {
      try {
        return new Date(date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return 'Date invalide';
      }
    }
  };

  // Main PDF generation method for project reports
  static async generateProjectPDF(projectId) {
    const doc = new PDFDocument({
      margin: 40,
      bufferPages: true,
      size: 'A4'
    });

    try {
      // Fetch project and materials data
      const [project, materials] = await Promise.all([
        Project.findById(projectId).lean(),
        Material.find({ projectId }).lean()
      ]);

      if (!project) {
        throw new Error('Projet non trouvé');
      }

      // Calculate project statistics
      const stats = this.calculateProjectStats(materials);

      // Generate PDF content
      this.addTitle(doc, 'RAPPORT DE PROJET');
      this.addProjectDetails(doc, project);
      this.addFinancialSummary(doc, project, stats);
      this.addMaterialsSummary(doc, materials);
      this.addDetailedMaterialsList(doc, materials);
      this.addProjectConclusions(doc, project, stats);

      // Add page numbers
      this.addPageNumbers(doc);

      // Convert PDF to buffer
      return await this.bufferPDF(doc);

    } catch (error) {
      console.error('Erreur génération rapport PDF:', error);
      throw error;
    }
  }

  // Materials list PDF generation
  static async generateMaterialsPDF(projectId) {
    const doc = new PDFDocument({
      margin: 40,
      bufferPages: true,
      size: 'A4'
    });

    try {
      // Fetch project and materials data
      const [project, materials] = await Promise.all([
        Project.findById(projectId).lean(),
        Material.find({ projectId }).sort({ category: 1, name: 1 }).lean()
      ]);

      if (!project) {
        throw new Error('Projet non trouvé');
      }

      // Calculate materials statistics
      const stats = this.calculateProjectStats(materials);

      // Generate PDF content
      this.addTitle(doc, 'LISTE DÉTAILLÉE DES MATÉRIAUX');
      this.addProjectHeader(doc, project);
      this.addMaterialsOverview(doc, stats);
      this.addCompleteMaterialsList(doc, materials);
      this.addMaterialsConclusions(doc, stats);

      // Add page numbers
      this.addPageNumbers(doc);

      // Convert PDF to buffer
      return await this.bufferPDF(doc);

    } catch (error) {
      console.error('Erreur génération liste matériaux PDF:', error);
      throw error;
    }
  }

  // Add document title
  static addTitle(doc, title) {
    doc.fontSize(16)
       .text(title, { align: 'center' })
       .moveDown(1);
  }

  // Add project header information
  static addProjectHeader(doc, project) {
    const headerItems = [
      `Nom du projet: ${this.utils.sanitizeText(project.name)}`,
      `Localisation: ${this.utils.sanitizeText(project.location || 'Non spécifiée')}`,
      `Date: ${this.utils.formatDate(new Date())}`
    ];

    headerItems.forEach(item => {
      doc.fontSize(10)
         .text(item)
         .moveDown(0.3);
    });

    doc.moveDown(1);
  }

  // Project details section
  static addProjectDetails(doc, project) {
    doc.fontSize(12)
       .text('DÉTAILS DU PROJET', { underline: true })
       .moveDown(0.5);

    const detailItems = [
      `Nom: ${this.utils.sanitizeText(project.name)}`,
      `Localisation: ${this.utils.sanitizeText(project.location || 'Non spécifiée')}`,
      `Statut: ${project.status || 'Non défini'}`,
      `Date de création: ${this.utils.formatDate(project.createdAt)}`,
      `Budget initial: ${this.utils.formatCurrency(project.budget || 0)}`
    ];

    detailItems.forEach(item => {
      doc.fontSize(10)
         .text(item)
         .moveDown(0.3);
    });

    doc.moveDown(1);
  }

  // Financial summary section
  static addFinancialSummary(doc, project, stats) {
    doc.fontSize(12)
       .text('RÉSUMÉ FINANCIER', { underline: true })
       .moveDown(0.5);

    const financialItems = [
      `Budget initial: ${this.utils.formatCurrency(project.budget || 0)}`,
      `Coût total des matériaux: ${this.utils.formatCurrency(stats.totalValue)}`,
      `Écart budgétaire: ${this.utils.formatCurrency((project.budget || 0) - stats.totalValue)}`
    ];

    financialItems.forEach(item => {
      doc.fontSize(10)
         .text(item)
         .moveDown(0.3);
    });

    doc.moveDown(1);
  }

  // Materials overview section
  static addMaterialsOverview(doc, stats) {
    doc.fontSize(12)
       .text('APERÇU DES MATÉRIAUX', { underline: true })
       .moveDown(0.5);

    const overviewItems = [
      `Nombre total de matériaux: ${stats.totalMaterials}`,
      `Valeur totale: ${this.utils.formatCurrency(stats.totalValue)}`,
      `Valeur moyenne par matériau: ${this.utils.formatCurrency(stats.averageItemCost)}`
    ];

    overviewItems.forEach(item => {
      doc.fontSize(10)
         .text(item)
         .moveDown(0.3);
    });

    doc.moveDown(1);
  }

  // Detailed materials summary section
  static addMaterialsSummary(doc, materials) {
    doc.fontSize(12)
       .text('RÉSUMÉ DES MATÉRIAUX', { underline: true })
       .moveDown(0.5);

    // Group materials by category
    const categorySummary = materials.reduce((acc, material) => {
      const category = material.category || 'Autres';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalValue: 0
        };
      }
      acc[category].count++;
      acc[category].totalValue += parseFloat(material.totalPrice) || 0;
      return acc;
    }, {});

    // Display category summary
    Object.entries(categorySummary).forEach(([category, summary]) => {
      doc.fontSize(10)
         .text(`${category}: ${summary.count} articles - ${this.utils.formatCurrency(summary.totalValue)}`)
         .moveDown(0.3);
    });

    doc.moveDown(1);
  }

  // Detailed materials list
  static addDetailedMaterialsList(doc, materials) {
    doc.fontSize(12)
       .text('LISTE DÉTAILLÉE DES MATÉRIAUX', { underline: true })
       .moveDown(0.5);

    materials.forEach(material => {
      doc.fontSize(10)
         .text(`Nom: ${this.utils.sanitizeText(material.name)}`)
         .text(`  Quantité: ${material.quantity || 0} ${material.unit || 'unité'}`)
         .text(`  Prix unitaire: ${this.utils.formatCurrency(material.pricePerUnit)}`)
         .text(`  Prix total: ${this.utils.formatCurrency(material.totalPrice)}`)
         .text(`  Catégorie: ${material.category || 'Non classé'}`)
         .moveDown(0.5);
    });

    doc.moveDown(1);
  }

  // Complete materials list for materials PDF
  static addCompleteMaterialsList(doc, materials) {
    doc.fontSize(12)
       .text('LISTE COMPLÈTE DES MATÉRIAUX', { underline: true })
       .moveDown(0.5);

    materials.forEach((material, index) => {
      doc.fontSize(10)
         .text(`${index + 1}. ${this.utils.sanitizeText(material.name, 50)}`)
         .text(`   Quantité: ${material.quantity || 0} ${material.unit || 'unité'}`)
         .text(`   Prix: ${this.utils.formatCurrency(material.totalPrice)}`)
         .text(`   Catégorie: ${material.category || 'Non classé'}`)
         .moveDown(0.3);
    });

    doc.moveDown(1);
  }

  // Project conclusions
  static addProjectConclusions(doc, project, stats) {
    doc.fontSize(12)
       .text('CONCLUSIONS', { underline: true })
       .moveDown(0.5);

    const conclusions = [
      `Statut du projet: ${project.status || 'Non défini'}`,
      `Total des dépenses en matériaux: ${this.utils.formatCurrency(stats.totalValue)}`,
      `Écart par rapport au budget: ${this.utils.formatCurrency((project.budget || 0) - stats.totalValue)}`,
      `Nombre total de matériaux: ${stats.totalMaterials}`
    ];

    conclusions.forEach(item => {
      doc.fontSize(10)
         .text(item)
         .moveDown(0.3);
    });
  }

  // Materials conclusions
  static addMaterialsConclusions(doc, stats) {
    doc.fontSize(12)
       .text('SYNTHÈSE', { underline: true })
       .moveDown(0.5);

    const conclusions = [
      `Nombre total de matériaux: ${stats.totalMaterials}`,
      `Valeur totale des matériaux: ${this.utils.formatCurrency(stats.totalValue)}`,
      `Coût moyen par matériau: ${this.utils.formatCurrency(stats.averageItemCost)}`
    ];

    conclusions.forEach(item => {
      doc.fontSize(10)
         .text(item)
         .moveDown(0.3);
    });
  }

  // Add page numbers
  static addPageNumbers(doc) {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .text(`Page ${i + 1} / ${pages.count}`, 
               doc.page.width - 100, 
               doc.page.height - 30, 
               { align: 'right' });
    }
  }

  // Calculate project statistics
  static calculateProjectStats(materials) {
    return {
      totalMaterials: materials.length,
      totalValue: materials.reduce((sum, m) => sum + (parseFloat(m.totalPrice) || 0), 0),
      averageItemCost: materials.reduce((sum, m) => sum + (parseFloat(m.totalPrice) || 0), 0) / (materials.length || 1)
    };
  }

  // Convert PDF to buffer
  static bufferPDF(doc) {
    return new Promise((resolve, reject) => {
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const buffer = Buffer.concat(buffers);
        resolve(buffer);
      });
      doc.on('error', reject);
      doc.end();
    });
  }
}

// Export main functions
module.exports = {
  generateProjectPDF: PDFExporter.generateProjectPDF.bind(PDFExporter),
  generateMaterialsPDF: PDFExporter.generateMaterialsPDF.bind(PDFExporter),
  
  // Project data validation
  validateProjectData: (project, materials) => {
    const errors = [];
    
    if (!project) {
      errors.push('Données du projet manquantes');
      return errors;
    }
    
    if (!project.name || project.name.trim().length === 0) {
      errors.push('Nom du projet manquant');
    }
    
    if (project.budget && isNaN(parseFloat(project.budget))) {
      errors.push('Budget invalide');
    }
    
    return errors;
  }
};