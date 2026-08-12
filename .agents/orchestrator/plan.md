# Plan — Codebase Cleanup, Security Audit, and Django Admin Removal

## Objectives
1. Perform deep codebase survey to identify Django Admin usage, dead code, unused imports, security vulnerabilities, and bug risks.
2. Complete removal of Django Admin (`django.contrib.admin`, `admin.py` files, `/admin/` & `/superadmin/` routes).
3. Deep codebase audit and cleanup (unused imports, empty files, dead code, unnecessary comments).
4. Security & bug remediation (resolve security issues, misconfigurations, logic bugs).
5. Comprehensive verification (ensure custom React admin panel and all API endpoints function seamlessly).

## Milestones
- **M0: Survey & Architectural Inventory** (In Progress)
  - Survey backend and frontend structures via 3 parallel Explorers.
  - Produce `PROJECT.md` with complete Feature Inventory and Architecture mapping.
- **M1: Django Admin Removal**
  - Unhook `django.contrib.admin` from `INSTALLED_APPS`.
  - Remove all `admin.py` boilerplate files or clear active registrations.
  - Remove `/admin/` and `/superadmin/` routes in `urls.py`.
- **M2: Codebase Audit & Cleanup**
  - Identify and eliminate unused imports, dead code, empty files, and bloated structure.
- **M3: Security & Bug Remediation**
  - Identify and fix security vulnerabilities, misconfigurations, and logic bugs in backend logic.
- **M4: Final Verification & Hardening**
  - Run build & test checks, verify React admin panel API endpoints, run Forensic Auditor check.
