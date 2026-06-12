/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        ui:   ['Rajdhani', 'sans-serif'],
        data: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg:      '#080b0f',
        surface: '#0d1117',
        card:    '#161b22',
        edge:    '#21262d',
        edge2:   '#30363d',
        accent:  '#00d4ff',
        soft:    '#8b949e',
        faint:   '#484f58',
        ok:      '#3fb950',
        err:     '#f85149',
      },
      keyframes: {
        cardIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.35', transform: 'scale(0.65)' },
        },
        pulseTarget: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(63,185,80,0.3)' },
          '50%':      { boxShadow: '0 0 0 5px rgba(63,185,80,0)' },
        },
        modalIn: {
          '0%':   { opacity: '0', transform: 'scale(0.91) translateY(14px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'card-in':      'cardIn 0.35s ease both',
        'pulse-dot':    'pulseDot 2.4s ease-in-out infinite',
        'pulse-target': 'pulseTarget 2.2s ease-in-out infinite',
        'modal-in':     'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        'fade-in':      'fadeIn 0.18s ease',
      },
    },
  },
  plugins: [],
}
