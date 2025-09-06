# LinkedIn Profile Populator - Figma Plugin

A simple Figma plugin that automatically populates profile templates with LinkedIn data and images from CSV files or Google Sheets.

## 🚀 Quick Start

### 1. Install the Plugin
1. Open Figma
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select the `manifest.json` file from this folder
4. The plugin will appear in your plugins list

### 2. Create Figma Templates
1. Create frames named with: `template`, `profile`, `card`, or `frame`
2. Add text elements named: `Name`, `Designation`, `Org`
3. Add a rectangle named: `ProfileImage` (for profile pictures)

### 3. Use the Plugin
1. Open the plugin in Figma
2. Choose your data input method (Google Sheets or CSV upload)
3. Load your data and review the preview
4. Click **"Generate Profile Cards"**

## 📊 Data Input Options

You can load profile data using **either** of these methods:

### Option 1: Google Sheets Integration 🔗

**Perfect for team collaboration and live data updates**

#### Setup Steps:
1. **Prepare your Google Sheet:**
   - Create columns: `Name`, `Designation`, `Org`, `LinkedinId`, `ProfileImage`
   - Add your profile data

2. **Make it public:**
   - Click **Share** → **"Change to anyone with the link"**
   - Set to **"Viewer"** permission
   - Copy the URL

3. **Use in plugin:**
   - Paste URL in **"Google Sheets URL"** field
   - Click **"Load from Sheets"**
   - If you get CORS errors, download the CSV file and upload it instead
   - Review data preview
   - Click **"Generate Profile Cards"**

**Supported URL formats:**
- `https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0`
- `https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=123456789`

**Benefits:**
- ✅ Real-time data updates
- ✅ Team collaboration
- ✅ No file management needed
- ✅ Always uses latest data

**Note:** If you encounter CORS errors, the plugin will suggest using the CSV upload option as a fallback.

### Option 2: CSV File Upload 📁

**Perfect for one-time use and offline work**

#### Setup Steps:
1. **Prepare CSV file** with columns:
   - `Name`, `Designation`, `Org`, `LinkedinId`, `ProfileImage`

2. **Upload in plugin:**
   - Drag & drop CSV file or click to browse
   - Review data preview
   - Click **"Generate Profile Cards"**

**Benefits:**
- ✅ Works offline
- ✅ Full data control
- ✅ No sharing required
- ✅ Version control friendly

## 📁 File Structure

```
linkedin-profile-plugin/
├── manifest.json          # Figma plugin configuration
├── code.js               # Main plugin logic
├── ui.html               # Plugin user interface
├── package.json          # Dependencies and scripts
├── simple-linkedin-scraper.js  # Manual image collection tool
├── README.md             # This documentation
└── .gitignore           # Git ignore file
```


## 🛠️ Manual Image Collection

Since automated LinkedIn scraping has technical limitations, use the manual approach:

### Step 1: Generate Image Collector

Run the image collection tool:
```bash
node simple-linkedin-scraper.js your-file.csv
```

This will generate `linkedin-image-collector.html` in your browser.



### Step 2: Collect Images
1. Open `linkedin-image-collector.html` in your browser
2. Click each LinkedIn URL to open the profile
3. Right-click on profile pictures and "Copy image address"
4. Paste URLs into the text fields
5. Download the updated CSV when done

### Step 3: Use in Figma
1. Upload the updated CSV or add URLs to Google Sheets
2. Process profiles to populate templates

## 📋 Data Requirements

**Required columns:**
- **Name** - Person's full name *(required)*
- **Designation** - Job title/position *(recommended)*
- **Org** - Company/organization *(recommended)*
- **LinkedinId** - LinkedIn profile URL *(optional)*
- **ProfileImage** - Direct image URL *(optional)*

**Example data format:**
```csv
Name,Designation,Org,LinkedinId,ProfileImage
John Doe,Software Engineer,Tech Corp,https://linkedin.com/in/johndoe,https://example.com/john.jpg
Jane Smith,Product Manager,Startup Inc,https://linkedin.com/in/janesmith,https://example.com/jane.jpg
```



