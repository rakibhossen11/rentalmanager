'use client';

import { useState } from 'react';
import { Printer, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PropertyPDFGenerator({ property }) {
  const [loading, setLoading] = useState(false);

  // Create PDF-ready HTML
  const createPDFHtml = (propertyData) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Calculate stats
    const totalUnits = propertyData.details?.units?.length || 0;
    const occupiedUnits = propertyData.stats?.occupiedUnits || 0;
    const vacancyRate = totalUnits > 0 ? 
      Math.round(((totalUnits - occupiedUnits) / totalUnits) * 100) : 0;
    
    const monthlyRevenue = propertyData.financial?.totalMonthlyIncome || 0;
    const currentValue = propertyData.financial?.currentValue || 0;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${propertyData.name} - Property Report</title>
          <style>
              /* Reset & Base */
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.4;
                  color: #1a1a1a;
                  background: #ffffff;
                  padding: 20px;
                  max-width: 800px;
                  margin: 0 auto;
              }
              
              /* Print Optimization */
              @media print {
                  @page {
                      margin: 15mm;
                      size: A4;
                  }
                  
                  body {
                      padding: 0;
                      font-size: 12pt;
                  }
                  
                  .no-print {
                      display: none !important;
                  }
                  
                  .page-break {
                      page-break-before: always;
                  }
              }
              
              /* Header */
              .header {
                  text-align: center;
                  margin-bottom: 30px;
                  padding-bottom: 20px;
                  border-bottom: 3px solid #2563eb;
              }
              
              .header h1 {
                  font-size: 28px;
                  color: #1e3a8a;
                  margin-bottom: 5px;
                  font-weight: 700;
              }
              
              .header .subtitle {
                  font-size: 18px;
                  color: #2563eb;
                  margin-bottom: 10px;
                  font-weight: 600;
              }
              
              .header .meta {
                  display: flex;
                  justify-content: center;
                  gap: 20px;
                  color: #64748b;
                  font-size: 14px;
                  margin-top: 10px;
              }
              
              /* Sections */
              .section {
                  margin-bottom: 25px;
                  page-break-inside: avoid;
              }
              
              .section-title {
                  font-size: 18px;
                  color: #1e3a8a;
                  margin-bottom: 15px;
                  padding-bottom: 8px;
                  border-bottom: 2px solid #e2e8f0;
                  font-weight: 600;
              }
              
              /* Property Details Grid */
              .details-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 15px;
                  margin-bottom: 20px;
              }
              
              .detail-item {
                  background: #f8fafc;
                  padding: 12px;
                  border-radius: 6px;
                  border-left: 4px solid #2563eb;
              }
              
              .detail-label {
                  font-size: 12px;
                  color: #64748b;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-bottom: 4px;
              }
              
              .detail-value {
                  font-size: 14px;
                  color: #1e293b;
                  font-weight: 500;
              }
              
              /* Stats Cards */
              .stats-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 15px;
                  margin: 20px 0;
              }
              
              .stat-card {
                  text-align: center;
                  padding: 15px;
                  border-radius: 8px;
                  background: linear-gradient(135deg, #2563eb, #3b82f6);
                  color: white;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              
              .stat-value {
                  font-size: 24px;
                  font-weight: 700;
                  margin-bottom: 5px;
              }
              
              .stat-label {
                  font-size: 12px;
                  opacity: 0.9;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              }
              
              /* Financial Highlights */
              .financial-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 15px;
                  margin: 15px 0;
              }
              
              .financial-card {
                  text-align: center;
                  padding: 12px;
                  background: #f0f9ff;
                  border: 1px solid #bae6fd;
                  border-radius: 6px;
              }
              
              .financial-value {
                  font-size: 18px;
                  color: #0369a1;
                  font-weight: 600;
                  margin-bottom: 4px;
              }
              
              .financial-label {
                  font-size: 11px;
                  color: #0c4a6e;
                  text-transform: uppercase;
              }
              
              /* Units Table */
              .units-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 15px 0;
                  font-size: 13px;
              }
              
              .units-table th {
                  background: #1e3a8a;
                  color: white;
                  padding: 10px;
                  text-align: left;
                  font-weight: 600;
              }
              
              .units-table td {
                  padding: 10px;
                  border-bottom: 1px solid #e2e8f0;
              }
              
              .units-table tr:nth-child(even) {
                  background: #f8fafc;
              }
              
              /* Status Badges */
              .status-badge {
                  display: inline-block;
                  padding: 4px 10px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 500;
                  text-transform: uppercase;
                  letter-spacing: 0.3px;
              }
              
              .status-active {
                  background: #dcfce7;
                  color: #166534;
              }
              
              .status-available {
                  background: #dbeafe;
                  color: #1e40af;
              }
              
              .status-occupied {
                  background: #fef3c7;
                  color: #92400e;
              }
              
              /* Footer */
              .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 2px solid #e2e8f0;
                  text-align: center;
                  color: #64748b;
                  font-size: 12px;
              }
              
              /* Print Controls */
              .print-controls {
                  text-align: center;
                  margin: 30px 0;
                  padding: 20px;
                  background: #f1f5f9;
                  border-radius: 8px;
              }
              
              .print-btn {
                  background: #2563eb;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 6px;
                  font-size: 14px;
                  cursor: pointer;
                  margin: 5px;
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
              }
              
              .print-btn:hover {
                  background: #1d4ed8;
              }
              
              /* Utility Classes */
              .text-center { text-align: center; }
              .mb-10 { margin-bottom: 10px; }
              .mb-20 { margin-bottom: 20px; }
              .mt-20 { margin-top: 20px; }
              .mt-30 { margin-top: 30px; }
          </style>
      </head>
      <body>
          <!-- Header -->
          <div class="header">
              <h1>Property Report</h1>
              <div class="subtitle">${propertyData.name}</div>
              <div class="meta">
                  <span>ID: ${propertyData._id.slice(-8)}</span>
                  <span>Type: ${propertyData.type || 'N/A'}</span>
                  <span>Generated: ${currentDate}</span>
              </div>
          </div>
          
          <!-- Property Status -->
          <div class="section">
              <div class="details-grid">
                  <div class="detail-item">
                      <div class="detail-label">Property Status</div>
                      <div class="detail-value">
                          <span class="status-badge status-${propertyData.status || 'active'}">
                              ${(propertyData.status || 'Active').toUpperCase()}
                          </span>
                      </div>
                  </div>
                  
                  <div class="detail-item">
                      <div class="detail-label">Property Structure</div>
                      <div class="detail-value">${propertyData.propertyStructure?.replace('_', ' ').toUpperCase() || 'N/A'}</div>
                  </div>
                  
                  <div class="detail-item">
                      <div class="detail-label">Total Units</div>
                      <div class="detail-value">${totalUnits} unit(s)</div>
                  </div>
                  
                  <div class="detail-item">
                      <div class="detail-label">Occupied Units</div>
                      <div class="detail-value">${occupiedUnits} unit(s)</div>
                  </div>
              </div>
          </div>
          
          <!-- Financial Summary -->
          <div class="section">
              <h2 class="section-title">Financial Summary</h2>
              <div class="financial-grid">
                  <div class="financial-card">
                      <div class="financial-value">$${currentValue.toLocaleString()}</div>
                      <div class="financial-label">Current Value</div>
                  </div>
                  
                  <div class="financial-card">
                      <div class="financial-value">$${monthlyRevenue.toLocaleString()}</div>
                      <div class="financial-label">Monthly Income</div>
                  </div>
                  
                  <div class="financial-card">
                      <div class="financial-value">${vacancyRate}%</div>
                      <div class="financial-label">Vacancy Rate</div>
                  </div>
              </div>
              
              ${propertyData.financial?.mortgage?.hasMortgage ? `
              <div class="detail-item mt-20">
                  <div class="detail-label">Mortgage Information</div>
                  <div class="detail-value">
                      ${propertyData.financial.mortgage.lender} - 
                      $${propertyData.financial.mortgage.loanAmount.toLocaleString()} at 
                      ${propertyData.financial.mortgage.interestRate}%
                  </div>
              </div>
              ` : ''}
          </div>
          
          <!-- Units Information -->
          ${propertyData.details?.units && propertyData.details.units.length > 0 ? `
          <div class="section page-break">
              <h2 class="section-title">Units Details</h2>
              <table class="units-table">
                  <thead>
                      <tr>
                          <th>Unit Number</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Monthly Rent</th>
                          <th>Deposit</th>
                          <th>Size</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${propertyData.details.units.map((unit, index) => `
                      <tr>
                          <td><strong>${unit.unitNumber || `Unit ${index + 1}`}</strong></td>
                          <td>${unit.type?.charAt(0).toUpperCase() + unit.type?.slice(1) || 'Room'}</td>
                          <td>
                              <span class="status-badge status-${unit.status || 'available'}">
                                  ${(unit.status || 'Available').toUpperCase()}
                              </span>
                          </td>
                          <td>$${(unit.monthlyRent || 0).toLocaleString()}</td>
                          <td>$${(unit.deposit || 0).toLocaleString()}</td>
                          <td>${unit.squareFeet || 0} sq ft</td>
                      </tr>
                      `).join('')}
                  </tbody>
              </table>
              
              <!-- Unit Features Summary -->
              <div class="mt-20">
                  <h2 class="section-title">Unit Features Summary</h2>
                  <div class="details-grid">
                      ${propertyData.details.units.some(u => u.hasKitchen) ? `
                      <div class="detail-item">
                          <div class="detail-label">Kitchen Included</div>
                          <div class="detail-value">
                              ${propertyData.details.units.filter(u => u.hasKitchen).length} unit(s)
                          </div>
                      </div>
                      ` : ''}
                      
                      ${propertyData.details.units.some(u => u.hasPrivateBathroom) ? `
                      <div class="detail-item">
                          <div class="detail-label">Private Bathroom</div>
                          <div class="detail-value">
                              ${propertyData.details.units.filter(u => u.hasPrivateBathroom).length} unit(s)
                          </div>
                      </div>
                      ` : ''}
                      
                      <div class="detail-item">
                          <div class="detail-label">Total Monthly Rent Potential</div>
                          <div class="detail-value">
                              $${propertyData.details.units.reduce((sum, unit) => sum + (unit.monthlyRent || 0), 0).toLocaleString()}
                          </div>
                      </div>
                      
                      <div class="detail-item">
                          <div class="detail-label">Average Rent per Unit</div>
                          <div class="detail-value">
                              $${totalUnits > 0 ? 
                                Math.round(propertyData.details.units.reduce((sum, unit) => sum + (unit.monthlyRent || 0), 0) / totalUnits).toLocaleString() : 
                                0}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          ` : ''}
          
          <!-- Property Details -->
          <div class="section">
              <h2 class="section-title">Property Specifications</h2>
              <div class="details-grid">
                  ${propertyData.details?.totalBedrooms ? `
                  <div class="detail-item">
                      <div class="detail-label">Total Bedrooms</div>
                      <div class="detail-value">${propertyData.details.totalBedrooms}</div>
                  </div>
                  ` : ''}
                  
                  ${propertyData.details?.totalBathrooms ? `
                  <div class="detail-item">
                      <div class="detail-label">Total Bathrooms</div>
                      <div class="detail-value">${propertyData.details.totalBathrooms}</div>
                  </div>
                  ` : ''}
                  
                  ${propertyData.details?.totalSquareFeet ? `
                  <div class="detail-item">
                      <div class="detail-label">Total Square Feet</div>
                      <div class="detail-value">${propertyData.details.totalSquareFeet.toLocaleString()} sq ft</div>
                  </div>
                  ` : ''}
                  
                  ${propertyData.details?.lotSize ? `
                  <div class="detail-item">
                      <div class="detail-label">Lot Size</div>
                      <div class="detail-value">${propertyData.details.lotSize.toLocaleString()} sq ft</div>
                  </div>
                  ` : ''}
                  
                  ${propertyData.details?.floors ? `
                  <div class="detail-item">
                      <div class="detail-label">Floors</div>
                      <div class="detail-value">${propertyData.details.floors}</div>
                  </div>
                  ` : ''}
                  
                  ${propertyData.details?.parkingSpaces ? `
                  <div class="detail-item">
                      <div class="detail-label">Parking Spaces</div>
                      <div class="detail-value">${propertyData.details.parkingSpaces}</div>
                  </div>
                  ` : ''}
                  
                  ${propertyData.details?.yearBuilt ? `
                  <div class="detail-item">
                      <div class="detail-label">Year Built</div>
                      <div class="detail-value">${propertyData.details.yearBuilt}</div>
                  </div>
                  ` : ''}
              </div>
              
              ${propertyData.details?.amenities && propertyData.details.amenities.length > 0 ? `
              <div class="detail-item mt-10">
                  <div class="detail-label">Amenities</div>
                  <div class="detail-value">${propertyData.details.amenities.join(', ')}</div>
              </div>
              ` : ''}
          </div>
          
          <!-- Address Information -->
          <div class="section">
              <h2 class="section-title">Address Information</h2>
              <div class="details-grid">
                  ${propertyData.address?.street ? `
                  <div class="detail-item">
                      <div class="detail-label">Street Address</div>
                      <div class="detail-value">${propertyData.address.street}</div>
                  </div>
                  ` : ''}
                  
                  ${propertyData.address?.city ? `
                  <div class="detail-item">
                      <div class="detail-label">City</div>
                      <div class="detail-value">${propertyData.address.city}</div>
                  </div>
                  ` : ''}
                  
                  ${propertyData.address?.state ? `
                  <div class="detail-item">
                      <div class="detail-label">State</div>
                      <div class="detail-value">${propertyData.address.state}</div>
                  </div>
                  ` : ''}
                  
                  ${propertyData.address?.zipCode ? `
                  <div class="detail-item">
                      <div class="detail-label">ZIP Code</div>
                      <div class="detail-value">${propertyData.address.zipCode}</div>
                  </div>
                  ` : ''}
                  
                  <div class="detail-item">
                      <div class="detail-label">Country</div>
                      <div class="detail-value">${propertyData.address?.country || 'US'}</div>
                  </div>
              </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
              <div>Confidential Property Report - Generated by Property Management System</div>
              <div>Report ID: ${propertyData._id} | User ID: ${propertyData.userId?.slice(-8) || 'N/A'}</div>
              <div class="mt-10">Page 1 of 1</div>
          </div>
          
          <!-- Print Controls (Visible only on screen) -->
          <div class="print-controls no-print">
              <h3>Property Report Ready</h3>
              <p>This document is optimized for printing. Click below to print or save as PDF.</p>
              <div>
                  <button onclick="window.print()" class="print-btn">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
                          <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                      </svg>
                      Print / Save as PDF
                  </button>
                  <button onclick="window.close()" class="print-btn" style="background: #64748b;">
                      Close Window
                  </button>
              </div>
          </div>
          
          <!-- Auto-print after loading (optional) -->
          <script>
              // Auto-open print dialog after 1 second
              setTimeout(() => {
                  // window.print(); // Uncomment to auto-print
              }, 1000);
          </script>
      </body>
      </html>
    `;
  };

  // Function to open PDF in new window for printing
  const openPDFForPrint = () => {
    try {
      setLoading(true);
      
      // Open new window with PDF content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups for this site');
        return;
      }
      
      const htmlContent = createPDFHtml(property);
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      toast.success('PDF ready! Use browser print to save as PDF.');
      
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  // Function to open PDF preview
  const openPDFPreview = () => {
    try {
      const previewWindow = window.open('', '_blank');
      if (!previewWindow) {
        toast.error('Please allow popups for this site');
        return;
      }
      
      const htmlContent = createPDFHtml(property);
      
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
      
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to open preview');
    }
  };

  // Function to download PDF (using data URL method)
  const downloadPDF = () => {
    try {
      setLoading(true);
      
      // Create HTML content
      const htmlContent = createPDFHtml(property);
      
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const fileName = `property-report-${property.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
      
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('HTML report downloaded! Open in browser and print to PDF.');
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={openPDFPreview}
        disabled={loading || !property}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <FileText className="w-4 h-4" />
        )}
        Preview PDF
      </button>
      
      <button
        onClick={openPDFForPrint}
        disabled={loading || !property}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Printer className="w-4 h-4" />
        Print PDF
      </button>
      
      <button
        onClick={downloadPDF}
        disabled={loading || !property}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="w-4 h-4" />
        Download HTML
      </button>
      
      <div className="text-xs text-gray-500 mt-2">
        <p>Tip: Use "Print PDF" and choose "Save as PDF" in print dialog</p>
      </div>
    </div>
  );
}

