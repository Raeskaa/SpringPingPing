/**
 * Simple LinkedIn Profile Picture Scraper
 * This script helps you manually get LinkedIn profile picture URLs
 * No browser automation - just a helper to make the process easier
 */

const fs = require('fs');
const path = require('path');

// Function to parse CSV and extract LinkedIn URLs
function parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const linkedinIndex = headers.findIndex(h => 
        h.includes('linkedin') || h.includes('linkedinid') || h.includes('linkedin_id')
    );
    
    if (linkedinIndex === -1) {
        throw new Error('No LinkedIn column found in CSV. Please ensure your CSV has a column with LinkedIn URLs.');
    }
    
    const profiles = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',');
        const linkedinUrl = values[linkedinIndex]?.trim();
        
        if (linkedinUrl && linkedinUrl.includes('linkedin.com')) {
            profiles.push({
                name: values[0] || `Profile ${i}`,
                linkedinUrl: linkedinUrl,
                rowIndex: i,
                imageUrl: null
            });
        }
    }
    
    return profiles;
}

// Function to generate LinkedIn profile picture URL
function generateLinkedInImageUrl(linkedinUrl) {
    // Extract username from LinkedIn URL
    const match = linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
    if (!match) {
        return null;
    }
    
    const username = match[1];
    
    // LinkedIn profile picture URL pattern
    // This is a common pattern for LinkedIn profile pictures
    return `https://media.licdn.com/dms/image/C4E03AQ${username}/profile-displayphoto-shrink_800_800/0/1234567890?e=1234567890&v=beta&t=example`;
}

