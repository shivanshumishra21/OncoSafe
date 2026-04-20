from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = getattr(user, 'role', 'patient')
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add role to response
        data['role'] = getattr(self.user, 'role', 'patient')
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        return data
