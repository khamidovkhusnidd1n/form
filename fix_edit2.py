import re

with open('src/pages/admin/ApplicationsPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { Search, Eye, Download, ChevronLeft, ChevronRight, MessageSquare, CheckCircle, Globe, Sparkles, Trash2, AlertTriangle } from 'lucide-react';",
    "import { Search, Eye, Download, ChevronLeft, ChevronRight, MessageSquare, CheckCircle, Globe, Sparkles, Trash2, AlertTriangle, Edit2 } from 'lucide-react';"
)

with open('src/pages/admin/ApplicationsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
