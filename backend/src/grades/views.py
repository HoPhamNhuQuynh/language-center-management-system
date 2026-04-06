from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from classes.models import ClassRoom
from enrollments.models import Enrollment
from grades.models import Score, AcademicResult
from grades import serializers


class ClassScoreListAPIView(APIView):
    def get(self, request, class_id):
        try:
            classroom = ClassRoom.objects.get(pk=class_id, active=True)
        except ClassRoom.DoesNotExist:
            return Response(
                {
                    'status': 'error',
                    'error': {
                        'code': 'NOT_FOUND',
                        'message': 'Class not found',
                        'details': None
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not request.user.is_authenticated:
            return Response(
                {
                    'status': 'error',
                    'error': {
                        'code': 'UNAUTHORIZED',
                        'message': 'Authentication required',
                        'details': None
                    }
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not (request.user.is_staff or request.user.is_teacher):
            return Response(
                {
                    'status': 'error',
                    'error': {
                        'code': 'FORBIDDEN',
                        'message': 'You do not have permission to access this resource',
                        'details': None
                    }
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if not request.user.is_staff:
            is_assigned_teacher = classroom.teachingassignment_set.filter(
                teacher=request.user
            ).exists()

            if not is_assigned_teacher:
                return Response(
                    {
                        'status': 'error',
                        'error': {
                            'code': 'FORBIDDEN',
                            'message': 'You are not assigned to this class',
                            'details': None
                        }
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        enrollments = Enrollment.objects.filter(
            classroom_id=class_id,
            active=True
        ).select_related('user')

        result = []

        for enrollment in enrollments:
            score_qs = Score.objects.filter(
                enrollment=enrollment,
                active=True
            ).select_related('score_type')

            academic_result = AcademicResult.objects.filter(
                enrollment=enrollment,
                active=True
            ).first()

            scores_data = []
            for score in score_qs:
                scores_data.append({
                    'score_type': score.score_type.name,
                    'score_value': score.score_value,
                })

            result.append({
                'user_id': enrollment.user.id,
                'first_name': enrollment.user.first_name,
                'last_name': enrollment.user.last_name,
                'scores': scores_data,
                'average_score': academic_result.average_score if academic_result else None,
                'comment': academic_result.comment if academic_result else None,
            })

        serializer = serializers.ClassStudentScoreSerializer(result, many=True)

        return Response(
            {
                'status': 'success',
                'data': serializer.data,
                'message': 'Class scores retrieved successfully'
            },
            status=status.HTTP_200_OK
        )