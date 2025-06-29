# BinaryCity Client-Contact Manager

## MUST_HAVES

- **Python 3.8+** installed
- **pip** (comes with Python)

## Setup

1. **Install Python dependencies**

   Open a terminal in the `backend` folder and run:

   ```
   pip install flask flask-cors
   ```

2. **Run the Backend (Flask API)**

   In the `backend` folder, run:

   ```
   python app.py
   ```

   - The API will start at [http://localhost:5000](http://localhost:5000)
   - The SQLite database file (`client_contact.db`) will be created automatically.

3. **Run the Frontend (Static HTML/JS/CSS)**

   In a new terminal, go to the `frontend` folder and run:

   ```
   python -m http.server 8000
   ```

   - Open [http://localhost:8000/index.html](http://localhost:8000/index.html) in your browser.

## Features

- Add, view, and delete clients and contacts
- Link/unlink contacts to clients
- Auto-generated client codes
- SQLite database (no setup needed)
