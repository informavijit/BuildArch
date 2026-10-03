import express from 'express';

const app = express();

app.get('/orders', (req, res) => {
  res.json([{ id: 101, item: 'Architecture Report' }]);
});

app.listen(3000, () => console.log('Server running on 3000'));
