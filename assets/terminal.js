// Create terminal instance
const term = new Terminal({
  cursorBlink: true,
  scrollback: 0,       // no scroll
  disableStdin: false  // initially allow input
});
term.open(document.getElementById('terminal'));

// Optional: fit terminal to full window
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
fitAddon.fit();

// Detect touch device
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouch) {
  term.setOption('disableStdin', true); // mobile cannot type
  document.getElementById('dock').classList.remove('hidden');
}

// Example welcome message
term.writeln("Welcome to portal.ujayden.com!");
term.writeln("Type 'help' to see available commands.");
