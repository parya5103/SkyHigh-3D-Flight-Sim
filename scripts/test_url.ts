import https from 'https';

const url = 'https://vazxmix.github.io/reusable-models/airplane.glb';

https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  if (res.statusCode === 302 || res.statusCode === 301) {
    console.log('Redirecting to:', res.headers.location);
  }
  
  res.on('data', (chunk) => {
    console.log('Got data chunk of size:', chunk.length);
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
