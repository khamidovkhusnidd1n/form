# Original User Request

## 2026-08-12T04:46:21Z

<USER_REQUEST>
# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Completely remove the default Django Admin panel from the project and perform a deep codebase audit to clean up unused files, optimize structure, and fix security or logical errors.

Working directory: D:\ariza\Markaz form
Integrity mode: development

## Requirements

### R1. Complete Removal of Django Admin
Remove all dependencies, routing, configurations, and boilerplate files (like `admin.py`) related to `django.contrib.admin`. The project relies entirely on a custom React admin panel, so the default Django admin must be completely unhooked from the backend.

### R2. Deep Codebase Audit and Cleanup
Conduct a full project check. Identify and remove unused code, dead imports, empty files, and bloated folder structures. Optimize the codebase for a clean, minimal architecture while preserving all existing active functionality.

### R3. Security and Bug Check
Identify and fix any security vulnerabilities, misconfigurations, or potential logical bugs in the existing backend code.

## Acceptance Criteria

### Django Admin Removal
- [ ] `django.contrib.admin` is removed from `INSTALLED_APPS` in `settings.py`.
- [ ] No `admin.py` files contain active admin registrations.
- [ ] No `/admin/` or `/superadmin/` routes exist in the main `urls.py`.

### Code Cleanup
- [ ] A programmatic search (e.g., using `flake8`, `eslint`, or `grep`) shows no unused imports or variables in the active backend code.
- [ ] Boilerplate comments and empty files are removed.

### Functional Integrity
- [ ] The custom React admin panel and all API endpoints continue to function without any dependency on the removed Django admin.
</USER_REQUEST>
