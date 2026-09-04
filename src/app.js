import { THEMES, applyTheme } from './theme.js';
import { ParticleEngine } from './confetti.js';
import { downloadCard } from './cardGenerator.js';
import { generateQRDataUrl } from './qr.js';
import { getHistoryEventsForDate } from './historyData.js';
import { fetchInspirationalQuote, getRandomFallbackQuote } from './quotes.js';

// Application State
const state = {
  fullName: '',
  dob: '',
  birthMonth: 1,
  birthDay: 1,
  birthYear: 2000,
  theme: 'golden',
  age: 0,
  totalMonths: 0,
  nextBdayDate: '',
  nextBdayYear: 2026,
  nextBdayDateObj: null,
  nextYearBdayDateObj: null,
  nextYearBdayFormatted: '',
  daysUntilNextBday: 0,
  ageNextYear: 0,
  isBirthdayToday: false
};

// Words of Inspiration dynamic state
let currentQuote = null;
let isFetchingQuote = false;
let particleEngine = null;
let gatekeeperTimerInterval = null;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('fx-canvas');
  particleEngine = new ParticleEngine(canvas);

  initThemeSelector();
  initDateInput();
  initForm();
  initActionGrid();
  initModals();
});

/**
 * Initializes the 8 theme selector swatches on Screen 1
 */
function initThemeSelector() {
  const container = document.getElementById('theme-swatches');
  container.innerHTML = '';

  Object.values(THEMES).forEach((theme) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = `swatch-btn ${theme.id === state.theme ? 'active' : ''}`;
    swatch.dataset.theme = theme.id;
    swatch.title = theme.name;
    swatch.setAttribute('aria-label', `${theme.name} theme`);
    swatch.style.setProperty('--swatch-color', theme.swatch);

    swatch.innerHTML = `
      <span class="swatch-color" style="background: ${theme.gradient};"></span>
      <span class="swatch-label">${theme.name}</span>
    `;

    swatch.addEventListener('click', () => {
      state.theme = theme.id;
      applyTheme(theme.id);
      particleEngine.setTheme(theme.accent);

      container.querySelectorAll('.swatch-btn').forEach(btn => btn.classList.remove('active'));
      swatch.classList.add('active');
    });

    container.appendChild(swatch);
  });

  applyTheme(state.theme);
  particleEngine.setTheme(THEMES[state.theme].accent);
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Robust cursor-aware date input mask for manual typing (DD-MM-YYYY).
 * Properly manages selectionStart/selectionEnd on mid-string edits, Backspace, and Delete.
 */
