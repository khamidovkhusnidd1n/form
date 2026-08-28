import re

with open('src/i18n.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "'brand.subtitle': \"Center for Retraining and Professional Development of Pedagogical and Specialist Personnel in Art Education Fields under the Academy of Fine Arts of Uzbekistan\",",
    "'brand.subtitle': \"Center for Retraining and Professional Development (AFA)\","
)
content = content.replace(
    "'brand.subtitle': 'Центр переподготовки и повышения квалификации педагогических и специалистов кадров направлений художественного образования при Академии художеств Узбекистана',",
    "'brand.subtitle': 'Центр переподготовки и повышения квалификации (АХУ)',"
)

with open('src/i18n.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
