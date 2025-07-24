# Plan to Run EduAI Backend with UV

## Steps to Execute

### 1. Check if UV is installed
```bash
uv --version
```
If not installed, install it:
- Windows: `pip install uv`
- macOS/Linux: `curl -LsSf https://astral.sh/uv/install.sh | sh`

### 2. Navigate to backend directory
```bash
cd backend
```

### 3. Create and activate virtual environment
```bash
# Create virtual environment
uv venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate

# On macOS/Linux:
source .venv/bin/activate
```

### 4. Install dependencies
```bash
# Install all project dependencies
uv pip install -e .

# Or if you want to sync with uv.lock file:
uv sync
```

### 5. Create .env file
Create a `.env` file in the backend directory with:
```env
GEMINI_API_KEY=dummy_key_for_now
```

### 6. Run the application
```bash
# Run with uvicorn (with auto-reload for development)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Alternative: Run directly with Python
python -m uvicorn app.main:app --reload
```

### 7. Verify the backend is running
- Open browser and go to: http://localhost:8000
- Check API documentation at: http://localhost:8000/docs
- Health check endpoint: http://localhost:8000/health

## Expected Output
When successfully running, you should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [####] using WatchFiles
INFO:     Started server process [####]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Troubleshooting

### If uv is not found:
- Make sure uv is in your PATH
- Try using `python -m uv` instead

### If dependencies fail to install:
- Check Python version (should be 3.8+)
- Try `uv pip install -r requirements.txt` if a requirements file exists

### If database errors occur:
- The SQLite database will be created automatically
- Check write permissions in the backend directory

### If CORS errors occur when connecting frontend:
- The backend is configured to accept connections from common frontend ports
- Check app/core/config.py for CORS settings