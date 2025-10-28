from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import MyTokenObtainPairSerializer, CompanySettingsSerializer
from .models import CompanySettings

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def company_settings(request):
    """
    GET: Retrieve company settings
    PUT: Update company settings
    """
    # Get or create company settings
    company_settings_obj = CompanySettings.get_company_settings()
    
    if request.method == 'GET':
        serializer = CompanySettingsSerializer(company_settings_obj)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = CompanySettingsSerializer(company_settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