// // app/components/PropertyPDFGenerator.jsx
// 'use client';

// import { useState, useRef } from 'react';
// import { Printer, Download, FileText } from 'lucide-react';
// import toast from 'react-hot-toast';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// export default function PropertyPDFGenerator({ property }) {
//   const [loading, setLoading] = useState(false);
//   const pdfRef = useRef();
//   console.log( property );

//   const generatePDFFromData = async () => {
//     try {
//       setLoading(true);
      
//       // Create a new window with the PDF content
//       const printWindow = window.open('', '_blank');
      
//       const htmlContent = createPDFHtml(property);
//       printWindow.document.write(htmlContent);
//       printWindow.document.close();
      
//       // Wait for content to load
//       setTimeout(() => {
//         printWindow.print();
//         toast.success('PDF ready for printing!');
//       }, 500);
      
//     } catch (error) {
//       console.error('PDF generation error:', error);
//       toast.error('Failed to generate PDF');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadPDF = async () => {
//     try {
//       setLoading(true);
      
//       // Create PDF using jsPDF
//       const doc = new jsPDF('p', 'mm', 'a4');
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();
      
//       // Add title
//       doc.setFontSize(20);
//       doc.setTextColor(40, 40, 40);
//       doc.text(`Property Report - ${property.name}`, pageWidth / 2, 20, { align: 'center' });
      
