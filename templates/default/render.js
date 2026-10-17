// デフォルトテンプレートの描画モジュール

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

  ctx.fillStyle = '#f0f4f8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = currentColor;
  ctx.fillRect(20, 20, 520, 500);

  ctx.save();
  ctx.beginPath();
  ctx.rect(560, 20, 380, 500);
  ctx.clip();

  if (bgType === 'image' && bgImage) {
    const scale = Math.max(380 / bgImage.width, 500 / bgImage.height);
    const x = 560 + (380 - bgImage.width * scale) / 2;
    const y = 20 + (500 - bgImage.height * scale) / 2;
    ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
  } else {
    ctx.fillStyle = areaBgColor;
    ctx.fillRect(560, 20, 380, 500);
  }
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.rect(570, 30, 360, 480);
  ctx.clip();

  if (uploadedImage) {
    const drawW = uploadedImage.width * imgScale;
    const drawH = uploadedImage.height * imgScale;
    const drawX = imgX - drawW / 2;
    const drawY = imgY - drawH / 2;
    ctx.drawImage(uploadedImage, drawX, drawY, drawW, drawH);
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(570, 30, 360, 480);
    ctx.fillStyle = '#666666';
    ctx.font = `bold 16px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('キャラクター画像をアップロード', 750, 250);
    ctx.font = `12px ${bodyFont}`;
    ctx.fillText('(ドラッグで移動 / ホイールで拡縮)', 750, 280);
  }
  ctx.restore();

  // ひとこと・クレジット欄の描画
  const captionText = illustCaption.trim();
  if (captionText) {
    ctx.save();
    ctx.font = `bold 12px ${bodyFont}`;
    const textWidth = ctx.measureText(captionText).width;
    const badgeWidth = Math.max(textWidth + 24, 90);
    const badgeX = 920 - badgeWidth; 
    const badgeY = 40;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, 26, 13);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.fillText(captionText, badgeX + badgeWidth / 2, badgeY + 18);
    ctx.restore();
  }

  drawFancyTitle(ctx, 750, 435, 'Weekly', 'SCHEDULE', titleFont, currentColor);

  const weekInfo = getWeekDayInfo(startDateInputVal);
  const startDate = weekInfo[0].date;
  const endDate = weekInfo[6].date;
  const dateRangeStr = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;
  
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(660, 485, 180, 28, 14);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = currentColor;
  ctx.font = `bold 16px ${bodyFont}`;
  ctx.textAlign = 'center';
  ctx.fillText(dateRangeStr, 750, 505);

  for (let i = 0; i < 7; i++) {
    const info = weekInfo[i];
    const currentDate = info.date;
    const y = 35 + i * 68;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(55, y + 25, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = currentColor;
    ctx.font = `bold 16px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(currentDate.getDate(), 55, y + 31);

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = `bold 11px ${bodyFont}`;
    ctx.textAlign = 'left';
    ctx.fillText(info.enName, 85, y + 15);

    const textVal = textInputs[i] || '';
    const timeVal = timeInputs[i] || '';
    const isOff = (textVal === 'おやすみ');

    if (isOff) {
      ctx.save();
      ctx.fillStyle = hexToRgba(currentColor, 0.35);
      ctx.strokeStyle = adjustBrightness(currentColor, -30);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(85, y + 20, 430, 32, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = adjustBrightness(currentColor, -70);
      ctx.font = `bold 14px ${bodyFont}`;
      ctx.textAlign = 'center';
      ctx.fillText('おやすみ', 300, y + 41);
      ctx.restore();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1.5;
      
      ctx.beginPath();
      ctx.roundRect(85, y + 20, 310, 32, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.roundRect(405, y + 20, 110, 32, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#333333';
      ctx.font = `bold 14px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(textVal, 100, y + 41);

      ctx.fillStyle = '#555555';
      ctx.font = `12px ${bodyFont}`;
      ctx.textAlign = 'center';
      ctx.fillText(timeVal, 460, y + 41);
    }
  }
}

// 曜日データの定義（export を追加）
export const ALL_DAYS_EN = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
export const ALL_DAYS_JP = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

function getWeekDayInfo(baseDateStr) {
  const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();
  const result = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(baseDate);
    cur.setDate(baseDate.getDate() + i);
    const dayIdx = cur.getDay();
    result.push({
      date: cur,
      jpName: ALL_DAYS_JP[dayIdx],
      enName: ALL_DAYS_EN[dayIdx]
    });
  }
  return result;
}

function hexToRgba(hex, alpha) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

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

function drawFancyTitle(ctx, x, y, line1, line2, titleFont, currentColor) {
  ctx.save();
  ctx.textAlign = 'center';

  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  ctx.font = `42px ${titleFont}`;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.lineJoin = 'round';
  ctx.strokeText(line1, x, y - 70);
  ctx.fillStyle = currentColor;
  ctx.fillText(line1, x, y - 70);

  ctx.font = `57px ${titleFont}`;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 12;
  ctx.lineJoin = 'round';
  ctx.strokeText(line2, x, y + 10);
  ctx.fillStyle = currentColor;
  ctx.fillText(line2, x, y + 10);

  ctx.restore();
}