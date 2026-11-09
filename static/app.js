const activity = document.querySelector('#activity');
const customHours = document.querySelector('#customHours');
const customMinutes = document.querySelector('#customMinutes');
const customSeconds = document.querySelector('#customSeconds');
const time = document.querySelector('#time');
const status = document.querySelector('#status');
const activityDisplay = document.querySelector('#activityDisplay');
const startButton = document.querySelector('#startButton');
const resetButton = document.querySelector('#resetButton');
const ring = document.querySelector('#ringValue');
const modal = document.querySelector('#timeUpModal');
const modalMessage = document.querySelector('#modalMessage');
const themeToggle = document.querySelector('#themeToggle');
const themeColor = document.querySelector('#themeColor');
const circumference = 2 * Math.PI * 98;
let totalSeconds = 25 * 60, remainingSeconds = totalSeconds, interval = null, soundEnabled = true, alarmInterval = null, alarmTimeout = null;

ring.style.strokeDasharray = circumference;
ring.style.strokeDashoffset = 0;
function inputValue(input, maximum) { return Math.max(0, Math.min(maximum, Number(input.value) || 0)); }
function duration() { return inputValue(customHours, 23) * 3600 + inputValue(customMinutes, 59) * 60 + inputValue(customSeconds, 59); }
function format(value) {
  const hours = Math.floor(value / 3600), minutes = Math.floor((value % 3600) / 60), seconds = value % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
function render() {
  time.textContent = format(remainingSeconds);
  ring.style.strokeDashoffset = circumference * (1 - remainingSeconds / totalSeconds);
  activityDisplay.textContent = activity.value.trim().toUpperCase() || 'READY WHEN YOU ARE';
}
function setDuration() { if (!interval) { totalSeconds = Math.max(1, duration()); remainingSeconds = totalSeconds; render(); } }
function beep() {
  if (!soundEnabled || !window.AudioContext) return;
  const audio = new AudioContext(), oscillator = audio.createOscillator(), gain = audio.createGain();
  oscillator.frequency.value = 660; gain.gain.setValueAtTime(.06, audio.currentTime); oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .35);
}
function stopAlarm() { clearInterval(alarmInterval); clearTimeout(alarmTimeout); alarmInterval = null; alarmTimeout = null; }
function playAlarm() {
  stopAlarm();
  if (!soundEnabled) return;
  beep();
  alarmInterval = setInterval(beep, 700);
  alarmTimeout = setTimeout(stopAlarm, 8000);
}
function finish() {
  clearInterval(interval); interval = null; startButton.innerHTML = 'Start timer <span>→</span>'; status.textContent = 'COMPLETE'; status.classList.add('complete'); playAlarm();
  const title = activity.value.trim() || 'your activity'; modalMessage.textContent = `Great work — your ${title} session is complete.`; modal.classList.remove('hidden');
}
function toggleTimer() {
  if (interval) { clearInterval(interval); interval = null; startButton.innerHTML = 'Resume timer <span>→</span>'; status.textContent = 'PAUSED'; return; }
  if (remainingSeconds === 0) setDuration();
  status.textContent = 'IN PROGRESS'; status.classList.remove('complete'); startButton.textContent = 'Pause timer';
  interval = setInterval(() => { remainingSeconds--; render(); if (remainingSeconds <= 0) finish(); }, 1000);
}
document.querySelectorAll('[data-minutes]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-minutes]').forEach(b => b.classList.remove('selected')); button.classList.add('selected'); customHours.value = 0; customMinutes.value = button.dataset.minutes; customSeconds.value = 0; setDuration(); }));
[customHours, customMinutes, customSeconds].forEach(input => input.addEventListener('input', () => { document.querySelectorAll('[data-minutes]').forEach(b => b.classList.remove('selected')); setDuration(); }));
activity.addEventListener('input', render); startButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', () => { clearInterval(interval); interval = null; stopAlarm(); setDuration(); startButton.innerHTML = 'Start timer <span>→</span>'; status.textContent = 'READY'; status.classList.remove('complete'); });
document.querySelector('#doneButton').addEventListener('click', () => { stopAlarm(); modal.classList.add('hidden'); });
document.querySelector('#soundToggle').addEventListener('click', event => { soundEnabled = !soundEnabled; event.currentTarget.setAttribute('aria-pressed', soundEnabled); event.currentTarget.innerHTML = soundEnabled ? '🔔 <span>Sound on</span>' : '🔕 <span>Sound off</span>'; });
function setTheme(theme) { const dark = theme === 'dark'; document.body.classList.toggle('dark', dark); themeToggle.textContent = dark ? '☀' : '☾'; themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode'); themeColor.content = dark ? '#181a20' : '#f7f8fc'; localStorage.setItem('sat-theme', theme); }
themeToggle.addEventListener('click', () => setTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));
setTheme(localStorage.getItem('sat-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
render();
