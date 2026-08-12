import os
import re

src_dir = r"D:\ariza\Markaz form\src"
backend_dir = r"D:\ariza\Markaz form\backend"

print("========================================")
print("     DEEP CODEBASE AUDIT & ANALYSIS     ")
print("========================================")

# --- 1. Check all files in src ---
src_files = []
for root, dirs, files in os.walk(src_dir):
    for f in files:
        src_files.append(os.path.join(root, f))

print(f"\n1. Total Frontend files in src/: {len(src_files)}")

# Check Skeleton usage in src
skeleton_refs = []
for p in src_files:
    with open(p, 'r', encoding='utf-8') as fh:
        text = fh.read()
        if 'Skeleton' in text:
            skeleton_refs.append(os.path.relpath(p, src_dir))
print(f"Files referencing Skeleton: {skeleton_refs}")

# Check mockData usage
mock_data_refs = []
for p in src_files:
    if p.endswith('.ts') or p.endswith('.tsx'):
        with open(p, 'r', encoding='utf-8') as fh:
            text = fh.read()
            if 'mockData' in text or 'INITIAL_APPLICATIONS' in text or 'INITIAL_EVENTS' in text:
                mock_data_refs.append(os.path.relpath(p, src_dir))
print(f"Files referencing mockData: {mock_data_refs}")

# Check translationService usage
trans_refs = []
for p in src_files:
    if p.endswith('.ts') or p.endswith('.tsx'):
        with open(p, 'r', encoding='utf-8') as fh:
            text = fh.read()
            if 'translationService' in text or 'autoTranslate' in text or 'translateContent' in text:
                trans_refs.append(os.path.relpath(p, src_dir))
print(f"Files referencing translationService: {trans_refs}")

# Check API client usage
api_refs = []
for p in src_files:
    if p.endswith('.ts') or p.endswith('.tsx'):
        with open(p, 'r', encoding='utf-8') as fh:
            text = fh.read()
            if 'api/client' in text or 'applicationsApi' in text or 'eventsApi' in text or 'authApi' in text:
                api_refs.append(os.path.relpath(p, src_dir))
print(f"Files referencing api/client: {api_refs}")

# --- 2. Check Backend files ---
backend_files = []
for root, dirs, files in os.walk(backend_dir):
    if '__pycache__' in root or '.venv' in root: continue
    for f in files:
        backend_files.append(os.path.join(root, f))

print(f"\n2. Total Backend files (excl pycache/.venv): {len(backend_files)}")

# Find all admin.py files and check lines of code
admin_py_files = [p for p in backend_files if os.path.basename(p) == 'admin.py']
print(f"Admin.py files ({len(admin_py_files)} files):")
for ap in admin_py_files:
    with open(ap, 'r', encoding='utf-8') as fh:
        lines = [line for line in fh.readlines() if line.strip() and not line.strip().startswith('#')]
    print(f"  {os.path.relpath(ap, backend_dir)}: {len(lines)} non-empty lines")

