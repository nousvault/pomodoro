const STORAGE_KEY = "nousvault-pomodoro-state-v1";
const IDLE_AFTER_MS = 90_000;
const ALARM_PLAY_COUNT = 3;
const ALARM_PAUSE_MS = 1_000;

const AUDIO_OPTIONS = [
  { label: "None", value: "None" },
  { label: "Cat 1", value: "assets/audio/cat-1.wav" },
  { label: "Cat 2", value: "assets/audio/cat-2.ogg" },
  { label: "Digital", value: "assets/audio/digital.flac" },
  { label: "Door Chime", value: "assets/audio/door-chime.wav" },
];

const MODES = {
  focus: { label: "Focus", defaultMinutes: 25 },
  short: { label: "Short Break", defaultMinutes: 5 },
  long: { label: "Long Break", defaultMinutes: 15 },
};

const DEFAULT_SETTINGS = {
  focusMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  longBreakInterval: 4,
  autoCheckTasks: false,
  checkToBottom: true,
  alarmSound: "assets/audio/door-chime.wav",
  alarmVolume: 50,
  alarmRepeat: ALARM_PLAY_COUNT,
  themeColor: "#FCD660",
  hourFormat: "24",
};

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const DEFAULT_TASKS = [
  { id: createId(), text: "Sketch the main landing page hero layout", done: true },
  { id: createId(), text: "Refine Pomodoro interaction styles", done: false },
];

const SPEECH = {
  cover: "Welcome back. Pick a task, press start, and let the small steps stack up.",
  focus: "Focus time, let's get sketching!",
  almost: "A little more. The finish line is already in sight.",
  timesup: "Time's up. Pencils down for one proud second.",
  done: "Done. That focus session counts.",
  break: "Rest time. Stretch, breathe, and let the page cool down.",
  ignored: "Still here. The timer is waiting for your next tiny brave move.",
};

const els = {
  tabs: [...document.querySelectorAll(".tab")],
  timerDisplay: document.querySelector("#timerDisplay"),
  startStop: document.querySelector("#startStop"),
  runnerCat: document.querySelector("#runnerCat"),
  characterArt: document.querySelector("#characterArt"),
  speechBubble: document.querySelector("#speechBubble"),
  mainCard: document.querySelector(".main-card"),
  activitySummary: document.querySelector("#activitySummary"),
  openActivitySummary: document.querySelector("#openActivitySummary"),
  backToTimer: document.querySelector("#backToTimer"),
  summaryHours: document.querySelector("#summaryHours"),
  summaryDays: document.querySelector("#summaryDays"),
  summaryStreak: document.querySelector("#summaryStreak"),
  summaryBars: document.querySelector("#summaryBars"),
  summaryPeriod: document.querySelector("#summaryPeriod"),
  summaryPrev: document.querySelector("#summaryPrev"),
  summaryNext: document.querySelector("#summaryNext"),
  rangeTabs: [...document.querySelectorAll(".range-tab")],
  taskList: document.querySelector("#taskList"),
  addTask: document.querySelector("#addTask"),
  completedCount: document.querySelector("#completedCount"),
  totalFocus: document.querySelector("#totalFocus"),
  navHome: document.querySelector("#navHome"),
  navSummary: document.querySelector("#navSummary"),
  settingsOpen: document.querySelector("#settingsOpen"),
  settingsClose: document.querySelector("#settingsClose"),
  settingsOverlay: document.querySelector("#settingsOverlay"),
  settingsSearch: document.querySelector("#settingsSearch"),
  settingsEmpty: document.querySelector("#settingsEmpty"),
  settingsForm: document.querySelector("#settingsForm"),
  settingsSections: [...document.querySelectorAll(".settings-section")],
  settingsNavLinks: [...document.querySelectorAll(".settings-rail a")],
  settingFocusMinutes: document.querySelector("#settingFocusMinutes"),
  settingShortMinutes: document.querySelector("#settingShortMinutes"),
  settingLongMinutes: document.querySelector("#settingLongMinutes"),
  settingAutoStartBreaks: document.querySelector("#settingAutoStartBreaks"),
  settingAutoStartPomodoros: document.querySelector("#settingAutoStartPomodoros"),
  settingLongBreakInterval: document.querySelector("#settingLongBreakInterval"),
  settingAutoCheckTasks: document.querySelector("#settingAutoCheckTasks"),
  settingCheckToBottom: document.querySelector("#settingCheckToBottom"),
  settingAlarmSound: document.querySelector("#settingAlarmSound"),
  testAlarmSound: document.querySelector("#testAlarmSound"),
  settingAlarmVolume: document.querySelector("#settingAlarmVolume"),
  alarmVolumeValue: document.querySelector("#alarmVolumeValue"),
  settingAlarmRepeat: document.querySelector("#settingAlarmRepeat"),
  settingHourFormat: document.querySelector("#settingHourFormat"),
  swatches: [...document.querySelectorAll(".swatch")],
};

