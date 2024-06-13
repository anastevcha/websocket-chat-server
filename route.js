const express = require('express');
const router = express.Router();

router.get("/",(req, res) => {
   res.send("Это чтобы проверить работу сервера");
});

module.exports = router;