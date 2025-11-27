Backend (FastAPI) instructions:

1. Create and activate a Python virtual environment:
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS / Linux:
   source .venv/bin/activate

2. Install dependencies:
   pip install -r requirements.txt

3. Start the server:
   uvicorn app.main:app --reload

4. Open API docs at:
   http://127.0.0.1:8000/docs
