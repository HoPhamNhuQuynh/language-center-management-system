from rest_framework.pagination import PageNumberPagination

class ClassRoomPaginator(PageNumberPagination):
    page_size = 8