//       // Add date
//       doc.setFontSize(10);
//       doc.setTextColor(100, 100, 100);
//       doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
      
//       // Add property details section
//       let yPos = 40;
      
//       // Property Information
//       doc.setFontSize(16);
//       doc.setTextColor(40, 40, 40);
//       doc.text('Property Information', 20, yPos);
//       yPos += 10;
      
//       doc.setFontSize(11);
//       doc.setTextColor(60, 60, 60);
//       doc.text(`Name: ${property.name}`, 20, yPos);
//       yPos += 7;
      
//       if (property.type) {
//         doc.text(`Type: ${property.type}`, 20, yPos);
//         yPos += 7;
//       }
      
//       if (property.address?.street) {
//         doc.text(`Address: ${property.address.street}`, 20, yPos);
//         yPos += 7;
//         doc.text(`${property.address.city}, ${property.address.state} ${property.address.zipCode}`, 20, yPos);
//         yPos += 7;
//       }
      
//       // Add space
//       yPos += 5;
      
//       // Property Stats
//       doc.setFontSize(16);
//       doc.setTextColor(40, 40, 40);
//       doc.text('Property Statistics', 20, yPos);
//       yPos += 10;
      
//       doc.setFontSize(11);
      
//       // Calculate stats
//       const totalUnits = property.units?.length || 0;
//       const occupiedUnits = property.units?.filter(unit => unit.status === 'occupied').length || 0;
//       const monthlyRevenue = property.units?.reduce((total, unit) => {
//         if (unit.status === 'occupied' && unit.monthlyRent) {
//           return total + unit.monthlyRent;
//         }
//         return total;
//       }, 0) || 0;
      
