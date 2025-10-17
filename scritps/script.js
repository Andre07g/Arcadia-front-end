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
    load += 5;
    progress.style.width = `${load}%`;
    percentage.textContent = `${load}%`;

    if (load >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        // Pantalla final con animación retro
        document.body.innerHTML = `
          <div class="container fade-in">
            <h1 class="title neon-text">BIENVENIDO A ARCADIA</h1>
            <p class="continue-text">Presione cualquier tecla para continuar...</p>
              <div class="stars"></div>
              <div class="stars2"></div>
              <div class="stars3"></div>
          </div>
        `;

        // Añadimos el listener de teclado (una sola vez)
        document.addEventListener(
          'keydown',
          () => {
            document.querySelector('.container').classList.add('fade-out');
            setTimeout(() => {
              window.location.href = '../pages/select.html';
            }, 800);
          },
          { once: true }
        );
      }, 500);
    }
  }, 150);
});
