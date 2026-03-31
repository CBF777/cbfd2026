// Detect if user is on mobile/touch device
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for touch capabilities
  const hasTouchScreen = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0;
  
  // Check user agent
  const mobileUA = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Check screen width
  const smallScreen = window.innerWidth <= 1024;
  
  return (hasTouchScreen && smallScreen) || mobileUA;
}

export function isDesktop(): boolean {
  return !isMobileDevice();
}
