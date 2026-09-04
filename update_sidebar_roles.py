import re

with open('src/components/layout/AdminSidebar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useData import
if "import { useData } from '../../store/dataStore';" not in content:
    content = content.replace("import { useAuth } from '../../store/authStore';", "import { useAuth } from '../../store/authStore';\nimport { useData } from '../../store/dataStore';")

# Replace NAV_ITEMS map logic
nav_code = '''
        {NAV_ITEMS.map(({ to, icon: Icon, key }) => {
          const active = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
          return (
            <Link
'''

new_nav_code = '''
        {NAV_ITEMS.map(({ to, icon: Icon, key }) => {
          // Moderators should not see Administrators and Settings
          if (user?.role === 'moderator' && (to === '/admin/administrators' || to === '/admin/settings')) {
            return null;
          }

          const active = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
          
          // Calculate new applications count for the badge
          const newAppsCount = (key === 'nav.applications') ? applications.filter(a => a.status === 'submitted').length : 0;

          return (
            <Link
'''
content = content.replace(nav_code.strip(), new_nav_code.strip())

# Add useData hook inside component
if "const { applications } = useData();" not in content:
    content = content.replace("const { t, language } = useTranslation();", "const { t, language } = useTranslation();\n  const { applications } = useData();")

# Add the badge inside the link
link_inner = '''
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{t(key)}</span>
              {active && <ChevronRight className="w-4 h-4 opacity-60" />}
'''

new_link_inner = '''
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{t(key)}</span>
              {newAppsCount > 0 && (
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
                    {newAppsCount > 99 ? '99+' : newAppsCount}
                  </span>
                </span>
              )}
              {active && newAppsCount === 0 && <ChevronRight className="w-4 h-4 opacity-60" />}
'''
content = content.replace(link_inner.strip(), new_link_inner.strip())

with open('src/components/layout/AdminSidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
