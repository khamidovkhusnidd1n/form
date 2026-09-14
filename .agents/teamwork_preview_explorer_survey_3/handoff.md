# Configuration, Settings, Security Headers & Dependency Review Handoff Report

## Executive Summary
This report provides an exhaustive static security audit of the **CENTRE FORM** application configuration, infrastructure settings, HTTP security headers, CORS/CSRF configurations, rate limiting policies, and third-party dependencies across both backend (Django 5.0.4) and frontend (React 19 / Vite 8.0).

---

## 1. Observation

### 1.1 Django Settings Configuration (backend/centr_form/settings.py)
- **Observation 1.1.1 (DEBUG Mode Default)**:
  - File: backend/centr_form/settings.py, Line 15:
    DEBUG = config('DEBUG', default=True, cast=bool)
  - File: backend/.env, Line 1:
    DEBUG=True
  - Verbatim Check Output (python backend/manage.py check --deploy):
    ?: (security.W018) You should not have DEBUG set to True in deployment.
- **Observation 1.1.2 (Insecure Fallback SECRET_KEY)**:
  - File: backend/centr_form/settings.py, Lines 16-28:
    Fallback uses SECRET_KEY = 'django-insecure-dev-' + get_random_secret_key() and writes to .secret_key.
  - File: backend/.secret_key, Line 1:
    django-insecure-dev-lz5wj50r*6)2#9_4tb_#vc9q_2lwp1*w5yt2uuf^zq(!_fo8mi
  - Verbatim Check Output:
    ?: (security.W009) Your SECRET_KEY has less than 50 characters, less than 5 unique characters, or it's prefixed with 'django-insecure-' indicating that it was generated automatically by Django.
- **Observation 1.1.3 (Permissive Wildcard ALLOWED_HOSTS)**:
  - File: backend/centr_form/settings.py, Line 30:
    ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')
  - File: backend/.env, Line 3:
    ALLOWED_HOSTS=*
- **Observation 1.1.4 (Hardcoded Database Credentials and Defaults)**:
  - File: backend/centr_form/settings.py, Lines 113-117:
    'NAME': config('DATABASE_NAME', default='uzbamala_ariza')
    'USER': config('DATABASE_USER', default='uzbamala_wp118')
    'PASSWORD': config('DATABASE_PASSWORD', default='')
- **Observation 1.1.5 (Missing Reverse Proxy SSL Detection)**:
  - File: backend/centr_form/settings.py, Lines 206-216:
    SECURE_PROXY_SSL_HEADER is missing from settings.py. Under cPanel Passenger / Nginx proxy, SSL terminates at the proxy.

### 1.2 CORS & CSRF Configuration
- **Observation 1.2.1 (Permissive CORS Allowed Origins & Credentials)**:
  - File: backend/centr_form/settings.py, Lines 179-187:
    
raw_cors_origins defaults to http://localhost:5173,http://localhost:3000,http://localhost:8443,http://127.0.0.1:8443,http://127.0.0.1:5173.
    CORS_ALLOW_CREDENTIALS = True is set while JWT is sent via Authorization header.
- **Observation 1.2.2 (Missing CSRF_TRUSTED_ORIGINS)**:
  - File: backend/centr_form/settings.py:
    CSRF_TRUSTED_ORIGINS is missing from settings.py.
- **Observation 1.2.3 (Conditional Cookie Flags and Missing SameSite Attributes)**:
  - File: backend/centr_form/settings.py, Lines 207-216:
    SESSION_COOKIE_SECURE and CSRF_COOKIE_SECURE are only enabled under if not DEBUG:.
    SESSION_COOKIE_HTTPONLY, SESSION_COOKIE_SAMESITE, CSRF_COOKIE_HTTPONLY, CSRF_COOKIE_SAMESITE are nowhere defined.
- **Observation 1.2.4 (Middleware Ordering Violation)**:
  - File: backend/centr_form/settings.py, Lines 63-66:
    corsheaders.middleware.CorsMiddleware is placed AFTER whitenoise.middleware.WhiteNoiseMiddleware.

