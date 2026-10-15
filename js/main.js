const ALL_DAYS_EN = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const ALL_DAYS_JP = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

let currentColor = '#85c7f2';
const titleFontSelect = document.getElementById('titleFontSelect');
const bodyFontSelect = document.getElementById('bodyFontSelect');

let titleFont = titleFontSelect.value;
let bodyFont = bodyFontSelect.value;

let uploadedImage = null;
let bgImage = null;
let areaBgColor = '#ffffff';
let bgType = 'color';

let imgX = 750;
let imgY = 220;
let imgScale = 1.0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

const canvas = document.getElementById('scheduleCanvas');
const ctx = canvas.getContext('2d');
const startDateInput = document.getElementById('startDate');
const themeColorPicker = document.getElementById('themeColorPicker');
const scheduleInputsContainer = document.getElementById('scheduleInputs');
const zoomRange = document.getElementById('zoomRange');
const bgTypeSelect = document.getElementById('bgTypeSelect');
const areaBgColorInput = document.getElementById('areaBgColor');
const bgImageUpload = document.getElementById('bgImageUpload');
const clearBgImgBtn = document.getElementById('clearBgImgBtn');
const illustCaptionInput = document.getElementById('illustCaption');

function getInitialMonday() {
  const d = new Date();
  const jstDate = new Date(d.getTime() + (9 * 60 * 60 * 1000) + (d.getTimezoneOffset() * 60 * 1000));
  const day = jstDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  jstDate.setDate(jstDate.getDate() + diff);

  const year = jstDate.getFullYear();
  const month = String(jstDate.getMonth() + 1).padStart(2, '0');
  const date = String(jstDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

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

function createInputs() {
  startDateInput.value = getInitialMonday();
  updateInputLabels();

  document.querySelectorAll('input, select').forEach(input => {
    if(input.id !== 'themeColorPicker' && input.id !== 'areaBgColor') {
      input.addEventListener('input', drawSchedule);
    }
  });
}

function updateInputLabels() {
  const weekInfo = getWeekDayInfo(startDateInput.value);
  
  if (scheduleInputsContainer.children.length === 0) {
    weekInfo.forEach((info, idx) => {
      const row = document.createElement('div');
      row.className = 'day-row';
      row.innerHTML = `
        <span class="day-label" id="label-${idx}">${info.jpName}:</span>
        <input type="text" class="text-input" id="text-${idx}" placeholder="内容をここに記載">
        <input type="text" class="time-input" id="time-${idx}" placeholder="時間">
        <button type="button" class="btn-off" onclick="setOff(${idx})">おやすみ</button>
      `;
      scheduleInputsContainer.appendChild(row);
    });
  } else {
    weekInfo.forEach((info, idx) => {
      const labelEl = document.getElementById(`label-${idx}`);
      if (labelEl) {
        labelEl.textContent = `${info.jpName}:`;
      }
    });
  }
}

function setOff(idx) {
  const textInput = document.getElementById(`text-${idx}`);
  const timeInput = document.getElementById(`time-${idx}`);
  if (textInput.value === 'おやすみ') {
    textInput.value = '';
    timeInput.disabled = false;
    timeInput.style.opacity = '1';
  } else {
    textInput.value = 'おやすみ';
    timeInput.value = '';
    timeInput.disabled = true;
    timeInput.style.opacity = '0.4';
  }
  drawSchedule();
}

startDateInput.addEventListener('change', () => {
  updateInputLabels();
  drawSchedule();
});

titleFontSelect.addEventListener('change', (e) => {
  titleFont = e.target.value;
  document.fonts.ready.then(() => drawSchedule());
});

bodyFontSelect.addEventListener('change', (e) => {
  bodyFont = e.target.value;
  document.fonts.ready.then(() => drawSchedule());
});

document.getElementById('colorPicker').addEventListener('click', (e) => {
  if (e.target.classList.contains('color-btn')) {
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentColor = e.target.getAttribute('data-color');
    themeColorPicker.value = currentColor;
    drawSchedule();
  }
});

themeColorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
  document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
  drawSchedule();
});

