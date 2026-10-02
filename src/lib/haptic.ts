export function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(5);
        break;
      case 'medium':
        navigator.vibrate(10);
        break;
      case 'heavy':
        navigator.vibrate(15);
        break;
      case 'success':
        navigator.vibrate([5, 50, 5]);
        break;
      case 'error':
        navigator.vibrate([10, 50, 10]);
        break;
    }
  }
}
