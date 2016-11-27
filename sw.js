/*
  just use the rolling release (cache, check for newer file & cache new version) for this project :D 
*/
self.addEventListener('fetch', function(event) {
  event.respondWith(caches.open('tiltballchallenge').then(function(cache) {
    return cache.match(event.request).then(function(response) {
      var fetchPromise = fetch(event.request).then(function(networkResponse) {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      })
      return response || fetchPromise;
    })
  }));
});
