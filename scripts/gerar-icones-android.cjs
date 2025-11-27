const fs = require('fs');
const path = require('path');

// Tamanhos necessários para cada densidade
const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

const logoPath = path.join(__dirname, '../public/assets/logo2-van360.png');
const androidResPath = path.join(__dirname, '../android/app/src/main/res');

console.log('📱 Gerador de Ícones Android para Van360\n');

// Verificar se o logo existe
if (!fs.existsSync(logoPath)) {
  console.error('❌ Logo não encontrado em:', logoPath);
  console.log('\n💡 Solução:');
  console.log('1. Use o Android Asset Studio online: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html');
  console.log('2. Faça upload do logo: public/assets/logo-van360.png');
  console.log('3. Configure:');
  console.log('   - Background: Cor sólida #1E40AF (azul)');
  console.log('   - Foreground: Seu logo');
  console.log('4. Baixe o zip gerado');
  console.log('5. Extraia e copie as pastas mipmap-* para: android/app/src/main/res/');
  process.exit(1);
}

console.log('✅ Logo encontrado:', logoPath);
console.log('\n⚠️  Para gerar os ícones, você precisa de uma ferramenta de manipulação de imagem.');
console.log('\n💡 Opções:');
console.log('\n1. Android Asset Studio (Recomendado):');
console.log('   → https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html');
console.log('   → Faça upload do logo');
console.log('   → Background: Cor sólida #1E40AF');
console.log('   → Foreground: Seu logo (com transparência)');
console.log('   → Baixe o zip e extraia as pastas mipmap-* para android/app/src/main/res/');
console.log('\n2. Ou instale sharp e rode:');
console.log('   npm install --save-dev sharp');
console.log('   node scripts/gerar-icones-android-com-sharp.js');
console.log('\n📝 Os arquivos XML já foram configurados corretamente!');

