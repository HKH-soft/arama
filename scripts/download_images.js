const fs = require('fs');
const path = require('path');
const https = require('https');

const magazinesPath = path.join(__dirname, '..', 'src', 'data', 'magazines.ts');
const publicImagesDir = path.join(__dirname, '..', 'public', 'images', 'magazines');

let fileContent = fs.readFileSync(magazinesPath, 'utf8');

// Regex to find Unsplash image URLs and their associated slug
// We'll iterate through the file and replace URLs
const urlRegex = /coverImage:\s*"([^"]+unsplash\.com[^"]+)"/g;

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects if any (Unsplash sometimes redirects)
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download image, status code: ${res.statusCode}`));
      }
      
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function processImages() {
  let matches = [...fileContent.matchAll(/slug:\s*"([^"]+)",[\s\S]*?coverImage:\s*"([^"]+unsplash\.com[^"]+)"/g)];
  
  console.log(`Found ${matches.length} Unsplash images to download.`);
  
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }

  for (let i = 0; i < matches.length; i++) {
    const slug = matches[i][1];
    const url = matches[i][2];
    
    // We'll save it as mag_slug.jpg
    const filename = `mag_${slug.replace(/-/g, '_')}.jpg`;
    const localPath = path.join(publicImagesDir, filename);
    const webPath = `/images/magazines/${filename}`;
    
    console.log(`[${i+1}/${matches.length}] Downloading for ${slug}...`);
    try {
      const picsumUrl = `https://picsum.photos/seed/${slug}/1200/630`;
      await downloadImage(picsumUrl, localPath);
      console.log(`Saved to ${localPath}`);
      
      // Update file content in memory
      fileContent = fileContent.replace(`"${url}"`, `"${webPath}"`);
    } catch (e) {
      console.error(`Error downloading ${url}:`, e.message);
    }
  }
  
  // Write updated content back to magazines.ts
  fs.writeFileSync(magazinesPath, fileContent, 'utf8');
  console.log('Finished updating magazines.ts');
}

processImages();
