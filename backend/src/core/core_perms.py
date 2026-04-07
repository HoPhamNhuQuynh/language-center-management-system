
from rest_framework import permissions

class IsTeacher(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_teacher)
        
    
class IsStudent(permissions.IsAuthenticated):
    def has_permission(self, request, view):        
        return bool(request.user and request.user.is_student)
    
class IsAdmin(permissions.IsAuthenticated):
    def has_permission(self, request, view):        
        return bool(request.user and (request.user.is_staff or request.user.is_superuser))