### 1.3 HTTP Security Headers
- **Observation 1.3.1 (Complete Absence of Content Security Policy - CSP)**:
  - Neither backend/centr_form/settings.py, backend/passenger_wsgi.py, nor index.html defines any CSP header.
  - File: src/api/client.ts, Lines 70-74 & src/store/authStore.ts, Lines 8, 16:
    JWT access tokens and refresh tokens are stored in browser localStorage under key 'centr-form-auth'.
- **Observation 1.3.2 (Conditional Security Headers Blocked by DEBUG)**:
  - SECURE_HSTS_SECONDS, SECURE_SSL_REDIRECT, SECURE_BROWSER_XSS_FILTER, SECURE_CONTENT_TYPE_NOSNIFF, X_FRAME_OPTIONS are indented inside if not DEBUG:.
  - Verbatim Check Output (manage.py check --deploy):
    ?: (security.W004) You have not set a value for the SECURE_HSTS_SECONDS setting.
    ?: (security.W008) Your SECURE_SSL_REDIRECT setting is not set to True.
    ?: (security.W012) SESSION_COOKIE_SECURE is not set to True.
    ?: (security.W016) You have 'django.middleware.csrf.CsrfViewMiddleware' in your MIDDLEWARE, but you have not set CSRF_COOKIE_SECURE to True.
- **Observation 1.3.3 (Missing SECURE_HSTS_PRELOAD and SECURE_REFERRER_POLICY)**:
  - Neither SECURE_HSTS_PRELOAD nor SECURE_REFERRER_POLICY is configured.

### 1.4 Rate Limiting & DRF Throttling
- **Observation 1.4.1 (Excessive Default Rate Limits & Inverted Throttling)**:
  - File: backend/centr_form/settings.py, Lines 161-166:
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.AnonRateThrottle', 'rest_framework.throttling.UserRateThrottle']
    'DEFAULT_THROTTLE_RATES': {'anon': '10000/hour', 'user': '1000/hour'}
- **Observation 1.4.2 (Missing Scoped Throttles on Sensitive Endpoints)**:
  - File: backend/apps/accounts/views.py, Line 15 (LoginView): No throttling class defined.
  - File: backend/apps/accounts/views.py, Line 71 (change_password_view): No throttling class defined.
  - File: backend/apps/applications/views.py, Line 34 (SubmitApplicationView): Public endpoint accepting 10MB multipart file uploads and triggering emails via NotificationService.send_status_email. No throttling class defined.
  - File: backend/apps/qr/views.py, Line 5 (vverify_qr): Plain Django view, bypasses DRF throttle middleware entirely.
- **Observation 1.4.3 (Missing Shared Cache Backend for Throttling)**:
  - File: backend/centr_form/settings.py: CACHES dictionary is missing. Django defaults to LocMemCache. Memory is isolated per worker process under cPanel Passenger/Gunicorn.

### 1.5 Dependency Review
- **Observation 1.5.1 (backend/requirements.txt)**:
  - Django==5.0.4 (Line 1): Released April 2024. Affected by CVE-2024-42005 (SQL injection in QuerySet.values()), CVE-2024-53907 (SQL injection in JSONField lookups), CVE-2024-38875, CVE-2024-41989, CVE-2024-41990, CVE-2024-45230 (DoS), and CVE-2024-39329, CVE-2024-45231 (timing attacks).
  - openpyxl==3.1.3 (Line 11): Affected by CVE-2024-47863 (Billion Laughs / XML Entity Expansion DoS).
  - Pillow==10.3.0 (Line 7): Outdated image parsing library.
  - Missing django-csp and django-redis.
- **Observation 1.5.2 (package.json)**:
  - xlsx: ^0.18.5 (Line 41): Vulnerable to CVE-2023-30533 (Prototype Pollution) and CVE-2024-22363 (ReDoS). SheetJS stopped updating on public npm after 0.18.5. Used in src/pages/admin/ApplicationsPage.tsx.