let state = loadState();
let tickTimer = null;
let idleTimer = null;
let finishTimer = null;
let summaryRange = "week";
let summaryOffset = 0;

function loadState() {
  const fallback = {
    mode: "focus",
    remaining: DEFAULT_SETTINGS.focusMinutes * 60,
    running: false,
    startedAt: null,
    endsAt: null,
    completedFocus: 0,
    totalFocusSeconds: 0,
    tasks: DEFAULT_TASKS,
    characterState: "cover",
    focusStreak: 0,
    sessions: [],
    settings: DEFAULT_SETTINGS,
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !MODES[saved.mode]) return fallback;
    const settings = normalizeSettings(saved.settings);

    return {
      ...fallback,
      ...saved,
      running: false,
      startedAt: null,
      endsAt: null,
      settings,
      remaining: Number.isFinite(saved.remaining) ? saved.remaining : modeSeconds(saved.mode, settings),
      tasks: Array.isArray(saved.tasks) && saved.tasks.length ? saved.tasks : DEFAULT_TASKS,
      sessions: Array.isArray(saved.sessions) ? saved.sessions : [],
      characterState: saved.characterState === "ignored" ? "cover" : saved.characterState || "cover",
    };
  } catch {
    return fallback;
  }
}

function normalizeSettings(settings = {}) {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  const validAudioValues = AUDIO_OPTIONS.map((option) => option.value);
  return {
    focusMinutes: clampNumber(merged.focusMinutes, 1, 180, DEFAULT_SETTINGS.focusMinutes),
    shortMinutes: clampNumber(merged.shortMinutes, 1, 60, DEFAULT_SETTINGS.shortMinutes),
    longMinutes: clampNumber(merged.longMinutes, 1, 90, DEFAULT_SETTINGS.longMinutes),
    autoStartBreaks: Boolean(merged.autoStartBreaks),
    autoStartPomodoros: Boolean(merged.autoStartPomodoros),
    longBreakInterval: clampNumber(merged.longBreakInterval, 2, 12, DEFAULT_SETTINGS.longBreakInterval),
    autoCheckTasks: Boolean(merged.autoCheckTasks),
    checkToBottom: Boolean(merged.checkToBottom),
    alarmSound: validAudioValues.includes(merged.alarmSound) ? merged.alarmSound : DEFAULT_SETTINGS.alarmSound,
    alarmVolume: clampNumber(merged.alarmVolume, 0, 100, DEFAULT_SETTINGS.alarmVolume),
    alarmRepeat: ALARM_PLAY_COUNT,
    themeColor: typeof merged.themeColor === "string" ? merged.themeColor : DEFAULT_SETTINGS.themeColor,
    hourFormat: merged.hourFormat === "12" ? "12" : "24",
  };
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function modeMinutes(mode, settings = state?.settings || DEFAULT_SETTINGS) {
  if (mode === "short") return settings.shortMinutes;
  if (mode === "long") return settings.longMinutes;
  return settings.focusMinutes;
}

function modeSeconds(mode, settings = state?.settings || DEFAULT_SETTINGS) {
  return modeMinutes(mode, settings) * 60;
}

function saveState() {
  const persisted = {
    ...state,
    running: false,
    startedAt: null,
    endsAt: null,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getProgress() {
  const duration = modeSeconds(state.mode);
  return Math.min(1, Math.max(0, 1 - state.remaining / duration));
}

function setCharacter(nextState) {
  state.characterState = nextState;
  els.characterArt.className = `cat-illustration state-${nextState}`;
  els.speechBubble.textContent = SPEECH[nextState];
}

function updateTimerFromClock() {
  if (!state.running || !state.endsAt) return;
  state.remaining = Math.max(0, (state.endsAt - Date.now()) / 1000);

  if (state.remaining <= 0) {
    completeSession();
    return;
  }

  const remainingRatio = state.remaining / modeSeconds(state.mode);
  if (state.mode === "focus" && remainingRatio <= 0.1) {
    setCharacter("almost");
  }

  render();
}

function startTimer() {
  clearTimeout(finishTimer);
  clearTimeout(idleTimer);
  state.running = true;
  state.startedAt = Date.now();
  state.endsAt = state.startedAt + state.remaining * 1000;
  setCharacter(state.mode === "focus" ? "focus" : "break");
  tickTimer = setInterval(updateTimerFromClock, 250);
  render();
}

function stopTimer() {
  updateTimerFromClock();
  state.running = false;
  state.startedAt = null;
  state.endsAt = null;
  clearInterval(tickTimer);
  scheduleIdle();
  saveState();
  render();
}

function resetMode(mode) {
  state.mode = mode;
  state.remaining = modeSeconds(mode);
  state.running = false;
  state.startedAt = null;
  state.endsAt = null;
  clearInterval(tickTimer);
  clearTimeout(finishTimer);
  setCharacter(mode === "focus" ? "cover" : "break");
  scheduleIdle();
  saveState();
  render();
}

function completeSession() {
  clearInterval(tickTimer);
  state.running = false;
  state.remaining = 0;
  state.startedAt = null;
  state.endsAt = null;
  setCharacter("timesup");

  if (state.mode === "focus") {
    state.completedFocus += 1;
    state.focusStreak += 1;
    const focusSeconds = modeSeconds("focus");
    state.totalFocusSeconds += focusSeconds;
    state.sessions.push({
      id: createId(),
      completedAt: new Date().toISOString(),
      focusSeconds,
    });
    maybeAutoCheckTask();
  } else {
    state.focusStreak = state.mode === "long" ? 0 : state.focusStreak;
  }

  saveState();
  render();
  playAlarmSequence();

  finishTimer = setTimeout(() => {
    setCharacter("done");
    const nextMode = getNextModeAfterCompletion();
    state.mode = nextMode;
    state.remaining = modeSeconds(nextMode);
    saveState();
    render();
    scheduleIdle();
    if (shouldAutoStart(nextMode)) startTimer();
  }, 2300);
}

async function playAlarmSequence() {
  if (state.settings.alarmSound === "None") return;

  for (let index = 0; index < ALARM_PLAY_COUNT; index += 1) {
    try {
      await playAudioOnce(state.settings.alarmSound, state.settings.alarmVolume / 100);
      if (index < ALARM_PLAY_COUNT - 1) {
        await wait(ALARM_PAUSE_MS);
      }
    } catch (error) {
      console.warn("Alarm sound could not play.", error);
      break;
    }
  }
}

function playAudioOnce(src, volume) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(src);
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.addEventListener("ended", resolve, { once: true });
    audio.addEventListener("error", reject, { once: true });
    audio.play().catch(reject);
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function testSelectedAudio() {
  updateSettingsFromForm();
  const src = state.settings.alarmSound;
  const volume = state.settings.alarmVolume / 100;
  if (src === "None") return;

  const button = els.testAlarmSound;
  button.disabled = true;
  button.textContent = "Playing";

  try {
    await playAudioOnce(src, volume);
  } catch (error) {
    console.warn("Test sound could not play.", error);
  } finally {
    button.disabled = false;
    button.textContent = "Test";
  }
}

function getNextModeAfterCompletion() {
  if (state.mode !== "focus") return "focus";
  return state.focusStreak % state.settings.longBreakInterval === 0 ? "long" : "short";
}

function shouldAutoStart(nextMode) {
  if (nextMode === "focus") return state.settings.autoStartPomodoros;
  return state.settings.autoStartBreaks;
}

function maybeAutoCheckTask() {
  if (!state.settings.autoCheckTasks) return;
  const task = state.tasks.find((candidate) => !candidate.done);
  if (!task) return;
  task.done = true;
  if (state.settings.checkToBottom) {
    state.tasks = [...state.tasks.filter((candidate) => candidate.id !== task.id), task];
  }
  renderTasks();
}

function scheduleIdle() {
  clearTimeout(idleTimer);
  if (state.running) return;
  idleTimer = setTimeout(() => {
    if (!state.running) {
      setCharacter("ignored");
      saveState();
      render();
    }
  }, IDLE_AFTER_MS);
}

function renderTabs() {
  els.tabs.forEach((tab) => {
    const active = tab.dataset.mode === state.mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function renderTasks() {
  els.taskList.innerHTML = "";

  state.tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark ${task.text || "task"} complete`);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveState();
    });

    const input = document.createElement("input");
    input.className = "task-text";
    input.value = task.text;
    input.placeholder = "New sketch task";
    input.addEventListener("input", () => {
      task.text = input.value;
      saveState();
    });
    input.addEventListener("focus", markAction);

    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.type = "button";
    remove.textContent = "x";
    remove.setAttribute("aria-label", `Delete ${task.text || "task"}`);
    remove.addEventListener("click", () => {
      state.tasks = state.tasks.filter((candidate) => candidate.id !== task.id);
      saveState();
      renderTasks();
    });

    item.append(checkbox, input, remove);
    els.taskList.append(item);
  });
}

function render() {
  els.timerDisplay.textContent = formatTime(state.remaining);
  els.startStop.textContent = state.running ? "STOP" : "START";
  els.runnerCat.style.setProperty("--progress", getProgress());
  els.runnerCat.classList.toggle("is-running", state.running);
  els.completedCount.textContent = state.completedFocus;
  els.totalFocus.textContent = `${Math.round(state.totalFocusSeconds / 60)}m`;
  renderTabs();
  if (!els.activitySummary.hidden) renderActivitySummary();
}

function showActivitySummary() {
  summaryRange = "week";
  summaryOffset = 0;
  document.body.classList.add("summary-open");
  els.mainCard.classList.add("summary-mode");
  els.activitySummary.hidden = false;
  renderActivitySummary();
  els.backToTimer.focus();
}

function showTimerView() {
  els.activitySummary.hidden = true;
  els.mainCard.classList.remove("summary-mode");
  document.body.classList.remove("summary-open");
  els.openActivitySummary.focus();
}

function renderActivitySummary() {
  const sessions = getFocusSessions();
  const totalSeconds = sessions.reduce((sum, session) => sum + session.focusSeconds, 0);
  const uniqueDays = new Set(sessions.map((session) => toDateKey(new Date(session.completedAt))));

  els.summaryHours.textContent = formatHours(totalSeconds);
  els.summaryDays.textContent = uniqueDays.size ? uniqueDays.size : "--";
  els.summaryStreak.textContent = getDayStreak(uniqueDays);

  const chart = getChartData(sessions, summaryRange, summaryOffset);
  els.summaryPeriod.textContent = chart.periodLabel;
  els.summaryBars.innerHTML = "";
  chart.items.forEach((item) => {
    const bar = document.createElement("div");
    const barHeight = Math.max(2, (item.hours / chart.maxHours) * 145);
    bar.className = "bar-item";
    bar.innerHTML = `
      <div class="bar-track">
        <div class="bar-fill" style="--bar-height: ${barHeight.toFixed(1)}px" title="${item.label}: ${item.hours.toFixed(2)}h"></div>
      </div>
      <div class="bar-label">${item.label}</div>
    `;
    els.summaryBars.append(bar);
  });

  els.rangeTabs.forEach((tab) => {
    const active = tab.dataset.range === summaryRange;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function getFocusSessions() {
  if (state.sessions.length) return state.sessions;
  if (!state.totalFocusSeconds) return [];
  return [
    {
      id: "legacy-total",
      completedAt: new Date().toISOString(),
      focusSeconds: state.totalFocusSeconds,
    },
  ];
}

function formatHours(seconds) {
  if (!seconds) return "--";
  const hours = seconds / 3600;
  if (hours < 1) return `${Math.round(seconds / 60)}m`;
  return `${Number(hours.toFixed(1))}h`;
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDayStreak(uniqueDays) {
  if (!uniqueDays.size) return "--";
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (uniqueDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak || "--";
}

function getChartData(sessions, range, offset) {
  if (range === "month") return getMonthChart(sessions, offset);
  if (range === "year") return getYearChart(sessions, offset);
  return getWeekChart(sessions, offset);
}

function getWeekChart(sessions, offset) {
  const start = startOfWeek(new Date());
  start.setDate(start.getDate() + offset * 7);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const items = labels.map((label, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return { label, start: day, end: addDays(day, 1), hours: 0 };
  });
  fillChartHours(items, sessions);
  return {
    items,
    maxHours: getMaxHours(items),
    periodLabel: offset === 0 ? "This Week" : formatPeriodRange(items[0].start, items[6].start),
  };
}

function getMonthChart(sessions, offset) {
  const month = new Date();
  month.setMonth(month.getMonth() + offset, 1);
  month.setHours(0, 0, 0, 0);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const items = Array.from({ length: daysInMonth }, (_, index) => {
    const day = new Date(year, monthIndex, index + 1);
    return { label: String(index + 1), start: day, end: addDays(day, 1), hours: 0 };
  });
  fillChartHours(items, sessions);
  return {
    items,
    maxHours: getMaxHours(items),
    periodLabel: month.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
  };
}

function getYearChart(sessions, offset) {
  const year = new Date().getFullYear() + offset;
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const items = labels.map((label, index) => ({
    label,
    start: new Date(year, index, 1),
    end: new Date(year, index + 1, 1),
    hours: 0,
  }));
  fillChartHours(items, sessions);
  return {
    items,
    maxHours: getMaxHours(items),
    periodLabel: String(year),
  };
}

function fillChartHours(items, sessions) {
  sessions.forEach((session) => {
    const completedAt = new Date(session.completedAt);
    const item = items.find((candidate) => completedAt >= candidate.start && completedAt < candidate.end);
    if (item) item.hours += session.focusSeconds / 3600;
  });
}

function getMaxHours(items) {
  return Math.max(1, ...items.map((item) => item.hours));
}

function startOfWeek(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  return start;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatPeriodRange(start, end) {
  return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function renderSettings() {
  renderAudioOptions(els.settingAlarmSound, state.settings.alarmSound);
  els.settingFocusMinutes.value = state.settings.focusMinutes;
  els.settingShortMinutes.value = state.settings.shortMinutes;
  els.settingLongMinutes.value = state.settings.longMinutes;
  els.settingAutoStartBreaks.checked = state.settings.autoStartBreaks;
  els.settingAutoStartPomodoros.checked = state.settings.autoStartPomodoros;
  els.settingLongBreakInterval.value = state.settings.longBreakInterval;
  els.settingAutoCheckTasks.checked = state.settings.autoCheckTasks;
  els.settingCheckToBottom.checked = state.settings.checkToBottom;
  els.settingAlarmSound.value = state.settings.alarmSound;
  els.settingAlarmVolume.value = state.settings.alarmVolume;
  els.alarmVolumeValue.value = state.settings.alarmVolume;
  els.settingAlarmRepeat.value = state.settings.alarmRepeat;
  els.settingHourFormat.value = state.settings.hourFormat;
  els.swatches.forEach((swatch) => {
    swatch.classList.toggle("is-active", swatch.dataset.theme.toLowerCase() === state.settings.themeColor.toLowerCase());
  });
}

function renderAudioOptions(select, selectedValue) {
  const currentValues = [...select.options].map((option) => option.value).join("|");
  const nextValues = AUDIO_OPTIONS.map((option) => option.value).join("|");
  if (currentValues !== nextValues) {
    select.replaceChildren(
      ...AUDIO_OPTIONS.map((option) => {
        const element = document.createElement("option");
        element.value = option.value;
        element.textContent = option.label;
        return element;
      }),
    );
  }
  select.value = selectedValue;
}

function applyTheme() {
  document.documentElement.style.setProperty("--yellow", state.settings.themeColor);
}

function openSettings() {
  renderSettings();
  filterSettings();
  els.settingsOverlay.hidden = false;
  document.body.classList.add("modal-open");
  els.settingsClose.focus();
}

function closeSettings() {
  els.settingsOverlay.hidden = true;
  document.body.classList.remove("modal-open");
  els.settingsOpen.focus();
}

function filterSettings() {
  const query = els.settingsSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  els.settingsSections.forEach((section) => {
    const matches = !query || section.textContent.toLowerCase().includes(query);
    section.classList.toggle("is-filtered-out", !matches);
    if (matches) visibleCount += 1;
  });

  els.settingsNavLinks.forEach((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    link.classList.toggle("is-filtered-out", target?.classList.contains("is-filtered-out"));
  });

  els.settingsEmpty.classList.toggle("is-visible", visibleCount === 0);
}

function scrollSettingsSection(sectionId) {
  const section = document.querySelector(sectionId);
  if (!section || section.classList.contains("is-filtered-out")) return;

  const formTop = els.settingsForm.getBoundingClientRect().top;
  const sectionTop = section.getBoundingClientRect().top;
  els.settingsForm.scrollTo({
    top: els.settingsForm.scrollTop + sectionTop - formTop,
    behavior: "smooth",
  });

  els.settingsNavLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === sectionId);
  });
}

function updateSettingsFromForm() {
  state.settings = normalizeSettings({
    ...state.settings,
    focusMinutes: els.settingFocusMinutes.value,
    shortMinutes: els.settingShortMinutes.value,
    longMinutes: els.settingLongMinutes.value,
    autoStartBreaks: els.settingAutoStartBreaks.checked,
    autoStartPomodoros: els.settingAutoStartPomodoros.checked,
    longBreakInterval: els.settingLongBreakInterval.value,
    autoCheckTasks: els.settingAutoCheckTasks.checked,
    checkToBottom: els.settingCheckToBottom.checked,
    alarmSound: els.settingAlarmSound.value,
    alarmVolume: els.settingAlarmVolume.value,
    alarmRepeat: els.settingAlarmRepeat.value,
    hourFormat: els.settingHourFormat.value,
  });

  if (!state.running) {
    state.remaining = modeSeconds(state.mode);
  }

  applyTheme();
  renderSettings();
  saveState();
  render();
}

function markAction() {
  if (!state.running && state.characterState === "ignored") {
    setCharacter(state.mode === "focus" ? "cover" : "break");
  }
  scheduleIdle();
}

els.startStop.addEventListener("click", () => {
  markAction();
  if (state.running) {
    stopTimer();
  } else {
    startTimer();
  }
});

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    markAction();
    resetMode(tab.dataset.mode);
  });
});

els.addTask.addEventListener("click", () => {
  markAction();
  const task = { id: createId(), text: "", done: false };
  state.tasks.push(task);
  saveState();
  renderTasks();
  const input = els.taskList.lastElementChild?.querySelector(".task-text");
  input?.focus();
});

els.openActivitySummary.addEventListener("click", showActivitySummary);
els.navSummary.addEventListener("click", () => {
  markAction();
  showActivitySummary();
});
els.navHome.addEventListener("click", () => {
  markAction();
  showTimerView();
  els.navHome.focus();
});
els.backToTimer.addEventListener("click", showTimerView);

els.rangeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    summaryRange = tab.dataset.range;
    summaryOffset = 0;
    renderActivitySummary();
  });
});

els.summaryPrev.addEventListener("click", () => {
  summaryOffset -= 1;
  renderActivitySummary();
});

els.summaryNext.addEventListener("click", () => {
  summaryOffset += 1;
  renderActivitySummary();
});

els.settingsOpen.addEventListener("click", () => {
  markAction();
  openSettings();
});

els.settingsClose.addEventListener("click", closeSettings);

els.settingsOverlay.addEventListener("click", (event) => {
  if (event.target === els.settingsOverlay) closeSettings();
});

els.settingsForm.addEventListener("input", updateSettingsFromForm);
els.settingsForm.addEventListener("change", updateSettingsFromForm);

els.settingsSearch.addEventListener("input", filterSettings);

els.testAlarmSound.addEventListener("click", () => {
  testSelectedAudio();
});

els.settingsNavLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    scrollSettingsSection(link.getAttribute("href"));
  });
});

els.swatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    state.settings.themeColor = swatch.dataset.theme;
    applyTheme();
    renderSettings();
    saveState();
  });
});

document.addEventListener("pointerdown", markAction);
document.addEventListener("keydown", markAction);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.settingsOverlay.hidden) closeSettings();
});

applyTheme();
renderTasks();
setCharacter(state.characterState);
render();
renderSettings();
scheduleIdle();
