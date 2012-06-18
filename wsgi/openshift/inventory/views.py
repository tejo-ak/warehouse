# Create your views here.
from django.http import HttpResponse
from django.template import Template, Context, loader
from django.shortcuts import render_to_response
from utility import Utility

def bcdt(request):
    return HttpResponse('''
    Maaf, Sistem Aplikasi BC 2.3 Sentralisasi sedang diperbaiki. <br/>
    Aplikasi dapat di gunakan kempabali pada pukul: <br/>
    <a style="font:24px verdana">10 : 50 AM</a>
    ''')

def index(request):
    util = Utility(post=request.POST, get=request.GET)
    c = util.nvlGet('c');
    if c is not None:
        if 'formtutorial' == c:
            return render_to_response('inventory/form_tutorial.html')
        if 'local' == c:
            t = loader.get_template('portal_ivtamd.html')
            djProd = '''http://ajax.googleapis.com/ajax/libs/dojo/1.7.2/'''
            djProdExt = '''.js'''
            djDev = '''/static/dojolib/'''
            djDevExt = '''.js'''
            d = {"dj": djDev, 'djExt': djProdExt}
            return HttpResponse(t.render(Context(d)))
        if 'home' == c:
            return render_to_response('inventory/web.html')
    else:
        #t = loader.get_template('portal_ivt.html')
        t = loader.get_template('portal_ivtamd.html')
        #        t = loader.get_template('portal_inventory.html') // the old system
        #djProd = '''http://ajax.googleapis.com/ajax/libs/dojo/1.6/'''
        djProd = '''http://ajax.googleapis.com/ajax/libs/dojo/1.7.2/'''
        djProdExt = '''.js'''
        djDev = '''/static/dojolib/'''
        djDevExt = '''.js'''
        d = {"dj": djProd, 'djExt': djProdExt}
        return HttpResponse(t.render(Context(d)))