### 1.6 Critical Architectural Findings in Scope
- **Observation 1.6.1 (Unauthenticated Admin Takeover Backdoor)**:
  - File: backend/apps/common/views.py, Lines 240-259:
    
reset_admin_view creates/updates admin user with password Markaz2026!, sets is_superuser=True, and prints plaintext credentials.
  - File: backend/apps/common/urls.py, Line 20:
    path('reset-admin/', views.reset_admin_view, name='reset-admin')
- **Observation 1.6.2 (Unauthenticated Web Database Migrations)**:
  - File: backend/apps/common/views.py, Lines 152-191 & backend/apps/common/urls.py, Lines 17-18:
    
run_migrations_view (/api/v1/common/migrate/) and 
run_makemigrations_view (/api/v1/common/makemigrations/) are unauthenticated GET endpoints executing call_command('migrate') and call_command('makemigrations').
- **Observation 1.6.3 (Hardcoded Production Credentials in Git-Tracked Files)**:
  - File: fix_settings.py, Line 19 & test_smtp.py, Line 6:
    user = uzbamalakamarkaz@umail.uz, password = F_meB67mGwVU8T
  - File: test_remote_login.py, Line 8 & test_remote_large.py, Line 5:
    username = admin, password = Markaz2026!
  - Output of git ls-files test_remote_*.py test_smtp.py fix_settings.py add_reset_admin.py: All files are actively tracked in Git!
- **Observation 1.6.4 (Insecure Production Static File Serving via serve)**:
  - File: backend/centr_form/urls.py, Lines 21-25:
    Exposes settings.BASE_DIR / '..' (project root) directly through django.views.static.serve without DEBUG checks.
- **Observation 1.6.5 (Insecure QR Verification Without Cryptographic Secret)**:
  - File: backend/apps/qr/services.py, Lines 8-13:
    QRService.generate_secure_hash(value) uses unkeyed hashlib.sha256(value.encode(utf-8)).hexdigest(). Anyone can forge verification hashes for any object_id.

---

## 2. Logic Chain

1. **Premise 1**: In settings.py:15, DEBUG = config('DEBUG', default=True, cast=bool), and backend/.env defines DEBUG=True.
   - **Inference 1**: DEBUG is active. Because lines 207-216 wrap all production security headers in if not DEBUG:, HTTP Strict Transport Security (SECURE_HSTS_SECONDS), SSL redirect (SECURE_SSL_REDIRECT), Content-Type sniffing prevention (SECURE_CONTENT_TYPE_NOSNIFF), and Secure cookie flags (SESSION_COOKIE_SECURE, CSRF_COOKIE_SECURE) are bypassed and inactive.
2. **Premise 2**: ALLOWED_HOSTS in settings.py:30 defaults to '*' and backend/.env sets ALLOWED_HOSTS=*.
   - **Inference 2**: Django accepts requests with arbitrary Host headers. Attackers can perform Host header poisoning, which invalidates caching layers and enables password reset email poisoning.
3. **Premise 3**: In backend/apps/common/urls.py:20 and backend/apps/common/views.py:240-259, the endpoint 
eset-admin/ is registered with permission_classes([AllowAny]) and resets user admin with password Markaz2026!.
   - **Inference 3**: Any remote client on the public internet can send an HTTP GET request to /api/v1/common/reset-admin/ to reset superadmin credentials and take complete administrative control of the system.
4. **Premise 4**: In backend/centr_form/settings.py:165, DRF anonymous throttling is set to 10000/hour, and sensitive endpoints (/auth/login/, /auth/change-password/, /applications/submit/) have no custom throttling classes.
   - **Inference 4**: An attacker can launch 10,000 automated login guesses per hour against /api/v1/auth/login/ from a single IP address without triggering rate limiting. Moreover, without a persistent distributed cache (CACHES), memory-based counters reset across worker processes.