// Function to create a simple HTML page for manual image collection
function createManualScraperHTML(profiles) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn Profile Picture Collector</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #0077b5;
            text-align: center;
            margin-bottom: 30px;
        }
        .profile-card {
            background: #f8f9fa;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid #0077b5;
        }
        .profile-name {
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 10px;
        }
        .profile-url {
            color: #0077b5;
            text-decoration: none;
            margin-bottom: 15px;
            display: block;
        }
        .image-section {
            display: flex;
            gap: 20px;
            align-items: center;
        }
        .current-image {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #ddd;
        }
        .image-input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .copy-btn {
            background: #0077b5;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        .copy-btn:hover {
            background: #005885;
        }
        .instructions {
            background: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ffeaa7;
            margin: 20px 0;
        }
        .instructions h3 {
            color: #856404;
            margin-top: 0;
        }
        .download-section {
            background: #d4edda;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #c3e6cb;
            margin: 20px 0;
            text-align: center;
        }
        .download-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        }
        .download-btn:hover {
            background: #218838;
        }
        .progress {
            background: #e9ecef;
            border-radius: 10px;
            padding: 3px;
            margin: 10px 0;
        }
        .progress-bar {
            background: #0077b5;
            height: 20px;
            border-radius: 8px;
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 LinkedIn Profile Picture Collector</h1>
        
        <div class="instructions">
            <h3>📋 How to Use This Tool:</h3>
            <ol>
                <li><strong>Click each LinkedIn URL</strong> to open the profile in a new tab</li>
                <li><strong>Right-click on the profile picture</strong> and select "Copy image address"</li>
                <li><strong>Paste the image URL</strong> into the text field next to each profile</li>
                <li><strong>Repeat for all profiles</strong> in the list</li>
                <li><strong>Click "Download Updated CSV"</strong> when you're done</li>
            </ol>
            <p><strong>💡 Tip:</strong> You can also use the "Copy URL" button to quickly copy the LinkedIn profile URL to your clipboard.</p>
        </div>
        
        <div class="progress">
            <div class="progress-bar" id="progressBar" style="width: 0%"></div>
        </div>
        <p id="progressText">0 of ${profiles.length} profiles completed</p>
        
        ${profiles.map((profile, index) => `
            <div class="profile-card">
                <div class="profile-name">${profile.name}</div>
                <a href="${profile.linkedinUrl}" target="_blank" class="profile-url">${profile.linkedinUrl}</a>
                <div class="image-section">
                    <img src="https://via.placeholder.com/100x100/cccccc/666666?text=No+Image" 
                         alt="Profile Image" class="current-image" id="img-${index}">
                    <input type="text" class="image-input" id="input-${index}" 
                           placeholder="Paste LinkedIn profile picture URL here..."
                           onchange="updateImage(${index})">
                    <button class="copy-btn" onclick="copyUrl('${profile.linkedinUrl}')">Copy URL</button>
                </div>
            </div>
        `).join('')}
        
        <div class="download-section">
            <h3>✅ Ready to Download?</h3>
            <p>Once you've collected all the profile picture URLs, click the button below to download your updated CSV file.</p>
            <button class="download-btn" onclick="downloadCSV()">📥 Download Updated CSV</button>
        </div>
    </div>

    <script>
        const profiles = ${JSON.stringify(profiles)};
        let completedCount = 0;
        
        function updateImage(index) {
            const input = document.getElementById('input-${index}');
            const img = document.getElementById('img-${index}');
            const url = input.value.trim();
            
            if (url) {
                img.src = url;
                profiles[index].imageUrl = url;
                completedCount++;
            } else {
                img.src = 'https://via.placeholder.com/100x100/cccccc/666666?text=No+Image';
                if (profiles[index].imageUrl) {
                    completedCount--;
                }
                profiles[index].imageUrl = null;
            }
            
            updateProgress();
        }
        
        function updateProgress() {
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            const percentage = (completedCount / profiles.length) * 100;
            
            progressBar.style.width = percentage + '%';
            progressText.textContent = completedCount + ' of ' + profiles.length + ' profiles completed';
        }
        
        function copyUrl(url) {
            navigator.clipboard.writeText(url).then(() => {
                alert('LinkedIn URL copied to clipboard!');
            });
        }
        
        function downloadCSV() {
            let csvContent = 'Name,LinkedIn URL,Profile Image URL\\n';
            profiles.forEach(profile => {
                csvContent += '"' + profile.name + '","' + profile.linkedinUrl + '","' + (profile.imageUrl || '') + '"\\n';
            });
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'linkedin_profiles_with_images.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            alert('CSV file downloaded successfully!');
        }
    </script>
</body>
</html>`;
    
    return html;
}

// Main function
function main() {
    console.log('🔍 LinkedIn Profile Picture Scraper');
    console.log('=====================================');
    
    // Check if CSV file exists
    const csvFile = process.argv[2] || 'example_data.csv';
    
    if (!fs.existsSync(csvFile)) {
        console.log('❌ CSV file not found:', csvFile);
        console.log('Usage: node simple-linkedin-scraper.js [csv-file]');
        console.log('Example: node simple-linkedin-scraper.js SpringVerify_demo.csv');
        return;
    }
    
    try {
        // Read and parse CSV
        console.log('📖 Reading CSV file:', csvFile);
        const csvContent = fs.readFileSync(csvFile, 'utf8');
        const profiles = parseCSV(csvContent);
        
        console.log('✅ Found', profiles.length, 'LinkedIn profiles');
        
        // Create HTML file for manual collection
        const htmlContent = createManualScraperHTML(profiles);
        const htmlFile = 'linkedin-image-collector.html';
        
        fs.writeFileSync(htmlFile, htmlContent);
        
        console.log('🎉 Created manual image collector:', htmlFile);
        console.log('');
        console.log('📋 Next Steps:');
        console.log('1. Open', htmlFile, 'in your browser');
        console.log('2. Click each LinkedIn URL to open the profile');
        console.log('3. Right-click on profile pictures and copy image URLs');
        console.log('4. Paste the URLs into the text fields');
        console.log('5. Download the updated CSV when done');
        console.log('');
        console.log('🚀 This approach bypasses all browser automation issues!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the script
main();