function setupDateInputMask(input, onValueChange) {
  function formatDigits(digits) {
    if (digits.length > 4) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    }
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    return digits;
  }

  function getCursorFromDigits(formatted, targetDigitCount) {
    if (targetDigitCount <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        seen++;
        if (seen === targetDigitCount) {
          return i + 1;
        }
      }
    }
    return formatted.length;
  }

  input.addEventListener('keydown', (e) => {
    // 1. Backspace handling: delete character immediately behind cursor
    if (e.key === 'Backspace') {
      const start = input.selectionStart;
      const end = input.selectionEnd;

      if (start !== end) {
        e.preventDefault();
        const val = input.value;
        const before = val.slice(0, start);
        const after = val.slice(end);
        const digits = (before + after).replace(/\D/g, '').slice(0, 8);
        const formatted = formatDigits(digits);
        const digitsBefore = before.replace(/\D/g, '').length;
        input.value = formatted;
        const newPos = getCursorFromDigits(formatted, digitsBefore);
        input.setSelectionRange(newPos, newPos);
        onValueChange?.();
        return;
      }

      if (start > 0) {
        e.preventDefault();
        const val = input.value;
        let before, after;

        // If cursor is immediately after a hyphen, delete the digit preceding the hyphen
        if (val[start - 1] === '-') {
          before = val.slice(0, start - 2);
          after = val.slice(start);
        } else {
          before = val.slice(0, start - 1);
          after = val.slice(start);
        }

        const digitsBefore = before.replace(/\D/g, '').length;
        const digits = (before + after).replace(/\D/g, '').slice(0, 8);
        const formatted = formatDigits(digits);
        input.value = formatted;
        const newPos = getCursorFromDigits(formatted, digitsBefore);
        input.setSelectionRange(newPos, newPos);
        onValueChange?.();
        return;
      }
    }

    // 2. Delete key handling
    if (e.key === 'Delete') {
      const start = input.selectionStart;
      const end = input.selectionEnd;

      if (start !== end) {
        e.preventDefault();
        const val = input.value;
        const before = val.slice(0, start);
        const after = val.slice(end);
        const digits = (before + after).replace(/\D/g, '').slice(0, 8);
        const formatted = formatDigits(digits);
        const digitsBefore = before.replace(/\D/g, '').length;
        input.value = formatted;
        const newPos = getCursorFromDigits(formatted, digitsBefore);
        input.setSelectionRange(newPos, newPos);
        onValueChange?.();
        return;
      }

      if (start < input.value.length) {
        e.preventDefault();
        const val = input.value;
        let before, after;

        // If character at cursor is a hyphen, delete the digit following the hyphen
        if (val[start] === '-') {
          before = val.slice(0, start);
          after = val.slice(start + 2);
        } else {
          before = val.slice(0, start);
          after = val.slice(start + 1);
        }

        const digitsBefore = before.replace(/\D/g, '').length;
        const digits = (before + after).replace(/\D/g, '').slice(0, 8);
        const formatted = formatDigits(digits);
        input.value = formatted;
        const newPos = getCursorFromDigits(formatted, digitsBefore);
        input.setSelectionRange(newPos, newPos);
        onValueChange?.();
        return;
      }
    }
  });

  input.addEventListener('input', (e) => {
    const rawVal = input.value;
    const currentPos = input.selectionStart || 0;
    const digitsBeforeCursor = (rawVal.slice(0, currentPos).match(/\d/g) || []).length;
    const allDigits = rawVal.replace(/\D/g, '').slice(0, 8);
    const formatted = formatDigits(allDigits);

    input.value = formatted;
    let newCursor = getCursorFromDigits(formatted, digitsBeforeCursor);

    // If forward typing just created a hyphen directly at the cursor, advance past it
    if (e.inputType && e.inputType.startsWith('insert') && (newCursor === 2 || newCursor === 5)) {
      if (formatted[newCursor] === '-') {
        newCursor++;
      }
    }

    input.setSelectionRange(newCursor, newCursor);
    onValueChange?.();
  });
}

/**
 * Modern Touch-Friendly Scrollable Drum/Wheel Date Picker Component.
 * Supports touch, wheel, drag, and click selection for Day, Month, and Year.
 */
