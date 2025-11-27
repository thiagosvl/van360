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

const logoPath = path.join(__dirname, '../public/assets/logo-van360.png');
const androidResPath = path.join(__dirname, '../android/app/src/main/res');

async function generateIcons() {
  console.log('📱 Gerando ícones Android para Van360\n');

  // Verificar se o logo existe
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo não encontrado em:', logoPath);
    process.exit(1);
  }

  console.log('✅ Logo encontrado:', logoPath);

  // Criar background azul
  const backgroundColor = { r: 30, g: 64, b: 175 }; // #1E40AF

  for (const [folder, size] of Object.entries(sizes)) {
    const folderPath = path.join(androidResPath, folder);
    
    // Criar pasta se não existir
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Gerar ícone foreground (logo centralizado em 108x108 para adaptive icon)
    const foregroundSize = 108; // Tamanho do viewport do adaptive icon
    const logoSize = Math.floor(foregroundSize * 0.8); // Logo ocupa 80% do espaço
    
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
    const foregroundBuffer = await sharp(logoPath)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .extend({
        top: Math.floor((foregroundSize - logoSize) / 2),
        bottom: Math.floor((foregroundSize - logoSize) / 2),
        left: Math.floor((foregroundSize - logoSize) / 2),
        right: Math.floor((foregroundSize - logoSize) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .resize(size, size)
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: backgroundColor
      }
    })
      .composite([{ input: foregroundBuffer }])
      .png()
      .toFile(path.join(folderPath, 'ic_launcher.png'));

    // Gerar ícone round (mesmo que o normal para Android)
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: backgroundColor
      }
    })
      .composite([{ input: foregroundBuffer }])
      .png()
      .toFile(path.join(folderPath, 'ic_launcher_round.png'));

    console.log(`✅ Gerado: ${folder}/ic_launcher*.png (${size}x${size})`);
  }

  console.log('\n🎉 Ícones gerados com sucesso!');
  console.log('📝 Execute: npx cap sync android');
}

generateIcons().catch(console.error);

