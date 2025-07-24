const PDFDocument = require('pdfkit');
const Project = require('../models/Project');
const Material = require('../models/Material');

// Utilitaire pour buffering du PDF avec gestion d'erreurs améliorée
function bufferPDF(doc) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    let hasEnded = false;
    let timeout;

    const cleanup = () => {
      if (timeout) clearTimeout(timeout);
      doc.removeAllListeners('data');
      doc.removeAllListeners('end');
      doc.removeAllListeners('error');
    };

    const handleError = (error) => {
      cleanup();
      reject(new Error(`Échec de génération PDF: ${error.message}`));
    };

    const handleEnd = () => {
      if (hasEnded) return;
      hasEnded = true;
      cleanup();
      
      try {
        const buffer = Buffer.concat(buffers);
        if (buffer.length === 0) {
          reject(new Error('Le PDF généré est vide'));
          return;
        }
        console.log(`✅ PDF généré avec succès (${buffer.length} octets)`);
        resolve(buffer);
      } catch (error) {
        reject(new Error(`Échec de création du buffer PDF: ${error.message}`));
      }
    };

    // Timeout de sécurité
    timeout = setTimeout(() => {
      handleError(new Error('Timeout lors de la génération PDF'));
    }, 30000); // 30 secondes

    doc.on('data', (chunk) => {
      if (hasEnded) return;
      buffers.push(chunk);
    });
    
    doc.on('end', handleEnd);
    doc.on('error', handleError);

    if (!doc.ended) {
      try {
        doc.end();
      } catch (error) {
        handleError(error);
      }
    }
  });
}

// Fonctions d'aide pour le PDF en français - Version améliorée
const PDFHelpers = {
  // Palette de couleurs optimisée
  couleurs: {
    primaire: '#1e40af',        // Bleu professionnel
    secondaire: '#64748b',       // Gris ardoise
    accent: '#f8fafc',          // Gris très clair (fond)
    texte: '#1e293b',           // Gris foncé (texte)
    succes: '#059669',          // Vert (matériaux)
    accentSucces: '#f0fdf4',    // Vert très clair
    blanc: '#ffffff',
    bordure: '#e2e8f0',         // Bordures
    bordureSucces: '#d1fae5',   // Bordures vertes
    tableauEntete: '#1e40af',   // En-tête tableau
    tableauLigne: '#f1f5f9',    // Lignes alternées
    avertissement: '#dc2626',   // Rouge (dépassement)
    info: '#3b82f6',           // Bleu info
    grisClairbg: '#f9fafb'     // Fond très clair
  },

  // Traductions complètes
  traductions: {
    statuts: {
      'planning': 'En planification',
      'in-progress': 'En cours',
      'completed': 'Terminé',
      'on-hold': 'En pause',
      'cancelled': 'Annulé',
      'unknown': 'Statut inconnu'
    },
    unites: {
      'sqm': 'm²',
      'kg': 'kg',
      'unit': 'unité(s)',
      'm3': 'm³',
      'ton': 'tonne(s)',
      'liter': 'litre(s)',
      'meter': 'mètre(s)',
      'piece': 'pièce(s)',
      'box': 'boîte(s)',
      'roll': 'rouleau(x)',
      'bag': 'sac(s)'
    },
    categories: {
      'construction': 'Construction',
      'electrical': 'Électricité',
      'plumbing': 'Plomberie',
      'finishing': 'Finition',
      'tools': 'Outillage',
      'safety': 'Sécurité',
      'other': 'Autres'
    },
    mois: [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ]
  },

  // Formatage sécurisé du texte avec validation
  texteSecurise: (texte, longueurMax = 50) => {
    if (!texte || typeof texte !== 'string') return 'Non spécifié';
    const cleaned = texte.trim().replace(/\s+/g, ' '); // Nettoyer les espaces multiples
    return cleaned.length > longueurMax ? cleaned.substring(0, longueurMax - 3) + '...' : cleaned;
  },

  // Formatage des devises amélioré
  formaterDevise: (montant) => {
    const num = parseFloat(montant) || 0;
    if (num === 0) return '0 MRU';
    
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(num) + ' MRU';
    } catch (error) {
      return `${num.toFixed(2)} MRU`;
    }
  },

  // Formatage des nombres
  formaterNombre: (nombre) => {
    const num = parseFloat(nombre) || 0;
    try {
      return new Intl.NumberFormat('fr-FR').format(num);
    } catch {
      return num.toString();
    }
  },

  // Formatage des dates en français amélioré
  formaterDate: (date) => {
    if (!date) return 'Non définie';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Date invalide';
      
      return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  },

  // Formatage des dates courtes
  formaterDateCourte: (date) => {
    if (!date) return 'Non définie';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Invalide';
      return d.toLocaleDateString('fr-FR');
    } catch {
      return 'Invalide';
    }
  },

  // Formatage de l'heure
  formaterHeure: (date = new Date()) => {
    try {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return new Date().toTimeString().substring(0, 5);
    }
  },

  // Ajouter un rectangle coloré avec validation
  ajouterRectangleColore: (doc, x, y, largeur, hauteur, couleur) => {
    try {
      if (x < 0 || y < 0 || largeur <= 0 || hauteur <= 0) {
        console.warn('Paramètres de rectangle invalides:', { x, y, largeur, hauteur });
        return;
      }
      
      doc.save()
         .fillColor(couleur)
         .rect(x, y, largeur, hauteur)
         .fill()
         .restore();
    } catch (error) {
      console.warn('Échec ajout rectangle coloré:', error.message);
    }
  },

  // Vérification de saut de page améliorée
  verifierSautPage: (doc, hauteurRequise = 100, paddingBas = 100) => {
    const espaceRestant = doc.page.height - doc.y - paddingBas;
    if (espaceRestant < hauteurRequise) {
      doc.addPage();
      doc.y = 50;
      return true;
    }
    return false;
  },

  // Ajouter un en-tête de section avec style amélioré
  ajouterEnteteSection: (doc, titre, y = null, couleur = null, niveau = 1) => {
    if (y !== null) doc.y = y;
    
    const couleurTitre = couleur || PDFHelpers.couleurs.primaire;
    const tailles = { 1: 18, 2: 16, 3: 14 };
    const taille = tailles[niveau] || 18;
    
    // Fond léger pour le titre si niveau 1
    if (niveau === 1) {
      const hauteurFond = 35;
      PDFHelpers.ajouterRectangleColore(doc, 40, doc.y - 5, doc.page.width - 80, hauteurFond, PDFHelpers.couleurs.grisClairbg);
      doc.strokeColor(PDFHelpers.couleurs.bordure)
         .lineWidth(1)
         .rect(40, doc.y - 5, doc.page.width - 80, hauteurFond)
         .stroke();
    }
    
    doc.fillColor(couleurTitre)
       .fontSize(taille)
       .font('Helvetica-Bold')
       .text(titre, 50, niveau === 1 ? doc.y + 8 : doc.y);
    
    // Soulignement
    if (niveau <= 2) {
      const soulignementY = doc.y + 5;
      const textWidth = doc.widthOfString(titre, { fontSize: taille });
      doc.moveTo(50, soulignementY)
         .lineTo(50 + Math.min(textWidth + 10, 300), soulignementY)
         .strokeColor(couleurTitre)
         .lineWidth(niveau === 1 ? 3 : 2)
         .stroke();
    }

    doc.moveDown(niveau === 1 ? 1.5 : 1);
  },

  // Création de cartes d'information
  creerCarte: (doc, x, y, largeur, hauteur, titre, contenu, couleurFond = null) => {
    const couleur = couleurFond || PDFHelpers.couleurs.accent;
    
    // Fond de la carte
    PDFHelpers.ajouterRectangleColore(doc, x, y, largeur, hauteur, couleur);
    doc.strokeColor(PDFHelpers.couleurs.bordure)
       .lineWidth(1)
       .rect(x, y, largeur, hauteur)
       .stroke();

    // Titre de la carte
    if (titre) {
      doc.fillColor(PDFHelpers.couleurs.primaire)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(titre, x + 10, y + 10);
    }

    // Contenu de la carte
    if (contenu && Array.isArray(contenu)) {
      contenu.forEach((item, index) => {
        const yPos = y + (titre ? 35 : 15) + (index * 16);
        if (typeof item === 'object' && item.label && item.valeur) {
          doc.fontSize(10)
             .font('Helvetica-Bold')
             .fillColor(PDFHelpers.couleurs.texte)
             .text(item.label, x + 10, yPos);
          
          doc.font('Helvetica')
             .fillColor(item.couleur || PDFHelpers.couleurs.texte)
             .text(item.valeur, x + 120, yPos, { width: largeur - 130 });
        }
      });
    }
  },

  // Numérotation des pages améliorée
  ajouterNumerotationPages: (doc, titre = '') => {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      // Pied de page avec numéro et titre
      const piedY = doc.page.height - 25;
      doc.fontSize(8)
         .fillColor(PDFHelpers.couleurs.secondaire);
      
      // Numéro de page à droite
      doc.text(`Page ${i + 1} / ${pages.count}`, doc.page.width - 100, piedY, { 
        align: 'right', 
        width: 50 
      });
      
      // Titre du document à gauche (si fourni)
      if (titre) {
        doc.text(titre, 50, piedY, { 
          width: 200, 
          ellipsis: true 
        });
      }
    }
  },

  // Calcul de statistiques
  calculerStatistiques: (materials) => {
    if (!materials || materials.length === 0) {
      return {
        total: 0,
        moyenne: 0,
        nbItems: 0,
        categories: {},
        itemLePlusCher: null,
        itemLeMoinsCher: null
      };
    }

    const total = materials.reduce((sum, mat) => sum + (parseFloat(mat.totalPrice) || 0), 0);
    const moyenne = total / materials.length;
    
    const categories = materials.reduce((acc, mat) => {
      const cat = mat.category || 'other';
      if (!acc[cat]) acc[cat] = { count: 0, total: 0 };
      acc[cat].count++;
      acc[cat].total += parseFloat(mat.totalPrice) || 0;
      return acc;
    }, {});

    const sorted = materials.sort((a, b) => (parseFloat(b.totalPrice) || 0) - (parseFloat(a.totalPrice) || 0));
    
    return {
      total,
      moyenne,
      nbItems: materials.length,
      categories,
      itemLePlusCher: sorted[0] || null,
      itemLeMoinsCher: sorted[sorted.length - 1] || null
    };
  }
};

