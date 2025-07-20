const express = require('express');
const router = express.Router();

// GET - Zobrazit základní info o aplikaci
router.get('/', (req, res) => {
  res.json({
    message: 'Vítejte v aplikaci MicroMatch!',
    description: 'Spojujeme influencery a podniky pro efektivní spolupráci.',
    features: [
      'Registrace jako influencer nebo podnik',
      'Nahrávání profilové fotky',
      'Dashboard pro správu spoluprací'
    ]
  });
});

module.exports = router;
