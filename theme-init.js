// Vzhled nastavíme hned v hlavičce, aby stránka neproblikla světlou barvou
try { if (localStorage.getItem('plab_theme') === 'light') document.documentElement.classList.remove('theme-dark'); } catch (e) {}