// Générateur PDF de Rapport de Projet amélioré
async function generateProjectPDF(projectId) {
  let doc;
  
  try {
    // Validation de l'entrée
    if (!projectId || typeof projectId !== 'string') {
      throw new Error('ID du projet requis et doit être une chaîne valide');
    }

    console.log('🔍 Début génération PDF projet:', projectId);
    
    // Récupération des données avec gestion d'erreur
    const [project, materials] = await Promise.all([
      Project.findById(projectId).lean(), // .lean() pour optimiser les performances
      Material.find({ projectId }).sort({ category: 1, name: 1 }).lean()
    ]);

    if (!project) {
      throw new Error(`Projet non trouvé avec l'ID: ${projectId}`);
    }

    console.log('📊 Données chargées:', {
      nom: project.name,
      materiaux: materials.length,
      statut: project.status
    });

    // Calcul des statistiques
    const stats = PDFHelpers.calculerStatistiques(materials);
    const coutTotal = stats.total;

    // Création du document PDF avec métadonnées complètes
    doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true,
      info: {
        Title: `Rapport de Projet - ${PDFHelpers.texteSecurise(project.name, 80)}`,
        Author: 'Système de Gestion de Projets',
        Subject: 'Rapport détaillé de projet de construction',
        Keywords: 'projet, rapport, matériaux, construction, BTP',
        Creator: 'Système de Gestion de Projets v2.0',
        Producer: 'PDFKit Node.js',
        CreationDate: new Date(),
        ModDate: new Date()
      }
    });

    // ========== PAGE DE COUVERTURE ==========
    // En-tête principal
    PDFHelpers.ajouterRectangleColore(doc, 0, 0, doc.page.width, 180, PDFHelpers.couleurs.primaire);
    
    doc.fillColor(PDFHelpers.couleurs.blanc)
       .fontSize(36)
       .font('Helvetica-Bold')
       .text('RAPPORT DE PROJET', 50, 40, { align: 'center' });

    // Nom du projet avec encadré
    const nomProjet = PDFHelpers.texteSecurise(project.name, 80);
    PDFHelpers.ajouterRectangleColore(doc, 80, 90, doc.page.width - 160, 50, 'rgba(255,255,255,0.1)');
    doc.fontSize(18)
       .font('Helvetica')
       .text(nomProjet, 90, 110, { 
         align: 'center', 
         width: doc.page.width - 180 
       });

    // Informations de génération
    doc.fontSize(12)
       .text(`Généré le ${PDFHelpers.formaterDate(new Date())}`, 50, 155, { align: 'center' });

    // Ligne décorative
    doc.strokeColor(PDFHelpers.couleurs.blanc)
       .lineWidth(3)
       .moveTo(120, 175)
       .lineTo(doc.page.width - 120, 175)
       .stroke();

    doc.y = 220;

    // ========== RÉSUMÉ EXÉCUTIF (Page de couverture) ==========
    PDFHelpers.ajouterEnteteSection(doc, 'RÉSUMÉ EXÉCUTIF');

    // Carte de résumé principal
    const resumeItems = [
      { 
        label: 'Statut du projet:', 
        valeur: PDFHelpers.traductions.statuts[project.status] || 'Inconnu',
        couleur: project.status === 'completed' ? PDFHelpers.couleurs.succes : PDFHelpers.couleurs.texte
      },
      { 
        label: 'Coût total:', 
        valeur: PDFHelpers.formaterDevise(coutTotal),
        couleur: PDFHelpers.couleurs.primaire
      },
      { 
        label: 'Nombre de matériaux:', 
        valeur: PDFHelpers.formaterNombre(materials.length),
        couleur: PDFHelpers.couleurs.texte
      },
      { 
        label: 'Localisation:', 
        valeur: PDFHelpers.texteSecurise(project.location, 40),
        couleur: PDFHelpers.couleurs.texte
      }
    ];

    if (project.budget) {
      const ecartBudget = coutTotal - project.budget;
      resumeItems.push({
        label: 'Statut budgétaire:',
        valeur: ecartBudget <= 0 ? 'Dans le budget' : `Dépassement de ${PDFHelpers.formaterDevise(ecartBudget)}`,
        couleur: ecartBudget <= 0 ? PDFHelpers.couleurs.succes : PDFHelpers.couleurs.avertissement
      });
    }

    PDFHelpers.creerCarte(doc, 50, doc.y, doc.page.width - 100, 120, '📊 APERÇU GÉNÉRAL', resumeItems);
    
    doc.y += 140;

    // Indicateurs clés
    PDFHelpers.verifierSautPage(doc, 150);
    
    const indicateurs = [
      { 
        titre: 'Coût moyen par matériau', 
        valeur: PDFHelpers.formaterDevise(stats.moyenne),
        icone: '💰'
      },
      { 
        titre: 'Catégories utilisées', 
        valeur: Object.keys(stats.categories).length.toString(),
        icone: '📋'
      }
    ];

    if (stats.itemLePlusCher) {
      indicateurs.push({
        titre: 'Article le plus coûteux',
        valeur: `${PDFHelpers.texteSecurise(stats.itemLePlusCher.name, 25)} (${PDFHelpers.formaterDevise(stats.itemLePlusCher.totalPrice)})`,
        icone: '🔝'
      });
    }

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(PDFHelpers.couleurs.primaire)
       .text('INDICATEURS CLÉS', 50);
    
    doc.moveDown(0.5);

    indicateurs.forEach((indic, index) => {
      const yPos = doc.y + (index * 25);
      doc.fontSize(10)
         .fillColor(PDFHelpers.couleurs.secondaire)
         .text(indic.icone, 60, yPos);
      
      doc.font('Helvetica-Bold')
         .fillColor(PDFHelpers.couleurs.texte)
         .text(indic.titre + ':', 80, yPos);
      
      doc.font('Helvetica')
         .text(indic.valeur, 250, yPos, { width: 250 });
    });

    doc.y += indicateurs.length * 25 + 30;

    // ========== NOUVELLE PAGE - DÉTAILS DU PROJET ==========
    doc.addPage();
    
    PDFHelpers.ajouterEnteteSection(doc, '1. INFORMATIONS DÉTAILLÉES DU PROJET');

    // Cartes d'information côte à côte
    const carteY = doc.y;
    const largeurCarte = 240;
    const hauteurCarte = 180;

    // Carte informations générales
    const infosGenerales = [
      { label: 'Nom complet:', valeur: PDFHelpers.texteSecurise(project.name, 35) },
      { label: 'Localisation:', valeur: PDFHelpers.texteSecurise(project.location, 35) },
      { label: 'Statut actuel:', valeur: PDFHelpers.traductions.statuts[project.status] || 'Inconnu' },
      { label: 'Créé le:', valeur: PDFHelpers.formaterDateCourte(project.createdAt) },
      { label: 'Modifié le:', valeur: PDFHelpers.formaterDateCourte(project.updatedAt) }
    ];

    if (project.description) {
      infosGenerales.push({ 
        label: 'Description:', 
        valeur: PDFHelpers.texteSecurise(project.description, 30) 
      });
    }

    PDFHelpers.creerCarte(doc, 50, carteY, largeurCarte, hauteurCarte, '📋 INFORMATIONS GÉNÉRALES', infosGenerales);

    // Carte budget et finances
    const infosFinancieres = [
      { label: 'Coût total actuel:', valeur: PDFHelpers.formaterDevise(coutTotal) }
    ];

    if (project.budget) {
      const ecart = coutTotal - project.budget;
      const pourcentageUtilise = (project.budget > 0) ? ((coutTotal / project.budget) * 100).toFixed(1) : 0;
      
      infosFinancieres.push(
        { label: 'Budget alloué:', valeur: PDFHelpers.formaterDevise(project.budget) },
        { 
          label: 'Écart budgétaire:', 
          valeur: `${ecart >= 0 ? '+' : ''}${PDFHelpers.formaterDevise(ecart)}`,
          couleur: ecart <= 0 ? PDFHelpers.couleurs.succes : PDFHelpers.couleurs.avertissement
        },
        { label: 'Utilisation budget:', valeur: `${pourcentageUtilise}%` }
      );
    } else {
      infosFinancieres.push({ label: 'Budget alloué:', valeur: 'Non défini' });
    }

    if (materials.length > 0) {
      infosFinancieres.push(
        { label: 'Coût moyen/matériau:', valeur: PDFHelpers.formaterDevise(stats.moyenne) },
        { label: 'Nombre d\'articles:', valeur: materials.length.toString() }
      );
    }

    PDFHelpers.creerCarte(doc, 310, carteY, largeurCarte, hauteurCarte, '💰 ANALYSE FINANCIÈRE', infosFinancieres);

    doc.y = carteY + hauteurCarte + 30;

    // ========== CHRONOLOGIE ET PLANNING ==========
    if (project.startDate || project.endDate) {
      PDFHelpers.verifierSautPage(doc, 120);
      PDFHelpers.ajouterEnteteSection(doc, '2. CHRONOLOGIE DU PROJET', null, null, 2);
      
      const chronoItems = [];
      
      if (project.startDate) {
        chronoItems.push({ label: 'Date de début:', valeur: PDFHelpers.formaterDate(project.startDate) });
      }
      
      if (project.endDate) {
        chronoItems.push({ label: 'Date de fin prévue:', valeur: PDFHelpers.formaterDate(project.endDate) });
      }

      // Calcul de la durée
      if (project.startDate && project.endDate) {
        const dureeMs = new Date(project.endDate) - new Date(project.startDate);
        const dureeJours = Math.ceil(dureeMs / (1000 * 60 * 60 * 24));
        chronoItems.push({ 
          label: 'Durée totale:', 
          valeur: `${dureeJours} jour${dureeJours > 1 ? 's' : ''}` 
        });

        // Calcul du temps écoulé si le projet a commencé
        if (new Date() >= new Date(project.startDate)) {
          const tempsEcouleMs = Math.min(new Date() - new Date(project.startDate), dureeMs);
          const joursEcoules = Math.floor(tempsEcouleMs / (1000 * 60 * 60 * 24));
          const progression = ((joursEcoules / dureeJours) * 100).toFixed(1);
          
          chronoItems.push({ 
            label: 'Progression temporelle:', 
            valeur: `${joursEcoules} jours (${progression}%)` 
          });
        }
      }

      PDFHelpers.creerCarte(doc, 50, doc.y, doc.page.width - 100, 80 + (chronoItems.length * 16), '📅 PLANNING', chronoItems);
      doc.y += 100 + (chronoItems.length * 16);
    }

    // ========== NOTES ET OBSERVATIONS ==========
    if (project.notes && project.notes.trim() && project.notes !== 'N/A') {
      PDFHelpers.verifierSautPage(doc, 150);
      PDFHelpers.ajouterEnteteSection(doc, '3. NOTES ET OBSERVATIONS', null, null, 2);
      
      // Calculer la hauteur nécessaire pour les notes
      const notesHeight = Math.max(60, doc.heightOfString(project.notes, {
        width: doc.page.width - 120,
        align: 'justify'
      }) + 40);

      PDFHelpers.ajouterRectangleColore(doc, 50, doc.y, doc.page.width - 100, notesHeight, PDFHelpers.couleurs.grisClairbg);
      doc.strokeColor(PDFHelpers.couleurs.bordure)
         .lineWidth(1)
         .rect(50, doc.y, doc.page.width - 100, notesHeight)
         .stroke();

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor(PDFHelpers.couleurs.texte)
         .text(project.notes, 60, doc.y + 20, {
           width: doc.page.width - 120,
           align: 'justify'
         });

      doc.y += notesHeight + 20;
    }

    // ========== NOUVELLE PAGE - ANALYSE DES MATÉRIAUX ==========
    if (materials.length > 0) {
      doc.addPage();
      PDFHelpers.ajouterEnteteSection(doc, '4. ANALYSE DÉTAILLÉE DES MATÉRIAUX');

      // === Analyse par catégorie ===
      PDFHelpers.ajouterEnteteSection(doc, '4.1 Répartition par Catégorie', null, null, 2);

      const categoriesStats = Object.entries(stats.categories)
        .map(([cat, data]) => ({
          nom: PDFHelpers.traductions.categories[cat] || cat,
          count: data.count,
          total: data.total,
          pourcentage: ((data.total / coutTotal) * 100).toFixed(1)
        }))
        .sort((a, b) => b.total - a.total);

      categoriesStats.forEach((cat) => {
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor(PDFHelpers.couleurs.texte)
           .text(`• ${cat.nom}:`, 70, doc.y)
           .text(`${cat.count} article${cat.count > 1 ? 's' : ''} - ${PDFHelpers.formaterDevise(cat.total)} (${cat.pourcentage}%)`, 200, doc.y, { width: 300 });
        
        doc.moveDown(0.4);
      });

      doc.moveDown(1);

      // === Tableau détaillé ===
      PDFHelpers.verifierSautPage(doc, 200);
      PDFHelpers.ajouterEnteteSection(doc, '4.2 Liste Complète des Matériaux', null, null, 2);

      // Configuration optimisée du tableau
      const tableConfig = {
        startX: 50,
        hauteurLigne: 28,
        hauteurEntete: 40,
        colonnes: [
          { cle: 'nom', libelle: 'Matériau', largeur: 110, align: 'left' },
          { cle: 'quantite', libelle: 'Quantité', largeur: 50, align: 'center' },
          { cle: 'unite', libelle: 'Unité', largeur: 50, align: 'center' },
          { cle: 'prixUnitaire', libelle: 'Prix Unit.', largeur: 75, align: 'right' },
          { cle: 'prixTotal', libelle: 'Total', largeur: 75, align: 'right' },
          { cle: 'categorie', libelle: 'Catégorie', largeur: 80, align: 'left' },
          { cle: 'fournisseur', libelle: 'Fournisseur', largeur: 85, align: 'left' }
        ]
      };

      // Calculer positions X
      let currentX = tableConfig.startX;
      tableConfig.colonnes.forEach(col => {
        col.x = currentX;
        currentX += col.largeur;
      });
      const tableWidth = currentX - tableConfig.startX;

      // En-tête du tableau avec style amélioré
      PDFHelpers.ajouterRectangleColore(doc, tableConfig.startX, doc.y, tableWidth, tableConfig.hauteurEntete, PDFHelpers.couleurs.primaire);
      
      // Bordure de l'en-tête
      doc.strokeColor(PDFHelpers.couleurs.bordure)
         .lineWidth(2)
         .rect(tableConfig.startX, doc.y, tableWidth, tableConfig.hauteurEntete)
         .stroke();

      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor(PDFHelpers.couleurs.blanc);

      tableConfig.colonnes.forEach(col => {
        doc.text(col.libelle.toUpperCase(), col.x + 5, doc.y + 15, {
          width: col.largeur - 10,
          align: 'center'
        });
      });

      let yActuel = doc.y + tableConfig.hauteurEntete;
      let indexLigne = 0;

      // Tri des matériaux par catégorie puis par nom
      const materiauxTries = materials.sort((a, b) => {
        const catA = PDFHelpers.traductions.categories[a.category] || 'Autres';
        const catB = PDFHelpers.traductions.categories[b.category] || 'Autres';
        if (catA !== catB) return catA.localeCompare(catB);
        return (a.name || '').localeCompare(b.name || '');
      });

      // Rendu des lignes de matériaux
      for (const material of materiauxTries) {
        // Vérification de saut de page
        if (PDFHelpers.verifierSautPage(doc, tableConfig.hauteurLigne + 20)) {
          yActuel = doc.y;
          
          // Refaire l'en-tête sur la nouvelle page
          PDFHelpers.ajouterRectangleColore(doc, tableConfig.startX, yActuel, tableWidth, tableConfig.hauteurEntete, PDFHelpers.couleurs.primaire);
          doc.strokeColor(PDFHelpers.couleurs.bordure)
             .lineWidth(2)
             .rect(tableConfig.startX, yActuel, tableWidth, tableConfig.hauteurEntete)
             .stroke();

          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor(PDFHelpers.couleurs.blanc);

          tableConfig.colonnes.forEach(col => {
            doc.text(col.libelle.toUpperCase(), col.x + 5, yActuel + 15, {
              width: col.largeur - 10,
              align: 'center'
            });
          });
          
          yActuel += tableConfig.hauteurEntete;
          indexLigne = 0; // Reset pour l'alternance des couleurs
        }

        // Couleur alternée des lignes
        const couleurLigne = indexLigne % 2 === 0 ? PDFHelpers.couleurs.blanc : PDFHelpers.couleurs.tableauLigne;
        PDFHelpers.ajouterRectangleColore(doc, tableConfig.startX, yActuel, tableWidth, tableConfig.hauteurLigne, couleurLigne);

        // Bordures des cellules
        doc.strokeColor(PDFHelpers.couleurs.bordure)
           .lineWidth(0.5);
        
        tableConfig.colonnes.forEach((col) => {
          doc.rect(col.x, yActuel, col.largeur, tableConfig.hauteurLigne).stroke();
        });

        // Contenu des cellules
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor(PDFHelpers.couleurs.texte);

        const donneesLigne = {
          nom: PDFHelpers.texteSecurise(material.name, 18),
          quantite: PDFHelpers.formaterNombre(material.quantity || 0),
          unite: PDFHelpers.traductions.unites[material.unit] || material.unit || 'N/A',
          prixUnitaire: PDFHelpers.formaterDevise(material.pricePerUnit).replace(' MRU', ''),
          prixTotal: PDFHelpers.formaterDevise(material.totalPrice).replace(' MRU', ''),
          categorie: PDFHelpers.traductions.categories[material.category] || 'Autres',
          fournisseur: PDFHelpers.texteSecurise(material.supplier, 12) || 'N/A'
        };

        tableConfig.colonnes.forEach(col => {
          doc.text(donneesLigne[col.cle], col.x + 3, yActuel + 10, {
            width: col.largeur - 6,
            align: col.align,
            ellipsis: true
          });
        });

        yActuel += tableConfig.hauteurLigne;
        indexLigne++;
      }

      // Ligne de total avec style amélioré
      PDFHelpers.ajouterRectangleColore(doc, tableConfig.startX, yActuel, tableWidth, tableConfig.hauteurEntete, PDFHelpers.couleurs.primaire);
      
      doc.strokeColor(PDFHelpers.couleurs.bordure)
         .lineWidth(2)
         .rect(tableConfig.startX, yActuel, tableWidth, tableConfig.hauteurEntete)
         .stroke();

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(PDFHelpers.couleurs.blanc)
         .text('COÛT TOTAL DU PROJET', tableConfig.startX + 10, yActuel + 15)
         .text(PDFHelpers.formaterDevise(coutTotal), tableConfig.colonnes[4].x + 3, yActuel + 15, {
           width: tableConfig.colonnes[4].largeur + tableConfig.colonnes[5].largeur + tableConfig.colonnes[6].largeur - 6,
           align: 'right'
         });

      doc.y = yActuel + tableConfig.hauteurEntete + 30;

    } else {
      // Message si aucun matériau
      PDFHelpers.verifierSautPage(doc, 120);
      PDFHelpers.ajouterEnteteSection(doc, '4. MATÉRIAUX DU PROJET');
      
      PDFHelpers.ajouterRectangleColore(doc, 50, doc.y, doc.page.width - 100, 100, PDFHelpers.couleurs.grisClairbg);
      doc.strokeColor(PDFHelpers.couleurs.bordure)
         .rect(50, doc.y, doc.page.width - 100, 100)
         .stroke();

      doc.fontSize(16)
         .font('Helvetica')
         .fillColor(PDFHelpers.couleurs.secondaire)
         .text('📦 Aucun matériau enregistré', 60, doc.y + 30, { 
           align: 'center', 
           width: doc.page.width - 120 
         });

      doc.fontSize(12)
         .text('Ce projet ne contient encore aucun matériau.\nAjoutez des matériaux pour voir l\'analyse détaillée.', 
               60, doc.y + 60, { 
                 align: 'center', 
                 width: doc.page.width - 120 
               });

      doc.y += 120;
    }

    // ========== NOUVELLE PAGE - CONCLUSIONS ET RECOMMANDATIONS ==========
    doc.addPage();
    PDFHelpers.ajouterEnteteSection(doc, '5. CONCLUSIONS ET RECOMMANDATIONS');

    // Analyse budgétaire détaillée
    let conclusions = [];
    
    if (project.budget && materials.length > 0) {
      const ecart = coutTotal - project.budget;
      const pourcentageUtilise = ((coutTotal / project.budget) * 100).toFixed(1);
      
      if (ecart <= 0) {
        conclusions.push({
          type: 'success',
          titre: '✅ Budget respecté',
          description: `Le projet reste dans les limites budgétaires avec ${PDFHelpers.formaterDevise(Math.abs(ecart))} d'économie (${pourcentageUtilise}% du budget utilisé).`
        });
      } else {
        conclusions.push({
          type: 'warning',
          titre: '⚠️ Dépassement budgétaire',
          description: `Le projet dépasse le budget de ${PDFHelpers.formaterDevise(ecart)} (${pourcentageUtilise}% du budget utilisé).`
        });
      }
    }

    // Analyse des matériaux
    if (materials.length > 0) {
      const nbCategories = Object.keys(stats.categories).length;
      conclusions.push({
        type: 'info',
        titre: '📊 Diversité des matériaux',
        description: `Le projet utilise ${materials.length} matériaux répartis sur ${nbCategories} catégorie${nbCategories > 1 ? 's' : ''}.`
      });

      if (stats.itemLePlusCher) {
        const pctPlusCher = ((parseFloat(stats.itemLePlusCher.totalPrice) / coutTotal) * 100).toFixed(1);
        conclusions.push({
          type: 'info',
          titre: '💰 Article principal',
          description: `"${PDFHelpers.texteSecurise(stats.itemLePlusCher.name, 30)}" représente ${pctPlusCher}% du coût total (${PDFHelpers.formaterDevise(stats.itemLePlusCher.totalPrice)}).`
        });
      }
    }

    // Recommandations basées sur l'analyse
    const recommandations = [];
    
    if (project.budget && coutTotal > project.budget * 0.95) {
      recommandations.push('Surveiller de près les coûts futurs pour éviter un dépassement significatif.');
    }
    
    if (materials.length > 20) {
      recommandations.push('Envisager une consolidation des achats auprès de moins de fournisseurs pour optimiser les coûts.');
    }
    
    if (Object.keys(stats.categories).length === 1) {
      recommandations.push('Vérifier que toutes les catégories de matériaux nécessaires ont été prises en compte.');
    }

    // Affichage des conclusions
    conclusions.forEach((conclusion, index) => {
      PDFHelpers.verifierSautPage(doc, 80);
      
      const couleurFond = conclusion.type === 'success' ? PDFHelpers.couleurs.accentSucces :
                         conclusion.type === 'warning' ? '#fef3c7' : PDFHelpers.couleurs.grisClairbg;
      
      PDFHelpers.ajouterRectangleColore(doc, 50, doc.y, doc.page.width - 100, 60, couleurFond);
      doc.strokeColor(PDFHelpers.couleurs.bordure)
         .lineWidth(1)
         .rect(50, doc.y, doc.page.width - 100, 60)
         .stroke();

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(PDFHelpers.couleurs.texte)
         .text(conclusion.titre, 60, doc.y + 10);

      doc.fontSize(10)
         .font('Helvetica')
         .text(conclusion.description, 60, doc.y + 30, { 
           width: doc.page.width - 120,
           align: 'justify'
         });

      doc.y += 80;
    });

    // Recommandations
    if (recommandations.length > 0) {
      PDFHelpers.verifierSautPage(doc, 100);
      PDFHelpers.ajouterEnteteSection(doc, 'RECOMMANDATIONS', null, null, 2);

      recommandations.forEach((rec, index) => {
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor(PDFHelpers.couleurs.texte)
           .text(`${index + 1}. ${rec}`, 70, doc.y, { width: doc.page.width - 120 });
        doc.moveDown(0.8);
      });
    }

    // ========== PIED DE PAGE FINAL ==========
    const piedY = doc.page.height - 100;
    PDFHelpers.ajouterRectangleColore(doc, 0, piedY, doc.page.width, 100, PDFHelpers.couleurs.primaire);

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor(PDFHelpers.couleurs.blanc)
       .text('SYSTÈME DE GESTION DE PROJETS', 50, piedY + 20, { 
         align: 'center', 
         width: doc.page.width - 100 
       });

    doc.fontSize(9)
       .font('Helvetica')
       .text(`Document généré le ${PDFHelpers.formaterDate(new Date())} à ${PDFHelpers.formaterHeure()}`, 
              50, piedY + 45, { 
                align: 'center', 
                width: doc.page.width - 100 
              });

    doc.text('Document confidentiel - Usage interne uniquement', 
             50, piedY + 65, { 
               align: 'center', 
               width: doc.page.width - 100 
             });

    // Numérotation des pages avec titre
    PDFHelpers.ajouterNumerotationPages(doc, `Rapport - ${PDFHelpers.texteSecurise(project.name, 20)}`);

    console.log('✅ Génération PDF projet terminée avec succès');
    return await bufferPDF(doc);

  } catch (error) {
    console.error('❌ Erreur génération PDF projet:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : 'Stack masqué en production',
      projectId,
      timestamp: new Date().toISOString()
    });

    // Nettoyage en cas d'erreur
    if (doc && !doc.ended) {
      try {
        doc.end();
      } catch (cleanupError) {
        console.error('Échec nettoyage document PDF:', cleanupError.message);
      }
    }

    throw new Error(`Échec génération PDF projet: ${error.message}`);
  }
}

