const PDFDocument = require('pdfkit');
const Project = require('../models/Project');
const Material = require('../models/Material');
const { Readable } = require('stream');

// Utility to buffer the PDF stream
function bufferPDF(doc) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);
    doc.end();
  });
}

// Project PDF
async function generateProjectPDF(projectId) {
  try {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const materials = await Material.find({ projectId });

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      info: {
        Title: `Project Report - ${project.name}`,
        Author: 'Project Management System',
        Subject: 'Project Report',
        Keywords: 'project, report, materials'
      }
    });

    // Colors and styling
    const primaryColor = '#2563eb';
    const secondaryColor = '#64748b';
    const accentColor = '#f8fafc';
    const textColor = '#1e293b';

    // Helper function to add a colored rectangle
    const addColoredRect = (x, y, width, height, color) => {
      doc.save()
         .fillColor(color)
         .rect(x, y, width, height)
         .fill()
         .restore();
    };

    // Header section with gradient-like effect
    addColoredRect(0, 0, doc.page.width, 120, primaryColor);
    
    doc.fillColor('white')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('PROJECT REPORT', 50, 40, { align: 'center' });
    
    doc.fontSize(14)
       .font('Helvetica')
       .text(project.name, 50, 75, { align: 'center' });

    // Reset position after header
    doc.y = 150;

    // Project Information Section
    doc.fillColor(textColor)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('Project Overview', 50);
    
    // Add underline
    doc.moveTo(50, doc.y + 5)
       .lineTo(200, doc.y + 5)
       .strokeColor(primaryColor)
       .lineWidth(2)
       .stroke();

    doc.moveDown(1);

    // Create info cards layout
    const cardY = doc.y;
    const cardHeight = 120;
    const cardWidth = 240;
    
    // Left card - Basic Info
    addColoredRect(50, cardY, cardWidth, cardHeight, accentColor);
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .rect(50, cardY, cardWidth, cardHeight)
       .stroke();

    doc.fillColor(textColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Basic Information', 60, cardY + 15);

    doc.fontSize(11)
       .font('Helvetica')
       .text(`Name: ${project.name}`, 60, cardY + 40)
       .text(`Location: ${project.location}`, 60, cardY + 55)
       .text(`Status: ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}`, 60, cardY + 70)
       .text(`Created: ${project.createdAt ? project.createdAt.toLocaleDateString() : 'N/A'}`, 60, cardY + 85);

    // Right card - Financial Info
    addColoredRect(310, cardY, cardWidth, cardHeight, accentColor);
    doc.strokeColor('#e2e8f0')
       .rect(310, cardY, cardWidth, cardHeight)
       .stroke();

    doc.fillColor(textColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Financial Summary', 320, cardY + 15);

    const totalCost = project.totalCost || materials.reduce((sum, mat) => sum + (mat.totalPrice || 0), 0);

    doc.fontSize(11)
       .font('Helvetica')
       .text(`Total Cost: ${totalCost} MRU`, 320, cardY + 40)
       .text(`Materials Count: ${materials.length}`, 320, cardY + 55);

    // Calculate total by category if materials exist
    if (materials.length > 0) {
      const categoryTotals = materials.reduce((acc, material) => {
        const category = material.category || 'Other';
        acc[category] = (acc[category] || 0) + (material.totalPrice || 0);
        return acc;
      }, {});
      
      const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
        categoryTotals[a] > categoryTotals[b] ? a : b
      );
      
      doc.text(`Top Category: ${topCategory}`, 320, cardY + 70)
         .text(`Category Total: ${categoryTotals[topCategory]} MRU`, 320, cardY + 85);
    }

    doc.y = cardY + cardHeight + 30;

    // Notes section
    if (project.notes && project.notes !== 'N/A') {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Project Notes', 50);
      
      doc.moveTo(50, doc.y + 5)
         .lineTo(150, doc.y + 5)
         .strokeColor(primaryColor)
         .lineWidth(2)
         .stroke();

      doc.moveDown(0.5);
      
      addColoredRect(50, doc.y, doc.page.width - 100, 60, accentColor);
      doc.strokeColor('#e2e8f0')
         .rect(50, doc.y, doc.page.width - 100, 60)
         .stroke();

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor(textColor)
         .text(project.notes, 60, doc.y + 15, { 
           width: doc.page.width - 120,
           height: 40
         });

      doc.y += 80;
    }

    // Materials Section
    if (materials.length > 0) {
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('Materials Breakdown', 50);
      
      doc.moveTo(50, doc.y + 5)
         .lineTo(220, doc.y + 5)
         .strokeColor(primaryColor)
         .lineWidth(2)
         .stroke();

      doc.moveDown(1);

      // Table setup
      const tableTop = doc.y;
      const nameX = 50;
      const unitX = 160;
      const qtyX = 200;
      const priceX = 240;
      const totalX = 310;
      const categoryX = 380;
      const supplierX = 450;

      // Table header background
      addColoredRect(nameX, tableTop, 495, 25, primaryColor);

      // Table headers
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text('Material', nameX + 5, tableTop + 8)
         .text('Unit', unitX + 5, tableTop + 8)
         .text('Qty', qtyX + 5, tableTop + 8)
         .text('Price/Unit', priceX + 5, tableTop + 8)
         .text('Total', totalX + 5, tableTop + 8)
         .text('Category', categoryX + 5, tableTop + 8)
         .text('Supplier', supplierX + 5, tableTop + 8);

      let currentY = tableTop + 30;
      let rowIndex = 0;

      // Materials data with alternating row colors
      materials.forEach((material) => {
        if (currentY > 720) { // Start new page if needed
          doc.addPage();
          currentY = 50;
          rowIndex = 0;
        }

        // Alternating row background
        const rowColor = rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
        addColoredRect(nameX, currentY - 5, 495, 20, rowColor);

        // Border for each row
        doc.strokeColor('#e2e8f0')
           .lineWidth(0.5)
           .rect(nameX, currentY - 5, 495, 20)
           .stroke();

        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(textColor)
           .text(material.name ? material.name.substring(0, 20) : 'N/A', nameX + 3, currentY, { width: 105 })
           .text(material.unit || 'N/A', unitX + 3, currentY)
           .text(material.quantity?.toString() || '0', qtyX + 3, currentY)
           .text(`${(material.pricePerUnit || 0)} MRU`, priceX + 3, currentY)
           .text(`${(material.totalPrice || 0)} MRU`, totalX + 3, currentY)
           .text(material.category || 'Other', categoryX + 3, currentY)
           .text(material.supplier || 'N/A', supplierX + 3, currentY, { width: 80 });

        currentY += 20;
        rowIndex++;
      });

      // Total row
      addColoredRect(nameX, currentY, 495, 25, secondaryColor);
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text('TOTAL PROJECT COST:', priceX + 5, currentY + 8)
         .text(`${totalCost} MRU`, totalX + 5, currentY + 8);

      doc.y = currentY + 40;
    } else {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Materials', 50);
      
      doc.moveDown(0.5);
      addColoredRect(50, doc.y, doc.page.width - 100, 40, accentColor);
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text('No materials have been added to this project yet.', 60, doc.y + 15);
      
      doc.y += 60;
    }

    // Summary Statistics
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor(textColor)
       .text('Project Summary', 50);
    
    doc.moveTo(50, doc.y + 5)
       .lineTo(180, doc.y + 5)
       .strokeColor(primaryColor)
       .lineWidth(2)
       .stroke();

    doc.moveDown(1);

    const summaryY = doc.y;
    const summaryItems = [
      { label: 'Total Materials', value: materials.length },
      { label: 'Project Status', value: project.status.charAt(0).toUpperCase() + project.status.slice(1) },
      { label: 'Total Investment', value: `${totalCost} MRU` },
      { label: 'Last Updated', value: project.updatedAt ? project.updatedAt.toLocaleDateString() : 'N/A' }
    ];

    summaryItems.forEach((item, index) => {
      const x = 50 + (index % 2) * 250;
      const y = summaryY + Math.floor(index / 2) * 30;
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text(`${item.label}:`, x, y)
         .font('Helvetica')
         .text(item.value.toString(), x + 120, y);
    });

    // Footer
    const footerY = doc.page.height - 50;
    addColoredRect(0, footerY - 10, doc.page.width, 60, primaryColor);
    
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('white')
       .text(
         `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
         50,
         footerY + 5,
         { align: 'center', width: doc.page.width - 100 }
       );

    doc.text(
      'Project Management System - Confidential',
      50,
      footerY + 20,
      { align: 'center', width: doc.page.width - 100 }
    );

    return bufferPDF(doc);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
}

// Materials PDF
async function generateMaterialsPDF(projectId) {
  try {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const materials = await Material.find({ projectId });

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      info: {
        Title: `Materials List - ${project.name}`,
        Author: 'Project Management System',
        Subject: 'Materials List',
        Keywords: 'materials, list, inventory'
      }
    });

    // Colors
    const primaryColor = '#059669';
    const secondaryColor = '#64748b';
    const accentColor = '#f0fdf4';

    // Helper function for colored rectangles
    const addColoredRect = (x, y, width, height, color) => {
      doc.save()
         .fillColor(color)
         .rect(x, y, width, height)
         .fill()
         .restore();
    };

    // Header
    addColoredRect(0, 0, doc.page.width, 100, primaryColor);
    
    doc.fillColor('white')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('MATERIALS LIST', 50, 30, { align: 'center' });
    
    doc.fontSize(12)
       .text(`Project: ${project.name}`, 50, 60, { align: 'center' });

    doc.y = 130;

    if (materials.length > 0) {
      // Group materials by category
      const groupedMaterials = materials.reduce((acc, material) => {
        const category = material.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(material);
        return acc;
      }, {});

      // Sort categories alphabetically
      const sortedCategories = Object.keys(groupedMaterials).sort();

      sortedCategories.forEach((category, categoryIndex) => {
        // Category header
        doc.fillColor(primaryColor)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text(category.toUpperCase(), 50);
        
        doc.moveTo(50, doc.y + 5)
           .lineTo(200, doc.y + 5)
           .strokeColor(primaryColor)
           .lineWidth(2)
           .stroke();

        doc.moveDown(0.8);

        // Materials in this category
        groupedMaterials[category].forEach((material, materialIndex) => {
          if (doc.y > 720) { // New page if needed
            doc.addPage();
            doc.y = 50;
          }

          const itemY = doc.y;
          
          // Material item background
          addColoredRect(50, itemY, doc.page.width - 100, 70, accentColor);
          doc.strokeColor('#d1fae5')
             .lineWidth(1)
             .rect(50, itemY, doc.page.width - 100, 70)
             .stroke();

          // Material name
          doc.fillColor('#065f46')
             .fontSize(12)
             .font('Helvetica-Bold')
             .text(`${materialIndex + 1}. ${material.name}`, 60, itemY + 8);

          // Material details - using your original format
          doc.fillColor('#374151')
             .fontSize(10)
             .font('Helvetica')
             .text(`Quantity: ${material.quantity} ${material.unit}`, 60, itemY + 25)
             .text(`Price/Unit: ${material.pricePerUnit} MRU`, 60, itemY + 38)
             .text(`Total: ${material.totalPrice} MRU`, 60, itemY + 51);

          // Additional details on the right
          if (material.supplier && material.supplier !== 'N/A') {
            doc.text(`Supplier: ${material.supplier}`, 300, itemY + 25);
          }
          doc.text(`Category: ${material.category}`, 300, itemY + 38);

          doc.y = itemY + 80;
        });

        // Category summary
        const categoryTotal = groupedMaterials[category].reduce((sum, material) => 
          sum + (material.totalPrice || 0), 0
        );
        
        doc.fillColor(secondaryColor)
           .fontSize(11)
           .font('Helvetica-Bold')
           .text(`${category} Subtotal: ${categoryTotal} MRU`, 
                 doc.page.width - 200, doc.y - 10, { align: 'right' });

        doc.moveDown(1.5);
      });

      // Grand total
      const grandTotal = materials.reduce((sum, material) => sum + (material.totalPrice || 0), 0);
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text(`GRAND TOTAL: ${grandTotal} MRU`, 
               50, doc.y + 10, { align: 'right' });

    } else {
      // No materials message
      addColoredRect(50, doc.y, doc.page.width - 100, 100, accentColor);
      doc.strokeColor('#d1fae5')
         .rect(50, doc.y, doc.page.width - 100, 100)
         .stroke();

      doc.fillColor(secondaryColor)
         .fontSize(14)
         .font('Helvetica')
         .text('No materials have been added to this project yet.', 
               60, doc.y + 40, { align: 'center', width: doc.page.width - 120 });
    }

    // Footer
    const footerY = doc.page.height - 50;
    addColoredRect(0, footerY - 10, doc.page.width, 60, primaryColor);
    
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('white')
       .text(
         `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
         50,
         footerY + 5,
         { align: 'center', width: doc.page.width - 100 }
       );

    return bufferPDF(doc);
  } catch (error) {
    console.error('Materials PDF Generation Error:', error);
    throw error;
  }
}

module.exports = {
  generateProjectPDF,
  generateMaterialsPDF
};