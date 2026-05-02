# Database Setup Guide

## Current Setup

Your application now uses **SQLite** database by default for easy local development. You can switch to **PostgreSQL** anytime.

### What's New:

✅ **Database Tables Created:**
- `users` - User accounts
- `portfolios` - Paper trading portfolios
- `positions` - Stock positions in portfolios
- `trades` - Trade history
- `stock_data` - Cached historical OHLCV data
- `stock_quotes` - Latest stock quotes
- `technical_indicators` - Technical analysis cache
- `ai_signals` - AI trading signals history
- `alerts` - User price alerts

✅ **Demo User Created:**
- Username: `demo`
- Email: `demo@stockai.com`
- Initial Cash: $100,000

## Features Now Integrated:

✅ **Database Persistence** - All trades and portfolio data saved
✅ **Trade History** - Track all buy/sell transactions
✅ **Position Management** - Automatic position tracking with P&L
✅ **Portfolio Updates** - Real-time portfolio value calculations

## Running the Application:

### Terminal 1 - FastAPI Backend
```bash
python -m uvicorn backend5:app --reload
```
Backend runs on: `http://localhost:8000`

### Terminal 2 - Vite Frontend
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173`

## Using the Application:

1. Open `http://localhost:5173` in your browser
2. Search for stock symbols (e.g., AAPL, GOOGL, MSFT)
3. View price charts and technical indicators
4. Get AI trading signals
5. Execute paper trades - they're now saved to the database!
6. Check your portfolio - all data persists

## Switching to PostgreSQL (Production):

### Step 1: Install PostgreSQL
- Download from: https://www.postgresql.org/download/

### Step 2: Create Database
```sql
CREATE DATABASE stock_ai;
```

### Step 3: Update .env file
```
DATABASE_URL=postgresql+psycopg2://username:password@localhost:5432/stock_ai
```

### Step 4: Initialize Database
```bash
python init_db.py
```

### Step 5: Restart Backend
The app will automatically use PostgreSQL

## API Endpoints:

### Stock Data
- `GET /quote/{symbol}` - Get stock quote
- `GET /history/{symbol}` - Get historical data
- `GET /indicators/{symbol}` - Get technical indicators
- `GET /ai-signal/{symbol}` - Get AI trading signal
- `GET /search` - Search stock symbols

### Portfolio & Trading
- `GET /portfolio` - Get portfolio data
- `POST /trade` - Execute trade (BUY/SELL)

### System
- `GET /health` - Health check
- `GET /` - API info

## Database Files:

- **SQLite**: `stock_ai.db` (local file)
- **Models**: `models/database_models.py`
- **Database Config**: `database.py`
- **Init Script**: `init_db.py`

## Troubleshooting:

### Issue: "Database file not found"
**Solution**: Run `python init_db.py` again

### Issue: "No position to sell"
**Solution**: You must have an open position to sell it

### Issue: "Insufficient funds"
**Solution**: Your cash balance is too low for the trade

### Issue: "PostgreSQL connection error"
**Solution**: Check DATABASE_URL in .env and ensure PostgreSQL is running

## Next Steps:

1. ✅ Database connected
2. 👤 Add user authentication (login/register)
3. 📧 Add email notifications for trades
4. 📊 Add more technical indicators
5. 🤖 Improve AI signal algorithms
6. 📱 Add mobile app support

---

Need help? Check the logs in terminal output for detailed error messages.
