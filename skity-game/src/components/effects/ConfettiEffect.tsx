import confetti from 'canvas-confetti';

export const ConfettiEffect = {
  // Game start celebration
  gameStart: () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  },

  // Vote cast sparkles
  voteCast: () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
    });
  },

  // Sabotage particles
  sabotage: () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    const fire = (particleRatio: number, opts: any) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    };

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#ef4444', '#dc2626', '#991b1b'],
    });

    fire(0.2, {
      spread: 60,
      colors: ['#f97316', '#ea580c', '#c2410c'],
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#fbbf24', '#f59e0b', '#d97706'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#000000', '#1f2937'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#7f1d1d', '#450a0a'],
    });
  },

  // Elimination explosion
  elimination: () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ef4444', '#dc2626', '#b91c1c'],
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ef4444', '#dc2626', '#b91c1c'],
      });
    }, 50);
  },

  // Whistle blown effect
  whistleBlow: () => {
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.5 },
      colors: ['#f97316', '#fb923c', '#fdba74'],
      shapes: ['circle'],
      scalar: 1.2,
    });
  },

  // Player joined
  playerJoined: () => {
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 45,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
    });
  },
};