function initDrumDatePicker() {
  const modal = document.getElementById('drum-picker-modal');
  const btnOpen = document.getElementById('btn-open-calendar');
  const btnClose = document.getElementById('btn-close-drum-picker');
  const btnCancel = document.getElementById('btn-cancel-drum');
  const btnConfirm = document.getElementById('btn-confirm-drum');
  const previewEl = document.getElementById('drum-picker-preview');
  const textInput = document.getElementById('input-dob');

  const wheelDay = document.getElementById('drum-wheel-day');
  const wheelMonth = document.getElementById('drum-wheel-month');
  const wheelYear = document.getElementById('drum-wheel-year');

  const trackDay = document.getElementById('drum-track-day');
  const trackMonth = document.getElementById('drum-track-month');
  const trackYear = document.getElementById('drum-track-year');

  if (!modal || !btnOpen) return;

  const ITEM_HEIGHT = 44; // Exact line height of each drum item
  const todayNow = new Date();
  const currentYearNow = todayNow.getFullYear();
  const minYear = 1920;

  // Initialize to dynamic present-day date (Day, Month, Year)
  let selectedDay = todayNow.getDate();
  let selectedMonth = todayNow.getMonth() + 1; // 1-12
  let selectedYear = todayNow.getFullYear();

  // 1. Populate Day Items (1 to 31)
  trackDay.innerHTML = '';
  for (let d = 1; d <= 31; d++) {
    const item = document.createElement('div');
    item.className = 'drum-item';
    item.dataset.val = d;
    item.textContent = String(d).padStart(2, '0');
    trackDay.appendChild(item);
  }

  // 2. Populate Month Items (January to December)
  trackMonth.innerHTML = '';
  MONTH_NAMES.forEach((mName, idx) => {
    const item = document.createElement('div');
    item.className = 'drum-item';
    item.dataset.val = idx + 1;
    item.textContent = mName;
    trackMonth.appendChild(item);
  });

  // 3. Populate Year Items (current year down to 1920)
  trackYear.innerHTML = '';
  for (let y = currentYearNow; y >= minYear; y--) {
    const item = document.createElement('div');
    item.className = 'drum-item';
    item.dataset.val = y;
    item.textContent = y;
    trackYear.appendChild(item);
  }

  function getDaysInMonth(m, y) {
    return new Date(y, m, 0).getDate();
  }

  function updateDaysAvailability() {
    const maxDays = getDaysInMonth(selectedMonth, selectedYear);
    const dayItems = trackDay.querySelectorAll('.drum-item');
    dayItems.forEach((item, idx) => {
      const d = idx + 1;
      if (d > maxDays) {
        item.style.display = 'none';
      } else {
        item.style.display = 'flex';
      }
    });

    if (selectedDay > maxDays) {
      selectedDay = maxDays;
      scrollToItem(wheelDay, selectedDay, true);
    }
  }

  function updatePreview() {
    if (previewEl) {
      const dStr = String(selectedDay).padStart(2, '0');
      const mStr = MONTH_NAMES[selectedMonth - 1] || 'January';
      previewEl.textContent = `${dStr} ${mStr} ${selectedYear}`;
    }
  }

  function scrollToItem(wheel, val, smooth = true) {
    const items = wheel.querySelectorAll('.drum-item');
    let targetIndex = -1;
    for (let i = 0; i < items.length; i++) {
      if (parseInt(items[i].dataset.val, 10) === val) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex >= 0) {
      const targetTop = targetIndex * ITEM_HEIGHT;
      wheel.scrollTo({
        top: targetTop,
        behavior: smooth ? 'smooth' : 'auto'
      });
      highlightActive(wheel, targetIndex);
    }
  }

  function highlightActive(wheel, index) {
    const items = wheel.querySelectorAll('.drum-item');
    items.forEach((it, idx) => {
      if (idx === index) {
        it.classList.add('active');
      } else {
        it.classList.remove('active');
      }
    });
  }

  function setupWheelListener(wheel, onSelect) {
    let scrollDebounce;
    let wheelDeltaSum = 0;
    let wheelCooldown = 0;
    let wheelResetTimer;

    // 1. Controlled Single-Item Mouse Wheel Scrolling
    wheel.addEventListener('wheel', (e) => {
      e.preventDefault();

      wheelDeltaSum += e.deltaY;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => {
        wheelDeltaSum = 0;
      }, 140);

      const now = performance.now();
      if (now < wheelCooldown) return;

      // Delta threshold ensures one discrete mouse notch moves exactly 1 item
      const STEP_THRESHOLD = 32;
      if (Math.abs(wheelDeltaSum) >= STEP_THRESHOLD) {
        const step = wheelDeltaSum > 0 ? 1 : -1;
        wheelDeltaSum = 0;
        wheelCooldown = now + 70; // 70ms cooldown prevents runaway multi-item jumping

        const currentIndex = Math.round(wheel.scrollTop / ITEM_HEIGHT);
        const items = Array.from(wheel.querySelectorAll('.drum-item')).filter(it => it.style.display !== 'none');
        const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + step));

        wheel.scrollTo({
          top: nextIndex * ITEM_HEIGHT,
          behavior: 'smooth'
        });
      }
    }, { passive: false });

    // 2. Active item tracking & Snap Locking on scroll end
    wheel.addEventListener('scroll', () => {
      const index = Math.round(wheel.scrollTop / ITEM_HEIGHT);
      highlightActive(wheel, index);
      const items = wheel.querySelectorAll('.drum-item');
      if (items[index] && items[index].style.display !== 'none') {
        const val = parseInt(items[index].dataset.val, 10);
        onSelect(val);
      }

      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(() => {
        const snapIndex = Math.round(wheel.scrollTop / ITEM_HEIGHT);
        const targetTop = snapIndex * ITEM_HEIGHT;
        if (Math.abs(wheel.scrollTop - targetTop) > 0.5) {
          wheel.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
      }, 75);
    }, { passive: true });

    // 3. Smooth Touch & Pointer Dragging
    let isPointerDown = false;
    let pointerStartY = 0;
    let pointerStartScroll = 0;
    let hasDragged = false;

    wheel.addEventListener('pointerdown', (e) => {
      if (e.button && e.button !== 0) return;
      isPointerDown = true;
      hasDragged = false;
      pointerStartY = e.clientY;
      pointerStartScroll = wheel.scrollTop;
      wheel.setPointerCapture(e.pointerId);
    });

    wheel.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      const deltaY = e.clientY - pointerStartY;
      if (Math.abs(deltaY) > 4) {
        hasDragged = true;
      }
      wheel.scrollTop = pointerStartScroll - deltaY;
    });

    const onPointerUp = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      try {
        wheel.releasePointerCapture(e.pointerId);
      } catch (_) {}

      // Snap smoothly to closest item
      const snapIndex = Math.round(wheel.scrollTop / ITEM_HEIGHT);
      wheel.scrollTo({ top: snapIndex * ITEM_HEIGHT, behavior: 'smooth' });
    };

    wheel.addEventListener('pointerup', onPointerUp);
    wheel.addEventListener('pointercancel', onPointerUp);

    // 4. Click item to scroll to it
    wheel.addEventListener('click', (e) => {
      if (hasDragged) return;
      const item = e.target.closest('.drum-item');
      if (!item || item.style.display === 'none') return;
      const val = parseInt(item.dataset.val, 10);
      scrollToItem(wheel, val, true);
    });
  }

  setupWheelListener(wheelDay, (val) => {
    selectedDay = val;
    updatePreview();
  });

  setupWheelListener(wheelMonth, (val) => {
    selectedMonth = val;
    updateDaysAvailability();
    updatePreview();
  });

  setupWheelListener(wheelYear, (val) => {
    selectedYear = val;
    updateDaysAvailability();
    updatePreview();
  });

  function openModal() {
    const val = textInput.value.trim();
    const parsed = parseDateInput(val);
    if (parsed) {
      selectedDay = parsed.day;
      selectedMonth = parsed.month;
      selectedYear = parsed.year;
    } else {
      const now = new Date();
      selectedDay = now.getDate();
      selectedMonth = now.getMonth() + 1;
      selectedYear = now.getFullYear();
    }

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    updateDaysAvailability();
    updatePreview();

    // Align wheels to target positions immediately and on next paint
    scrollToItem(wheelDay, selectedDay, false);
    scrollToItem(wheelMonth, selectedMonth, false);
    scrollToItem(wheelYear, selectedYear, false);

    requestAnimationFrame(() => {
      scrollToItem(wheelDay, selectedDay, false);
      scrollToItem(wheelMonth, selectedMonth, false);
      scrollToItem(wheelYear, selectedYear, false);
    });

    setTimeout(() => {
      scrollToItem(wheelDay, selectedDay, false);
      scrollToItem(wheelMonth, selectedMonth, false);
      scrollToItem(wheelYear, selectedYear, false);
    }, 40);
  }

  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btnOpen.addEventListener('click', openModal);
  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });

  // Confirm selection
  btnConfirm?.addEventListener('click', () => {
    const dStr = String(selectedDay).padStart(2, '0');
    const mStr = String(selectedMonth).padStart(2, '0');
    textInput.value = `${dStr}-${mStr}-${selectedYear}`;
    resetGatekeeperUI();
    closeModal();
    textInput.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

/**
 * Initializes Date of Birth Input Component
 */
function initDateInput() {
  const textInput = document.getElementById('input-dob');

  // 1. Setup robust cursor-aware manual text masking
  setupDateInputMask(textInput, () => {
    resetGatekeeperUI();
  });

  // 2. Setup modern scrollable drum date picker
  initDrumDatePicker();

  document.getElementById('input-name').addEventListener('input', () => {
    resetGatekeeperUI();
  });

  // Reset button in gatekeeper block
  document.getElementById('btn-reset-gatekeeper')?.addEventListener('click', () => {
    resetGatekeeperUI();
    textInput.focus();
  });
}

/**
 * Resets Gatekeeper UI back to standard CTA button
 */
function resetGatekeeperUI() {
  if (gatekeeperTimerInterval) {
    clearInterval(gatekeeperTimerInterval);
    gatekeeperTimerInterval = null;
  }
  const ctaBtn = document.getElementById('btn-submit-welcome');
  const gatekeeperBlock = document.getElementById('gatekeeper-block');
  if (ctaBtn && gatekeeperBlock) {
    ctaBtn.style.display = 'block';
    gatekeeperBlock.style.display = 'none';
  }
}

/**
 * Parses date string (DD-MM-YYYY, DD/MM/YYYY, or YYYY-MM-DD)
 */
function parseDateInput(str) {
  if (!str) return null;
  const clean = str.trim();

  // Pattern 1: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);

    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return { date, day, month, year };
    }
    return null;
  }

  // Pattern 2: YYYY-MM-DD
  const ymdMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);

    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return { date, day, month, year };
    }
    return null;
  }

  return null;
}