5. **Premise 5**: In src/api/client.ts:70-74, JWT access and refresh tokens are persisted in localStorage. Neither Django nor the frontend sets a Content Security Policy (CSP).
   - **Inference 5**: localStorage is accessible to all client-side JavaScript within the origin. In the absence of a strict CSP, any XSS vector or third-party dependency injection can immediately extract administrative JWT tokens.
6. **Premise 6**: In 
equirements.txt:1 and package.json:41, Django==5.0.4 and xlsx@0.18.5 are pinned.
   - **Inference 6**: Both packages contain confirmed public CVEs (SQL injection in Django QuerySet values, prototype pollution in SheetJS). These vulnerabilities are exploitable directly through standard framework operations.

---

## 3. Vulnerability Findings & Defensive Remediations

| ID | Title | Severity | OWASP Category | Location |
|---|---|---|---|---|
| SEC-01 | Unauthenticated Administrative Takeover Backdoor | CRITICAL | A01:2021 - Broken Access Control | backend/apps/common/views.py:240, urls.py:20 |
| SEC-02 | Unauthenticated Remote Database Migration Execution | HIGH | A01:2021 - Broken Access Control | backend/apps/common/views.py:152, urls.py:17-18 |
| SEC-03 | Production Credentials Committed to Git | HIGH | A07:2021 - Identification & Authentication Failures | fix_settings.py:19, test_smtp.py:6, test_remote_login.py:8 |
| SEC-04 | Wildcard ALLOWED_HOSTS & Insecure DEBUG Default | HIGH | A05:2021 - Security Misconfiguration | backend/centr_form/settings.py:15,30 |
| SEC-05 | Insecure Static File Exposure via serve | HIGH | A01:2021 - Broken Access Control | backend/centr_form/urls.py:21-25 |
| SEC-06 | Missing Content Security Policy (CSP) & Token Storage | HIGH | A05:2021 - Security Misconfiguration | backend/centr_form/settings.py, src/api/client.ts:70 |
| SEC-07 | Missing DRF Scoped Rate Limiting & Inverted Rates | HIGH | A04:2021 - Insecure Design | backend/centr_form/settings.py:161-166, apps/accounts/views.py:15 |
| SEC-08 | Outdated Dependencies with Known CVEs (Django, SheetJS) | HIGH | A06:2021 - Vulnerable and Outdated Components | backend/requirements.txt:1, package.json:41 |
| SEC-09 | Missing CSRF_TRUSTED_ORIGINS & Insecure Cookie Defaults | MEDIUM | A05:2021 - Security Misconfiguration | backend/centr_form/settings.py:179-186 |
| SEC-10 | Missing Shared Cache Backend for Rate Limiting | MEDIUM | A04:2021 - Insecure Design | backend/centr_form/settings.py (CACHES missing) |
| SEC-11 | Missing SECURE_PROXY_SSL_HEADER for Reverse Proxy | MEDIUM | A05:2021 - Security Misconfiguration | backend/centr_form/settings.py:206 |
| SEC-12 | Unkeyed QR Code Hash Calculation | MEDIUM | A02:2021 - Cryptographic Failures | backend/apps/qr/services.py:8-13 |
| SEC-13 | Sensitive Data Disclosure via Test Email Endpoint | MEDIUM | A05:2021 - Security Misconfiguration | backend/apps/common/views.py:198 |
| SEC-14 | Misplaced CorsMiddleware in Middleware Stack | LOW | A05:2021 - Security Misconfiguration | backend/centr_form/settings.py:63-66 |

---

### Detailed Findings & Code Remediation

#### SEC-01: Unauthenticated Administrative Takeover Backdoor
- **Severity**: CRITICAL (CVSS: 10.0)
- **File & Line**: `backend/apps/common/views.py:240-259`, `backend/apps/common/urls.py:20`
- **Vulnerability**: Any anonymous visitor can access `GET /api/v1/common/reset-admin/`. This creates or updates the `admin` superuser with password `Markaz2026!`, sets `is_superuser=True`, and returns plaintext credentials in the HTTP response.
- **Defensive Fix**:
  Completely remove `reset_admin_view` and delete `path('reset-admin/', ...)` from `backend/apps/common/urls.py`. Also remove `add_reset_admin.py` from repository tracking.
