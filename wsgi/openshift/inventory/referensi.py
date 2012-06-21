__author__ = 'User'
from django.http import HttpResponse, HttpResponseServerError
from django.utils import simplejson as json
from utility import Utility
from inventory import models
from datetime import date
from django.db.models import Q

def dispatch(request):
    util = Utility(post=request.POST, get=request.GET)
    c = util.nvlGet('c');
    par = util.nvlGet('q', '')
    if c is not None:
        if 'referensi' == c:
            grup = util.nvlGet('grup', 0)
            field = util.nvlGet('field')
            refs = models.Referensi.objects.filter(grup__exact=grup)
            jrefs = []
            for ref in refs:
                jrefs.append(util.modelToDict(ref))
            return HttpResponse(json.dumps({'data': jrefs}))