/**
 * Handles Form submission and Gatekeeper logic
 */
function initForm() {
  const form = document.getElementById('form-welcome');
  const nameInput = document.getElementById('input-name');
  const dobInput = document.getElementById('input-dob');
  const errorMsg = document.getElementById('form-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const fullName = nameInput.value.trim();
    const rawDob = dobInput.value.trim();

    if (!fullName) {
      showFormError('Please enter your full name.');
      nameInput.focus();
      return;
    }

    if (!rawDob) {
      showFormError('Please enter your date of birth (e.g. 05-09-2000).');
      dobInput.focus();
      return;
    }

    const parsed = parseDateInput(rawDob);
    const now = new Date();

    if (!parsed) {
      showFormError('Please enter a valid date in DD-MM-YYYY format.');
      dobInput.focus();
      return;
    }

    if (parsed.date > now) {
      showFormError('Date of birth cannot be in the future.');
      dobInput.focus();
      return;
    }

    if (parsed.year < 1900) {
      showFormError('Please enter a birth year after 1900.');
      dobInput.focus();
      return;
    }

    // Calculate age & birthday metrics
    const metrics = calculateBirthdayMetrics(parsed.date, now);
    state.fullName = fullName;
    state.dob = rawDob;
    state.birthMonth = parsed.month;
    state.birthDay = parsed.day;
    state.birthYear = parsed.year;
    state.age = metrics.age;
    state.totalMonths = metrics.age * 12;
    state.nextBdayDate = metrics.nextBdayFormatted;
    state.nextBdayYear = metrics.nextBdayYear;
    state.nextBdayDateObj = metrics.nextBdayDateObj;
    state.nextYearBdayDateObj = metrics.nextYearBdayDateObj;
    state.nextYearBdayFormatted = metrics.nextYearBdayFormatted;
    state.daysUntilNextBday = metrics.daysUntil;
    state.ageNextYear = metrics.age + 1;
    state.isBirthdayToday = metrics.isToday;

    // GATEKEEPER CHECK:
    // If it IS the user's birthday today: immediately transition to Screen 2!
    // If it is NOT: morph CTA into live countdown timer on Screen 1!
    if (state.isBirthdayToday) {
      transitionToSurprise();
    } else {
      activateGatekeeperCountdown();
    }
  });
}

