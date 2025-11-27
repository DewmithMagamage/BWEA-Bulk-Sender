#!/bin/bash

# Deployment Script for cPanel
# This script prepares the project for deployment

echo "🚀 Starting deployment preparation..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Install root dependencies
echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
npm install

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install

# Build frontend
echo -e "${YELLOW}🔨 Building frontend for production...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend built successfully!${NC}"
cd ..

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📝 Creating .env file from example...${NC}"
    if [ -f "env.example" ]; then
        cp env.example backend/.env
        echo -e "${YELLOW}⚠️  Please update backend/.env with your configuration${NC}"
    fi
fi

# Set permissions
echo -e "${YELLOW}🔐 Setting file permissions...${NC}"
chmod 755 backend
chmod 755 frontend
chmod 644 backend/src/server.js

echo -e "${GREEN}✅ Deployment preparation complete!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "   1. Upload the entire project to your cPanel"
echo "   2. Configure Node.js application in cPanel"
echo "   3. Set environment variables"
echo "   4. Start the application"
echo ""
echo -e "${YELLOW}📖 See CPANEL_DEPLOYMENT.md for detailed instructions${NC}"