//       doc.text(`Total Units: ${totalUnits}`, 20, yPos);
//       yPos += 7;
//       doc.text(`Occupied Units: ${occupiedUnits}`, 20, yPos);
//       yPos += 7;
//       doc.text(`Vacancy Rate: ${totalUnits > 0 ? Math.round(((totalUnits - occupiedUnits) / totalUnits) * 100) : 0}%`, 20, yPos);
//       yPos += 7;
//       doc.text(`Monthly Revenue: $${monthlyRevenue.toLocaleString()}`, 20, yPos);
//       yPos += 7;
      
//       // Add Units section if available
//       if (property.units && property.units.length > 0) {
//         yPos += 10;
        
//         // Check if we need a new page
//         if (yPos > pageHeight - 50) {
//           doc.addPage();
//           yPos = 20;
//         }
        
//         doc.setFontSize(16);
//         doc.setTextColor(40, 40, 40);
//         doc.text('Units & Rooms', 20, yPos);
//         yPos += 10;
        
//         property.units.forEach((unit, index) => {
//           // Check if we need a new page for this unit
//           if (yPos > pageHeight - 40) {
//             doc.addPage();
//             yPos = 20;
//           }
          
//           doc.setFontSize(12);
//           doc.setTextColor(40, 40, 40);
//           doc.text(`Unit ${index + 1}: ${unit.unitNumber || `Unit ${index + 1}`}`, 20, yPos);
//           yPos += 7;
          
