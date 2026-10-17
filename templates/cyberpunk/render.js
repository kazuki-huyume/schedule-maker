// --- Generated template render configuration for render.js ---
export function render(ctx, canvas, state) {
  const { assets, uploadedImage, illustCaption, startDateInputVal, textInputs, timeInputs, bodyFont } = state;

  // 1. 背景描画 (background.png)
  if (assets && assets.background) {
    ctx.drawImage(assets.background, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 2. キャラクターイラスト描画 (指定マスク枠: X:503, Y:98, W:420, H:410)
  if (uploadedImage) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(503, 98, 420, 410);
    ctx.clip();
    const drawW = uploadedImage.width * state.imgScale;
    const drawH = uploadedImage.height * state.imgScale;
    ctx.drawImage(uploadedImage, state.imgX - drawW / 2, state.imgY - drawH / 2, drawW, drawH);
    ctx.restore();
  }

  // 3. クレジット枠 & テキスト (credit.png)
  if (illustCaption && assets && assets.credit) {
    const cx = 770, cy = 460;
    const cw = 140, ch = 35;
    ctx.drawImage(assets.credit, cx, cy, cw, ch);
    ctx.fillStyle = '#00f0ff';
    ctx.font = `bold 13px ${bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(illustCaption, cx + 70, cy + 22);
  }

  // 4. 期間テキスト描画
  ctx.fillStyle = '#00f0ff';
  ctx.font = `bold 20px ${bodyFont}`;
  ctx.textAlign = 'center';
  ctx.fillText(getFormattedDateRange(startDateInputVal), 480, 45);

  // 5. 7日分スケジュール要素描画
  const daysLayout = [
    {
        "gray": { "x": 40, "y": 84, "w": 435, "h": 56 },
        "date": { "x": 60, "y": 125, "size": 15, "color": "#00f0ff" },
        "day": { "x": 138, "y": 123, "size": 13, "color": "#00f0ff" },
        "text": { "x": 204, "y": 124, "size": 14, "color": "#ffffff" },
        "time": { "x": 363, "y": 123, "size": 12, "color": "#a0aec0" }
    },
    {
        "gray": { "x": 40, "y": 147, "w": 435, "h": 56 },
        "date": { "x": 59, "y": 186, "size": 15, "color": "#00f0ff" },
        "day": { "x": 140, "y": 186, "size": 13, "color": "#00f0ff" },
        "text": { "x": 202, "y": 186, "size": 14, "color": "#ffffff" },
        "time": { "x": 362, "y": 185, "size": 12, "color": "#a0aec0" }
    },
    {
        "gray": { "x": 40, "y": 207, "w": 435, "h": 56 },
        "date": { "x": 59, "y": 246, "size": 15, "color": "#00f0ff" },
        "day": { "x": 138, "y": 247, "size": 13, "color": "#00f0ff" },
        "text": { "x": 203, "y": 247, "size": 14, "color": "#ffffff" },
        "time": { "x": 363, "y": 247, "size": 12, "color": "#a0aec0" }
    },
    {
        "gray": { "x": 40, "y": 268, "w": 435, "h": 56 },
        "date": { "x": 59, "y": 309, "size": 15, "color": "#00f0ff" },
        "day": { "x": 140, "y": 308, "size": 13, "color": "#00f0ff" },
        "text": { "x": 202, "y": 308, "size": 14, "color": "#ffffff" },
        "time": { "x": 363, "y": 308, "size": 12, "color": "#a0aec0" }
    },
    {
        "gray": { "x": 40, "y": 330, "w": 435, "h": 56 },
        "date": { "x": 58, "y": 370, "size": 15, "color": "#00f0ff" },
        "day": { "x": 144, "y": 368, "size": 13, "color": "#00f0ff" },
        "text": { "x": 202, "y": 369, "size": 14, "color": "#ffffff" },
        "time": { "x": 363, "y": 369, "size": 12, "color": "#a0aec0" }
    },
    {
        "gray": { "x": 40, "y": 392, "w": 435, "h": 56 },
        "date": { "x": 58, "y": 432, "size": 15, "color": "#00f0ff" },
        "day": { "x": 140, "y": 431, "size": 13, "color": "#00f0ff" },
        "text": { "x": 203, "y": 431, "size": 14, "color": "#ffffff" },
        "time": { "x": 365, "y": 431, "size": 12, "color": "#a0aec0" }
    },
    {
        "gray": { "x": 40, "y": 453, "w": 435, "h": 56 },
        "date": { "x": 57, "y": 492, "size": 15, "color": "#00f0ff" },
        "day": { "x": 140, "y": 492, "size": 13, "color": "#00f0ff" },
        "text": { "x": 204, "y": 493, "size": 14, "color": "#ffffff" },
        "time": { "x": 366, "y": 492, "size": 12, "color": "#a0aec0" }
    }
  ];

  const weekInfo = getWeekDayInfo(startDateInputVal);

  daysLayout.forEach((pos, i) => {
    const textVal = textInputs[i] || '';
    const timeVal = timeInputs[i] || '';
    const isOff = (textVal === 'おやすみ');

    if (isOff) {
      if (assets && assets.gray_out) {
        ctx.drawImage(assets.gray_out, pos.gray.x, pos.gray.y, pos.gray.w, pos.gray.h);
      }
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold 14px ${bodyFont}`;
      ctx.textAlign = 'center';
      ctx.fillText('OFF DAY', pos.gray.x + pos.gray.w / 2, pos.gray.y + pos.gray.h / 2 + 5);
    } else {
      // 日付
      ctx.fillStyle = pos.date.color;
      ctx.font = `bold ${pos.date.size}px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(formatDateStr(weekInfo[i].date, 'MM/DD'), pos.date.x, pos.date.y);

      // 曜日
      ctx.fillStyle = pos.day.color;
      ctx.font = `bold ${pos.day.size}px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(formatDayStr(weekInfo[i], 'EN_SHORT'), pos.day.x, pos.day.y);

      // 予定
      ctx.fillStyle = pos.text.color;
      ctx.font = `bold ${pos.text.size}px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(textVal, pos.text.x, pos.text.y);

      // 時間
      ctx.fillStyle = pos.time.color;
      ctx.font = `bold ${pos.time.size}px ${bodyFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(timeVal, pos.time.x, pos.time.y);
    }
  });
}

// 補助関数群
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

function getFormattedDateRange(baseDateStr) {
  const weekInfo = getWeekDayInfo(baseDateStr);
  const start = weekInfo[0].date;
  const end = weekInfo[6].date;
  return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
}

function formatDateStr(date, format) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if (format === 'MM/DD') {
    return `${m}/${d}`;
  } else if (format === 'DD' || format === 'D') {
    return `${d}`;
  }
  return `${m}/${d}`;
}

function formatDayStr(info, format) {
  if (format === 'EN_SHORT') {
    return info.enName.slice(0, 3);
  } else if (format === 'EN_FULL') {
    return info.enName;
  } else if (format === 'JP_FULL') {
    return info.jpName;
  } else if (format === 'JP_SHORT') {
    return info.jpName.charAt(0);
  }
  return info.enName.slice(0, 3);
}