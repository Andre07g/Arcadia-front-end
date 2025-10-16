const progress = document.getElementById('progress');
const percentage = document.getElementById('percentage');
const startBtn = document.getElementById('start-btn');

let load = 0;
let loading = false;

startBtn.addEventListener('click', () => {
  if (loading) return;
  loading = true;
  startBtn.disabled = true;

  const interval = setInterval(() => {
    load += 2;
    progress.style.width = `${load}%`;
    percentage.textContent = `${load}%`;

    if (load >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        document.body.innerHTML = `
          <div class="container">
            <h1 class="title">WELCOME TO ARCADIA</h1>
            <p style="font-size:10px;">Press any key to continue...</p>
          </div>
        `;
      }, 500);
    }
  }, 150);
});
