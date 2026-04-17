import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

const assets = [
  {
    urls: [
      'https://raw.githubusercontent.com/pmndrs/drei-assets/master/airplane.glb',
      'https://raw.githubusercontent.com/pmndrs/drei-assets/main/airplane.glb',
    ],
    dest: 'public/assets/models/airplane.glb'
  },
  {
    urls: [
      'https://raw.githubusercontent.com/pmndrs/drei-assets/master/arwing.glb',
      'https://raw.githubusercontent.com/pmndrs/drei-assets/main/arwing.glb',
    ],
    dest: 'public/assets/models/arwing.glb'
  },
  {
    urls: [
      'https://raw.githubusercontent.com/pmndrs/drei-assets/master/scifi-ship.glb',
      'https://raw.githubusercontent.com/pmndrs/drei-assets/main/scifi-ship.glb',
    ],
    dest: 'public/assets/models/scifi-ship.glb'
  },
  {
    urls: [
      'https://raw.githubusercontent.com/pmndrs/drei-assets/master/hdri/sky.hdr',
      'https://github.com/pmndrs/drei-assets/raw/master/hdri/sky.hdr',
      'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/hdri/sky.hdr'
    ],
    dest: 'public/assets/hdri/sky.hdr'
  }
];

async function downloadFile(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        resolve(false);
        return;
      }

      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  const dirs = ['public/assets/models', 'public/assets/hdri', 'public/assets/images'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  for (const asset of assets) {
    let success = false;
    for (const url of asset.urls) {
      console.log(`Downloading ${url}...`);
      success = await downloadFile(url, asset.dest);
      if (success) {
        console.log(`Successfully downloaded to ${asset.dest}`);
        break;
      }
    }
    if (!success) {
      console.warn(`Failed to download asset to ${asset.dest}`);
    }
  }
}

main();
