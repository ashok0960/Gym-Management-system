from django.http import HttpResponse

def home(request):
    return HttpResponse("Gym Management Backend is Running ✅")