//           doc.setFontSize(10);
//           doc.setTextColor(60, 60, 60);
//           doc.text(`Type: ${unit.type || 'Standard'}`, 20, yPos);
//           yPos += 5;
//           doc.text(`Status: ${unit.status || 'Vacant'}`, 20, yPos);
//           yPos += 5;
//           doc.text(`Rent: $${(unit.monthlyRent || 0).toLocaleString()}/month`, 20, yPos);
//           yPos += 5;
//           doc.text(`Bedrooms: ${unit.bedrooms || 0} | Bathrooms: ${unit.bathrooms || 0}`, 20, yPos);
//           yPos += 5;
//           doc.text(`Size: ${unit.squareFeet || 0} sq ft`, 20, yPos);
//           yPos += 5;
//           doc.text(`Deposit: $${(unit.deposit || 0).toLocaleString()}`, 20, yPos);
//           yPos += 10;
//         });
//       }
      
//       // Add Financial Information if available
//       if (property.financial) {
//         yPos += 10;
        
//         if (yPos > pageHeight - 50) {
//           doc.addPage();
//           yPos = 20;
//         }
        
//         doc.setFontSize(16);
//         doc.setTextColor(40, 40, 40);
//         doc.text('Financial Information', 20, yPos);
//         yPos += 10;
        
//         doc.setFontSize(11);
        