// Générateur PDF Liste des Matériaux amélioré
async function generateMaterialsPDF(projectId) {
  let doc;

  try {
    // Validation de l'entrée
    if (!projectId || typeof projectId !== 'string') {
      throw new Error('ID du projet requis et doit être une chaîne valide');
    }

    console.log('🔍 Début génération PDF matériaux:', projectId);

    // Récupération des données
    const [project, materials] = await Promise.all([
      Project.findById(projectId).lean(),
      Material.find({ projectId }).sort({ category: 1, name: 1 }).lean()
    ]);

    if (!project) {
      throw new Error(`Projet non trouvé avec l'ID: ${projectId}`);
    }

    console.log('📊 Données matériaux chargées:', {
      nomProjet: project.name,
      nombreMateriaux: materials.length
    });

    // Calcul des statistiques
    const stats = PDFHelpers.calculerStatistiques(materials);
    const totalGeneral = stats.total;

    // Création du document
    doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true,
      info: {
        Title: `Liste des Matériaux - ${PDFHelpers.texteSecurise(project.name, 80)}`,
        Author: 'Système de Gestion de Projets',
        Subject: 'Liste détaillée des matériaux de construction',
        Keywords: 'matériaux, liste, inventaire, construction, BTP',
        Creator: 'Système de Gestion de Projets v2.0',
        Producer: 'PDFKit Node.js',
        CreationDate: new Date(),
        ModDate: new Date()
      }
    });

    // ========== EN-TÊTE AMÉLIORÉ ==========
    PDFHelpers.ajouterRectangleColore(doc, 0, 0, doc.page.width, 140, PDFHelpers.couleurs.succes);

    doc.fillColor(PDFHelpers.couleurs.blanc)
       .fontSize(32)
       .font('Helvetica-Bold')
       .text('LISTE DES MATÉRIAUX', 50, 30, { align: 'center' });

    // Nom du projet dans un encadré
    PDFHelpers.ajouterRectangleColore(doc, 80, 75, doc.page.width - 160, 40, 'rgba(255,255,255,0.1)');
    doc.fontSize(16)
       .font('Helvetica')
       .text(`Projet: ${PDFHelpers.texteSecurise(project.name, 60)}`, 90, 90, { 
         align: 'center',
         width: doc.page.width - 180
       });

    // Informations de génération
    doc.fontSize(10)
       .text(`Généré le ${PDFHelpers.formaterDate(new Date())} à ${PDFHelpers.formaterHeure()}`, 
              50, 125, { align: 'center' });

    doc.y = 170;

    if (materials.length > 0) {
      // ========== TABLEAU DE BORD EXÉCUTIF ==========
      PDFHelpers.ajouterEnteteSection(doc, 'TABLEAU DE BORD', null, PDFHelpers.couleurs.succes);

      const dashboardItems = [
        { 
          label: 'Nombre total d\'articles:', 
          valeur: PDFHelpers.formaterNombre(materials.length),
          icone: '📦' 
        },
        { 
          label: 'Valeur totale du stock:', 
          valeur: PDFHelpers.formaterDevise(totalGeneral),
          icone: '💰' 
        },
        { 
          label: 'Nombre de catégories:', 
          valeur: Object.keys(stats.categories).length.toString(),
          icone: '📋' 
        },
        { 
          label: 'Valeur moyenne par article:', 
          valeur: PDFHelpers.formaterDevise(stats.moyenne),
          icone: '📊' 
        }
      ];

      if (project.budget) {
        const pourcentageBudget = ((totalGeneral / project.budget) * 100).toFixed(1);
        dashboardItems.push({
          label: 'Utilisation du budget:',
          valeur: `${pourcentageBudget}% (${PDFHelpers.formaterDevise(project.budget)} alloués)`,
          icone: '🎯'
        });
      }

      // Affichage du tableau de bord
      const dashboardHeight = 40 + (Math.ceil(dashboardItems.length / 2) * 25);
      PDFHelpers.ajouterRectangleColore(doc, 50, doc.y, doc.page.width - 100, dashboardHeight, PDFHelpers.couleurs.accentSucces);
      doc.strokeColor(PDFHelpers.couleurs.bordureSucces)
         .lineWidth(1)
         .rect(50, doc.y, doc.page.width - 100, dashboardHeight)
         .stroke();

      const dashboardY = doc.y + 15;
      
      dashboardItems.forEach((item, index) => {
        const x = 60 + (index % 2) * 250;
        const y = dashboardY + Math.floor(index / 2) * 25;
        
        doc.fontSize(10)
           .fillColor(PDFHelpers.couleurs.secondaire)
           .text(item.icone, x, y);
        
        doc.font('Helvetica-Bold')
           .fillColor('#065f46')
           .text(item.label, x + 20, y);
        
        doc.font('Helvetica')
           .fillColor(PDFHelpers.couleurs.texte)
           .text(item.valeur, x + 150, y, { width: 90 });
      });

      doc.y += dashboardHeight + 30;

      // ========== ANALYSE PAR CATÉGORIE ==========
      const materiauxGroupes = materials.reduce((acc, material) => {
        const categorie = PDFHelpers.traductions.categories[material.category] || 'Autres';
        if (!acc[categorie]) acc[categorie] = [];
        acc[categorie].push(material);
        return acc;
      }, {});

      const categoriesTriees = Object.keys(materiauxGroupes).sort();

      for (const [indexCategorie, categorie] of categoriesTriees.entries()) {
        PDFHelpers.verifierSautPage(doc, 200);

        // En-tête de catégorie avec style amélioré
        const headerY = doc.y;
        PDFHelpers.ajouterRectangleColore(doc, 45, headerY - 5, doc.page.width - 90, 35, PDFHelpers.couleurs.succes);
        
        doc.fillColor(PDFHelpers.couleurs.blanc)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text(`${indexCategorie + 1}. ${categorie.toUpperCase()}`, 55, headerY + 5);

        doc.y = headerY + 40;

        // Statistiques de la catégorie
        const sousTotal = materiauxGroupes[categorie].reduce((somme, material) =>
          somme + (parseFloat(material.totalPrice) || 0), 0);
        
        const pourcentageCategorie = ((sousTotal / totalGeneral) * 100).toFixed(1);
        const moyenneCategorie = sousTotal / materiauxGroupes[categorie].length;

        const statsCategorie = [
          { label: 'Articles dans cette catégorie:', valeur: materiauxGroupes[categorie].length.toString() },
          { label: 'Valeur totale:', valeur: PDFHelpers.formaterDevise(sousTotal) },
          { label: 'Pourcentage du total:', valeur: `${pourcentageCategorie}%` },
          { label: 'Valeur moyenne:', valeur: PDFHelpers.formaterDevise(moyenneCategorie) }
        ];

        PDFHelpers.creerCarte(doc, 50, doc.y, doc.page.width - 100, 80, '📊 STATISTIQUES', statsCategorie, PDFHelpers.couleurs.accentSucces);
        doc.y += 100;

        // Liste détaillée des matériaux de la catégorie
        for (const [indexMaterial, material] of materiauxGroupes[categorie].entries()) {
          const itemHeight = 90;
          PDFHelpers.verifierSautPage(doc, itemHeight + 10);

          const itemY = doc.y;

          // Fond alterné pour chaque item
          const couleurFond = indexMaterial % 2 === 0 ? PDFHelpers.couleurs.accentSucces : PDFHelpers.couleurs.blanc;
          PDFHelpers.ajouterRectangleColore(doc, 50, itemY, doc.page.width - 100, itemHeight, couleurFond);
          doc.strokeColor(PDFHelpers.couleurs.bordureSucces)
             .lineWidth(1)
             .rect(50, itemY, doc.page.width - 100, itemHeight)
             .stroke();

          // Nom et numéro du matériau
          doc.fillColor('#065f46')
             .fontSize(12)
             .font('Helvetica-Bold')
             .text(`${indexMaterial + 1}. ${PDFHelpers.texteSecurise(material.name, 50)}`, 60, itemY + 10);

          // Informations détaillées en colonnes
          const infosGauche = [
            `Quantité: ${PDFHelpers.formaterNombre(material.quantity || 0)} ${PDFHelpers.traductions.unites[material.unit] || material.unit || 'N/A'}`,
            `Prix unitaire: ${PDFHelpers.formaterDevise(material.pricePerUnit)}`,
            `Valeur totale: ${PDFHelpers.formaterDevise(material.totalPrice)}`
          ];

          const infosDroite = [
            `Fournisseur: ${PDFHelpers.texteSecurise(material.supplier, 25) || 'Non spécifié'}`,
            `Catégorie: ${PDFHelpers.traductions.categories[material.category] || 'Autres'}`,
            material.description ? `Description: ${PDFHelpers.texteSecurise(material.description, 30)}` : 'Aucune description'
          ];

          // Colonne gauche
          infosGauche.forEach((info, index) => {
            doc.fillColor('#374151')
               .fontSize(10)
               .font('Helvetica')
               .text(info, 60, itemY + 35 + (index * 15), { width: 250 });
          });

          // Colonne droite
          infosDroite.forEach((info, index) => {
            doc.text(info, 320, itemY + 35 + (index * 15), { width: 250 });
          });

          doc.y = itemY + itemHeight + 5;
        }

        // Sous-total de la catégorie
        PDFHelpers.ajouterRectangleColore(doc, doc.page.width - 280, doc.y, 230, 30, PDFHelpers.couleurs.succes);
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(PDFHelpers.couleurs.blanc)
           .text(`Sous-total ${categorie}:`, doc.page.width - 270, doc.y + 10)
           .text(PDFHelpers.formaterDevise(sousTotal), doc.page.width - 150, doc.y + 10);

        doc.y += 50; // Espace entre catégories
      }

      // ========== RÉCAPITULATIF FINAL ==========
      doc.addPage();
      PDFHelpers.ajouterEnteteSection(doc, 'RÉCAPITULATIF GÉNÉRAL', null, PDFHelpers.couleurs.succes);

      // Total général avec mise en valeur
      PDFHelpers.ajouterRectangleColore(doc, 50, doc.y, doc.page.width - 100, 80, PDFHelpers.couleurs.succes);
      doc.strokeColor(PDFHelpers.couleurs.bordureSucces)
         .lineWidth(3)
         .rect(50, doc.y, doc.page.width - 100, 80)
         .stroke();

      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor(PDFHelpers.couleurs.blanc)
         .text('VALEUR TOTALE DU STOCK', 60, doc.y + 20, { align: 'center', width: doc.page.width - 120 });

      doc.fontSize(24)
         .text(PDFHelpers.formaterDevise(totalGeneral), 60, doc.y + 45, { align: 'center', width: doc.page.width - 120 });

      doc.y += 100;

      // Tableau récapitulatif par catégorie
      PDFHelpers.ajouterEnteteSection(doc, 'RÉPARTITION PAR CATÉGORIE', null, null, 2);

      const tableauRecap = {
        startX: 50,
        hauteurEntete: 35,
        hauteurLigne: 30,
        colonnes: [
          { libelle: 'Catégorie', largeur: 130, align: 'left' },
          { libelle: 'Nombre', largeur: 80, align: 'center' },
          { libelle: 'Valeur Totale', largeur: 110, align: 'right' },
          { libelle: '% du Total', largeur: 80, align: 'center' },
          { libelle: 'Valeur Moyenne', largeur: 115, align: 'right' }
        ]
      };

      // Calcul des positions
      let currentXRecap = tableauRecap.startX;
      tableauRecap.colonnes.forEach(col => {
        col.x = currentXRecap;
        currentXRecap += col.largeur;
      });
      const tableRecapWidth = currentXRecap - tableauRecap.startX;

      // En-tête du tableau récapitulatif
      PDFHelpers.ajouterRectangleColore(doc, tableauRecap.startX, doc.y, tableRecapWidth, tableauRecap.hauteurEntete, PDFHelpers.couleurs.succes);
      doc.strokeColor(PDFHelpers.couleurs.bordureSucces)
         .lineWidth(2)
         .rect(tableauRecap.startX, doc.y, tableRecapWidth, tableauRecap.hauteurEntete)
         .stroke();

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(PDFHelpers.couleurs.blanc);

      tableauRecap.colonnes.forEach(col => {
        doc.text(col.libelle.toUpperCase(), col.x + 5, doc.y + 12, {
          width: col.largeur - 10,
          align: 'center'
        });
      });

      let yRecap = doc.y + tableauRecap.hauteurEntete;

      // Données du tableau récapitulatif
      const categoriesRecap = Object.entries(materiauxGroupes)
        .map(([categorie, materiaux]) => {
          const total = materiaux.reduce((s, m) => s + (parseFloat(m.totalPrice) || 0), 0);
          return {
            nom: categorie,
            count: materiaux.length,
            total,
            pourcentage: totalGeneral > 0 ? ((total / totalGeneral) * 100).toFixed(1) : '0.0',
            moyenne: total / materiaux.length
          };
        })
        .sort((a, b) => b.total - a.total);

      categoriesRecap.forEach((cat, index) => {
        PDFHelpers.verifierSautPage(doc, tableauRecap.hauteurLigne + 10);
        if (doc.y < yRecap) yRecap = doc.y; // Reset après saut de page

        // Couleur alternée
        const couleurLigne = index % 2 === 0 ? PDFHelpers.couleurs.blanc : PDFHelpers.couleurs.accentSucces;
        PDFHelpers.ajouterRectangleColore(doc, tableauRecap.startX, yRecap, tableRecapWidth, tableauRecap.hauteurLigne, couleurLigne);

        // Bordures
        doc.strokeColor(PDFHelpers.couleurs.bordureSucces)
           .lineWidth(0.5);
        
        tableauRecap.colonnes.forEach(col => {
          doc.rect(col.x, yRecap, col.largeur, tableauRecap.hauteurLigne).stroke();
        });

        // Contenu des cellules
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#374151');

        const donneesRecap = [
          cat.nom,
          cat.count.toString(),
          PDFHelpers.formaterDevise(cat.total),
          `${cat.pourcentage}%`,
          PDFHelpers.formaterDevise(cat.moyenne)
        ];

        tableauRecap.colonnes.forEach((col, colIndex) => {
          doc.text(donneesRecap[colIndex], col.x + 5, yRecap + 10, {
            width: col.largeur - 10,
            align: col.align
          });
        });

        yRecap += tableauRecap.hauteurLigne;
      });

      doc.y = yRecap + 30;

      // ========== ANALYSE ET INSIGHTS ==========
      PDFHelpers.ajouterEnteteSection(doc, 'ANALYSE ET RECOMMANDATIONS', null, null, 2);

      const insights = [];

      // Analyse de la répartition
      if (categoriesRecap.length > 0) {
        const catPrincipale = categoriesRecap[0];
        if (catPrincipale.pourcentage > 50) {
          insights.push({
            type: 'warning',
            titre: '⚠️ Concentration élevée',
            description: `La catégorie "${catPrincipale.nom}" représente ${catPrincipale.pourcentage}% de la valeur totale. Une diversification pourrait réduire les risques.`
          });
        }
      }

      // Analyse budgétaire
      if (project.budget) {
        const utilisationBudget = (totalGeneral / project.budget) * 100;
        if (utilisationBudget > 90) {
          insights.push({
            type: 'warning',
            titre: '💰 Budget critique',
            description: `Utilisation à ${utilisationBudget.toFixed(1)}% du budget. Surveillance rapprochée recommandée.`
          });
        } else if (utilisationBudget < 70) {
          insights.push({
            type: 'info',
            titre: '💡 Optimisation possible',
            description: `Seulement ${utilisationBudget.toFixed(1)}% du budget utilisé. Des améliorations ou extensions sont peut-être possibles.`
          });
        }
      }

      // Analyse des quantités
      if (materials.length > 50) {
        insights.push({
          type: 'info',
          titre: '📦 Stock important',
          description: `Le projet compte ${materials.length} articles différents. Envisager une optimisation de la gestion des stocks.`
        });
      }

      // Affichage des insights
      insights.forEach((insight) => {
        PDFHelpers.verifierSautPage(doc, 80);
        
        const couleurFond = insight.type === 'warning' ? '#fef3c7' : 
                           insight.type === 'success' ? PDFHelpers.couleurs.accentSucces : 
                           PDFHelpers.couleurs.grisClairbg;
        
        PDFHelpers.ajouterRectangleColore(doc, 50, doc.y, doc.page.width - 100, 65, couleurFond);
        doc.strokeColor(PDFHelpers.couleurs.bordure)
           .lineWidth(1)
           .rect(50, doc.y, doc.page.width - 100, 65)
           .stroke();

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(PDFHelpers.couleurs.texte)
           .text(insight.titre, 60, doc.y + 10);

        doc.fontSize(10)
           .font('Helvetica')
           .text(insight.description, 60, doc.y + 30, { 
             width: doc.page.width - 120,
             align: 'justify'
           });

        doc.y += 85;
      });

    } else {
      // ========== MESSAGE AUCUN MATÉRIAU ==========
      PDFHelpers.ajouterRectangleColore(doc, 50, doc.y, doc.page.width - 100, 150, PDFHelpers.couleurs.accentSucces);
      doc.strokeColor(PDFHelpers.couleurs.bordureSucces)
         .lineWidth(2)
         .rect(50, doc.y, doc.page.width - 100, 150)
         .stroke();

      // Icône et message principal
      doc.fillColor(PDFHelpers.couleurs.secondaire)
         .fontSize(24)
         .text('📦', 0, doc.y + 30, { align: 'center', width: doc.page.width });

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Aucun matériau enregistré', 60, doc.y + 70, { 
           align: 'center', 
           width: doc.page.width - 120 
         });

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Ce projet ne contient encore aucun matériau dans son inventaire.', 
               60, doc.y + 95, { 
                 align: 'center', 
                 width: doc.page.width - 120 
               });

      doc.text('Commencez par ajouter des matériaux pour générer des rapports détaillés et des analyses.', 
               60, doc.y + 115, { 
                 align: 'center', 
                 width: doc.page.width - 120 
               });

      doc.y += 170;
    }

    // ========== INFORMATIONS DU PROJET ==========
    PDFHelpers.verifierSautPage(doc, 150);
    PDFHelpers.ajouterEnteteSection(doc, 'INFORMATIONS DU PROJET', null, null, 2);

    const infosProjet = [
      { label: 'Nom complet:', valeur: PDFHelpers.texteSecurise(project.name, 50) },
      { label: 'Localisation:', valeur: PDFHelpers.texteSecurise(project.location, 50) },
      { label: 'Statut:', valeur: PDFHelpers.traductions.statuts[project.status] || 'Inconnu' },
      { label: 'Créé le:', valeur: PDFHelpers.formaterDate(project.createdAt) },
      { label: 'Dernière modification:', valeur: PDFHelpers.formaterDate(project.updatedAt) }
    ];

    if (project.budget) {
      infosProjet.push({ label: 'Budget alloué:', valeur: PDFHelpers.formaterDevise(project.budget) });
    }

    if (project.startDate) {
      infosProjet.push({ label: 'Date de début:', valeur: PDFHelpers.formaterDate(project.startDate) });
    }

    if (project.endDate) {
      infosProjet.push({ label: 'Date de fin prévue:', valeur: PDFHelpers.formaterDate(project.endDate) });
    }

    // Affichage en deux colonnes
    const hauteurInfos = Math.ceil(infosProjet.length / 2) * 20 + 30;
    PDFHelpers.ajouterRectangleColore(doc, 50, doc.y, doc.page.width - 100, hauteurInfos, PDFHelpers.couleurs.grisClairbg);
    doc.strokeColor(PDFHelpers.couleurs.bordure)
       .lineWidth(1)
       .rect(50, doc.y, doc.page.width - 100, hauteurInfos)
       .stroke();

    const infosY = doc.y + 15;
    infosProjet.forEach((info, index) => {
      const x = 60 + (index % 2) * 250;
      const y = infosY + Math.floor(index / 2) * 20;

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(PDFHelpers.couleurs.texte)
         .text(info.label, x, y);

      doc.font('Helvetica')
         .text(info.valeur, x + 120, y, { width: 120 });
    });

    doc.y += hauteurInfos + 30;

    // ========== PIED DE PAGE FINAL ==========
    const piedY = doc.page.height - 100;
    PDFHelpers.ajouterRectangleColore(doc, 0, piedY, doc.page.width, 100, PDFHelpers.couleurs.succes);

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor(PDFHelpers.couleurs.blanc)
       .text('SYSTÈME DE GESTION DE PROJETS', 50, piedY + 20, { 
         align: 'center', 
         width: doc.page.width - 100 
       });

    doc.fontSize(9)
       .font('Helvetica')
       .text(`Liste générée le ${PDFHelpers.formaterDate(new Date())} à ${PDFHelpers.formaterHeure()}`, 
              50, piedY + 45, { 
                align: 'center', 
                width: doc.page.width - 100 
              });

    doc.text('Document confidentiel - Réservé à l\'usage interne', 
             50, piedY + 65, { 
               align: 'center', 
               width: doc.page.width - 100 
             });

    // Numérotation des pages
    PDFHelpers.ajouterNumerotationPages(doc, `Matériaux - ${PDFHelpers.texteSecurise(project.name, 20)}`);

    console.log('✅ Génération PDF matériaux terminée avec succès');
    return await bufferPDF(doc);

  } catch (error) {
    console.error('❌ Erreur génération PDF matériaux:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : 'Stack masqué en production',
      projectId,
      timestamp: new Date().toISOString()
    });

    // Nettoyage en cas d'erreur
    if (doc && !doc.ended) {
      try {
        doc.end();
      } catch (cleanupError) {
        console.error('Échec nettoyage document PDF matériaux:', cleanupError.message);
      }
    }

    throw new Error(`Échec génération PDF matériaux: ${error.message}`);
  }
}

