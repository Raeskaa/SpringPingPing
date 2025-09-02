// LinkedIn Profile Populator - Main Plugin Code
// This plugin processes Google Sheets with actual images and CSV files

figma.showUI(__html__, { 
    title: 'LinkedIn Profile Populator',
    width: 500, 
    height: 700,
    themeColors: true
  });
  
  interface ProfileData {
    name: string;
    designation: string;
    organization: string;
    profileImageUrl?: string;
    linkedinUrl?: string;
  }
  
  interface ProcessingSettings {
    batchSize: number;
    imageProcessing: string;
    frameLayout: string;
  }
  
  // Image cache to avoid reprocessing identical images
  const imageCache = new Map<string, string>();
  
  figma.ui.onmessage = async (msg) => {
    if (msg.type === 'process-data') {
      const { csvData, settings } = msg;
  
      try {
        figma.ui.postMessage({ 
          type: 'status', 
          message: 'Parsing CSV data...' 
        });
  
        // Parse CSV data
        const profiles: ProfileData[] = await parseCSVData(csvData);
        
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
    } else if (msg.type === 'process-sheets') {
      const { sheetsUrl, settings } = msg;
      
      try {
        figma.ui.postMessage({ 
          type: 'status', 
          message: 'Fetching Google Sheets data...' 
        });
        
        // Fetch and parse Google Sheets data
        const profiles: ProfileData[] = await fetchGoogleSheetsData(sheetsUrl);
        
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
  
  // Process profiles with the existing logic
  async function processProfiles(profiles: ProfileData[], settings: ProcessingSettings) {
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
          await Promise.all(
            batch.map(async (profile, index) => {
              const frameIndex = processedCount + index;
              await populateFrameOptimized(frames[frameIndex], profile, settings);
            })
          );
  
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
  
      } catch (error) {
        console.error('Plugin error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        figma.ui.postMessage({ 
          type: 'error', 
          message: errorMessage
        });
      }
    }
  
  // Parse CSV data (simplified - no base64 images)
  async function parseCSVData(csvData: string): Promise<ProfileData[]> {
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
  
    const profiles: ProfileData[] = [];
  
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
  
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      console.log(`Line ${i} values:`, values);
      console.log(`Line ${i} values length:`, values.length);
  
      if (values.length > Math.max(nameIndex, designationIndex, orgIndex)) {
        const profile: ProfileData = {
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
        } else {
          console.log(`Skipped profile ${i} - no name`);
        }
      } else {
        console.log(`Skipped line ${i} - insufficient columns`);
      }
    }
  
    console.log('Final profiles array:', profiles);
    if (profiles.length === 0) {
      throw new Error('No valid profiles found in CSV. Please check your data format.');
    }
  
    return profiles;
  }
  
  // Fetch and parse Google Sheets data
  async function fetchGoogleSheetsData(sheetsUrl: string): Promise<ProfileData[]> {
    try {
      // Extract sheet ID from URL
      const sheetIdMatch = sheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        throw new Error('Invalid Google Sheets URL. Please provide a valid sharing URL.');
      }
      
      const sheetId = sheetIdMatch[1];
      
      // Try to bypass CORS issues with multiple approaches
      let csvData = '';
      
      // Approach 1: Direct CSV export
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        console.log('Trying direct CSV export...');
        
        const response = await fetch(csvUrl);
        if (response.ok) {
          csvData = await response.text();
          console.log('Direct CSV export successful');
        }
      } catch (error) {
        console.log('Direct export failed, trying CORS proxy...');
        
        // Approach 2: Use CORS proxy as fallback
        try {
          const proxyUrl = `https://cors-anywhere.herokuapp.com/https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            csvData = await response.text();
            console.log('CORS proxy method successful');
          }
        } catch (proxyError) {
          console.log('CORS proxy failed, trying final method...');
          
          // Approach 3: Alternative export format
          try {
            const altUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0&t=${Date.now()}`;
            const response = await fetch(altUrl);
            if (response.ok) {
              csvData = await response.text();
              console.log('Alternative method successful');
            }
          } catch (finalError) {
            throw new Error('All methods failed - CORS issue persists');
          }
        }
      }
      
      if (!csvData) {
        throw new Error('Failed to fetch any data from Google Sheets');
      }
      
      console.log('Fetched Google Sheets data:', csvData.substring(0, 200) + '...');
      
      // Parse the CSV data using existing function
      return await parseCSVData(csvData);
      
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      throw new Error(`Failed to fetch Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Helper function to find column index by multiple possible names
  function findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
      if (index !== -1) return index;
    }
    return -1;
  }
  
  // Clean CSV values (remove quotes, trim whitespace)
  function cleanValue(value: string): string {
    if (!value) return '';
    return value.trim().replace(/^"|"$/g, '').trim();
  }
  
  // Validate and prepare template frames
  async function validateAndPrepareFrames(requiredCount: number, frameLayout: string): Promise<FrameNode[]> {
    const frames: FrameNode[] = [];
  
    // First, check if user has selected frames
    const selection = figma.currentPage.selection;
    console.log('Current selection:', selection);
    for (const node of selection) {
      if (node.type === 'FRAME') {
        frames.push(node as FrameNode);
        console.log('Added selected frame:', node.name);
      }
    }
  
    // If not enough selected frames, look for template frames
    if (frames.length < requiredCount) {
      const searchTerms = ['template', 'profile', 'card', 'speaker', 'participant'];
      const allFrames = figma.currentPage.findAll(node => {
        if (node.type !== 'FRAME') return false;
        const nodeName = node.name.toLowerCase();
        return searchTerms.some(term => nodeName.includes(term));
      }) as FrameNode[];
      
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
        } else if (frameLayout === 'list') {
          duplicate.x = templateFrame.x;
          duplicate.y = templateFrame.y + (frames.length + i) * (templateFrame.height + 20);
        } else {
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
  async function populateFrameOptimized(frame: FrameNode, profile: ProfileData, settings: ProcessingSettings) {
    // Process text fields first (faster)
    await populateTextFields(frame, profile);
  
    // Process image if available
    if (profile.profileImageUrl) {
      await populateImageField(frame, profile.profileImageUrl, settings.imageProcessing);
    }
  }
  
  // Populate text fields in frame
  async function populateTextFields(frame: FrameNode, profile: ProfileData) {
    const textNodes = frame.findAll(node => node.type === 'TEXT') as TextNode[];
    
    console.log(`Processing frame: ${frame.name}`);
    console.log(`Found ${textNodes.length} text nodes`);
    console.log(`Profile data:`, profile);
    
    // Also log all nodes in the frame to see what we're working with
    const allNodes = frame.findAll(node => true);
    console.log(`All nodes in frame:`, allNodes.map(n => ({ type: n.type, name: n.name })));
    
    // Process all text nodes
    for (const textNode of textNodes) {
      const nodeName = textNode.name.toLowerCase();
      console.log(`Processing text node: "${textNode.name}" (${nodeName})`);
  
      let newText = '';
      if (nodeName.includes('name') || nodeName.includes('speaker') || nodeName.includes('participant')) {
        newText = profile.name;
        console.log(`Setting name to: ${newText}`);
      } else if (nodeName.includes('designation') || nodeName.includes('title') || nodeName.includes('position')) {
        newText = profile.designation;
        console.log(`Setting designation to: ${newText}`);
      } else if (nodeName.includes('org') || nodeName.includes('company') || nodeName.includes('employer')) {
        newText = profile.organization;
        console.log(`Setting organization to: ${newText}`);
      }
  
      if (newText && newText !== textNode.characters) {
        try {
          await figma.loadFontAsync(textNode.fontName as FontName);
          textNode.characters = newText;
          console.log(`Successfully updated "${textNode.name}" to "${newText}"`);
        } catch (fontError) {
          // If font fails to load, try with default font
          try {
            await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
            textNode.characters = newText;
            console.log(`Updated "${textNode.name}" with default font to "${newText}"`);
          } catch (defaultFontError) {
            console.warn(`Could not update text for ${textNode.name}:`, defaultFontError);
          }
        }
      } else {
        console.log(`No change needed for "${textNode.name}"`);
      }
    }
  }
  
  // Populate image field with URL (for Google Sheets)
  async function populateImageField(frame: FrameNode, imageUrl: string, processingMode: string) {
    try {
      console.log('Processing image URL:', imageUrl);
      
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
  
        // Create Figma image
        const image = figma.createImage(uint8Array);
        imageHash = image.hash;
  
        // Cache for future use (limit cache size)
        if (imageCache.size < 100) {
          imageCache.set(imageUrl, imageHash);
        }
      }
  
      // Find image placeholder in frame
      const imageNode = frame.findOne(node => {
        if (node.type !== 'RECTANGLE' && node.type !== 'ELLIPSE') return false;
        const nodeName = node.name.toLowerCase();
        return nodeName.includes('image') || 
               nodeName.includes('photo') || 
               nodeName.includes('picture') ||
               nodeName.includes('profile') ||
               nodeName.includes('avatar');
      }) as RectangleNode | EllipseNode;
  
      if (imageNode) {
        imageNode.fills = [{
          type: 'IMAGE',
          imageHash: imageHash,
          scaleMode: 'FILL'
        }];
        console.log('Successfully populated image in existing node');
      } else {
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
  
    } catch (error) {
      console.warn('Error populating image:', error);
      // Continue without image rather than failing
    }
  }
  
  // Utility function to chunk arrays for batch processing
  function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  