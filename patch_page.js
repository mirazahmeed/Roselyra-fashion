const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

if (!content.includes('import { db }')) {
  content = content.replace('import Image from "next/image";', 'import Image from "next/image";\nimport { db } from "@/lib/db";');
}

if (!content.includes('const config = db.homeConfig')) {
  content = content.replace('export default function Home() {', 'export default function Home() {\n  const config = db.homeConfig || {};\n  const getImg = (key, fallback) => config[key] || fallback;');
}

// Find all Image src url matches and replace them with getImg calls
let imgIndex = 1;
content = content.replace(/src="(https:\/\/images\.unsplash\.com[^"]+)"/g, (match, url) => {
  const result = `src={getImg('hero${imgIndex}', "${url}")}`;
  imgIndex++;
  return result;
});

fs.writeFileSync('src/app/page.tsx', content);
console.log('page.tsx patched to use homeConfig');
