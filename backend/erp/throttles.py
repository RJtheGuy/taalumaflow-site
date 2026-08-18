from rest_framework.throttling import AnonRateThrottle

class PublicExtractThrottle(AnonRateThrottle):
    rate = '10/min'

class PublicChatThrottle(AnonRateThrottle):
    rate = '30/min'