function showFormError(msg) {
  const errorMsg = document.getElementById('form-error');
  const card = document.getElementById('card-welcome');
  errorMsg.textContent = msg;
  card.classList.add('shake');
  setTimeout(() => card.classList.remove('shake'), 500);
}

/**
 * Calculates exact age and next birthday midnight object
 */
function calculateBirthdayMetrics(dob, now) {
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }

  let nextBdayYear = now.getFullYear();
  let nextBday = new Date(nextBdayYear, dob.getMonth(), dob.getDate(), 0, 0, 0);

  // Check if today is the birthday (matching month & day)
  const isToday = (now.getMonth() === dob.getMonth() && now.getDate() === dob.getDate());

  if (now > nextBday && !isToday) {
    nextBdayYear++;
    nextBday = new Date(nextBdayYear, dob.getMonth(), dob.getDate(), 0, 0, 0);
  }

  const oneDayMs = 1000 * 60 * 60 * 24;
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const nextBdayMidnight = new Date(nextBday.getFullYear(), nextBday.getMonth(), nextBday.getDate(), 0, 0, 0);
  const daysUntil = Math.round((nextBdayMidnight - todayMidnight) / oneDayMs);

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const nextBdayFormatted = nextBday.toLocaleDateString('en-US', options);

  // Calculate actual birthday date in the upcoming year (next year)
  const nextYearVal = now.getFullYear() + 1;
  const isLeapNext = (nextYearVal % 4 === 0 && nextYearVal % 100 !== 0) || (nextYearVal % 400 === 0);
  const nextYearDay = (dob.getMonth() === 1 && dob.getDate() === 29 && !isLeapNext) ? 28 : dob.getDate();
  const nextYearBdayDate = new Date(nextYearVal, dob.getMonth(), nextYearDay, 0, 0, 0);
  const nextYearBdayFormatted = nextYearBdayDate.toLocaleDateString('en-US', options);

  return {
    age: Math.max(0, age),
    nextBdayFormatted,
    nextBdayYear,
    nextBdayDateObj: nextBday,
    nextYearBdayDateObj: nextYearBdayDate,
    nextYearBdayFormatted,
    daysUntil,
    isToday
  };
}

/**
 * Activates Live Countdown Timer on Screen 1 when NOT today's birthday
 */
