const PDFDocument = require('pdfkit');
const Project = require('../models/Project');

const pdfGenerator = {
  generateProjectPDF: async (projectId) => {
    try {
      // Fetch project with materials
      const project = await Project.findById(projectId).populate('materials');
      
      if (!project) {
        throw new Error('Project not found');
      }

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text('Project Report', { align: 'center' });
        doc.moveDown();

        // Project Information
        doc.fontSize(16).text('Project Information', { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(12);
        doc.text(`Name: ${project.name}`);
        doc.text(`Location: ${project.location}`);
        doc.text(`Status: ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}`);
        doc.text(`Created: ${project.createdAt.toLocaleDateString()}`);
        doc.text(`Total Cost: $${project.totalCost.toLocaleString()}`);
        
        if (project.notes) {
          doc.text(`Notes: ${project.notes}`);
        }
        
        doc.moveDown();

        // Materials Table
        if (project.materials && project.materials.length > 0) {
          doc.fontSize(16).text('Materials', { underline: true });
          doc.moveDown(0.5);

          // Table headers
          const tableTop = doc.y;
          const nameX = 50;
          const unitX = 150;
          const qtyX = 200;
          const priceX = 250;
          const totalX = 320;
          const categoryX = 400;

          doc.fontSize(10);
          doc.text('Material', nameX, tableTop, { width: 90 });
          doc.text('Unit', unitX, tableTop);
          doc.text('Qty', qtyX, tableTop);
          doc.text('Price/Unit', priceX, tableTop);
          doc.text('Total', totalX, tableTop);
          doc.text('Category', categoryX, tableTop);

          // Draw line under headers
          doc.moveTo(nameX, tableTop + 15)
             .lineTo(500, tableTop + 15)
             .stroke();

          let currentY = tableTop + 25;

          // Materials data
          project.materials.forEach((material, index) => {
            if (currentY > 700) { // Start new page if needed
              doc.addPage();
              currentY = 50;
            }

            doc.text(material.name.substring(0, 15), nameX, currentY, { width: 90 });
            doc.text(material.unit, unitX, currentY);
            doc.text(material.quantity.toString(), qtyX, currentY);
            doc.text(`${material.pricePerUnit.toFixed(2)}`, priceX, currentY);
            doc.text(`${material.totalPrice.toFixed(2)}`, totalX, currentY);
            doc.text(material.category, categoryX, currentY);

            currentY += 20;
          });

          // Total line
          doc.moveTo(nameX, currentY)
             .lineTo(500, currentY)
             .stroke();
          
          currentY += 10;
          doc.fontSize(12).text(`Total Project Cost: ${project.totalCost.toLocaleString()}`, totalX, currentY);
        } else {
          doc.fontSize(12).text('No materials added to this project yet.');
        }

        // Summary section
        doc.moveDown(2);
        doc.fontSize(16).text('Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Total Materials: ${project.materials ? project.materials.length : 0}`);
        doc.text(`Project Status: ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}`);
        
        // Footer
        doc.fontSize(8).text(
          `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw error;
    }
  },

  generateMaterialsPDF: async (projectId) => {
    try {
      const project = await Project.findById(projectId).populate('materials');
      
      if (!project) {
        throw new Error('Project not found');
      }

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        doc.on('error', reject);

        // Title
        doc.fontSize(18).text(`Materials List - ${project.name}`, { align: 'center' });
        doc.moveDown();

        if (project.materials && project.materials.length > 0) {
          // Group materials by category
          const groupedMaterials = project.materials.reduce((acc, material) => {
            const category = material.category || 'other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(material);
            return acc;
          }, {});

          Object.keys(groupedMaterials).forEach(category => {
            doc.fontSize(14).text(category.charAt(0).toUpperCase() + category.slice(1), { underline: true });
            doc.moveDown(0.5);

            groupedMaterials[category].forEach(material => {
              doc.fontSize(11);
              doc.text(`• ${material.name}`);
              doc.fontSize(9);
              doc.text(`  Quantity: ${material.quantity} ${material.unit} | Price: ${material.pricePerUnit}/unit | Total: ${material.totalPrice}`, { indent: 20 });
              if (material.supplier) {
                doc.text(`  Supplier: ${material.supplier}`, { indent: 20 });
              }
              doc.moveDown(0.3);
            });
            doc.moveDown();
          });
        }

        doc.end();
      });
    } catch (error) {
      console.error('Materials PDF Generation Error:', error);
      throw error;
    }
  }
};

module.exports = pdfGenerator;