## 🎨 Figma Template Setup

### Frame Naming
- Name your frames with: `template`, `profile`, `card`, or `frame`
- The plugin will find and use these as templates

### Text Elements
- **Name** - For person's name
- **Designation** - For job title
- **Org** - For company name

### Image Placeholder
- Create a **rectangle** named `ProfileImage`
- This will be filled with the profile picture

## 🔧 Plugin Settings

- **Batch Size**: Number of profiles to process at once (5-50)
- **Image Processing**: Quality settings for images
  - Original: Keep original image quality
  - Optimized: Balance quality and file size
  - Compressed: Smaller file size

## 🐛 Troubleshooting

### Google Sheets Issues
- **"Could not access sheet data"** → Make sure sheet is public
- **"Invalid Google Sheets URL"** → Use the share URL from Google Sheets
- **"No data found"** → Check that your sheet has data rows with names
- **CORS errors** → The plugin uses a CORS proxy, but if it fails, download the CSV and upload it instead
- **"Failed to fetch"** → Try downloading the CSV file and using the upload option

### CSV Upload Issues
- **"No valid data rows"** → Ensure your CSV has a Name column with data
- **"CSV Error"** → Check file format and column headers

### Plugin Issues
- **Plugin won't open** → Check that `manifest.json` is valid
- **Images not loading** → Ensure image URLs are direct links (not LinkedIn profile pages)
- **Templates not found** → Make sure frames are named with template keywords

### Template Issues
- **Templates not found** → Ensure frames contain: `template`, `profile`, `card`, or `frame` in the name
- **Text not updating** → Check that text elements are named: `Name`, `Designation`, `Org`
- **Images not showing** → Ensure image placeholder is a rectangle named `ProfileImage`

## 📝 Example Workflows

### Using Google Sheets
1. Create a Google Sheet with profile data
2. Make it public (anyone with link can view)
3. Copy the share URL
4. Open Figma plugin → paste URL → Load from Sheets
5. Review data preview → Generate Profile Cards

### Using CSV Upload
1. Prepare CSV with profile data
2. Open Figma plugin → drag & drop CSV file
3. Review data preview → Generate Profile Cards

### With Manual Image Collection
1. Use `node simple-linkedin-scraper.js your-file.csv`
2. Open generated HTML file in browser
3. Collect LinkedIn profile picture URLs
4. Update your Google Sheet or CSV with image URLs
5. Use in Figma plugin

## 🎯 Features

- ✅ **Dual Input Methods** - Google Sheets or CSV upload
- ✅ **CORS Proxy Support** - Bypasses browser restrictions for Google Sheets
- ✅ **Data Preview** - See your data before processing
- ✅ **Image Support** - Handle profile pictures from URLs
- ✅ **Template Detection** - Automatically find and use templates
- ✅ **Batch Processing** - Process multiple profiles efficiently
- ✅ **Progress Tracking** - Real-time processing updates
- ✅ **Manual Image Collection** - Reliable way to get LinkedIn images
- ✅ **Error Handling** - Graceful fallbacks for missing data
- ✅ **Settings Control** - Customize processing options
- ✅ **Font Loading Fixes** - Proper font handling in Figma

## 💡 Pro Tips

1. **Data Preview:** Both methods show a preview of loaded data before processing
2. **Switch Methods:** You can switch between Google Sheets and CSV anytime
3. **Column Flexibility:** Extra columns are preserved, missing ones are handled gracefully
4. **Profile Images:** Leave ProfileImage column empty if you don't have image URLs yet
5. **Team Workflow:** Use Google Sheets for team collaboration, CSV for individual work
6. **CORS Fallback:** If Google Sheets fails, the plugin will suggest using CSV upload
7. **Font Issues:** The plugin now handles font loading properly to avoid text errors

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Need help?** Check the troubleshooting section or create an issue in the repository.
