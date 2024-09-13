from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from user_management.models import User

class RegisterUser(APIView):
    def post(self, request):
        email = request.data.get('email')
        name = request.data.get('name')
        password = request.data.get('password')

        if User.objects.filter(email=email).exists():
            return Response({'msg': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            new_user = User.objects.create_user(
                email=email,
                name=name,
                password=password
            )
            new_user.save()
            return Response({'msg': 'User created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'msg': f'Error in creating user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class UserLogin(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                return Response({'msg': 'Login Successful'}, status=status.HTTP_200_OK)
            else:
                return Response({'msg': 'Incorrect username or password'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'msg': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

class TokenObtainSerializer(TokenObtainPairSerializer):
    def get_token(cls, user):
        token = super().get_token(user)
        token["name"] = user.name
        token["email"] = user.email
        token['isAdmin'] = user.is_superuser

        return token


class TokenView(TokenObtainPairView):
    serializer_class = TokenObtainSerializer
