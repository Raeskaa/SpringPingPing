# Background Removal Configuration Guide

## Overview
The LinkedIn Profile Populator plugin now includes automatic background removal functionality. When you select "Remove background automatically" in the Image Processing settings, the plugin will automatically remove backgrounds from profile images before adding them to Figma.

## Setup Instructions

### Option 1: Remove.bg API (Recommended - Free Tier: 50 images/month)

1. **Get Free API Key:**
   - Go to [remove.bg](https://www.remove.bg/api)
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Update Plugin Code:**
   - Open `code.js`
   - Find line: `const apiKey = 'YOUR_REMOVE_BG_API_KEY';`
   - Replace `YOUR_REMOVE_BG_API_KEY` with your actual API key

3. **Example:**
   ```javascript
   const apiKey = 'HZrvxg1Gn6cbffNKBTXMckJ1'; // Your actual API key
   ```

### Option 2: Cloudinary (Alternative - Free Tier: 25 credits/month)

1. **Get Cloudinary Account:**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for a free account
   - Get your cloud name and upload preset

2. **Update Plugin Code:**
   - Open `code.js`
   - Find the `removeBackgroundAlternative` function
   - Replace `YOUR_CLOUD_NAME` and `YOUR_UPLOAD_PRESET`

3. **Example:**
   ```javascript
   const response = await fetch('https://api.cloudinary.com/v1_1/mycloudname/image/upload', {
       // ... other options
       body: JSON.stringify({
           file: `data:image/jpeg;base64,${base64Image}`,
           upload_preset: 'my_upload_preset',
           transformation: 'e_bgremoval'
       })
   });
   ```

## How It Works

1. **Image Processing Flow:**
   - Plugin fetches image from URL in CSV
   - If "Remove background" is selected, sends image to background removal API
   - Receives processed image with background removed
   - Adds processed image to Figma frame

2. **Fallback System:**
   - If primary service fails, tries alternative service
   - If both fail, uses original image
   - Logs all attempts for debugging

3. **Caching:**
   - Processed images are cached to avoid re-processing
   - Cache limited to 100 images to manage memory

## Usage

1. **In Plugin UI:**
   - Select "Remove background automatically" from Image Processing dropdown
   - Process your CSV or Google Sheets data
   - Images will automatically have backgrounds removed

2. **CSV Format:**
   - Ensure your CSV has a column with image URLs
   - Column names: "ProfileImage", "Image", "Photo", "Picture", "ImageURL"

## Troubleshooting

### Common Issues:

1. **API Key Invalid:**
   - Check your API key is correct
   - Ensure you have remaining credits/quota

2. **Background Removal Fails:**
   - Check console for error messages
   - Verify image URLs are accessible
   - Check network connectivity

3. **Images Not Processing:**
   - Ensure "Remove background automatically" is selected
   - Check that images have valid URLs in CSV

### Error Messages:

- `"Background removal API failed: 401"` → Invalid API key
- `"Background removal API failed: 429"` → Rate limit exceeded
- `"Background removal unavailable"` → All services failed

## Cost Considerations

- **Remove.bg:** Free tier includes 50 images/month
- **Cloudinary:** Free tier includes 25 credits/month
- **Alternative:** Use "Keep original quality" for unlimited images

## Performance Tips

1. **Batch Processing:** Process multiple images at once for efficiency
2. **Image Quality:** Higher quality images give better background removal results
3. **Caching:** Processed images are cached to avoid re-processing
4. **Fallback:** Plugin gracefully falls back to original images if processing fails

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API keys are correct
3. Ensure you have remaining API credits
4. Check that image URLs are accessible from your network
