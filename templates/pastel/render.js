// パステル＆ポップ テンプレート描画モジュール (CSS/Canvasプログラミング描画のみ)

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

  // 1. ベース背景（やわらかいクリーム色）
  ctx.fillStyle = '#fffbf0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ドット柄背景装飾
  ctx.fillStyle = hexToRgba(currentColor, 0.15);
  for (let x = 10; x < canvas.width; x += 30) {
    for (let y = 10; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. 右側イラスト表示フレーム（角丸＋2重縁取り）
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(540, 20, 400, 500, 24);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(550, 30, 380, 480, 18);
  ctx.clip();

  if (bgType === 'image' && bgImage) {
    const scale = Math.max(380 / bgImage.width, 480 / bgImage.height);
    const x = 550 + (380 - bgImage.width * scale) / 2;
    const y = 30 + (480 - bgImage.height * scale) / 2;
    ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
  } else {
    ctx.fillStyle = areaBgColor || '#f0fdf4';
    ctx.fillRect(550, 30, 380, 480);
  }

  if (uploadedImage) {
    const drawW = uploadedImage.width * imgScale;
    const drawH = uploadedImage.height * imgScale;
    ctx.drawImage(uploadedImage, imgX - drawW / 2, imgY - drawH / 2, drawW, drawH);
  }
  ctx.restore();

  // イラスト枠の破線フレーム
  ctx.save();
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.roundRect(550, 30, 380, 480, 18);
  ctx.stroke();
  ctx.restore();

  // 3. 左側タイトルリボン
  ctx.save();
  ctx.fillStyle = currentColor;
  ctx.shadowColor = 'rgba(0,0,0,0.1)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.roundRect(20, 15, 320, 42, 21);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 20px ${titleFont}`;
  ctx.textAlign = 'center';
  ctx.fillText('WEEKLY SCHEDULE', 180, 43);
  ctx.restore();

  // 期間カプセル
  const weekInfo = getWeekDayInfo(startDateInputVal);
  const startDate = weekInfo[0].date;
  const endDate = weekInfo[6].date;
  const dateRangeStr = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(355, 20, 160, 32, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = `bold 13px ${bodyFont}`;
  ctx.textAlign = 'center';
  ctx.fillText(dateRangeStr, 435, 41);
  ctx.restore();

  // 4. クレジットバッジ（右下）
  const captionText = illustCaption.trim();
  if (captionText) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(570, 465, 340, 32, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = `bold 12px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(captionText, 740, 486);
    ctx.restore();
  }

  // 5. 7日分スケジュールリスト
  for (let i = 0; i < 7; i++) {
    const info = weekInfo[i];
    const y = 72 + i * 63;
    const textVal = textInputs[i] || '';
    const timeVal = timeInputs[i] || '';
    const isOff = (textVal === 'おやすみ');

    // ホワイトカード
    ctx.save();
    ctx.fillStyle = isOff ? '#f1f5f9' : '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.04)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.roundRect(20, y, 495, 52, 16);
    ctx.fill();

    // 枠線
    ctx.strokeStyle = isOff ? '#cbd5e1' : hexToRgba(currentColor, 0.4);
    ctx.lineWidth = 2;
    ctx.stroke();

    // 日付・曜日サークル
    ctx.fillStyle = isOff ? '#94a3b8' : currentColor;
    ctx.beginPath();
    ctx.arc(52, y + 26, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 11px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(info.enName.slice(0, 3), 52, y + 22);
    ctx.font = `bold 12px ${bodyFont}`;
    ctx.fillText(`${info.date.getDate()}`, 52, y + 35);

    if (isOff) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold 14px ${bodyFont}`;
      ctx.textAlign = 'center';
      ctx.fillText('おやすみ 💤', 290, y + 31);
    } else {
      // 予定
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold 14px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(textVal, 88, y + 31);

      // 時間ピルバッジ
      if (timeVal) {
        ctx.fillStyle = hexToRgba(currentColor, 0.15);
        ctx.beginPath();
        ctx.roundRect(390, y + 13, 110, 26, 13);
        ctx.fill();

        ctx.fillStyle = '#334155';
        ctx.font = `bold 12px ${bodyFont}`;
        ctx.textAlign = 'center';
        ctx.fillText(timeVal, 445, y + 30);
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