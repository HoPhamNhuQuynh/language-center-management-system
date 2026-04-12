from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from classes.models import ClassRoom
from .serializers import BulkSyncScoreSerializer
from .service import ScoreService

class BulkSyncScoreView(APIView):
    def post(self, request, class_id):
        serializer = BulkSyncScoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            classroom = ClassRoom.objects.get(pk=class_id)
        except ClassRoom.DoesNotExist:
            return Response(
                {"message": "Lớp học không tồn tại."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        result = ScoreService.bulk_sync_scores(
            classroom=classroom,
            scores_date=serializer.validated_data["scores"]
        )

        return Response(
            {
                "message": "Lưu toàn bộ danh sách điểm số thành công!",
                "data": result
            },
            status=status.HTTP_200_OK
        )