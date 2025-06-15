import express from 'express';
import dotenv from 'dotenv';
const app = express();
const PORT = process.env.PORT; 
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
