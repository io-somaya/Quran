const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'قرءاني', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA-style routing if needed
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ خادم قرءاني يعمل بنجاح على المنفذ: ${PORT}`);
  console.log(`🌐 الرابط المحلي: http://localhost:${PORT}`);
});