function activateGatekeeperCountdown() {
  const ctaBtn = document.getElementById('btn-submit-welcome');
  const gatekeeperBlock = document.getElementById('gatekeeper-block');
  const daysEl = document.getElementById('gk-days');
  const hoursEl = document.getElementById('gk-hours');
  const minsEl = document.getElementById('gk-mins');
  const secsEl = document.getElementById('gk-secs');

  ctaBtn.style.display = 'none';
  gatekeeperBlock.style.display = 'flex';
  gatekeeperBlock.classList.add('fade-in');

  if (gatekeeperTimerInterval) clearInterval(gatekeeperTimerInterval);

  function update() {
    const now = new Date();
    const target = state.nextBdayDateObj;
    let diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      clearInterval(gatekeeperTimerInterval);
      state.isBirthdayToday = true;
      transitionToSurprise();
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  gatekeeperTimerInterval = setInterval(update, 1000);
}

/**
 * Smooth transition from Screen 1 to Screen 2 (only on actual birthday)
 */
function transitionToSurprise() {
  const screen1 = document.getElementById('screen-welcome');
  const screen2 = document.getElementById('screen-surprise');

  populateSurpriseScreen();

  screen1.classList.add('fade-out');
  setTimeout(() => {
    screen1.style.display = 'none';
    screen1.classList.remove('fade-out');

    screen2.style.display = 'flex';
    screen2.classList.add('fade-in');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    particleEngine.startCelebration();
  }, 400);
}

/**
 * Populates Screen 2 with personalized user data
 */
function populateSurpriseScreen() {
  const nameDisplay = document.getElementById('display-name');
  const ageBadge = document.getElementById('display-age-badge');
  const mainMessage = document.getElementById('display-main-message');
  const statAge = document.getElementById('stat-age-today');
  const statNextBday = document.getElementById('stat-next-bday');
  const statMonthsLived = document.getElementById('stat-months-lived');
  const statDaysLived = document.getElementById('stat-days-lived');

  nameDisplay.textContent = state.fullName;
  ageBadge.textContent = `${state.age} years`;

  // CARD 1: Heartfelt Celebration (Quote removed as requested!)
  mainMessage.innerHTML = `
    <p class="celebration-intro">
      Today is all about YOU, <strong class="accent-text">${escapeHtml(state.fullName)}</strong>!
    </p>
    <p class="celebration-detail">
      You've completed <strong class="accent-text">${state.age} remarkable years</strong> of spreading warmth, strength, and joy to everyone around you. 
      May this milestone birthday bring you boundless laughter, extraordinary adventures, and the glorious fulfillment of every dream you hold dear!
    </p>
  `;

  // CARD 2: Birthday Milestone Stats
  if (statAge) {
    statAge.textContent = `${state.age} years old`;
  }
  if (statNextBday) {
    statNextBday.textContent = state.nextYearBdayFormatted;
  }
  if (statMonthsLived) {
    const totalMonths = state.age * 12;
    statMonthsLived.textContent = `${totalMonths.toLocaleString()} months`;
  }
  const estDays = (state.age * 365 + Math.floor(state.age / 4)).toLocaleString();
  if (statDaysLived) {
    statDaysLived.textContent = `~${estDays} days of joy`;
  }

  // CARD 3: Words of Inspiration (Quote moved here!)
  loadAndDisplayQuote();

  // CARD 4: On This Day in History (2-3 Milestones)
  renderHistoryEvents();
}

/**
 * Loads and displays an inspirational quote in the bottom-left card.
 * Primary source: Public API (https://dummyjson.com/quotes/random)
 * Fallback source: Local database of 55+ diverse quotes (quotes.js)
 */
async function loadAndDisplayQuote(isUserRefresh = false) {
  const quoteContainer = document.getElementById('quote-content');
  const refreshBtn = document.getElementById('btn-refresh-quote');
  if (!quoteContainer) return;

  if (isFetchingQuote) return;
  isFetchingQuote = true;

  if (refreshBtn) {
    refreshBtn.classList.add('loading');
    refreshBtn.setAttribute('aria-busy', 'true');
  }

  // If container is empty (initial Screen 2 load), display placeholder so card layout is rock-solid
  if (!quoteContainer.querySelector('.quote-text')) {
    quoteContainer.innerHTML = `
      <blockquote class="quote-text" style="opacity: 0.65; font-style: italic;">“Finding inspiring words for your special day...”</blockquote>
      <cite class="quote-author" style="opacity: 0.65;">— ✨</cite>
    `;
  }

  try {
    const quoteData = await fetchInspirationalQuote(currentQuote?.text || '');
    if (quoteData && quoteData.text) {
      currentQuote = quoteData;
      quoteContainer.innerHTML = `
        <div class="quote-fade-in">
          <blockquote class="quote-text">"${escapeHtml(quoteData.text)}"</blockquote>
          <cite class="quote-author">— ${escapeHtml(quoteData.author)}</cite>
        </div>
      `;
    }
  } catch (err) {
    console.warn('Quote fetch fallback applied:', err);
    const fallback = getRandomFallbackQuote(currentQuote?.text || '');
    currentQuote = fallback;
    quoteContainer.innerHTML = `
      <div class="quote-fade-in">
        <blockquote class="quote-text">"${escapeHtml(fallback.text)}"</blockquote>
        <cite class="quote-author">— ${escapeHtml(fallback.author)}</cite>
      </div>
    `;
  } finally {
    isFetchingQuote = false;
    if (refreshBtn) {
      refreshBtn.classList.remove('loading');
      refreshBtn.removeAttribute('aria-busy');
    }
  }
}

/**
 * Displays 2 to 3 major historical milestones for the user's birth date
 */
function renderHistoryEvents() {
  const listEl = document.getElementById('history-events-list');
  const events = getHistoryEventsForDate(state.birthMonth, state.birthDay);

  listEl.innerHTML = '';

  events.slice(0, 3).forEach(ev => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <span class="history-bullet"></span>
      <div class="history-text-wrap">
        <strong class="accent-text">In ${ev.year}</strong> — ${escapeHtml(ev.event)}
      </div>
    `;
    listEl.appendChild(li);
  });
}

/**
 * Action Grid Button Handlers
 */
function initActionGrid() {
  // Refresh Quote button in bottom-left card
  document.getElementById('btn-refresh-quote')?.addEventListener('click', async () => {
    await loadAndDisplayQuote(true);
  });

  // 1. Save Wish Card
  document.getElementById('btn-save-card').addEventListener('click', async () => {
    showToast('🎨 Generating your high-res wish card...');
    try {
      await downloadCard(state);
      particleEngine.burst(window.innerWidth / 2, window.innerHeight / 2, 80);
      showToast('🎉 Birthday card downloaded successfully!');
    } catch (e) {
      console.error(e);
      showToast('⚠️ Could not generate card.');
    }
  });

  // 2. WhatsApp Share
  document.getElementById('btn-whatsapp').addEventListener('click', () => {
    const wishText = `🎉 Happy Birthday ${state.fullName}! 🎂\nCelebrating ${state.age} wonderful years today! Wishing you boundless joy, success, and prosperity! ✨\n\nSent with Surprise Birthday Wish 🎈`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(wishText)}`;
    window.open(waUrl, '_blank');
    showToast('💬 Opening WhatsApp...');
  });

  // 3. Add Reminder (Google Calendar Integration)
  document.getElementById('btn-add-reminder')?.addEventListener('click', () => {
    const title = `${state.fullName}'s Birthday`;
    const details = `Happy Birthday ${state.fullName}! Celebrating ${state.ageNextYear} wonderful years of excellence and joy! 🎉🎂\nCreated with Surprise Birthday Wish.`;

    const bdayDate = state.nextYearBdayDateObj || state.nextBdayDateObj || new Date();
    const y = bdayDate.getFullYear();
    const m = String(bdayDate.getMonth() + 1).padStart(2, '0');
    const d = String(bdayDate.getDate()).padStart(2, '0');
    const startStr = `${y}${m}${d}`;

    const nextDay = new Date(bdayDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const ny = nextDay.getFullYear();
    const nm = String(nextDay.getMonth() + 1).padStart(2, '0');
    const nd = String(nextDay.getDate()).padStart(2, '0');
    const endStr = `${ny}${nm}${nd}`;

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(details)}`;

    window.open(gcalUrl, '_blank');
    showToast('📅 Google Calendar reminder opened!');
  });

  // 4. Copy Wish
  document.getElementById('btn-copy-wish').addEventListener('click', async () => {
    const wishText = `Happy Birthday, ${state.fullName}! 🎉 Celebrating ${state.age} incredible years of smiles and inspiration. Wishing you an extraordinary year ahead filled with love, laughter, and great adventures! ✨`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(wishText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = wishText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      particleEngine.burst(window.innerWidth * 0.5, window.innerHeight * 0.7, 40);
      showToast('📋 Birthday wish copied to clipboard!');
    } catch (err) {
      showToast('⚠️ Failed to copy wish.');
    }
  });

  // 5. Get QR Code
  document.getElementById('btn-get-qr').addEventListener('click', async () => {
    const modal = document.getElementById('qr-modal');
    const qrContainer = document.getElementById('qr-code-img');
    const qrText = `Happy Birthday ${state.fullName}! Age: ${state.age} | ${window.location.href}`;

    try {
      const qrDataUrl = await generateQRDataUrl(qrText, {
        width: 260,
        darkColor: '#0f172a',
        lightColor: '#ffffff'
      });
      qrContainer.src = qrDataUrl;
      modal.classList.add('show');
    } catch (err) {
      showToast('⚠️ Failed to generate QR code.');
    }
  });

  // 6. Sign Out
  document.getElementById('btn-sign-out').addEventListener('click', () => {
    signOut();
  });

  // Interactive cake click confetti burst!
  const cakeIllustration = document.getElementById('cake-illustration');
  if (cakeIllustration) {
    cakeIllustration.addEventListener('click', (e) => {
      particleEngine.burst(e.clientX, e.clientY, 80);
      showToast('🎂 Make a wish!');
    });
  }
}

/**
 * Correctly clears all stored user session state (Name, DOB, selected theme)
 * and immediately routes the user back to the initial Welcome Screen (Screen 1).
 */
function signOut() {
  const screen1 = document.getElementById('screen-welcome');
  const screen2 = document.getElementById('screen-surprise');

  // Stop celebration animation & reset gatekeeper UI
  particleEngine?.stopCelebration();
  resetGatekeeperUI();

  // 1. Clear stored user session state
  state.fullName = '';
  state.dob = '';
  state.birthMonth = 1;
  state.birthDay = 1;
  state.birthYear = 2000;
  state.theme = 'golden';
  state.age = 0;
  state.totalMonths = 0;
  state.nextBdayDate = '';
  state.nextBdayYear = 2026;
  state.nextBdayDateObj = null;
  state.nextYearBdayDateObj = null;
  state.nextYearBdayFormatted = '';
  state.daysUntilNextBday = 0;
  state.ageNextYear = 0;
  state.isBirthdayToday = false;

  // 2. Clear input fields and error messages
  const inputName = document.getElementById('input-name');
  const inputDob = document.getElementById('input-dob');
  const nativePicker = document.getElementById('native-dob-picker');
  const formError = document.getElementById('form-error');

  if (inputName) inputName.value = '';
  if (inputDob) inputDob.value = '';
  if (nativePicker) nativePicker.value = '';
  if (formError) formError.textContent = '';

  // 3. Reset theme to default 'golden' and update theme swatches
  applyTheme('golden');
  if (particleEngine) {
    particleEngine.setTheme(THEMES['golden'].accent);
  }
  const swatchContainer = document.getElementById('theme-swatches');
  if (swatchContainer) {
    swatchContainer.querySelectorAll('.swatch-btn').forEach(btn => {
      if (btn.dataset.theme === 'golden') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // 4. Clear any running countdown timers
  if (gatekeeperTimerInterval) {
    clearInterval(gatekeeperTimerInterval);
    gatekeeperTimerInterval = null;
  }

  // 5. Immediately route back to Screen 1 without delay
  screen2.style.display = 'none';
  screen2.classList.remove('fade-in', 'fade-out');

  screen1.style.display = 'flex';
  screen1.classList.remove('fade-out');
  screen1.classList.add('fade-in');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  showToast('👋 Signed out. Ready for the next wish!');
}

/**
 * Initializes QR Modal actions and click-outside listeners
 */
function initModals() {
  const modal = document.getElementById('qr-modal');
  const closeBtn = document.getElementById('btn-close-qr');
  const copyLinkBtn = document.getElementById('btn-copy-qr-link');
  const downloadQrBtn = document.getElementById('btn-download-qr');

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });

  copyLinkBtn?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(window.location.href);
    showToast('🔗 App link copied to clipboard!');
  });

  downloadQrBtn?.addEventListener('click', () => {
    const qrImg = document.getElementById('qr-code-img');
    if (qrImg && qrImg.src) {
      const a = document.createElement('a');
      a.href = qrImg.src;
      a.download = `Birthday_QR_${state.fullName || 'Wish'}.png`;
      a.click();
      showToast('📥 QR code image downloaded!');
    }
  });
}

/**
 * Animated Toast Notification System
 */
let toastTimeout = null;
export function showToast(message) {
  const toast = document.getElementById('app-toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
