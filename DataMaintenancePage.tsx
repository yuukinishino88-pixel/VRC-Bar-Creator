@import "tailwindcss";

@theme {
  --color-gold-500: #d4af37;
  --color-gold-400: #e5c158;
  --color-wine-900: #4e070c;
  --color-wine-800: #7b1113;
  --color-navy-900: #0a1128;
  --color-navy-800: #1c2541;
  
  --font-serif: 'Cormorant Garamond', 'Playfair Display', serif;
  --font-sans: 'Inter', system-ui, sans-serif;
}

body {
  font-family: var(--font-sans);
  background-color: #050505; /* Deep black */
  color: #e0e0e0;
}

.font-lux {
  font-family: var(--font-serif);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 175, 55, 0.2); /* Gold border with low opacity */
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.gold-gradient-text {
  background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.gold-border {
  border: 1px solid #d4af37;
}

.btn-gold {
  background: linear-gradient(135deg, #d4af37, #b38728);
  color: #050505;
  font-weight: 600;
  transition: all 0.3s ease;
}
.btn-gold:hover {
  background: linear-gradient(135deg, #e5c158, #d4af37);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
}

.btn-outline-gold {
  background: transparent;
  border: 1px solid #d4af37;
  color: #d4af37;
  font-weight: 600;
  transition: all 0.3s ease;
}
.btn-outline-gold:hover {
  background: rgba(212, 175, 55, 0.1);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.glass-silhouette-male {
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.9));
  clip-path: polygon(20% 100%, 80% 100%, 75% 20%, 60% 10%, 40% 10%, 25% 20%);
}

.glass-silhouette-female {
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.9));
  clip-path: polygon(25% 100%, 75% 100%, 70% 30%, 60% 15%, 40% 15%, 30% 30%);
}
