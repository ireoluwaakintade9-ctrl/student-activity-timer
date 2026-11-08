const activity = document.querySelector('#activity');
const customMinutes = document.querySelector('#customMinutes');
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
let totalSeconds = 25 * 60, remainingSeconds = totalSeconds, interval = null, soundEnabled = true;

ring.style.strokeDasharray = circumference;
ring.style.strokeDashoffset = 0;
function duration() { return Math.max(1, Math.min(480, Number(customMinutes.value) || 25)); }
function format(value) { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }
function render() {
  time.textContent = format(remainingSeconds);
  ring.style.strokeDashoffset = circumference * (1 - remainingSeconds / totalSeconds);
  activityDisplay.textContent = activity.value.trim().toUpperCase() || 'READY WHEN YOU ARE';
}
function setDuration() { if (!interval) { totalSeconds = duration() * 60; remainingSeconds = totalSeconds; render(); } }
function beep() {
  if (!soundEnabled || !window.AudioContext) return;
  const audio = new AudioContext(), oscillator = audio.createOscillator(), gain = audio.createGain();
  oscillator.frequency.value = 660; gain.gain.setValueAtTime(.06, audio.currentTime); oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .35);
}
function finish() {
  clearInterval(interval); interval = null; startButton.innerHTML = 'Start timer <span>→</span>'; status.textContent = 'COMPLETE'; status.classList.add('complete'); beep();
  const title = activity.value.trim() || 'your activity'; modalMessage.textContent = `Great work — your ${title} session is complete.`; modal.classList.remove('hidden');
}
function toggleTimer() {
  if (interval) { clearInterval(interval); interval = null; startButton.innerHTML = 'Resume timer <span>→</span>'; status.textContent = 'PAUSED'; return; }
  if (remainingSeconds === 0) setDuration();
  status.textContent = 'IN PROGRESS'; status.classList.remove('complete'); startButton.textContent = 'Pause timer';
  interval = setInterval(() => { remainingSeconds--; render(); if (remainingSeconds <= 0) finish(); }, 1000);
}
document.querySelectorAll('[data-minutes]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-minutes]').forEach(b => b.classList.remove('selected')); button.classList.add('selected'); customMinutes.value = button.dataset.minutes; setDuration(); }));
customMinutes.addEventListener('input', () => { document.querySelectorAll('[data-minutes]').forEach(b => b.classList.remove('selected')); setDuration(); });
activity.addEventListener('input', render); startButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', () => { clearInterval(interval); interval = null; setDuration(); startButton.innerHTML = 'Start timer <span>→</span>'; status.textContent = 'READY'; status.classList.remove('complete'); });
document.querySelector('#doneButton').addEventListener('click', () => modal.classList.add('hidden'));
document.querySelector('#soundToggle').addEventListener('click', event => { soundEnabled = !soundEnabled; event.currentTarget.setAttribute('aria-pressed', soundEnabled); event.currentTarget.innerHTML = soundEnabled ? '🔔 <span>Sound on</span>' : '🔕 <span>Sound off</span>'; });
function setTheme(theme) { const dark = theme === 'dark'; document.body.classList.toggle('dark', dark); themeToggle.textContent = dark ? '☀' : '☾'; themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode'); themeColor.content = dark ? '#181a20' : '#f7f8fc'; localStorage.setItem('sat-theme', theme); }
themeToggle.addEventListener('click', () => setTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));
setTheme(localStorage.getItem('sat-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
render();
