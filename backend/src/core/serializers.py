from rest_framework import serializers
from cloudinary.utils import cloudinary_url

class ItemImageSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        image = instance.image

        if hasattr(image, 'url'):
            data['image'] = image.url
        elif isinstance(image, str) and image:
            url, _ = cloudinary_url(image)
            data['image'] = url
        else:
            data['image'] = None
            
        return data