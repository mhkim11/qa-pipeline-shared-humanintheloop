// 서비스 워커 설치
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 서비스 워커 활성화
self.addEventListener('activate', (event) => {
  clients.claim();
});

// 푸시 메시지 수신 처리
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    // 알림 표시
    const title = data.title || '새 알림';
    const options = {
      body: data.message || '새 알림이 있습니다',
      icon: '/logo.png',
      badge: '/logo-small.png',
      tag: data.notification_id || Date.now().toString()
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    // 오류가 발생해도 기본 알림 표시
    event.waitUntil(
      self.registration.showNotification('새 알림', {
        body: '알림을 확인하세요',
        icon: '/logo.png'
      })
    );
  }
});

// 알림 클릭 처리 - 단순히 알림만 닫습니다
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
});

// 정기적으로 콘솔에 로그 출력 (서비스 워커가 활성 상태인지 확인)
setInterval(() => {
  // console.log('서비스 워커 활성 상태');
}, 30000);