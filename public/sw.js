/**
 * Service Worker for Qur'ani Push Notifications
 * منصة «الأنس بالقرآن» — خدمة إشعارات الورد القرآني
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// استقبال إشعارات الويب Push
self.addEventListener('push', (event) => {
  let data = {
    title: '📖 تذكير بالورد القرآني اليومي',
    body: 'حان موعد وردك المبارك من كتاب الله 🌸',
    icon: '/assets/icons/icon-192.svg',
    badge: '/assets/icons/icon-192.svg',
    url: '/'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = Object.assign(data, parsed);
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/assets/icons/icon-192.svg',
    badge: data.badge || data.icon || '/assets/icons/icon-192.svg',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/'
    },
    dir: 'rtl',
    lang: 'ar',
    tag: 'qurani-wird-reminder',
    renotify: true,
    actions: [
      { action: 'open_wird', title: '📖 قراءة الورد الآن' },
      { action: 'dismiss', title: 'إغلاق' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// التفاعل عند النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          if (client.navigate) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
