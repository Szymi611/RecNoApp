const express = require('express');
const multer = require('multer');
const path = require('path');

const PORT = 3000;

const app = express();


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
