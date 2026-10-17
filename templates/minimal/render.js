// マガジン＆ミニマル テンプレート描画モジュール (CSS/Canvasプログラミング描画のみ)

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

  // 1. 全体背景（ミニマルホワイト）
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 左側アクセント垂直ライン
  ctx.fillStyle = currentColor;
  ctx.fillRect(0, 0, 12, canvas.height);

  // 2. 右側イラスト描画（フレームレス・右寄せ配置）
  ctx.save();
  ctx.beginPath();
  ctx.rect(500, 0, 460, canvas.height);
  ctx.clip();

  if (bgType === 'image' && bgImage) {
    const scale = Math.max(460 / bgImage.width, 540 / bgImage.height);
    const x = 500 + (460 - bgImage.width * scale) / 2;
    const y = (540 - bgImage.height * scale) / 2;
    ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
  } else {
    ctx.fillStyle = areaBgColor || '#f1f5f9';
    ctx.fillRect(500, 0, 460, canvas.height);
  }

  if (uploadedImage) {
    const drawW = uploadedImage.width * imgScale;
    const drawH = uploadedImage.height * imgScale;
    ctx.drawImage(uploadedImage, imgX - drawW / 2, imgY - drawH / 2, drawW, drawH);
  }
  ctx.restore();

  // イラストとの境目の区切り線
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(500, 0);
  ctx.lineTo(500, canvas.height);
  ctx.stroke();

  // 3. タイトル & 期間表示
  const weekInfo = getWeekDayInfo(startDateInputVal);
  const startDate = weekInfo[0].date;
  const endDate = weekInfo[6].date;
  const dateRangeStr = `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, '0')}.${String(startDate.getDate()).padStart(2, '0')} ➔ ${String(endDate.getMonth() + 1).padStart(2, '0')}.${String(endDate.getDate()).padStart(2, '0')}`;

  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.font = `900 24px ${titleFont}`;
  ctx.textAlign = 'left';
  ctx.fillText('WEEKLY SCHEDULE', 32, 42);

  ctx.fillStyle = currentColor;
  ctx.font = `bold 12px ${bodyFont}`;
  ctx.fillText(dateRangeStr, 32, 62);

  // 区切り横線
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, 75);
  ctx.lineTo(475, 75);
  ctx.stroke();
  ctx.restore();

  // 4. クレジット（右下オーバーレイ）
  const captionText = illustCaption.trim();
  if (captionText) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(500, 500, 460, 40);

    ctx.fillStyle = '#475569';
    ctx.font = `12px ${bodyFont}`;
    ctx.textAlign = 'right';
    ctx.fillText(captionText, 940, 525);
    ctx.restore();
  }

  // 5. 7日分スケジュールリスト
  for (let i = 0; i < 7; i++) {
    const info = weekInfo[i];
    const y = 85 + i * 62;
    const textVal = textInputs[i] || '';
    const timeVal = timeInputs[i] || '';
    const isOff = (textVal === 'おやすみ');

    // 日付 & 曜日（グリッドスタイル）
    ctx.save();
    ctx.fillStyle = isOff ? '#94a3b8' : currentColor;
    ctx.font = `900 16px ${bodyFont}`;
    ctx.textAlign = 'left';
    ctx.fillText(info.enName.slice(0, 3), 32, y + 25);

    ctx.fillStyle = '#64748b';
    ctx.font = `bold 12px ${bodyFont}`;
    ctx.fillText(`${info.date.getMonth() + 1}/${info.date.getDate()}`, 32, y + 42);

    // 行セパレーター
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, y + 54);
    ctx.lineTo(475, y + 54);
    ctx.stroke();

    if (isOff) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `bold 14px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText('ー OFF DAY ー', 110, y + 32);
    } else {
      // 予定テキスト
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold 14px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(textVal, 110, y + 32);

      // 時間
      if (timeVal) {
        ctx.fillStyle = '#64748b';
        ctx.font = `12px ${bodyFont}`;
        ctx.textAlign = 'right';
        ctx.fillText(timeVal, 475, y + 32);
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