#!/bin/bash
# LinkedIn Profile Populator - Setup Script

echo "🚀 Setting up LinkedIn Profile Populator Plugin..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the project
echo "🔨 Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
    echo ""
    echo "🎉 Setup complete! Next steps:"
    echo "   1. Open Figma Desktop App"
    echo "   2. Go to Plugins → Development → Import plugin from manifest..."
    echo "   3. Select the manifest.json file in this folder"
    echo "   4. Create a template frame with 'Name', 'Designation', 'Org' text layers"
    echo "   5. Add an 'Image' rectangle for profile pictures"
    echo "   6. Run the plugin and upload your CSV file!"
    echo ""
    echo "📄 See README.md for detailed usage instructions"
else
    echo "❌ Build failed"
    exit 1
fi
