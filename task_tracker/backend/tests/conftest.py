# tests/conftest.py
import sys
import os


# backend/
backend_dir = os.path.dirname(os.path.abspath(__file__))  # tests/
backend_dir = os.path.dirname(backend_dir)                # backend/

# Add backend/ to sys.path
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Add backend/src to sys.path
src_dir = os.path.join(backend_dir, "src")
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)
