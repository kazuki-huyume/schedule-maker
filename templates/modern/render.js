// シック＆モダン テンプレート描画モジュール (CSS/Canvasプログラミング描画のみ)

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

  // 1. 全体背景（ダークグラデーション）
  const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGradient.addColorStop(0, '#0f172a');
  bgGradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // アクセントの円形グリッドパターン（背景背景の装飾）
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  ctx.restore();

  // 2. 右側イラストエリア
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(550, 20, 390, 500, 16);
  ctx.clip();

  if (bgType === 'image' && bgImage) {
    const scale = Math.max(390 / bgImage.width, 500 / bgImage.height);
    const x = 550 + (390 - bgImage.width * scale) / 2;
    const y = 20 + (500 - bgImage.height * scale) / 2;
    ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
  } else {
    ctx.fillStyle = areaBgColor || '#090d16';
    ctx.fillRect(550, 20, 390, 500);
  }

  // キャラクター画像描画
  if (uploadedImage) {
    const drawW = uploadedImage.width * imgScale;
    const drawH = uploadedImage.height * imgScale;
    ctx.drawImage(uploadedImage, imgX - drawW / 2, imgY - drawH / 2, drawW, drawH);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = `bold 14px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('イラストエリア', 745, 260);
  }
  ctx.restore();

  // イラスト枠のストローク（メインカラー発光）
  ctx.save();
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = currentColor;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.roundRect(550, 20, 390, 500, 16);
  ctx.stroke();
  ctx.restore();

  // 3. タイトル & 期間（左側上部）
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 28px ${titleFont}`;
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText('WEEKLY SCHEDULE', 25, 52);

  const weekInfo = getWeekDayInfo(startDateInputVal);
  const startDate = weekInfo[0].date;
  const endDate = weekInfo[6].date;
  const dateRangeStr = `${startDate.getFullYear()}.${startDate.getMonth() + 1}.${startDate.getDate()} - ${endDate.getMonth() + 1}.${endDate.getDate()}`;

  ctx.fillStyle = currentColor;
  ctx.font = `bold 14px ${bodyFont}`;
  ctx.fillText(dateRangeStr, 25, 76);
  ctx.restore();

  // 4. クレジット欄（右下）
  const captionText = illustCaption.trim();
  if (captionText) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(570, 475, 350, 32, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `12px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(captionText, 745, 495);
    ctx.restore();
  }

  // 5. 7日分スケジュールリスト
  for (let i = 0; i < 7; i++) {
    const info = weekInfo[i];
    const y = 92 + i * 60;
    const textVal = textInputs[i] || '';
    const timeVal = timeInputs[i] || '';
    const isOff = (textVal === 'おやすみ');

    // 行カード背景（グラデーションガラス風）
    ctx.save();
    ctx.fillStyle = isOff ? 'rgba(30, 41, 59, 0.4)' : 'rgba(30, 41, 59, 0.75)';
    ctx.strokeStyle = isOff ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(20, y, 510, 52, 10);
    ctx.fill();
    ctx.stroke();

    // 曜日・日付バッジ
    ctx.fillStyle = isOff ? '#64748b' : currentColor;
    ctx.beginPath();
    ctx.roundRect(28, y + 8, 80, 36, 6);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = `bold 11px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(info.enName.slice(0, 3), 68, y + 23);
    ctx.font = `bold 13px ${bodyFont}`;
    ctx.fillText(`${info.date.getMonth() + 1}/${info.date.getDate()}`, 68, y + 38);

    if (isOff) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold 15px ${bodyFont}`;
      ctx.textAlign = 'center';
      ctx.fillText('ー  OFF DAY  ー', 315, y + 32);
    } else {
      // 予定本文
      ctx.fillStyle = '#f8fafc';
      ctx.font = `bold 14px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(textVal, 122, y + 31);

      // 時間
      if (timeVal) {
        ctx.fillStyle = currentColor;
        ctx.font = `bold 12px ${bodyFont}`;
        ctx.textAlign = 'right';
        ctx.fillText(timeVal, 515, y + 31);
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