//         if (property.financial.currentValue) {
//           doc.text(`Property Value: $${property.financial.currentValue.toLocaleString()}`, 20, yPos);
//           yPos += 7;
//         }
        
//         if (property.financial.marketRent) {
//           doc.text(`Market Rent: $${property.financial.marketRent.toLocaleString()}/month`, 20, yPos);
//           yPos += 7;
//         }
        
//         if (property.financial.propertyTax) {
//           doc.text(`Annual Property Tax: $${property.financial.propertyTax.toLocaleString()}`, 20, yPos);
//           yPos += 7;
//         }
        
//         if (property.financial.insurance) {
//           doc.text(`Annual Insurance: $${property.financial.insurance.toLocaleString()}`, 20, yPos);
//           yPos += 7;
//         }
//       }
      
//       // Add footer
//       doc.setFontSize(9);
//       doc.setTextColor(150, 150, 150);
//       doc.text('Generated by Property Management System', pageWidth / 2, pageHeight - 10, { align: 'center' });
//       doc.text(`Page 1 of ${doc.internal.pages.length}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      
//       // Save the PDF
//       doc.save(`property-${property.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      
//       toast.success('PDF downloaded successfully!');
      
//     } catch (error) {
//       console.error('PDF download error:', error);
//       toast.error('Failed to download PDF');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createPDFHtml = (property) => {
//     const currentDate = new Date().toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });

//     const totalUnits = property.units?.length || 0;
//     const occupiedUnits = property.units?.filter(unit => unit.status === 'occupied').length || 0;
//     const monthlyRevenue = property.units?.reduce((total, unit) => {
//       if (unit.status === 'occupied' && unit.monthlyRent) {
//         return total + unit.monthlyRent;
//       }
//       return total;
//     }, 0) || 0;
//     const vacancyRate = totalUnits > 0 ? Math.round(((totalUnits - occupiedUnits) / totalUnits) * 100) : 0;

//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Property Report - ${property.name}</title>
//           <style>
//               * {
//                   margin: 0;
//                   padding: 0;
//                   box-sizing: border-box;
//               }
              
//               body {
//                   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//                   line-height: 1.6;
//                   color: #333;
//                   background: #fff;
//                   padding: 40px;
//                   max-width: 1000px;
//                   margin: 0 auto;
//               }
              
//               @media print {
//                   body {
//                       padding: 20mm;
//                   }
                  
//                   .no-print {
//                       display: none !important;
//                   }
                  
//                   @page {
//                       margin: 20mm;
//                       size: A4 portrait;
//                   }
//               }
              
//               .header {
//                   text-align: center;
//                   margin-bottom: 40px;
//                   padding-bottom: 20px;
//                   border-bottom: 2px solid #4f46e5;
//               }
              
//               .header h1 {
//                   font-size: 28px;
//                   color: #1f2937;
//                   margin-bottom: 10px;
//               }
              
//               .header .property-name {
//                   font-size: 24px;
//                   color: #4f46e5;
//                   margin-bottom: 5px;
//               }
              
//               .header .date {
//                   color: #6b7280;
//                   font-size: 14px;
//               }
              
//               .section {
//                   margin-bottom: 30px;
//                   page-break-inside: avoid;
//               }
              
//               .section-title {
//                   font-size: 20px;
//                   color: #1f2937;
//                   margin-bottom: 20px;
//                   padding-bottom: 10px;
//                   border-bottom: 1px solid #e5e7eb;
//               }
              
//               .info-grid {
//                   display: grid;
//                   grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//                   gap: 20px;
//                   margin-bottom: 20px;
//               }
              
//               .info-card {
//                   border: 1px solid #e5e7eb;
//                   border-radius: 8px;
//                   padding: 20px;
//                   background: #f9fafb;
//               }
              
//               .info-card h4 {
//                   color: #4f46e5;
//                   margin-bottom: 15px;
//                   font-size: 16px;
//               }
              
//               .info-row {
//                   display: flex;
//                   justify-content: space-between;
//                   padding: 8px 0;
//                   border-bottom: 1px solid #e5e7eb;
//               }
              
//               .info-row:last-child {
//                   border-bottom: none;
//               }
              
//               .info-label {
//                   font-weight: 500;
//                   color: #6b7280;
//               }
              
//               .info-value {
//                   font-weight: 600;
//                   color: #1f2937;
//                   text-align: right;
//               }
              
//               .stats-grid {
//                   display: grid;
//                   grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//                   gap: 20px;
//                   margin: 20px 0;
//               }
              
//               .stat-card {
//                   text-align: center;
//                   padding: 20px;
//                   border-radius: 8px;
//                   background: linear-gradient(135deg, #4f46e5, #7c73e6);
//                   color: white;
//               }
              
