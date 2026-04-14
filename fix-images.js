const fs = require('fs');

function processFile(file, regex, replacement) {
  let code = fs.readFileSync(file, 'utf8');
  if(!code.includes('import { imagePath }')) {
    code = 'import { imagePath } from "@/lib/utils";\n' + code;
  }
  code = code.replace(regex, replacement);
  fs.writeFileSync(file, code);
  console.log('Fixed ' + file);
}

processFile('src/constants/products.ts', /image:\s*\"(\/[^\"]+)\"/g, 'image: imagePath("$1")');

processFile('src/components/layout/Header.tsx', /src=\"(\/[^\"]+)\"/g, 'src={imagePath("$1")}');
processFile('src/components/home/HistorySection.tsx', /src=\"(\/[^\"]+)\"/g, 'src={imagePath("$1")}');
processFile('src/components/home/Hero.tsx', /src=\"(\/[^\"]+)\"/g, 'src={imagePath("$1")}');
