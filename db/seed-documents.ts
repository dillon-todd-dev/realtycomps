import { drizzle } from 'drizzle-orm/node-postgres';
import { documentsTable } from './schema';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const db = drizzle(DATABASE_URL);

const documents = [
  // Contracts & Agreements
  {
    name: 'Residential Purchase Agreement',
    description: 'Standard contract for residential property purchases',
    fileName: 'residential-purchase-agreement.pdf',
    fileType: 'application/pdf',
    fileSize: 245760,
    url: '/uploads/templates/residential-purchase-agreement.pdf',
    category: 'CONTRACT' as const,
    order: 1,
    isTemplate: true,
  },
  {
    name: 'Lease Agreement Template',
    description: 'Standard residential lease agreement for rental properties',
    fileName: 'lease-agreement-template.pdf',
    fileType: 'application/pdf',
    fileSize: 189440,
    url: '/uploads/templates/lease-agreement-template.pdf',
    category: 'CONTRACT' as const,
    order: 2,
    isTemplate: true,
  },
  {
    name: 'Buyer Representation Agreement',
    description: 'Agreement between buyer and agent for representation services',
    fileName: 'buyer-representation-agreement.pdf',
    fileType: 'application/pdf',
    fileSize: 122880,
    url: '/uploads/templates/buyer-representation-agreement.pdf',
    category: 'CONTRACT' as const,
    order: 3,
    isTemplate: true,
  },
  {
    name: 'Listing Agreement',
    description: 'Exclusive right to sell agreement for property listings',
    fileName: 'listing-agreement.pdf',
    fileType: 'application/pdf',
    fileSize: 156672,
    url: '/uploads/templates/listing-agreement.pdf',
    category: 'CONTRACT' as const,
    order: 4,
    isTemplate: true,
  },

  // Disclosures
  {
    name: 'Seller Disclosure Statement',
    description: 'Property condition disclosure required by seller',
    fileName: 'seller-disclosure-statement.pdf',
    fileType: 'application/pdf',
    fileSize: 143360,
    url: '/uploads/templates/seller-disclosure-statement.pdf',
    category: 'DISCLOSURE' as const,
    order: 1,
    isTemplate: true,
  },
  {
    name: 'Lead-Based Paint Disclosure',
    description: 'Required disclosure for pre-1978 properties',
    fileName: 'lead-based-paint-disclosure.pdf',
    fileType: 'application/pdf',
    fileSize: 81920,
    url: '/uploads/templates/lead-based-paint-disclosure.pdf',
    category: 'DISCLOSURE' as const,
    order: 2,
    isTemplate: true,
  },
  {
    name: 'HOA Disclosure Packet',
    description: 'Homeowners association rules and financial documents',
    fileName: 'hoa-disclosure-packet.pdf',
    fileType: 'application/pdf',
    fileSize: 204800,
    url: '/uploads/templates/hoa-disclosure-packet.pdf',
    category: 'DISCLOSURE' as const,
    order: 3,
    isTemplate: true,
  },

  // Marketing Materials
  {
    name: 'Property Flyer Template',
    description: 'Customizable single-page property marketing flyer',
    fileName: 'property-flyer-template.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 512000,
    url: '/uploads/templates/property-flyer-template.docx',
    category: 'MARKETING' as const,
    order: 1,
    isTemplate: true,
  },
  {
    name: 'Open House Sign-In Sheet',
    description: 'Visitor registration form for open house events',
    fileName: 'open-house-sign-in.pdf',
    fileType: 'application/pdf',
    fileSize: 61440,
    url: '/uploads/templates/open-house-sign-in.pdf',
    category: 'MARKETING' as const,
    order: 2,
    isTemplate: true,
  },
  {
    name: 'CMA Presentation Template',
    description: 'Comparative Market Analysis presentation slides',
    fileName: 'cma-presentation-template.pptx',
    fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    fileSize: 1048576,
    url: '/uploads/templates/cma-presentation-template.pptx',
    category: 'MARKETING' as const,
    order: 3,
    isTemplate: true,
  },

  // Financial Documents
  {
    name: 'Net Sheet Calculator',
    description: 'Spreadsheet to calculate seller net proceeds',
    fileName: 'net-sheet-calculator.xlsx',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileSize: 40960,
    url: '/uploads/templates/net-sheet-calculator.xlsx',
    category: 'FINANCIAL' as const,
    order: 1,
    isTemplate: true,
  },
  {
    name: 'Rental Property Calculator',
    description: 'Investment analysis spreadsheet for rental properties',
    fileName: 'rental-property-calculator.xlsx',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileSize: 61440,
    url: '/uploads/templates/rental-property-calculator.xlsx',
    category: 'FINANCIAL' as const,
    order: 2,
    isTemplate: true,
  },
  {
    name: 'Closing Cost Estimate',
    description: 'Estimated closing costs breakdown for buyers',
    fileName: 'closing-cost-estimate.pdf',
    fileType: 'application/pdf',
    fileSize: 92160,
    url: '/uploads/templates/closing-cost-estimate.pdf',
    category: 'FINANCIAL' as const,
    order: 3,
    isTemplate: true,
  },
];

async function seed() {
  console.log('Seeding documents...');

  try {
    // Clear existing documents
    await db.delete(documentsTable);
    console.log('Cleared existing documents');

    // Insert new documents
    await db.insert(documentsTable).values(documents);
    console.log(`Inserted ${documents.length} documents`);

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding documents:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
