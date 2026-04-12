from django.db import transaction
from .models import Score

class ScoreService:
    @staticmethod
    @transaction.atomic
    def bulk_sync_scores(classroom, scores_date):
        # lay lay du lieu cu chuyen thanh dict toi uu truy xuat
        existings = {
            (s.enrollment_id, s.score_type_id): s
            for s in Score.objects.filter(enrollment__classroom=classroom)
        }

        incoming_keys = set()
        to_update = []
        to_create = []

        for item in scores_date:
            key = (item["enrollment"].id, item["score_type"].id)
            value = item["score_value"]

            incoming_keys.add(key)

            if key in existings:
                obj = existings[key]

                if obj.score_value != value:
                    obj.score_value = value   # 🔥 FIX
                    to_update.append(obj)
            else:
                to_create.append(
                    Score(
                        enrollment=item["enrollment"],   # ✔ dùng object
                        score_type=item["score_type"],   # ✔ dùng object
                        score_value=value
                    )
                )
        if to_update:
            Score.objects.bulk_update(to_update, ["score_value"])

        if to_create:
            Score.objects.bulk_create(to_create)

        to_delete = [
            obj.id for key, obj in existings.items() 
            if key not in incoming_keys
        ]

        deleted_count = 0
        if to_delete:
            deleted_count, _ = Score.objects.filter(id__in=to_delete).delete()

        return {
            "updated": len(to_update),
            "created": len(to_create),
            "deleted": deleted_count
        }