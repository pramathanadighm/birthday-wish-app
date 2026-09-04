// Generates a downloadable high-resolution personalized birthday card image

import { getTheme } from './theme.js';

export function generateCardBlob(userData) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const theme = getTheme(userData.theme);

    // 1. Deep cosmic dark background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0d17');
    bgGrad.addColorStop(0.5, '#111827');
    bgGrad.addColorStop(1, '#080a10');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient radial glow based on theme accent
    const radialGlow = ctx.createRadialGradient(width / 2, 200, 30, width / 2, 200, 450);
    radialGlow.addColorStop(0, theme.glow);
    radialGlow.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // 3. Decorative floating sparkles/stars
    ctx.fillStyle = '#ffffff';
    const sparkles = [
      { x: 120, y: 100, s: 3, a: 0.6 },
      { x: 220, y: 220, s: 2, a: 0.4 },
      { x: 1050, y: 120, s: 4, a: 0.7 },
      { x: 980, y: 260, s: 2.5, a: 0.5 },
      { x: 150, y: 520, s: 3, a: 0.5 },
      { x: 1080, y: 550, s: 3, a: 0.6 },
      { x: 600, y: 80, s: 2, a: 0.8 },
      { x: 80, y: 350, s: 2.5, a: 0.4 },
      { x: 1120, y: 380, s: 2, a: 0.5 }
    ];
    sparkles.forEach(sp => {
      ctx.globalAlpha = sp.a;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.s, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // 4. Glassmorphism Card Frame
    const margin = 50;
    const cardW = width - margin * 2;
    const cardH = height - margin * 2;
    const radius = 28;

    ctx.save();
    // Glass card background
    ctx.fillStyle = 'rgba(23, 30, 48, 0.75)';
    roundRect(ctx, margin, margin, cardW, cardH, radius);
    ctx.fill();

    // Subtle border glow
    ctx.lineWidth = 2;
    const borderGrad = ctx.createLinearGradient(margin, margin, margin + cardW, margin + cardH);
    borderGrad.addColorStop(0, theme.accentLight);
    borderGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    borderGrad.addColorStop(1, theme.accent);
    ctx.strokeStyle = borderGrad;
    roundRect(ctx, margin, margin, cardW, cardH, radius);
    ctx.stroke();
    ctx.restore();

    // 5. Draw Birthday Cake Icon & Candles
    drawCakeGraphic(ctx, width / 2, 175, theme.accent);

    // 6. Header Text
    ctx.textAlign = 'center';
    ctx.font = '600 24px "Outfit", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('CELEBRATING AN EXTRAORDINARY MILESTONE', width / 2, 260);

    // 7. Full Name in Vibrant Gradient
    ctx.font = 'bold 54px "Outfit", sans-serif';
    const nameGrad = ctx.createLinearGradient(width / 2 - 250, 0, width / 2 + 250, 0);
    nameGrad.addColorStop(0, theme.accentLight);
    nameGrad.addColorStop(0.5, theme.accent);
    nameGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = nameGrad;
    ctx.fillText(`Happy Birthday, ${userData.fullName}!`, width / 2, 330);

    // 8. Glowing Age Badge Pill
    const badgeText = `✨ ${userData.age} YEARS OF AWESOMENESS ✨`;
    ctx.font = '600 20px "Outfit", sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const badgeW = textWidth + 48;
    const badgeH = 42;
    const badgeX = width / 2 - badgeW / 2;
    const badgeY = 365;

    ctx.fillStyle = theme.glow;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 21);
    ctx.fill();

    ctx.strokeStyle = theme.accentLight;
    ctx.lineWidth = 1.5;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 21);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(badgeText, width / 2, badgeY + 28);

    // 9. Wish message paragraph (wrapped)
    ctx.font = 'normal 22px "Outfit", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    const wishMsg = `Today is all about YOU, ${userData.fullName}! You've completed ${userData.age} incredible years of joy and inspiration. May your upcoming year be overflowing with endless laughter, boundless adventures, and cherished moments!`;
    wrapText(ctx, wishMsg, width / 2, 460, 900, 32);

    // 10. Footer decoration
    ctx.font = '16px "Outfit", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(`Made with Surprise Birthday Wish • ${dateStr}`, width / 2, 585);

    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

export async function downloadCard(userData) {
  const blob = await generateCardBlob(userData);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanName = userData.fullName.replace(/[^a-zA-Z0-9]/g, '_') || 'Friend';
  a.href = url;
  a.download = `Birthday_Wish_${cleanName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCakeGraphic(ctx, cx, cy, accentColor) {
  ctx.save();
  // Bottom tier
  ctx.fillStyle = '#f87171';
  roundRect(ctx, cx - 45, cy - 2, 90, 32, 6);
  ctx.fill();

  // Top tier
  ctx.fillStyle = '#fbbf24';
  roundRect(ctx, cx - 32, cy - 28, 64, 28, 5);
  ctx.fill();

  // Frosting drips
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - 24, cy - 28, 8, 0, Math.PI);
  ctx.arc(cx - 8, cy - 28, 8, 0, Math.PI);
  ctx.arc(cx + 8, cy - 28, 8, 0, Math.PI);
  ctx.arc(cx + 24, cy - 28, 8, 0, Math.PI);
  ctx.fill();

  // Candles
  const candleXs = [cx - 16, cx, cx + 16];
  candleXs.forEach(x => {
    ctx.fillStyle = accentColor;
    ctx.fillRect(x - 2, cy - 46, 4, 18);

    // Candle flame glow
    ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.beginPath();
    ctx.arc(x, cy - 52, 9, 0, Math.PI * 2);
    ctx.fill();

    // Candle flame core
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(x, cy - 52, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
}
