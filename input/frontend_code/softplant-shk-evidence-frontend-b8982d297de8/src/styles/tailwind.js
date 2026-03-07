const plugin = require('tailwindcss/plugin');

const base = plugin(({ addUtilities }) => {
  addUtilities({
    '.z-uppermost': {
      'z-index': '9999',
    },
    '.animate-in-350': {
      'animation-name': 'enter',
      'animation-duration': '350ms',
    },
    '.animate-out-350': {
      'animation-name': 'exit',
      'animation-duration': '350ms',
    },
    '.modal-scroll::-webkit-scrollbar': {
      width: '10px',
    },
    '.modal-scroll::-webkit-scrollbar-thumb': {
      'background-color': '#d4d4d4',
      'background-clip': 'padding-box',
    },
    '.modal-scroll::-webkit-scrollbar-track': {
      'background-color': '#8A8A8A',
      'box-shadow': 'inset 0px 0px 5px #8A8A8A',
    },
    '.no-scrollbar::-webkit-scrollbar': {
      display: 'none',
    },
    '.no-scrollbar': {
      '-ms-overflow-style': 'none' /* IE and Edge */,
      'scrollbar-width': 'none' /* Firefox */,
    },

    '.scroll-bar::-webkit-scrollbar': {
      width: '10px',
    },
    '.scroll-bar::-webkit-scrollbar-thumb': {
      'background-color': '#d1d5db',
      'border-radius': '10px',
      'background-clip': 'padding-box',
      border: '2px solid transparent',
    },
    '.scroll-bar::-webkit-scrollbar-track': {
      'background-color': 'white',
      'border-radius': '10px',
      'box-shadow': 'inset 0px 0px 5px white',
    },
    '.fade-in': {
      transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      opacity: 0,
      transform: 'translateY(0) translateX(50px)',
    },
    '.fade-in-active': {
      opacity: 1,
      transform: 'translateY(0) translateX(0)',
    },
    '.shadow-ring-bottom': {
      'box-shadow': '0px 1px 0 0 rgba(212, 212, 212, 1)',
    },
    '.shadow-ring-top': {
      'box-shadow': '0px -1px 0 0 rgba(212, 212, 212, 1)',
    },
    '.is-not-closed': {}, // 자동완성을 위한 코드
    '.is-not-animated': {}, // 자동완성을 위한 코드
    '.pretendard': {
      'font-family': 'Pretendard',
    },
    '.pretendard-bold': {
      'font-family': 'Pretendard-Bold',
    },
    '.pretendard-extrabold': {
      'font-family': 'Pretendard-ExtraBold',
    },
    '.pretendard-medium': {
      'font-family': 'Pretendard-Medium',
    },
    '.pretendard-semibold': {
      'font-family': 'Pretendard-SemiBold',
    },
    '.pretendard-extra-light': {
      'font-family': 'Pretendard-ExtraLight',
    },
    '.pretendard-light': {
      'font-family': 'Pretendard-Light',
    },
    '.pretendard-thin': {
      'font-family': 'Pretendard-Thin',
    },
  });
});

module.exports = { base };
