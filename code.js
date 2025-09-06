"use strict";

// LinkedIn Profile Populator - Main Plugin Code
// This plugin processes CSV files with LinkedIn profile data and images

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
        const { csvData, settings, source } = msg;
        
        try {
            figma.ui.postMessage({
                type: 'status',
                message: `Processing data from ${source === 'google-sheets' ? 'Google Sheets' : 'CSV file'}...`
            });

            // Parse CSV data
            const profiles = await parseCSVData(csvData);
            
            figma.ui.postMessage({
                type: 'status',
                message: `Found ${profiles.length} profiles. Processing templates...`
            });

            // Process profiles
            await processProfiles(profiles, settings);

        } catch (error) {
            console.error('Plugin error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            figma.ui.postMessage({
                type: 'error',
                message: errorMessage
            });
        }
    }
};


// Parse CSV data into profile objects
async function parseCSVData(csvData) {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const profiles = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length < headers.length) continue;
        
        const profile = {
            name: values[0] || `Profile ${i}`,
            designation: values[1] || '',
            org: values[2] || '',
            linkedinUrl: values[3] || '',
            imageUrl: values[4] || ''
        };
        
        profiles.push(profile);
    }
    
    return profiles;
}

// Process profiles and populate Figma templates
async function processProfiles(profiles, settings) {
    const { batchSize = 10, imageProcessing = 'original', frameLayout = 'auto' } = settings;
    
    figma.ui.postMessage({
        type: 'status',
        message: `Found ${profiles.length} profiles. Validating template...`
    });
    
    // Find template frames
    const frames = findTemplateFrames(profiles.length);
    
    console.log(`Found ${frames.length} frames for ${profiles.length} profiles`);
    console.log('Frame names:', frames.map(f => f.name));
    
    figma.ui.postMessage({
        type: 'status',
        message: `Found ${frames.length} template frames. Starting profile processing...`
    });
    
    // Process profiles one by one to avoid font loading conflicts
    for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i];
        const frame = frames[i];
        
        if (frame) {
            console.log(`Processing profile ${i + 1}: ${profile.name} in frame: ${frame.name}`);
            await populateFrame(frame, profile, imageProcessing);
        } else {
            console.log(`No frame available for profile ${i + 1}: ${profile.name}`);
        }
        
        // Small delay between profiles
        await new Promise(resolve => setTimeout(resolve, 100));
        
        figma.ui.postMessage({
            type: 'progress',
            current: i + 1,
            total: profiles.length
        });
    }
    
    figma.ui.postMessage({
        type: 'complete',
        message: `Successfully processed ${profiles.length} profiles!`
    });
}

// Find template frames in the current page
function findTemplateFrames(requiredCount) {
    const frames = [];
    
    // Look for frames with template indicators
    const searchTerms = ['template', 'profile', 'card', 'frame'];
    const allFrames = figma.currentPage.findAll(node => {
        if (node.type !== 'FRAME') return false;
        const nodeName = node.name.toLowerCase();
        return searchTerms.some(term => nodeName.includes(term));
    });
    
    console.log('Found template frames:', allFrames.map(f => f.name));
    
    // Add found frames
    for (let i = 0; i < allFrames.length && frames.length < requiredCount; i++) {
        frames.push(allFrames[i]);
    }
    
    // If we have enough frames, just use them (don't duplicate)
    if (frames.length >= requiredCount) {
        return frames.slice(0, requiredCount);
    }
    
    // If we have some frames but not enough, duplicate the first one
    if (frames.length > 0 && frames.length < requiredCount) {
        const templateFrame = frames[0];
        const needed = requiredCount - frames.length;
        
        for (let i = 0; i < needed; i++) {
            const duplicate = templateFrame.clone();
            duplicate.x = templateFrame.x + (i + 1) * (templateFrame.width + 50);
                duplicate.y = templateFrame.y;
            duplicate.name = `${templateFrame.name} ${i + 2}`;
            frames.push(duplicate);
        }
    }
    
    // If no frames found, create a basic template
    if (frames.length === 0) {
        console.log('No template frames found, creating basic template');
        const basicFrame = figma.createFrame();
        basicFrame.name = 'Profile Template';
        basicFrame.resize(300, 400);
        basicFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        
        // Add text elements
        const nameText = figma.createText();
        nameText.name = 'Name';
        nameText.characters = 'Name';
        nameText.x = 20;
        nameText.y = 20;
        basicFrame.appendChild(nameText);
        
        const designationText = figma.createText();
        designationText.name = 'Designation';
        designationText.characters = 'Designation';
        designationText.x = 20;
        designationText.y = 50;
        basicFrame.appendChild(designationText);
        
        const orgText = figma.createText();
        orgText.name = 'Org';
        orgText.characters = 'Organization';
        orgText.x = 20;
        orgText.y = 80;
        basicFrame.appendChild(orgText);
        
        // Add image placeholder
        const imageRect = figma.createRectangle();
        imageRect.name = 'ProfileImage';
        imageRect.resize(100, 100);
        imageRect.x = 20;
        imageRect.y = 120;
        imageRect.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
        basicFrame.appendChild(imageRect);
        
        frames.push(basicFrame);
        
        // Duplicate if needed
        for (let i = 1; i < requiredCount; i++) {
            const duplicate = basicFrame.clone();
            duplicate.x = basicFrame.x + i * (basicFrame.width + 50);
            duplicate.y = basicFrame.y;
            duplicate.name = `Profile Template ${i + 1}`;
            frames.push(duplicate);
        }
    }
    
    return frames;
}

