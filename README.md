# LinkedIn Profile Populator - Figma Plugin

A powerful Figma plugin that automatically populates LinkedIn profile data from CSV files or Google Sheets, with **automatic background removal** for profile images.

## ✨ Features

- **CSV Import**: Upload CSV files with LinkedIn profile data
- **Google Sheets Integration**: Direct import from Google Sheets URLs
- **Automatic Background Removal**: AI-powered background removal for profile images
- **Smart Template Detection**: Automatically finds and populates template frames
- **Batch Processing**: Handle multiple profiles efficiently
- **Image Caching**: Optimized performance with intelligent caching
- **Flexible Layouts**: Support for grid, list, and auto-arrangement

## 🚀 New: Background Removal

The plugin now includes **automatic background removal** for profile images:

- **AI-Powered**: Uses advanced AI to remove backgrounds automatically
- **Free Tier Available**: 50 images/month with remove.bg API
- **Fallback System**: Gracefully handles API failures
- **Quality Preservation**: Maintains image quality while removing backgrounds
- **Batch Processing**: Process multiple images simultaneously

### How to Use Background Removal:

1. Select **"Remove background automatically"** in Image Processing settings
2. Upload your CSV or Google Sheets data
3. Images are automatically processed and backgrounds removed
4. Clean, professional profile images are added to Figma

## 📋 Requirements

- **Figma Desktop App** or **Figma Web**
- **CSV file** with LinkedIn profile data OR **Google Sheets URL**
- **Template frames** in your Figma document
- **Background Removal API key** (optional, for background removal feature)

## 🎯 Use Cases

- **Team Presentations**: Create professional team member slides
- **Event Materials**: Speaker and participant profiles
- **Company Profiles**: Employee directory and organizational charts
- **Portfolio Showcases**: Clean profile images without backgrounds
- **Marketing Materials**: Professional headshots for campaigns

## 📁 CSV Format

Your CSV should include these columns:

```csv
Name,Designation,Organization,ProfileImage,LinkedIn
John Doe,CEO,Acme Corp,https://example.com/john.jpg,https://linkedin.com/in/johndoe
Jane Smith,CTO,Tech Inc,https://example.com/jane.jpg,https://linkedin.com/in/janesmith
```

### Column Names (Flexible):
- **Name**: `Name`, `Full Name`, `FullName`
- **Designation**: `Designation`, `Title`, `Position`, `Role`
- **Organization**: `Organization`, `Company`, `Employer`, `Org`
- **Profile Image**: `ProfileImage`, `Image`, `Photo`, `Picture`, `ImageURL`
- **LinkedIn**: `LinkedIn`, `LinkedIn ID`, `LinkedIn URL`, `Profile URL`

## 🖼️ Template Setup

1. **Create Template Frame**: Design your profile template
2. **Name Text Layers**: Use descriptive names like "Name", "Designation", "Organization"
3. **Image Placeholder**: Add a rectangle/circle named "Image", "Photo", or "Profile"
4. **Select Frame**: Select your template frame before running the plugin

## ⚙️ Settings

### Image Processing:
- **Optimize for performance**: Faster processing, smaller file sizes
- **Keep original quality**: Best quality, larger file sizes
- **Remove background automatically**: AI-powered background removal

### Frame Layout:
- **Auto-arrange**: Smart automatic positioning
- **Grid layout**: 4-column grid arrangement
- **List layout**: Vertical stacking
- **Keep current positions**: Maintain existing layout

### Batch Size:
- **5 profiles**: Slower, safer processing
- **10 profiles**: Recommended balance
- **15-20 profiles**: Faster processing, higher memory usage

## 🔧 Background Removal Setup

For background removal functionality, you'll need to set up an API key:

1. **Get Free API Key**: Sign up at [remove.bg](https://www.remove.bg/api)
2. **Update Code**: Replace `YOUR_REMOVE_BG_API_KEY` in `code.js`
3. **Free Tier**: 50 images/month included

See [background-removal-config.md](background-removal-config.md) for detailed setup instructions.

## 🚀 Quick Start

1. **Install Plugin**: Add to Figma from Community
2. **Prepare Template**: Create template frame with named layers
3. **Upload Data**: CSV file or Google Sheets URL
4. **Configure Settings**: Choose image processing and layout options
5. **Process**: Click "Process LinkedIn Data"
6. **Enjoy**: Professional profiles with clean images!

## 📚 Documentation

- [Background Removal Setup](background-removal-config.md)
- [Google Apps Script Setup](GOOGLE_APPS_SCRIPT_SETUP.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your CSV format and data
3. Ensure template frames are properly named
4. Check the troubleshooting guide

---

**Made with ❤️ for the Figma community**
