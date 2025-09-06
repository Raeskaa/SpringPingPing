# LinkedIn Profile Populator - Figma Plugin

A simple Figma plugin that automatically populates profile templates with LinkedIn data and images from CSV files.

## 🚀 Quick Start

### 1. Install the Plugin
1. Open Figma
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select the `manifest.json` file from this folder
4. The plugin will appear in your plugins list

### 2. Prepare Your Data
1. Create a CSV file with the following columns:
   - **Name** - Person's full name
   - **Designation** - Job title/position
   - **Org** - Company/organization
   - **LinkedinId** - LinkedIn profile URL
   - **ProfileImage** - Direct URL to profile picture

2. **Get LinkedIn Profile Pictures:**
   ```bash
   node simple-linkedin-scraper.js your-file.csv
   ```
   This creates `linkedin-image-collector.html` - open it in your browser to manually collect profile picture URLs.

### 3. Create Figma Templates
1. Create frames named with: `template`, `profile`, `card`, or `frame`
2. Add text elements named: `Name`, `Designation`, `Org`
3. Add a rectangle named: `ProfileImage` (for profile pictures)

### 4. Use the Plugin
1. Open the plugin in Figma
2. Upload your CSV file
3. Adjust settings if needed
4. Click **"Process Profiles"**

## 📁 File Structure

```
linkedin-profile-plugin/
├── code.js                    # Main plugin code
├── ui.html                    # Plugin interface
├── manifest.json              # Plugin configuration
├── simple-linkedin-scraper.js # Manual image collector
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🛠️ Manual Image Collection

Since automated LinkedIn scraping has technical limitations, use the manual approach:

### Step 1: Generate Image Collector
```bash
node simple-linkedin-scraper.js SpringVerify_demo.csv
```

### Step 2: Collect Images
1. Open `linkedin-image-collector.html` in your browser
2. Click each LinkedIn URL to open the profile
3. Right-click on profile pictures and "Copy image address"
4. Paste URLs into the text fields
5. Download the updated CSV when done

### Step 3: Use in Figma
1. Upload the updated CSV to the Figma plugin
2. Process profiles to populate templates

## ⚙️ CSV Format

Your CSV should look like this:

```csv
Name,Designation,Org,LinkedinId,ProfileImage
John Doe,Software Engineer,Acme Corp,https://linkedin.com/in/johndoe,https://media.licdn.com/dms/image/...
Jane Smith,Designer,Tech Inc,https://linkedin.com/in/janesmith,https://media.licdn.com/dms/image/...
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
- **Frame Layout**: How to arrange multiple frames

## 🐛 Troubleshooting

### Plugin Won't Open
- Make sure you're using the latest version
- Check that `manifest.json` is valid

### Images Not Loading
- Ensure image URLs are direct links (not LinkedIn profile pages)
- Check that URLs are accessible (not private/restricted)
- Try using the manual image collector for reliable URLs

### Templates Not Found
- Make sure frames are named with: `template`, `profile`, `card`, or `frame`
- Check that text elements are named: `Name`, `Designation`, `Org`
- Ensure image placeholder is a rectangle named `ProfileImage`

## 📝 Example Workflow

1. **Prepare Data:**
   ```bash
   # Generate image collector
   node simple-linkedin-scraper.js my-profiles.csv
   
   # Open linkedin-image-collector.html in browser
   # Collect profile picture URLs manually
   # Download updated CSV
   ```

2. **Setup Figma:**
   - Create profile template frame
   - Add text elements: Name, Designation, Org
   - Add rectangle: ProfileImage

3. **Process:**
   - Open plugin in Figma
   - Upload updated CSV
   - Click "Process Profiles"
   - Watch your templates populate!

## 🎯 Features

- ✅ **CSV Processing** - Upload and process profile data
- ✅ **Image Support** - Handle profile pictures from URLs
- ✅ **Template Detection** - Automatically find and use templates
- ✅ **Batch Processing** - Process multiple profiles efficiently
- ✅ **Manual Image Collection** - Reliable way to get LinkedIn images
- ✅ **Error Handling** - Graceful fallbacks for missing data

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Need help?** Check the troubleshooting section or create an issue in the repository.