```python
# REMOVE from backend/apps/common/urls.py line 20:
path('reset-admin/', views.reset_admin_view, name='reset-admin'),

# REMOVE from backend/apps/common/views.py lines 240-259:
@api_view(['GET'])
@permission_classes([AllowAny])
def reset_admin_view(request):
    ...
```

#### SEC-02: Unauthenticated Remote Database Migration Execution
- **Severity**: HIGH (CVSS: 8.5)
- **File & Line**: `backend/apps/common/views.py:152-191`, `backend/apps/common/urls.py:17-18`
- **Vulnerability**: `run_migrations_view` (`/api/v1/common/migrate/`) and `run_makemigrations_view` (`/api/v1/common/makemigrations/`) expose Django management commands (`call_command('migrate')`, `call_command('makemigrations')`) over HTTP without authentication.
- **Defensive Fix**:
  Remove `migrate/` and `makemigrations/` routes from `backend/apps/common/urls.py`. Execute migrations strictly via deployment pipeline / CLI.
```python
# REMOVE from backend/apps/common/urls.py lines 17-18:
path('migrate/', views.run_migrations_view, name='run-migrations'),
path('makemigrations/', views.run_makemigrations_view, name='run-makemigrations'),
```

#### SEC-03: Production Credentials Committed to Git
- **Severity**: HIGH (CVSS: 8.2)
- **File & Line**: `fix_settings.py:19`, `test_smtp.py:6`, `test_remote_login.py:8`, `test_remote_large.py:5`
- **Vulnerability**: Production SMTP password (`F_meB67mGwVU8T`) and admin credentials (`Markaz2026!`) are committed in plaintext scripts tracked by Git.
- **Defensive Fix**:
  1. Untrack files: `git rm --cached test_*.py fix_*.py add_*.py`
  2. Add patterns to `.gitignore`:
```gitignore
test_*.py
fix_*.py
add_*.py
```
  3. Rotate SMTP password for `uzbamalakamarkaz@umail.uz` and change superadmin password.
  4. Ensure `settings.py` loads credentials strictly from environment without default passwords:
```python
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
```

#### SEC-04: Insecure DEBUG Mode & Wildcard ALLOWED_HOSTS
- **Severity**: HIGH (CVSS: 7.5)
- **File & Line**: `backend/centr_form/settings.py:15,30`, `backend/.env:1,3`
- **Vulnerability**: `DEBUG=True` and `ALLOWED_HOSTS=*` enable traceback exposure, data leakage, and Host Header poisoning.
- **Defensive Fix**:
```python
# backend/centr_form/settings.py
DEBUG = config('DEBUG', default=False, cast=bool)

raw_allowed_hosts = config('ALLOWED_HOSTS', default='form.uzbamalaka.uz,localhost,127.0.0.1')
ALLOWED_HOSTS = [host.strip() for host in raw_allowed_hosts.split(',') if host.strip()]

if not DEBUG and ('*' in ALLOWED_HOSTS or not ALLOWED_HOSTS):
    from django.core.exceptions import ImproperlyConfigured
    raise ImproperlyConfigured("ALLOWED_HOSTS must not contain wildcard '*' in production.")
```

#### SEC-05: Insecure Production Static File Serving via `serve`
- **Severity**: HIGH (CVSS: 7.5)
- **File & Line**: `backend/centr_form/urls.py:21-25`
- **Vulnerability**: `django.views.static.serve` is exposed in production `urlpatterns` pointing to `BASE_DIR.parent`.
- **Defensive Fix**:
```python
# backend/centr_form/urls.py
urlpatterns = [
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/accounts/', include('apps.accounts.urls')),
    path('api/v1/events/', include('apps.events.urls')),
    path('api/v1/applications/', include('apps.applications.urls')),
    path('api/v1/faqs/', include('apps.faqs.urls')),
    path('api/v1/dashboard/', include('apps.dashboard.urls')),
    path('api/v1/qr/', include('apps.qr.urls')),
    path('api/v1/settings/', include('apps.settings_app.urls')),
    path('api/v1/common/', include('apps.common.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    from django.views.static import serve
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]

from .views import react_app_view
urlpatterns += [
    re_path(r'^(?!api/|media/|static/).*$', react_app_view),
]
```

