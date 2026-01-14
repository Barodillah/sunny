import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import promoRoutes from './routes/promos.js';
import knowledgeRoutes from './routes/knowledge.js';
import chatRoutes from './routes/chat.js';
import requestRoutes from './routes/requests.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/promos', promoRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/requests', requestRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