// Populate a frame with profile data
async function populateFrame(frame, profile, imageProcessing) {
    try {
        // Load fonts first to avoid font loading errors
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        
        // Find and populate text fields
        const nameNode = frame.findOne(node => 
            node.type === 'TEXT' && node.name.toLowerCase().includes('name')
        );
        if (nameNode && nameNode.type === 'TEXT') {
            try {
                await figma.loadFontAsync(nameNode.fontName);
                nameNode.characters = profile.name;
            } catch (fontError) {
                console.log('Font loading failed, using default font');
                await figma.loadFontAsync({ family: "Inter", style: "Regular" });
                nameNode.fontName = { family: "Inter", style: "Regular" };
                nameNode.characters = profile.name;
            }
        }
        
        const designationNode = frame.findOne(node => 
            node.type === 'TEXT' && node.name.toLowerCase().includes('designation')
        );
        if (designationNode && designationNode.type === 'TEXT') {
            try {
                await figma.loadFontAsync(designationNode.fontName);
                designationNode.characters = profile.designation;
            } catch (fontError) {
                console.log('Font loading failed, using default font');
                await figma.loadFontAsync({ family: "Inter", style: "Regular" });
                designationNode.fontName = { family: "Inter", style: "Regular" };
                designationNode.characters = profile.designation;
            }
        }
        
        const orgNode = frame.findOne(node => 
            node.type === 'TEXT' && node.name.toLowerCase().includes('org')
        );
        if (orgNode && orgNode.type === 'TEXT') {
            try {
                await figma.loadFontAsync(orgNode.fontName);
                orgNode.characters = profile.org;
            } catch (fontError) {
                console.log('Font loading failed, using default font');
                await figma.loadFontAsync({ family: "Inter", style: "Regular" });
                orgNode.fontName = { family: "Inter", style: "Regular" };
                orgNode.characters = profile.org;
            }
        }
        
        // Handle profile image (always populate, use placeholder if no URL)
        await populateImageField(frame, profile.imageUrl, imageProcessing, profile.name);
        
    } catch (error) {
        console.error('Error populating frame:', error);
    }
}

// Populate image field with profile picture or placeholder
async function populateImageField(frame, imageUrl, imageProcessing, profileName = '') {
    try {
        const imageNode = frame.findOne(node => 
            node.type === 'RECTANGLE' && node.name.toLowerCase().includes('image')
        );
        
        if (!imageNode || imageNode.type !== 'RECTANGLE') {
            console.log('No image node found in frame');
            return;
        }
        
        // If no image URL provided, use placeholder
        if (!imageUrl || imageUrl.trim() === '') {
            console.log('No image URL provided, using placeholder');
            await setPlaceholderImage(imageNode, profileName);
            return;
        }
            
        // Check cache first
        if (imageCache.has(imageUrl)) {
            const cachedImage = imageCache.get(imageUrl);
            imageNode.fills = [cachedImage];
            return;
        }
        
        // Fetch and process image
        let processedImage;
        
        try {
            if (imageUrl.startsWith('data:image/svg+xml;base64,')) {
                // Handle SVG data URLs
                const base64Data = imageUrl.split(',')[1];
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                processedImage = figma.createImage(bytes);
            } else {
                // Handle regular URLs
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.status}`);
                }
                const imageBytes = await response.arrayBuffer();
                const bytes = new Uint8Array(imageBytes);
                processedImage = figma.createImage(bytes);
            }
            
            // Create image fill
            const imageFill = {
                type: 'IMAGE',
                imageHash: processedImage.hash,
                scaleMode: 'FILL'
            };
            
            // Cache the image
            imageCache.set(imageUrl, imageFill);
            
            // Apply to node
            imageNode.fills = [imageFill];
            
        } catch (imageError) {
            console.error('Error processing image:', imageError);
            // Use placeholder if image fails to load
            await setPlaceholderImage(imageNode, profileName);
        }
        
    } catch (error) {
        console.error('Error in populateImageField:', error);
        // Fallback to placeholder
        await setPlaceholderImage(imageNode, profileName);
    }
}

// Set placeholder image for profile picture with initials
async function setPlaceholderImage(imageNode, profileName = '') {
    try {
        // Create light red background
        const placeholderFill = {
            type: 'SOLID',
            color: { r: 1, g: 0.8, b: 0.8 } // Light red
        };
        
        imageNode.fills = [placeholderFill];
        
        // Add a subtle border
        imageNode.strokes = [{
            type: 'SOLID',
            color: { r: 0.9, g: 0.6, b: 0.6 } // Slightly darker red border
        }];
        imageNode.strokeWeight = 1;
        
        // Generate initials from name
        const initials = generateInitials(profileName);
        
        // Create text node for initials
        const textNode = figma.createText();
        textNode.name = 'Initials';
        textNode.characters = initials;
        
        // Load font and style the text
        await figma.loadFontAsync({ family: "Inter", style: "Bold" });
        textNode.fontName = { family: "Inter", style: "Bold" };
        textNode.fontSize = Math.min(imageNode.width, imageNode.height) * 0.4; // 40% of the smaller dimension
        textNode.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.2, b: 0.2 } }]; // Dark red text
        
        // Center the text
        textNode.x = imageNode.x + (imageNode.width - textNode.width) / 2;
        textNode.y = imageNode.y + (imageNode.height - textNode.height) / 2;
        
        // Add text to the same parent as the image node
        if (imageNode.parent) {
            imageNode.parent.appendChild(textNode);
        }
        
        console.log(`Applied placeholder image with initials: ${initials}`);
        
    } catch (error) {
        console.error('Error setting placeholder image:', error);
    }
}

// Generate initials from name
function generateInitials(name) {
    if (!name || name.trim() === '') {
        return '?';
    }
    
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        // Single word - take first two characters
        return words[0].substring(0, 2).toUpperCase();
    } else {
        // Multiple words - take first character of each word
        return words.map(word => word.charAt(0)).join('').toUpperCase();
    }
}
