import re

with open('backend/apps/accounts/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_destroy = '''    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.role == 'super_admin':
            return Response({'detail': "Super Adminni o'chirib bo'lmaydi"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)'''

new_destroy = '''    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({'detail': "O'zingizni o'chira olmaysiz"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)'''

content = content.replace(old_destroy, new_destroy)

with open('backend/apps/accounts/views.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated accounts/views.py")