//               .stat-value {
//                   font-size: 28px;
//                   font-weight: bold;
//                   margin-bottom: 5px;
//               }
              
//               .stat-label {
//                   font-size: 14px;
//                   opacity: 0.9;
//               }
              
//               table {
//                   width: 100%;
//                   border-collapse: collapse;
//                   margin: 20px 0;
//               }
              
//               th {
//                   background: #4f46e5;
//                   color: white;
//                   padding: 12px;
//                   text-align: left;
//                   font-weight: 600;
//               }
              
//               td {
//                   padding: 12px;
//                   border-bottom: 1px solid #e5e7eb;
//               }
              
//               tr:nth-child(even) {
//                   background: #f9fafb;
//               }
              
//               .status-badge {
//                   display: inline-block;
//                   padding: 4px 12px;
//                   border-radius: 20px;
//                   font-size: 12px;
//                   font-weight: 500;
//               }
              
//               .status-occupied {
//                   background: #d1fae5;
//                   color: #065f46;
//               }
              
//               .status-vacant {
//                   background: #fef3c7;
//                   color: #92400e;
//               }
              
//               .footer {
//                   margin-top: 40px;
//                   padding-top: 20px;
//                   border-top: 2px solid #e5e7eb;
//                   text-align: center;
//                   color: #6b7280;
//                   font-size: 14px;
//               }
              
//               .no-print {
//                   text-align: center;
//                   margin: 40px 0;
//                   padding: 20px;
//                   background: #f3f4f6;
//                   border-radius: 8px;
//               }
              
//               .print-button {
//                   background: #4f46e5;
//                   color: white;
//                   border: none;
//                   padding: 12px 24px;
//                   border-radius: 6px;
//                   font-size: 16px;
//                   cursor: pointer;
//                   margin: 10px;
//               }
              
//               .print-button:hover {
//                   background: #4338ca;
//               }
//           </style>
//       </head>
//       <body>
//           <div class="header">
//               <h1>Property Report</h1>
//               <div class="property-name">${property.name}</div>
//               <div class="date">Generated: ${currentDate}</div>
//           </div>
          
//           <!-- Property Information -->
//           <div class="section">
//               <h2 class="section-title">Property Information</h2>
//               <div class="info-grid">
//                   <div class="info-card">
//                       <h4>Basic Details</h4>
//                       <div class="info-row">
//                           <span class="info-label">Property Name:</span>
//                           <span class="info-value">${property.name}</span>
//                       </div>
//                       <div class="info-row">
//                           <span class="info-label">Property Type:</span>
//                           <span class="info-value">${property.type || 'N/A'}</span>
//                       </div>
//                       <div class="info-row">
//                           <span class="info-label">Status:</span>
//                           <span class="info-value">${property.status || 'Active'}</span>
//                       </div>
//                   </div>
                  
//                   <div class="info-card">
//                       <h4>Address</h4>
//                       <div class="info-row">
//                           <span class="info-label">Street:</span>
//                           <span class="info-value">${property.address?.street || 'N/A'}</span>
//                       </div>
//                       <div class="info-row">
//                           <span class="info-label">City:</span>
//                           <span class="info-value">${property.address?.city || 'N/A'}</span>
//                       </div>
//                       <div class="info-row">
//                           <span class="info-label">State:</span>
//                           <span class="info-value">${property.address?.state || 'N/A'}</span>
//                       </div>
//                       <div class="info-row">
//                           <span class="info-label">ZIP Code:</span>
//                           <span class="info-value">${property.address?.zipCode || 'N/A'}</span>
//                       </div>
//                   </div>
//               </div>
//           </div>
          
//           <!-- Property Stats -->
//           <div class="section">
//               <h2 class="section-title">Property Statistics</h2>
//               <div class="stats-grid">
//                   <div class="stat-card">
//                       <div class="stat-value">${totalUnits}</div>
//                       <div class="stat-label">Total Units</div>
//                   </div>
//                   <div class="stat-card">
//                       <div class="stat-value">${occupiedUnits}</div>
//                       <div class="stat-label">Occupied Units</div>
//                   </div>
//                   <div class="stat-card">
//                       <div class="stat-value">${vacancyRate}%</div>
//                       <div class="stat-label">Vacancy Rate</div>
//                   </div>
//                   <div class="stat-card">
//                       <div class="stat-value">$${monthlyRevenue.toLocaleString()}</div>
//                       <div class="stat-label">Monthly Revenue</div>
//                   </div>
//               </div>
//           </div>
          
