from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import AdminUser


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = AdminUserSerializer(self.user).data
        return data


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ['id', 'username', 'email', 'full_name', 'role', 'is_active', 'created_at', 'last_login']
        read_only_fields = ['id', 'created_at', 'last_login']

    def update(self, instance, validated_data):
        role = validated_data.get('role', instance.role)
        if role in ('super_admin', 'superadmin'):
            instance.is_superuser = True
        elif 'role' in validated_data and role not in ('super_admin', 'superadmin'):
            instance.is_superuser = False
        return super().update(instance, validated_data)


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = AdminUser
        fields = ['username', 'email', 'full_name', 'role', 'password', 'is_active']

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        if password:
            candidate_user = AdminUser(
                username=attrs.get('username'),
                email=attrs.get('email'),
                full_name=attrs.get('full_name'),
            )
            try:
                validate_password(password, user=candidate_user)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({'password': list(exc.messages)})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = AdminUser(**validated_data)
        if validated_data.get('role') in ('super_admin', 'superadmin') or user.role in ('super_admin', 'superadmin'):
            user.is_superuser = True
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        user = self.context.get('request').user if self.context.get('request') else None
        try:
            validate_password(value, user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

