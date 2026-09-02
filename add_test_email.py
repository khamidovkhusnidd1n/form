import re

with open('backend/apps/common/urls.py', 'r', encoding='utf-8') as f:
    urls_content = f.read()

if 'test_email_view' not in urls_content:
    urls_content = urls_content.replace(
        "path('makemigrations/', views.run_makemigrations_view, name='run-makemigrations'),",
        "path('makemigrations/', views.run_makemigrations_view, name='run-makemigrations'),\n    path('test-email/', views.test_email_view, name='test_email'),"
    )

with open('backend/apps/common/urls.py', 'w', encoding='utf-8') as f:
    f.write(urls_content)

print("done")
