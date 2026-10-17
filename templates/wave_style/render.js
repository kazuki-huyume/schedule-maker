// ウェーブ・グラデーション風テンプレート描画モジュール (タイトル位置右寄り調整版)

export function render(ctx, canvas, state) {
  const {
    currentColor,
    bodyFont,
    titleFont,
    uploadedImage,
    bgImage,
    areaBgColor,
    bgType,
    imgX,
    imgY,
    imgScale,
    illustCaption,
    startDateInputVal,
    textInputs,
    timeInputs
  } = state;

  // --- 1. 最背面：ベース背景（右側エリア）---
  if (bgType === 'image' && bgImage) {
    const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
    const x = (canvas.width - bgImage.width * scale) / 2;
    const y = (canvas.height - bgImage.height * scale) / 2;
    ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
  } else {
    ctx.fillStyle = areaBgColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // --- 2. 背面：キャラクターイラスト（波枠の後ろに潜り込む描画）---
  if (uploadedImage) {
    ctx.save();
    const drawW = uploadedImage.width * imgScale;
    const drawH = uploadedImage.height * imgScale;
    ctx.drawImage(uploadedImage, imgX - drawW / 2, imgY - drawH / 2, drawW, drawH);
    ctx.restore();
  }

  // --- 3. 前面：ウェーブ枠（波型グラデーション ＆ ドロップシャドウ）---
  ctx.save();

  const defineWavePath = (context) => {
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(540, 0);
    context.bezierCurveTo(625, 130, 485, 380, 580, 540);
    context.lineTo(0, 540);
    context.closePath();
  };

  // 波枠のシャドウ
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#ffffff';
  defineWavePath(ctx);
  ctx.fill();
  ctx.restore();

  // クリッピング＆グラデーション
  defineWavePath(ctx);
  ctx.clip();

  const colorStart = adjustBrightness(currentColor, 10);
  const colorMid = currentColor;
  const colorEnd = adjustBrightness(currentColor, -25);

  const waveGrad = ctx.createLinearGradient(0, 0, 600, 540);
  waveGrad.addColorStop(0, colorStart);
  waveGrad.addColorStop(0.5, colorMid);
  waveGrad.addColorStop(1, colorEnd);
  ctx.fillStyle = waveGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- 波枠内の装飾図形 ---
  // ① 左上 4x4 ドット柄
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      ctx.beginPath();
      ctx.arc(28 + c * 13, 22 + r * 13, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ② 右上 斜めストライプ
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 3.5;
  for (let i = -60; i < 180; i += 11) {
    ctx.beginPath();
    ctx.moveTo(430 + i, 30);
    ctx.lineTo(480 + i, 95);
    ctx.stroke();
  }
  ctx.restore();

  // ③ リング・ライン・サークル
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(438, 125, 16, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(5, 360);
  ctx.lineTo(135, 490);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(445, 330);
  ctx.lineTo(515, 400);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.arc(525, 450, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // ウェーブクリップ終了

  // --- 4. 最前面：ヘッダーテキスト（中心位置をもう少し右側に調整）---
  ctx.save();
  // 小文字英文 (weekly schedule)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 13px ${titleFont}`;
  ctx.textAlign = 'center';
  drawLetterSpaced(ctx, 'weekly schedule', 280, 24, 3.5);

  // メインタイトル (今週の予定)
  ctx.font = `900 30px ${titleFont}`;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  drawLetterSpaced(ctx, '今週の予定', 280, 60, 6);
  ctx.restore();

  // --- 5. 7段の予定バー ＆ 曜日丸バッジ ---
  const jpDays = ['月', '火', '水', '木', '金', '土', '日'];
  const darkThemeColor = adjustBrightness(currentColor, -65);

  for (let i = 0; i < 7; i++) {
    const y = 88 + i * 53;
    const textVal = textInputs[i] || '';
    const timeVal = timeInputs[i] || '';
    const isOff = (textVal === 'おやすみ');

    // バー背景
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    const barGrad = ctx.createLinearGradient(70, y, 500, y + 40);
    if (isOff) {
      barGrad.addColorStop(0, 'rgba(230, 235, 245, 0.6)');
      barGrad.addColorStop(1, 'rgba(200, 210, 225, 0.6)');
    } else {
      barGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      barGrad.addColorStop(1, 'rgba(225, 233, 250, 0.85)');
    }

    ctx.fillStyle = barGrad;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(70, y, 430, 40, 20);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 曜日丸バッジ
    ctx.save();
    ctx.fillStyle = darkThemeColor;
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(52, y + 20, 19, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 15px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(jpDays[i], 52, y + 25);
    ctx.restore();

    // テキスト描画
    if (isOff) {
      ctx.fillStyle = '#64748b';
      ctx.font = `bold 14px ${bodyFont}`;
      ctx.textAlign = 'center';
      ctx.fillText('おやすみ', 285, y + 25);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold 13px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(textVal, 96, y + 25);

      if (timeVal) {
        ctx.fillStyle = '#475569';
        ctx.font = `bold 12px ${bodyFont}`;
        ctx.textAlign = 'right';
        ctx.fillText(timeVal, 480, y + 25);
      }
    }
  }

  // --- 6. 下部：吹き出し風クレジット・ひとこと帯 ---
  ctx.save();
  ctx.fillStyle = darkThemeColor;
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  const bx = 28, by = 472, bw = 472, bh = 42, br = 21;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, br);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(bx + bw - 20, by);
  ctx.lineTo(bx + bw - 10, by - 6);
  ctx.lineTo(bx + bw - 12, by);
  ctx.closePath();
  ctx.fill();

  const captionText = illustCaption.trim();
  if (captionText) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 13px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(captionText, bx + bw / 2, by + 26);
  }
  ctx.restore();
}

// 字間（トラッキング）を考慮してテキストを描画するヘルパー関数
function drawLetterSpaced(ctx, text, x, y, spacing) {
  const totalWidth = text.split('').reduce((acc, char) => acc + ctx.measureText(char).width + spacing, -spacing);
  let currentX = x - totalWidth / 2;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    ctx.fillText(char, currentX, y);
    currentX += ctx.measureText(char).width + spacing;
  }
}

// 明度調整ヘルパー
function adjustBrightness(hex, percent) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  let num = parseInt(c, 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}