# Google Apps Script Setup Guide

## Why This is Needed

The LinkedIn Profile Populator plugin is encountering CORS (Cross-Origin Resource Sharing) policy violations when trying to directly access Google Sheets. Even though the export URL works (as you can see from the working URL: `https://docs.google.com/spreadsheets/d/1TNxKcs9_12AH2Q1QfV_p2y3jsSY_KnsdIHsEJmitIOY/export?format=csv&gid=0&range=A1:A2`), the browser blocks the request due to security policies.

## Solution: Google Apps Script Proxy

We'll use Google Apps Script as a proxy to fetch the data and return it with proper CORS headers.

## Step-by-Step Setup

### 1. Create a New Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Give it a name like "Google Sheets Proxy"

### 2. Copy the Script Code

Replace the default code with the contents of `google-apps-script.js`:

```javascript
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
```

### 3. Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set "Execute as" to "Me"
4. Set "Who has access" to "Anyone"
5. Click "Deploy"
6. Click "Authorize access" and follow the prompts
7. Copy the Web app URL (it will look like: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`)

### 4. Update the Plugin Code

Replace the script URL in `code.js` with your new script URL:

```javascript
const scriptUrl = `YOUR_SCRIPT_URL_HERE?sheetId=${sheetId}`;
```

## How It Works

1. **Plugin sends request** to Google Apps Script with the sheet ID
2. **Google Apps Script fetches data** from the Google Sheet (no CORS issues)
3. **Script returns JSON data** with proper CORS headers
4. **Plugin converts JSON to CSV** and processes it normally

## Benefits

- ✅ **Bypasses CORS completely**
- ✅ **More reliable than direct export**
- ✅ **Better error handling**
- ✅ **Can access private sheets** (if you have permission)
- ✅ **No need to change sheet sharing settings**

## Testing

After setup, test the connection:
1. Use the "Test Connection" button in the plugin
2. Check the console for detailed logs
3. The plugin should now successfully connect to Google Sheets

## Troubleshooting

- **403 Error**: Make sure the script is deployed as "Anyone" can access
- **Sheet not found**: Verify the sheet ID in the URL
- **Permission denied**: Ensure the script has access to the Google Sheet

This approach completely eliminates the CORS issue and provides a robust solution for accessing Google Sheets data.
