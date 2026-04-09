import toast, { Toaster } from 'react-hot-toast';

export const ToastProvider = () => (
  <Toaster
    position="top-center"
    toastOptions={{
      duration: 3000,
      style: {
        background: '#fff',
        color: '#1f2937',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        fontWeight: '500',
      },
      success: {
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      },
      error: {
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      },
    }}
  />
);

export const showToast = {
  voteCast: () => {
    toast.success('🗳️ Vote cast successfully!', {
      style: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: '#fff',
      },
    });
  },

  sabotageActivated: () => {
    toast.error('🚨 SABOTAGE ACTIVATED!', {
      style: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
      },
      duration: 5000,
    });
  },

  whistleBlown: () => {
    toast('📢 Anonymous alert sent', {
      icon: '🔒',
      style: {
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        color: '#fff',
      },
    });
  },

  playerJoined: (playerName: string) => {
    toast.success(`${playerName} joined the game!`, {
      icon: '👋',
      style: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
      },
    });
  },

  actionTaken: () => {
    toast.success('✓ Action completed', {
      style: {
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        color: '#fff',
      },
    });
  },

  gameStarted: () => {
    toast('🎮 Game starting!', {
      icon: '🎉',
      style: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
      },
      duration: 4000,
    });
  },

  roleRevealed: (role: string) => {
    toast(`You are the ${role}!`, {
      icon: '🎭',
      style: {
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        color: '#fff',
        fontSize: '16px',
      },
      duration: 5000,
    });
  },

  playerEliminated: (playerName: string) => {
    toast.error(`${playerName} has been eliminated!`, {
      icon: '💀',
      style: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: '#fff',
      },
      duration: 5000,
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#f3f4f6',
        color: '#1f2937',
      },
    });
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
};
