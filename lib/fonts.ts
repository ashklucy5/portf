import localFont from 'next/font/local';

// English: Inter
export const inter = localFont({
  src: [
    { path: '../public/fonts/inter/Inter-Regular.ttf', weight: '400' },
    { path: '../public/fonts/inter/Inter-Medium.ttf', weight: '500' },
    { path: '../public/fonts/inter/Inter-SemiBold.ttf', weight: '600' },
    { path: '../public/fonts/inter/Inter-Bold.ttf', weight: '700' },
  ],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
});

// Chinese: Noto Sans SC
export const notoSansSC = localFont({
  src: [
    { path: '../public/fonts/noto-sc/NotoSansSC-Regular.ttf', weight: '400' },
    { path: '../public/fonts/noto-sc/NotoSansSC-Medium.ttf', weight: '500' },
    { path: '../public/fonts/noto-sc/NotoSansSC-SemiBold.ttf', weight: '600' },
    { path: '../public/fonts/noto-sc/NotoSansSC-Bold.ttf', weight: '700' },
  ],
  variable: '--font-noto-sc',
  display: 'swap',
  preload: false,
});