//           <!-- Units Information -->
//           ${property.units && property.units.length > 0 ? `
//           <div class="section">
//               <h2 class="section-title">Units & Rooms</h2>
//               <table>
//                   <thead>
//                       <tr>
//                           <th>Unit #</th>
//                           <th>Type</th>
//                           <th>Status</th>
//                           <th>Bed/Bath</th>
//                           <th>Size</th>
//                           <th>Monthly Rent</th>
//                           <th>Deposit</th>
//                       </tr>
//                   </thead>
//                   <tbody>
//                       ${property.units.map((unit, index) => `
//                       <tr>
//                           <td>${unit.unitNumber || `Unit ${index + 1}`}</td>
//                           <td>${unit.type || 'Standard'}</td>
//                           <td>
//                               <span class="status-badge ${unit.status === 'occupied' ? 'status-occupied' : 'status-vacant'}">
//                                   ${unit.status || 'Vacant'}
//                               </span>
//                           </td>
//                           <td>${unit.bedrooms || 0}/${unit.bathrooms || 0}</td>
//                           <td>${unit.squareFeet || 0} sq ft</td>
//                           <td>$${(unit.monthlyRent || 0).toLocaleString()}</td>
//                           <td>$${(unit.deposit || 0).toLocaleString()}</td>
//                       </tr>
//                       `).join('')}
//                   </tbody>
//               </table>
//           </div>
//           ` : ''}
          
//           <!-- Financial Information -->
//           ${property.financial ? `
//           <div class="section">
//               <h2 class="section-title">Financial Information</h2>
//               <div class="info-grid">
//                   ${property.financial.currentValue ? `
//                   <div class="info-card">
//                       <h4>Valuation</h4>
//                       <div class="info-row">
//                           <span class="info-label">Property Value:</span>
//                           <span class="info-value">$${property.financial.currentValue.toLocaleString()}</span>
//                       </div>
//                   </div>
//                   ` : ''}
                  
//                   ${property.financial.marketRent ? `
//                   <div class="info-card">
//                       <h4>Rental Information</h4>
//                       <div class="info-row">
//                           <span class="info-label">Market Rent:</span>
//                           <span class="info-value">$${property.financial.marketRent.toLocaleString()}/month</span>
//                       </div>
//                   </div>
//                   ` : ''}
                  
//                   ${property.financial.propertyTax || property.financial.insurance ? `
//                   <div class="info-card">
//                       <h4>Expenses</h4>
//                       ${property.financial.propertyTax ? `
//                       <div class="info-row">
//                           <span class="info-label">Property Tax:</span>
//                           <span class="info-value">$${property.financial.propertyTax.toLocaleString()}/year</span>
//                       </div>
//                       ` : ''}
//                       ${property.financial.insurance ? `
//                       <div class="info-row">
//                           <span class="info-label">Insurance:</span>
//                           <span class="info-value">$${property.financial.insurance.toLocaleString()}/year</span>
//                       </div>
//                       ` : ''}
//                   </div>
//                   ` : ''}
//               </div>
//           </div>
//           ` : ''}
          
//           <!-- Notes -->
//           ${property.notes ? `
//           <div class="section">
//               <h2 class="section-title">Property Notes</h2>
//               <div class="info-card">
//                   <p>${property.notes.replace(/\n/g, '<br>')}</p>
//               </div>
//           </div>
//           ` : ''}
          
//           <!-- Print Controls -->
//           <div class="no-print">
//               <h3>Print or Save as PDF</h3>
//               <p>Click the button below to print this report or save it as PDF.</p>
//               <button onclick="window.print()" class="print-button">Print Report</button>
//               <button onclick="window.close()" class="print-button">Close Window</button>
//           </div>
          
//           <!-- Footer -->
//           <div class="footer">
//               <div>Generated by Property Management System</div>
//               <div>Confidential - For internal use only</div>
//           </div>
          
//           <script>
//               // Auto-print after a short delay
//               setTimeout(() => {
//                   window.print();
//               }, 1000);
//           </script>
//       </body>
//       </html>
//     `;
//   };

//   return (
//     <div className="flex gap-2">
//       <button
//         onClick={generatePDFFromData}
//         disabled={loading || !property}
//         className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         {loading ? (
//           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//         ) : (
//           <Printer className="w-4 h-4" />
//         )}
//         Print PDF
//       </button>
      
//       <button
//         onClick={downloadPDF}
//         // disabled={loading || !property}
//         className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         <Download className="w-4 h-4" />
//         Download PDF
//       </button>
//     </div>
//   );
// }