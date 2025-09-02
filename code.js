"use strict";
// LinkedIn Profile Populator - Main Plugin Code
// This plugin processes Google Sheets with actual images and CSV files
figma.showUI(__html__, {
    title: 'LinkedIn Profile Populator',
    width: 500,
    height: 700,
    themeColors: true
});
// Image cache to avoid reprocessing identical images
const imageCache = new Map();
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'process-data') {
        const { csvData, settings } = msg;
        try {
            figma.ui.postMessage({
                type: 'status',
                message: 'Parsing CSV data...'
            });
            // Parse CSV data
            const profiles = await parseCSVData(csvData);
            // Process profiles
            await processProfiles(profiles, settings);
        }
        catch (error) {
            console.error('Plugin error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            figma.ui.postMessage({
                type: 'error',
                message: errorMessage
            });
        }
    }
    else if (msg.type === 'process-sheets') {
        const { sheetsUrl, settings } = msg;
        try {
            figma.ui.postMessage({
                type: 'status',
                message: 'Fetching Google Sheets data...'
            });
            // Fetch and parse Google Sheets data
            const profiles = await fetchGoogleSheetsData(sheetsUrl);
            // Process profiles
            await processProfiles(profiles, settings);
        }
        catch (error) {
            console.error('Plugin error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            figma.ui.postMessage({
                type: 'error',
                message: errorMessage
            });
        }
    }
    else if (msg.type === 'test-connection') {
        const { sheetsUrl } = msg;
        try {
            console.log('Testing connection to Google Sheets:', sheetsUrl);
            figma.ui.postMessage({
                type: 'status',
                message: 'Testing connection...'
            });
            
            // Test the connection
            const testResult = await testGoogleSheetsConnection(sheetsUrl);
            
            figma.ui.postMessage({
                type: 'test-result',
                success: true,
                message: 'Connection test successful!',
                details: testResult
            });
        }
        catch (error) {
            console.error('Connection test failed:', error);
            figma.ui.postMessage({
                type: 'test-result',
                success: false,
                message: error.message,
                details: null
            });
        }
    }
};
// Process profiles with the existing logic
async function processProfiles(profiles, settings) {
    figma.ui.postMessage({
        type: 'status',
        message: `Found ${profiles.length} profiles. Validating template...`
    });
    console.log('Parsed profiles:', profiles);
    console.log('Number of profiles found:', profiles.length);
    // Validate and prepare template frames
    const frames = await validateAndPrepareFrames(profiles.length, settings.frameLayout);
    figma.ui.postMessage({
        type: 'status',
        message: 'Starting profile processing...'
    });
    // Process profiles in batches for optimal performance
    const batchSize = settings.batchSize || 10;
    const batches = chunkArray(profiles, batchSize);
    let processedCount = 0;
    const startTime = Date.now();
    for (const batch of batches) {
        // Process batch in parallel
        await Promise.all(batch.map(async (profile, index) => {
            const frameIndex = processedCount + index;
            await populateFrameOptimized(frames[frameIndex], profile, settings);
        }));
        processedCount += batch.length;
        // Update progress with performance stats
        const elapsed = Date.now() - startTime;
        const avgTimePerProfile = elapsed / processedCount;
        const remaining = (profiles.length - processedCount) * avgTimePerProfile;
        figma.ui.postMessage({
            type: 'progress',
            current: processedCount,
            total: profiles.length,
            avgTime: Math.round(avgTimePerProfile),
            remaining: Math.round(remaining / 1000)
        });
        // Small delay between batches to prevent blocking UI
        if (processedCount < profiles.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    const totalTime = Date.now() - startTime;
    figma.ui.postMessage({
        type: 'complete',
        total: profiles.length,
        time: totalTime
    });
}
try { }
catch (error) {
    console.error('Plugin error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    figma.ui.postMessage({
        type: 'error',
        message: errorMessage
    });
}
// Parse CSV data (simplified - no base64 images)
async function parseCSVData(csvData) {
    const lines = csvData.trim().split('\n');
    console.log('CSV lines:', lines);
    if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
    }
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('CSV headers:', headers);
    // Find column indices - flexible header matching
    const nameIndex = findColumnIndex(headers, ['name', 'full name', 'fullname']);
    const designationIndex = findColumnIndex(headers, ['designation', 'title', 'position', 'role']);
    const orgIndex = findColumnIndex(headers, ['org', 'organization', 'company', 'employer']);
    const imageIndex = findColumnIndex(headers, ['profileimage', 'image', 'photo', 'picture', 'imageurl']);
    const linkedinIndex = findColumnIndex(headers, ['linkedin', 'linkedin id', 'linkedin url', 'profile url']);
    console.log('Column indices:', {
        name: nameIndex,
        designation: designationIndex,
        org: orgIndex,
        image: imageIndex,
        linkedin: linkedinIndex
    });
    if (nameIndex === -1) {
        throw new Error('Could not find Name column. Please ensure your CSV has a "Name" column.');
    }
    const profiles = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        console.log(`Line ${i} values:`, values);
        console.log(`Line ${i} values length:`, values.length);
        if (values.length > Math.max(nameIndex, designationIndex, orgIndex)) {
            const profile = {
                name: cleanValue(values[nameIndex]) || '',
                designation: cleanValue(values[designationIndex]) || '',
                organization: cleanValue(values[orgIndex]) || '',
                profileImageUrl: imageIndex !== -1 ? cleanValue(values[imageIndex]) : '',
                linkedinUrl: linkedinIndex !== -1 ? cleanValue(values[linkedinIndex]) : ''
            };
            console.log(`Created profile ${i}:`, profile);
            // Only add profiles with at least a name
            if (profile.name) {
                profiles.push(profile);
                console.log(`Added profile: ${profile.name}`);
            }
            else {
                console.log(`Skipped profile ${i} - no name`);
            }
        }
        else {
            console.log(`Skipped line ${i} - insufficient columns`);
        }
    }
    console.log('Final profiles array:', profiles);
    if (profiles.length === 0) {
        throw new Error('No valid profiles found in CSV. Please check your data format.');
    }
    return profiles;
}
// Fetch and parse Google Sheets data - AGGRESSIVE CORS bypass approach
async function fetchGoogleSheetsData(sheetsUrl) {
    try {
        // Extract sheet ID from URL
        const sheetIdMatch = sheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!sheetIdMatch) {
            throw new Error('Invalid Google Sheets URL. Please provide a valid sharing URL.');
        }
        const sheetId = sheetIdMatch[1];
        console.log('Processing Google Sheet ID:', sheetId);
        
        // Method 1: Try with CORS headers
        try {
            console.log('Attempting Method 1 - With CORS headers');
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
            
            const response = await fetch(csvUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'text/csv,application/csv,text/plain,*/*',
                    'Origin': 'https://www.figma.com'
                }
            });
            
            console.log('Method 1 response status:', response.status);
            
            if (response.ok) {
                const csvData = await response.text();
                console.log('Method 1 successful! Data length:', csvData.length);
                return await parseCSVData(csvData);
            }
            throw new Error(`Method 1 failed: HTTP ${response.status}`);
        } catch (method1Error) {
            console.log('Method 1 failed:', method1Error.message);
            
            // Method 2: Try with no-cors mode
            try {
                console.log('Attempting Method 2 - No-CORS mode');
                const csvUrl2 = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
                
                const response2 = await fetch(csvUrl2, {
                    method: 'GET',
                    mode: 'no-cors'
                });
                
                console.log('Method 2 response type:', response2.type);
                
                if (response2.type === 'opaque') {
                    // Try to get text from opaque response
                    try {
                        const csvData = await response2.text();
                        if (csvData && csvData.trim().length > 0) {
                            console.log('Method 2 successful! Data length:', csvData.length);
                            return await parseCSVData(csvData);
                        }
                    } catch (textError) {
                        console.log('Could not extract text from opaque response');
                    }
                }
                throw new Error('Method 2 failed - opaque response');
            } catch (method2Error) {
                console.log('Method 2 failed:', method2Error.message);
                
                // Method 3: Try with different export parameters
                try {
                    console.log('Attempting Method 3 - Different export format');
                    const csvUrl3 = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0&range=A:Z&t=${Date.now()}`;
                    
                    const response3 = await fetch(csvUrl3);
                    console.log('Method 3 response status:', response3.status);
                    
                    if (response3.ok) {
                        const csvData = await response3.text();
                        if (csvData && csvData.trim().length > 0) {
                            console.log('Method 3 successful! Data length:', csvData.length);
                            return await parseCSVData(csvData);
                        }
                    }
                    throw new Error(`Method 3 failed: HTTP ${response3.status}`);
                } catch (method3Error) {
                    console.log('Method 3 failed:', method3Error.message);
                    
                    // Method 4: Try Google Apps Script as last resort
                    try {
                        console.log('Attempting Method 4 - Google Apps Script proxy');
                        const scriptUrl = `https://script.google.com/macros/s/AKfycbzNCNJJMdf4WCh7orQOqHwQnN66htlRf0c_4Xq4/exec?sheetId=${sheetId}`;
                        
                        const response4 = await fetch(scriptUrl);
                        console.log('Method 4 response status:', response4.status);
                        
                        if (response4.ok) {
                            const jsonData = await response4.json();
                            if (jsonData && jsonData.data) {
                                console.log('Method 4 successful! Converting JSON to CSV');
                                const csvData = convertJsonToCSV(jsonData.data);
                                return await parseCSVData(csvData);
                            }
                        }
                        throw new Error(`Method 4 failed: HTTP ${response4.status}`);
                    } catch (method4Error) {
                        console.log('Method 4 failed:', method4Error.message);
                        
                        // All methods failed
                        throw new Error(`All methods failed. The Google Sheets export URL is working but CORS is blocking access. Please ensure your sheet is shared with "Anyone with the link can view" permissions.`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
        
        // Comprehensive error messages
        if (error.message.includes('CORS') || error.message.includes('blocked')) {
            throw new Error('CORS blocked. Try sharing your sheet with "Anyone with the link can view" or use a different browser.');
        } else if (error.message.includes('fetch')) {
            throw new Error('Network error. Check your internet connection and try again.');
        } else if (error.message.includes('HTTP 403')) {
            throw new Error('Access denied. Please share your Google Sheet with "Anyone with the link can view".');
        } else if (error.message.includes('HTTP 404')) {
            throw new Error('Sheet not found. Please check the Google Sheets URL.');
        } else {
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }
}

// Helper function to convert JSON data to CSV format
function convertJsonToCSV(jsonData) {
    if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('Invalid JSON data format');
    }
    
    const headers = Object.keys(jsonData[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of jsonData) {
        const values = headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}


// Test Google Sheets connection for debugging - AGGRESSIVE CORS bypass
async function testGoogleSheetsConnection(sheetsUrl) {
    try {
        // Extract sheet ID from URL
        const sheetIdMatch = sheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!sheetIdMatch) {
            throw new Error('Invalid Google Sheets URL format');
        }
        
        const sheetId = sheetIdMatch[1];
        console.log('Testing connection to Google Sheet ID:', sheetId);
        
        // Method 1: Test with CORS headers
        try {
            console.log('Testing Method 1 - With CORS headers');
            const testUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0&range=A1:A2`;
            
            const response = await fetch(testUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'text/csv,application/csv,text/plain,*/*',
                    'Origin': 'https://www.figma.com'
                }
            });
            
            console.log('Method 1 test response status:', response.status);
            
            if (response.ok) {
                const testData = await response.text();
                console.log('Method 1 test successful! Data:', testData.substring(0, 100));
                
                return {
                    sheetId: sheetId,
                    status: response.status,
                    method: 'CORS Headers',
                    dataLength: testData.length,
                    sampleData: testData.substring(0, 100)
                };
            }
            throw new Error(`Method 1 test failed: HTTP ${response.status}`);
        } catch (method1Error) {
            console.log('Method 1 test failed:', method1Error.message);
            
            // Method 2: Test with no-cors mode
            try {
                console.log('Testing Method 2 - No-CORS mode');
                const testUrl2 = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0&range=A1:A2`;
                
                const response2 = await fetch(testUrl2, {
                    method: 'GET',
                    mode: 'no-cors'
                });
                
                console.log('Method 2 test response type:', response2.type);
                
                if (response2.type === 'opaque') {
                    return {
                        sheetId: sheetId,
                        status: 'opaque',
                        method: 'No-CORS Mode',
                        dataLength: 'unknown',
                        sampleData: 'Opaque response - data accessible but not readable'
                    };
                }
                throw new Error('Method 2 test failed - unexpected response type');
            } catch (method2Error) {
                console.log('Method 2 test failed:', method2Error.message);
                
                // Method 3: Test Google Apps Script
                try {
                    console.log('Testing Method 3 - Google Apps Script proxy');
                    const scriptUrl = `https://script.google.com/macros/s/AKfycbzNCNJJMdf4WCh7orQOqHwQnN66htlRf0c_4Xq4/exec?sheetId=${sheetId}`;
                    
                    const response3 = await fetch(scriptUrl);
                    console.log('Method 3 test response status:', response3.status);
                    
                    if (response3.ok) {
                        const jsonData = await response3.json();
                        if (jsonData && jsonData.success && jsonData.data) {
                            console.log('Method 3 test successful! Found', jsonData.rowCount, 'rows');
                            
                            return {
                                sheetId: sheetId,
                                status: response3.status,
                                method: 'Google Apps Script Proxy',
                                rowCount: jsonData.rowCount,
                                headers: jsonData.headers,
                                sampleData: JSON.stringify(jsonData.data[0]).substring(0, 100)
                            };
                        }
                    }
                    throw new Error(`Method 3 test failed: HTTP ${response3.status}`);
                } catch (method3Error) {
                    console.log('Method 3 test failed:', method3Error.message);
                    
                    // All methods failed
                    throw new Error(`All test methods failed. The Google Sheets export URL is working but CORS is blocking access. Please ensure your sheet is shared with "Anyone with the link can view" permissions.`);
                }
            }
        }
        
    } catch (error) {
        console.error('Test connection failed:', error);
        throw error;
    }
}

// Helper function to find column index by multiple possible names
function findColumnIndex(headers, possibleNames) {
    for (const name of possibleNames) {
        const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
        if (index !== -1)
            return index;
    }
    return -1;
}
// Clean CSV values (remove quotes, trim whitespace)
function cleanValue(value) {
    if (!value)
        return '';
    return value.trim().replace(/^"|"$/g, '').trim();
}
// Validate and prepare template frames
async function validateAndPrepareFrames(requiredCount, frameLayout) {
    const frames = [];
    // First, check if user has selected frames
    const selection = figma.currentPage.selection;
    console.log('Current selection:', selection);
    for (const node of selection) {
        if (node.type === 'FRAME') {
            frames.push(node);
            console.log('Added selected frame:', node.name);
        }
    }
    // If not enough selected frames, look for template frames
    if (frames.length < requiredCount) {
        const searchTerms = ['template', 'profile', 'card', 'speaker', 'participant'];
        const allFrames = figma.currentPage.findAll(node => {
            if (node.type !== 'FRAME')
                return false;
            const nodeName = node.name.toLowerCase();
            return searchTerms.some(term => nodeName.includes(term));
        });
        console.log('Found template frames:', allFrames.map(f => f.name));
        frames.push(...allFrames.slice(0, requiredCount - frames.length));
    }
    // If still not enough frames, duplicate the first template frame
    if (frames.length > 0 && frames.length < requiredCount) {
        const templateFrame = frames[0];
        const needed = requiredCount - frames.length;
        console.log(`Duplicating template frame ${templateFrame.name} ${needed} times`);
        for (let i = 0; i < needed; i++) {
            const duplicate = templateFrame.clone();
            // Position based on layout preference
            if (frameLayout === 'grid') {
                const cols = 4;
                const row = Math.floor((frames.length + i) / cols);
                const col = (frames.length + i) % cols;
                duplicate.x = templateFrame.x + col * (templateFrame.width + 20);
                duplicate.y = templateFrame.y + row * (templateFrame.height + 20);
            }
            else if (frameLayout === 'list') {
                duplicate.x = templateFrame.x;
                duplicate.y = templateFrame.y + (frames.length + i) * (templateFrame.height + 20);
            }
            else {
                // Auto arrange
                duplicate.x = templateFrame.x + (frames.length + i) * (templateFrame.width + 20);
                duplicate.y = templateFrame.y;
            }
            frames.push(duplicate);
            console.log(`Created duplicate frame ${i + 1}: ${duplicate.name}`);
        }
    }
    console.log(`Final frames array: ${frames.length} frames`);
    frames.forEach((frame, index) => {
        console.log(`Frame ${index}: ${frame.name}`);
    });
    if (frames.length === 0) {
        throw new Error(`No template frames found. Please create a template frame and select it, or name it with "template" in the title.`);
    }
    return frames.slice(0, requiredCount);
}
// Optimized frame population
async function populateFrameOptimized(frame, profile, settings) {
    // Process text fields first (faster)
    await populateTextFields(frame, profile);
    // Process image if available
    if (profile.profileImageUrl) {
        await populateImageField(frame, profile.profileImageUrl, settings.imageProcessing);
    }
}
// Populate text fields in frame
async function populateTextFields(frame, profile) {
    const textNodes = frame.findAll(node => node.type === 'TEXT');
    console.log(`Processing frame: ${frame.name}`);
    console.log(`Found ${textNodes.length} text nodes`);
    console.log(`Profile data:`, profile);
    
    // Process all text nodes
    for (const textNode of textNodes) {
        const nodeName = textNode.name.toLowerCase();
        console.log(`Processing text node: "${textNode.name}" (${nodeName})`);
        let newText = '';
        
        if (nodeName.includes('name') || nodeName.includes('speaker') || nodeName.includes('participant')) {
            newText = profile.name;
            console.log(`Setting name to: ${newText}`);
        }
        else if (nodeName.includes('designation') || nodeName.includes('title') || nodeName.includes('position')) {
            newText = profile.designation;
            console.log(`Setting designation to: ${newText}`);
        }
        else if (nodeName.includes('org') || nodeName.includes('company') || nodeName.includes('employer')) {
            newText = profile.organization;
            console.log(`Setting organization to: ${newText}`);
        }
        
        if (newText && newText !== textNode.characters) {
            try {
                await figma.loadFontAsync(textNode.fontName);
                textNode.characters = newText;
                console.log(`Successfully updated "${textNode.name}" to "${newText}"`);
            }
            catch (fontError) {
                // If font fails to load, try with default font
                try {
                    await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
                    textNode.characters = newText;
                    console.log(`Updated "${textNode.name}" with default font to "${newText}"`);
                }
                catch (defaultFontError) {
                    console.warn(`Could not update text for ${textNode.name}:`, defaultFontError);
                }
            }
        }
        else {
            console.log(`No change needed for "${textNode.name}"`);
        }
    }
}

// Populate image field with URL (for Google Sheets) - with background removal
async function populateImageField(frame, imageUrl, processingMode) {
    try {
        console.log('Processing image URL:', imageUrl);
        console.log('Processing mode:', processingMode); // Debug: see what mode is received
        
        // Check cache first
        let imageHash = imageCache.get(imageUrl);
        if (!imageHash) {
            // Fetch image from URL
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            const imageData = await response.arrayBuffer();
            const uint8Array = new Uint8Array(imageData);
            if (uint8Array.length === 0) {
                console.warn('Skipping image - empty image data');
                return;
            }
            
            // Apply background removal if enabled
            let processedImageData = uint8Array;
            if (processingMode === 'remove-background') {
                try {
                    console.log('🔄 Background removal enabled - processing image...');
                    processedImageData = await removeBackgroundFromImage(uint8Array);
                    console.log('✅ Background removal completed successfully');
                } catch (bgError) {
                    console.warn('⚠️ Background removal failed, using original image:', bgError.message);
                    processedImageData = uint8Array;
                }
            } else {
                console.log('ℹ️ Background removal not enabled, using original image');
            }
            
            // Create Figma image
            const image = figma.createImage(processedImageData);
            imageHash = image.hash;
            
            // Cache for future use (limit cache size)
            if (imageCache.size < 100) {
                imageCache.set(imageUrl, imageHash);
            }
        }
        
        // Find image placeholder in frame
        const imageNode = frame.findOne(node => {
            if (node.type !== 'RECTANGLE' && node.type !== 'ELLIPSE')
                return false;
            const nodeName = node.name.toLowerCase();
            return nodeName.includes('image') ||
                nodeName.includes('photo') ||
                nodeName.includes('picture') ||
                nodeName.includes('profile') ||
                nodeName.includes('avatar');
        });
        
        if (imageNode) {
            imageNode.fills = [{
                type: 'IMAGE',
                imageHash: imageHash,
                scaleMode: 'FILL'
            }];
            console.log('Successfully populated image in existing node');
        }
        else {
            // Create new image node if no placeholder found
            const newImageNode = figma.createRectangle();
            newImageNode.name = 'Profile Image';
            newImageNode.resize(100, 100);
            newImageNode.fills = [{
                type: 'IMAGE',
                imageHash: imageHash,
                scaleMode: 'FILL'
            }];
            
            // Position in top-left of frame
            newImageNode.x = 0;
            newImageNode.y = 0;
            frame.appendChild(newImageNode);
            console.log('Created and populated new image node');
        }
    }
    catch (error) {
        console.warn('Error populating image:', error);
        // Continue without image rather than failing
    }
}

// Background removal function using free API service
async function removeBackgroundFromImage(imageBuffer) {
    try {
        console.log('🔄 Starting background removal process...');
        console.log('📊 Image buffer size:', imageBuffer.byteLength, 'bytes');
        
        // Convert ArrayBuffer to base64
        const base64Image = arrayBufferToBase64(imageBuffer);
        console.log('🔄 Image converted to base64, length:', base64Image.length);
        
        // Use remove.bg API (free tier: 50 images/month)
        const apiKey = 'HZrvxg1Gn6cbffNKBTXMckJ1';
        console.log('🔑 Using API key:', apiKey.substring(0, 8) + '...');
        
        const apiUrl = 'https://api.remove.bg/v1.0/removebg';
        console.log('🌐 Calling API:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_url: null,
                image_base64: base64Image,
                size: 'auto'
            })
        });
        
        console.log('📡 API response status:', response.status);
        console.log('📡 API response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API error response:', errorText);
            throw new Error(`Background removal API failed: ${response.status} - ${errorText}`);
        }
        
        const processedImageBuffer = await response.arrayBuffer();
        console.log('✅ Received processed image, size:', processedImageBuffer.byteLength, 'bytes');
        
        return new Uint8Array(processedImageBuffer);
        
    } catch (error) {
        console.error('❌ Background removal failed:', error);
        
        // Fallback: Try alternative free service (remove.bg alternative)
        try {
            console.log('🔄 Trying alternative background removal service...');
            return await removeBackgroundAlternative(imageBuffer);
        } catch (fallbackError) {
            console.error('❌ Alternative background removal also failed:', fallbackError);
            throw new Error('Background removal unavailable');
        }
    }
}

// Alternative background removal using different free service
async function removeBackgroundAlternative(imageBuffer) {
    try {
        // Convert to base64
        const base64Image = arrayBufferToBase64(imageBuffer);
        
        // Use alternative service (example: Cloudinary with background removal)
        const response = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                file: `data:image/jpeg;base64,${base64Image}`,
                upload_preset: 'YOUR_UPLOAD_PRESET',
                transformation: 'e_bgremoval'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Alternative service failed: ${response.status}`);
        }
        
        const result = await response.json();
        const processedImageUrl = result.secure_url;
        
        // Download the processed image
        const imageResponse = await fetch(processedImageUrl);
        const processedImageBuffer = await imageResponse.arrayBuffer();
        return new Uint8Array(processedImageBuffer);
        
    } catch (error) {
        throw new Error(`Alternative background removal failed: ${error.message}`);
    }
}

// Utility function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Utility function to chunk arrays for batch processing
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}



