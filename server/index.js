

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { connectDB } = require('./config/db');
const formRoutes = require('./routes/formRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const { createAdminIfNotExists } = require('./controllers/userController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', formRoutes);
app.use('/api/auth', userRoutes);
app.use(errorHandler);

connectDB().then(async () => {
  // Create default admin user if not exists
  await createAdminIfNotExists();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