// Fonction utilitaire pour valider les données avant génération
function validateProjectData(project, materials = []) {
  const errors = [];
  
  if (!project) {
    errors.push('Données du projet manquantes');
    return errors;
  }
  
  if (!project.name || typeof project.name !== 'string' || project.name.trim().length === 0) {
    errors.push('Nom du projet manquant ou invalide');
  }
  
  if (!project.location || typeof project.location !== 'string' || project.location.trim().length === 0) {
    errors.push('Localisation du projet manquante ou invalide');
  }
  
  if (project.budget && (isNaN(parseFloat(project.budget)) || parseFloat(project.budget) < 0)) {
    errors.push('Budget du projet invalide (doit être un nombre positif)');
  }
  
  if (materials && Array.isArray(materials)) {
    materials.forEach((material, index) => {
      if (!material.name || typeof material.name !== 'string') {
        errors.push(`Matériau ${index + 1}: nom manquant ou invalide`);
      }
      
      if (material.pricePerUnit && (isNaN(parseFloat(material.pricePerUnit)) || parseFloat(material.pricePerUnit) < 0)) {
        errors.push(`Matériau ${index + 1}: prix unitaire invalide`);
      }
      
      if (material.quantity && (isNaN(parseFloat(material.quantity)) || parseFloat(material.quantity) <= 0)) {
        errors.push(`Matériau ${index + 1}: quantité invalide`);
      }
    });
  }
  
  return errors;
}

// Export des fonctions avec validation
module.exports = {
  generateProjectPDF: async (projectId) => {
    try {
      const result = await generateProjectPDF(projectId);
      return result;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF projet:', error.message);
      throw error;
    }
  },
  
  generateMaterialsPDF: async (projectId) => {
    try {
      const result = await generateMaterialsPDF(projectId);
      return result;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF matériaux:', error.message);
      throw error;
    }
  },
  
  // Fonction utilitaire exposée pour validation
  validateProjectData,
  
  // Constantes utiles
  constants: {
    MAX_PROJECT_NAME_LENGTH: 100,
    MAX_MATERIAL_NAME_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 500,
    SUPPORTED_UNITS: Object.keys(PDFHelpers.traductions.unites),
    SUPPORTED_CATEGORIES: Object.keys(PDFHelpers.traductions.categories),
    SUPPORTED_STATUSES: Object.keys(PDFHelpers.traductions.statuts)
  }
};