bgTypeSelect.addEventListener('change', (e) => {
  bgType = e.target.value;
  if (bgType === 'color') {
    document.getElementById('bgColorContainer').style.display = 'block';
    document.getElementById('bgImageContainer').style.display = 'none';
  } else {
    document.getElementById('bgColorContainer').style.display = 'none';
    document.getElementById('bgImageContainer').style.display = 'flex';
  }
  drawSchedule();
});

areaBgColorInput.addEventListener('input', (e) => {
  areaBgColor = e.target.value;
  drawSchedule();
});

bgImageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        bgImage = img;
        clearBgImgBtn.style.display = 'inline-block';
        drawSchedule();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

clearBgImgBtn.addEventListener('click', () => {
  bgImage = null;
  bgImageUpload.value = '';
  clearBgImgBtn.style.display = 'none';
  drawSchedule();
});

document.getElementById('imageUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        uploadedImage = img;
        resetImagePosition();
        document.getElementById('imageControls').style.display = 'flex';
        drawSchedule();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function resetImagePosition() {
  if (!uploadedImage) return;
  const baseScale = Math.max(360 / uploadedImage.width, 460 / uploadedImage.height);
  imgScale = baseScale;
  zoomRange.value = 1.0;
  imgX = 750;
  imgY = 220;
}

document.getElementById('resetImgBtn').addEventListener('click', () => {
  resetImagePosition();
  drawSchedule();
});

zoomRange.addEventListener('input', (e) => {
  if (!uploadedImage) return;
  const baseScale = Math.max(360 / uploadedImage.width, 460 / uploadedImage.height);
  imgScale = baseScale * parseFloat(e.target.value);
  drawSchedule();
});

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  if (x >= 560 && x <= 940 && y >= 20 && y <= 520) {
    isDragging = true;
    dragStartX = x - imgX;
    dragStartY = y - imgY;
  }
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  imgX = x - dragStartX;
  imgY = y - dragStartY;
  drawSchedule();
});

window.addEventListener('mouseup', () => { isDragging = false; });

canvas.addEventListener('wheel', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  if (x >= 560 && x <= 940 && y >= 20 && y <= 520 && uploadedImage) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const currentSliderVal = parseFloat(zoomRange.value);
    const newVal = Math.min(Math.max(currentSliderVal + delta, 0.2), 3.0);
    zoomRange.value = newVal;

    const baseScale = Math.max(360 / uploadedImage.width, 460 / uploadedImage.height);
    imgScale = baseScale * newVal;
    drawSchedule();
  }
}, { passive: false });

function drawSchedule() {
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

  // --- キャラクター画像表示領域の右上に合わせたひとこと・クレジット欄の描画 ---
  const captionText = illustCaptionInput.value.trim();
  if (captionText) {
    ctx.save();
    ctx.font = `bold 12px ${bodyFont}`;
    const textWidth = ctx.measureText(captionText).width;
    const badgeWidth = Math.max(textWidth + 24, 90);
    
    // 画像表示領域の右端(570 + 360 = 930)から少し内側に収まるように配置
    const badgeX = 920 - badgeWidth; 
    const badgeY = 40; // 画像表示枠の上のほう（右上）

    // 白背景バッジ ＋ 輪郭線
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

  drawFancyTitle(750, 435, 'Weekly', 'SCHEDULE');

  const weekInfo = getWeekDayInfo(startDateInput.value);
  const startDate = weekInfo[0].date;
  const endDate = weekInfo[6].date;
  const dateRangeStr = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;
  
  // 右下の期間バッジ
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

    const textVal = document.getElementById(`text-${i}`)?.value || '';
    const timeVal = document.getElementById(`time-${i}`)?.value || '';
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

function drawFancyTitle(x, y, line1, line2) {
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

document.getElementById('downloadBtn').addEventListener('click', async () => {
  const filename = `schedule_${startDateInput.value}.png`;
  
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'PNG Image',
          accept: { 'image/png': ['.png'] },
        }],
      });
      const writable = await handle.createWritable();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('ファイル保存エラー:', err);
      } else {
        return;
      }
    }
  }

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

document.fonts.ready.then(() => {
  createInputs();
  drawSchedule();
});