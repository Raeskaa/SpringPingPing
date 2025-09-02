// Google Apps Script to fetch Google Sheets data and bypass CORS
// Deploy this as a web app to use as a proxy

function doGet(e) {
  try {
    // Get the sheet ID from the request
    const sheetId = e.parameter.sheetId;
    
    if (!sheetId) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Sheet ID is required' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Fetch the Google Sheet data
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheets()[0]; // Get first sheet
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No data found in sheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Convert to JSON format
    const headers = data[0];
    const rows = data.slice(1);
    
    const jsonData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    // Return the data as JSON
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        data: jsonData,
        headers: headers,
        rowCount: rows.length
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: error.toString(),
        message: 'Failed to fetch Google Sheets data'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

// Handle OPTIONS request for CORS preflight
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