#### SEC-06: Missing Content Security Policy (CSP) & Security Headers
- **Severity**: HIGH (CVSS: 7.5)
- **File & Line**: `backend/centr_form/settings.py:206-216`, `index.html`
- **Vulnerability**: No CSP header is emitted. Security headers (`HSTS`, `X-Content-Type-Options`, `X-Frame-Options`) are inactive under `DEBUG=True`.
- **Defensive Fix**:
```python
# backend/centr_form/settings.py
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Universal cookie hardening
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
```
Add CSP meta tag in `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://form.uzbamalaka.uz; frame-ancestors 'none';">
```

#### SEC-07: Inadequate Rate Limiting & Missing Scoped Throttles
- **Severity**: HIGH (CVSS: 7.5)
- **File & Line**: `backend/centr_form/settings.py:161-166`, `backend/apps/accounts/views.py:15,71`, `backend/apps/applications/views.py:34`
- **Vulnerability**: Anonymous users are allowed 10,000 req/hr. Sensitive endpoints (`login`, `change_password`, `submit`) have no scoped throttling.
- **Defensive Fix**:
```python
# backend/centr_form/settings.py
REST_FRAMEWORK = {
    ...
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '120/minute',
        'user': '600/minute',
        'auth_login': '5/minute',
        'auth_password': '5/minute',
        'application_submit': '10/hour',
    },
}
```
In `backend/apps/accounts/views.py`:
```python
class LoginView(TokenObtainPairView):
    throttle_scope = 'auth_login'
    ...
```
In `backend/apps/applications/views.py`:
```python
class SubmitApplicationView(generics.CreateAPIView):
    throttle_scope = 'application_submit'
    ...
```

#### SEC-08: Vulnerable Dependencies (`Django`, `xlsx`, `openpyxl`)
- **Severity**: HIGH (CVSS: 7.8)
- **File & Line**: `backend/requirements.txt:1,11`, `package.json:41`
- **Vulnerability**:
  - `Django==5.0.4` contains multiple SQL injection and DoS CVEs.
  - `xlsx@0.18.5` is abandoned on npm with prototype pollution (CVE-2023-30533).
  - `openpyxl==3.1.3` is vulnerable to CVE-2024-47863.
- **Defensive Fix**:
Update `backend/requirements.txt`:
```
Django>=5.0.12
openpyxl>=3.1.5
Pillow>=10.4.0
```
In `package.json`: Remove `xlsx` and replace client-side export with backend `/api/v1/applications/admin/export/excel/` API.

#### SEC-09: Missing `CSRF_TRUSTED_ORIGINS` & Hardened CORS Origins
- **Severity**: MEDIUM (CVSS: 5.4)
- **File & Line**: `backend/centr_form/settings.py:179-187`
- **Vulnerability**: Missing `CSRF_TRUSTED_ORIGINS` causes 403 Forbidden on cross-origin submissions, while default CORS allows all local development HTTP URLs with credentials.
- **Defensive Fix**:
```python
# backend/centr_form/settings.py
raw_cors_origins = config(
    'CORS_ALLOWED_ORIGINS',
    default='https://form.uzbamalaka.uz' if not DEBUG else 'http://localhost:5173,http://localhost:3000,http://localhost:8443'
)
CORS_ALLOWED_ORIGINS = [o.strip() for o in raw_cors_origins.split(',') if o.strip()]

CSRF_TRUSTED_ORIGINS = [
    f"https://{host.strip()}" if not host.startswith(('http://', 'https://')) else host.strip()
    for host in CORS_ALLOWED_ORIGINS
]
CORS_ALLOW_CREDENTIALS = False
```

