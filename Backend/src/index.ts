import 'dotenv/config';
import app from './server';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});
