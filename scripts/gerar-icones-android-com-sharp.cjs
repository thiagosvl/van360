const sharp = require('sharp');
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

async function generateIcons() {
  console.log('📱 Gerando ícones Android para Van360\n');

  // Verificar se o logo existe
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo não encontrado em:', logoPath);
    process.exit(1);
  }

  console.log('✅ Logo encontrado:', logoPath);

  // Criar background branco
  const backgroundColor = { r: 255, g: 255, b: 255 }; // #FFFFFF

  for (const [folder, size] of Object.entries(sizes)) {
    const folderPath = path.join(androidResPath, folder);
    
    // Criar pasta se não existir
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Gerar ícone foreground (logo centralizado em 108x108 para adaptive icon)
    const foregroundSize = 108; // Tamanho do viewport do adaptive icon
    const logoSize = Math.floor(foregroundSize * 0.45); // Logo ocupa 45% do espaço (similar ao Asaas)
    
    await sharp(logoPath)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparente
      })
      .extend({
        top: Math.floor((foregroundSize - logoSize) / 2),
        bottom: Math.floor((foregroundSize - logoSize) / 2),
        left: Math.floor((foregroundSize - logoSize) / 2),
        right: Math.floor((foregroundSize - logoSize) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .resize(size, size)
      .png()
      .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));

    // Gerar ícone completo (foreground + background)
    // Criar foreground no tamanho exato
    const logoResized = Math.floor(size * 0.45); // Logo ocupa 45% do tamanho final (similar ao Asaas)
    const padding = Math.floor((size - logoResized) / 2);
    
    const foregroundBuffer = await sharp(logoPath)
      .resize(logoResized, logoResized, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .extend({
        top: padding,
        bottom: size - logoResized - padding,
        left: padding,
        right: size - logoResized - padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    // Criar background e compor com foreground
    const backgroundImage = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: backgroundColor
      }
    });

    await backgroundImage
      .composite([{ input: foregroundBuffer }])
      .png()
      .toFile(path.join(folderPath, 'ic_launcher.png'));

    // Gerar ícone round (mesmo que o normal para Android)
    await backgroundImage
      .clone()
      .composite([{ input: foregroundBuffer }])
      .png()
      .toFile(path.join(folderPath, 'ic_launcher_round.png'));

    console.log(`✅ Gerado: ${folder}/ic_launcher*.png (${size}x${size})`);
  }

  console.log('\n🎉 Ícones gerados com sucesso!');
  console.log('📝 Execute: npx cap sync android');
}

generateIcons().catch(console.error);