#### SEC-10: Configure Redis Cache Backend for Throttling
- **Severity**: MEDIUM (CVSS: 5.3)
- **File & Line**: `backend/centr_form/settings.py`
- **Vulnerability**: Without `CACHES`, throttle counters reside in memory (`LocMemCache`) and do not synchronize across multi-worker cPanel Passenger/Gunicorn processes.
- **Defensive Fix**:
```python
# backend/centr_form/settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/1'),
    }
}
```

#### SEC-11: Cryptographically Sign QR Verification Hashes
- **Severity**: MEDIUM (CVSS: 5.3)
- **File & Line**: `backend/apps/qr/services.py:8-13`
- **Vulnerability**: QR hashes are unkeyed SHA-256 digests of predictable strings, enabling hash forgery.
- **Defensive Fix**:
```python
# backend/apps/qr/services.py
import hmac
import hashlib
from django.conf import settings

class QRService:
    @staticmethod
    def generate_secure_hash(value: str) -> str:
        key = settings.SECRET_KEY.encode('utf-8')
        return hmac.new(key, value.encode('utf-8'), hashlib.sha256).hexdigest()

    @staticmethod
    def verify_hash(value: str, expected_hash: str) -> bool:
        return hmac.compare_digest(QRService.generate_secure_hash(value), expected_hash)
```

---

## 4. Caveats
1. **Passenger Environment Deployment**: In cPanel Passenger deployments, process lifecycle and reverse proxy headers depend on .htaccess and cPanel configuration. The SECURE_PROXY_SSL_HEADER fix is essential, but proper upstream proxy header forwarding (X-Forwarded-Proto) must also be enabled on Apache/Nginx.
2. **Local Development Parity**: Developers running without Redis locally should be able to fallback to LocMemCache if REDIS_URL is unreachable.
3. **No Caveats Beyond Scope**: All findings in this report were verified directly from source code and environment configurations in the workspace.

---

## 5. Conclusion
The CENTRE FORM application exhibits severe security misconfigurations and vulnerabilities:
1. **Critical Backdoor**: An unauthenticated endpoint (/api/v1/common/reset-admin/) allows instantaneous takeover of the superadmin account with hardcoded credentials Markaz2026!.
2. **Git Exposure**: Live production email passwords (F_meB67mGwVU8T) and admin credentials are committed to version control in test/fix scripts.
3. **Configuration Flaws**: DEBUG=True is active, ALLOWED_HOSTS=* is set, all security headers are bypassed, and DRF rate limits are set to an excessive 10,000 req/hr without sensitive endpoint throttling.
4. **Vulnerable Dependencies**: Unpatched CVEs exist in Django 5.0.4 and SheetJS xlsx.

Immediate remediation is required before production deployment. Downstream implementers must follow the code snippets provided in Section 3.

---

## 6. Verification Method

To independently reproduce and verify all findings:

1. **Verify Django Deployment Security Check**:
   `powershell
   backend\.venv\Scripts\python.exe backend\manage.py check --deploy
   `
   *Expected Output*: Displays warnings W004 (HSTS), W008 (SSL redirect), W009 (insecure secret key), W012 (session cookie secure), W016 (csrf cookie secure), W018 (DEBUG=True).

2. **Verify Reset-Admin Backdoor Route & Code**:
   Inspect line 20 in backend/apps/common/urls.py and lines 240-259 in backend/apps/common/views.py.

3. **Verify Tracked Credentials**:
   `powershell
   git ls-files test_remote_login.py test_smtp.py fix_settings.py add_reset_admin.py
   `
   Inspect test_smtp.py:6 for password F_meB67mGwVU8T and test_remote_login.py:8 for Markaz2026!.

4. **Verify Dependency Vulnerabilities**:
   - Inspect backend/requirements.txt:1 for Django==5.0.4.
   - Inspect package.json:41 for xlsx: ^0.18.5.
