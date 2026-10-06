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


class ParticipantRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = AdminUser
        fields = ['email', 'full_name', 'password']
        
    def validate_email(self, value):
        if AdminUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu email allaqachon ro'yxatdan o'tgan.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Generate username from email
        email = validated_data['email']
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while AdminUser.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
            
        user = AdminUser(
            username=username,
            email=email,
            full_name=validated_data.get('full_name', ''),
            role=AdminUser.Role.PARTICIPANT,
            is_staff=False,
            is_superuser=False,
            is_active=False  # Must be activated via OTP
        )
        user.set_password(password)
        user.save()
        return user

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, max_length=6)

from django.contrib.auth import authenticate

class EmailOrUsernameTokenObtainPairSerializer(CustomTokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get('username')
        password = attrs.get('password')
        
        # Try to find user by email
        try:
            user = AdminUser.objects.get(email=username_or_email)
            username = user.username
        except AdminUser.DoesNotExist:
            username = username_or_email
            
        attrs['username'] = username
        return super().validate(attrs)
