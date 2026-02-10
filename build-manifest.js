#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const blogPostsDir = path.join(__dirname, 'blog-posts');
const manifestPath = path.join(blogPostsDir, 'manifest.json');

// Read all files in blog-posts directory
const files = fs.readdirSync(blogPostsDir);

// Filter for .md files and sort by numeric prefix
const markdownFiles = files
    .filter(file => file.endsWith('.md'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/^(\d+)/)?.[1] || '0');
        const numB = parseInt(b.match(/^(\d+)/)?.[1] || '0');
        return numA - numB;
    });

// Write manifest.json
fs.writeFileSync(manifestPath, JSON.stringify(markdownFiles, null, 2));

console.log(`✅ Generated manifest.json with ${markdownFiles.length} blog posts:`);
markdownFiles.forEach(file => console.log(`   - ${file}`));
