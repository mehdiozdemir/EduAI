# EduAI Backend

## Project Structure

````
backend/
│
├── app/
│   ├── api/                  # FastAPI route modules
│   │   ├── agents.py
│   │   ├── users.py
│   │   ├── subjects.py
│   │   ├── questions.py
│   │   └── performance.py
│   │
│   ├── agents/               # 🤖 LangChain agents (Gemini/Tavily)
│   │   ├── base_agent.py
│   │   ├── question_agent.py
│   │   ├── analysis_agent.py
│   │   ├── youtube_agent.py
│   │   ├── book_agent.py
│   │   └── master_agent.py
│   │
│   ├── core/                 # Settings & shared logic
│   │   ├── config.py
│   │   └── langchain_integration.py
│   │
│   ├── models/               # DB/Pydantic models
│   ├── schemas/              # Request/response schemas
│   ├── main.py               # FastAPI application entrypoint
│   └── database.py           # SQLAlchemy engine & Base
│
├── tests/                    # Pytest unit/integration tests (if any)
├── pyproject.toml            # Poetry/uv metadata & dependencies
└── README.md                 # (this file)
````

## Setup

1. Install uv (if not already installed):
   ```bash
   # On Windows
   pip install uv
   
   # On macOS and Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   uv pip install -e .
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```env
   # Gemini (Google Generative AI)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Tavily Search (required for BookAgent)
   TAVILY_API_KEY=your_tavily_api_key_here

   # (Optional) YouTube Data API – for video recommendations
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

4. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Endpoints

### Users
- `POST /users/` - Create a new user
- `GET /users/{user_id}` - Get user by ID
- `PUT /users/{user_id}` - Update user by ID

### Subjects
- `POST /subjects/` - Create a new subject
- `GET /subjects/` - Get all subjects
- `GET /subjects/{subject_id}` - Get subject by ID
- `POST /subjects/{subject_id}/topics` - Create a new topic for a subject
- `GET /subjects/{subject_id}/topics` - Get all topics for a subject

### Questions
- `POST /questions/generate` - Generate a question using LangChain
- `POST /questions/` - Create a new question
- `GET /questions/{question_id}` - Get question by ID
- `POST /questions/evaluate` - Evaluate user's answer using LangChain

### Performance
- `POST /performance/analyze` - Analyze user performance using LangChain
- `POST /performance/` - Create a new performance analysis
- `GET /performance/{analysis_id}` - Get performance analysis by ID
- `GET /performance/user/{user_id}` - Get all performance analyses for a user
- `POST /performance/{analysis_id}/recommendations` - Create a new resource recommendation
- `GET /performance/{analysis_id}/recommendations` - Get all resource recommendations for an analysis

### Agents (Orchestration)

- `POST /agents/recommend/books` - Get book recommendations via **BookAgent** (Gemini ✕ Tavily)
- `POST /agents/recommend/youtube` - Get YouTube video recommendations
- `POST /agents/process` - MasterAgent entry point (questions, analysis, etc.)

## Database

The application uses SQLite as the database. The database file will be created automatically when the application starts.

## LangChain Integration

The application integrates with Google's Gemini API through LangChain for:
- Question generation
- Answer evaluation
- Performance analysis

Make sure to set the `GEMINI_API_KEY` environment variable with your actual Gemini API key.
