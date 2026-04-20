from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Permission class that allows only users with role='admin'
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', None) == 'admin'
        )


class IsPatientOwner(BasePermission):
    """
    Permission class that allows only users with role='patient' to access their own data
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', None) == 'patient'
        )
    
    def has_object_permission(self, request, view, obj):
        # Check if the object belongs to the authenticated user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'patient') and hasattr(obj.patient, 'user'):
            return obj.patient.user == request.user
        return False
