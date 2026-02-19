import os
import sys

# Get the directory containing this file (e.g., .../backend)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Get the parent directory (e.g., .../nagarbhavi-brigades-frontend (1))
parent_dir = os.path.dirname(current_dir)

# Add the parent directory to sys.path so that 'backend' package can be imported
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from backend.app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()
