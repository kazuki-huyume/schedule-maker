// フローティング・カレンダー テンプレート描画モジュール

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

  // 1. 全体背景（リッチなグラデーション）
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#1e1b4b');
  bgGrad.addColorStop(0.5, '#0f172a');
  bgGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 背景の装飾サークル
  ctx.save();
  ctx.fillStyle = hexToRgba(currentColor, 0.05);
  ctx.beginPath();
  ctx.arc(150, 270, 220, 0, Math.PI * 2);
  ctx.arc(800, 100, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. 左側：キャラクターイラストエリア（存在感を出すため大きく配置）
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(25, 25, 340, 490, 24);
  ctx.clip();

  if (bgType === 'image' && bgImage) {
    const scale = Math.max(340 / bgImage.width, 490 / bgImage.height);
    const x = 25 + (340 - bgImage.width * scale) / 2;
    const y = 25 + (490 - bgImage.height * scale) / 2;
    ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
  } else {
    ctx.fillStyle = areaBgColor || '#1e293b';
    ctx.fillRect(25, 25, 340, 490);
  }

  if (uploadedImage) {
    const drawW = uploadedImage.width * imgScale;
    const drawH = uploadedImage.height * imgScale;
    ctx.drawImage(uploadedImage, imgX - drawW / 2, imgY - drawH / 2, drawW, drawH);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = `bold 14px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('CHARACTER AREA', 195, 275);
  }
  ctx.restore();

  // イラスト枠のネオン風シャドウボーダー
  ctx.save();
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = currentColor;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(25, 25, 340, 490, 24);
  ctx.stroke();
  ctx.restore();

  // 3. タイトル & 期間（右上のヘッダーエリア）
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 22px ${titleFont}`;
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.fillText('WEEKLY SCHEDULE', 390, 45);

  const weekInfo = getWeekDayInfo(startDateInputVal);
  const startDate = weekInfo[0].date;
  const endDate = weekInfo[6].date;
  const dateRangeStr = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;

  ctx.fillStyle = currentColor;
  ctx.font = `bold 13px ${bodyFont}`;
  ctx.fillText(`TERM: ${dateRangeStr}`, 390, 66);
  ctx.restore();

  // 4. クレジット欄（イラストの下や右下にフロート）
  const captionText = illustCaption.trim();
  if (captionText) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(40, 470, 310, 30, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `11px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(captionText, 195, 490);
    ctx.restore();
  }

  // 5. 右側：7日分のフロート・タイルカード配置（2列グリッド風 or スタック）
  // 7日分を右側に美しく並べるため、上部タイトルを避けて Y=85 から配置
  for (let i = 0; i < 7; i++) {
    const info = weekInfo[i];
    // 7日分を綺麗に収めるため少しコンパクトな高さ（約60px間隔）
    const y = 85 + i * 61;
    const textVal = textInputs[i] || '';
    const timeVal = timeInputs[i] || '';
    const isOff = (textVal === 'おやすみ');

    ctx.save();
    // カード背景（ガラスモーフィズム風）
    ctx.fillStyle = isOff ? 'rgba(30, 41, 59, 0.4)' : 'rgba(30, 41, 59, 0.75)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.roundRect(390, y, 545, 53, 12);
    ctx.fill();

    // カードの左アクセントライン
    ctx.fillStyle = isOff ? '#64748b' : currentColor;
    ctx.beginPath();
    ctx.roundRect(390, y, 6, 53, [12, 0, 0, 12]);
    ctx.fill();

    // 日付 & 曜日バッジ（左側に配置）
    ctx.fillStyle = isOff ? '#475569' : hexToRgba(currentColor, 0.2);
    ctx.beginPath();
    ctx.roundRect(408, y + 10, 85, 33, 8);
    ctx.fill();

    ctx.fillStyle = isOff ? '#94a3b8' : '#ffffff';
    ctx.font = `bold 11px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(info.enName.slice(0, 3), 450, y + 23);
    ctx.font = `bold 12px ${bodyFont}`;
    ctx.fillText(`${info.date.getMonth() + 1}/${info.date.getDate()}`, 450, y + 37);

    if (isOff) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold 14px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText('ー  OFF DAY  ー', 510, y + 32);
    } else {
      // 予定本文
      ctx.fillStyle = '#f8fafc';
      ctx.font = `bold 13px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(textVal, 510, y + 32);

      // 時間バッジ（右端）
      if (timeVal) {
        ctx.fillStyle = currentColor;
        ctx.font = `bold 12px ${bodyFont}`;
        ctx.textAlign = 'right';
        ctx.fillText(timeVal, 920, y + 32);
      }
    }
    ctx.restore();
  }
}

const ALL_DAYS_EN = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const ALL_DAYS_JP = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

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