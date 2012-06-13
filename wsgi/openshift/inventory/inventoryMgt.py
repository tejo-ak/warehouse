__author__ = 'jote'
from django.http import HttpResponse,HttpResponseServerError
from django.template.loader import render_to_string
from django.shortcuts import render_to_response
from django.utils import simplejson as json
from utility import Utility
from inventory import models


def dispatch(request):
    util = Utility(post=request.POST, get=request.GET)
    c = util.nvlGet('c');
    if c is not None:
        if 'cariinventory' == c:
            return render_to_response('inventory/cari_inventory.html')
        if 'forminventory' == c:
            return HttpResponse(json.dumps(prepareFormInventory(util.data)))
        if 'inventorybyname' == c:
            par = util.nvlGet('q', '')
            namas = [];
            #g=500/0
            nama = 'noname';
            if len(par) > 2:
                pas = models.Inventory.objects.filter(nama__icontains=par)[:util.nvlGet('a', 8)]
                for p in pas:
                    nama = util.modelToDict(p)
                    namas.append(nama)
                    #return HttpResponseServerError('error dari server lhoo')
            data = dict({'eventid': util.nvlGet('eventid'), 'data': namas})
            return HttpResponse(json.dumps(data))
        if 'invetorybyid' == c:
            nama = models.Inventory.objects.filter(id__exact=par)
            return HttpResponse(namas)
        if 'hapusinventory' == c:
            print 'start menghapus pasien ' + util.nvlGet('id', 'no id')
            pasien = models.Inventory.objects.filter(id__exact=util.nvlGet('id', 0));
            dp = {}
            if pasien:
                dp = util.modelToDict(pasien[0])
                print 'pasien telah dihapus'
                pasien.delete()
            return HttpResponse(json.dumps(dp))
        if 'simpaninventory' == c:
            #simpanPasien(request.POST)
            return HttpResponse(json.dumps(saveUpdateInventory(util.data)))

    return HttpResponse('can''t find param')


def prepareFormInventory(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_inventory.html', {})})
    data = {}
    if 'id' in reqData:
        id = requtil.nvlGet('id')
        if id > 0:
            pas = models.Inventory.objects.get(id__exact=requtil.nvlGet('id'))
            data = requtil.modelToDict(pas)
            jresp.update({'data': data})
    return jresp


def saveUpdateInventory(reqData):
    requtil = Utility(reqData=reqData)
    inventory = models.Inventory()
    inventory = requtil.bindRequestModel(inventory)
    if requtil.hasKey('jnsInventory'):
        refJns = models.Referensi.objects.filter(id__exact=requtil.nvlGet('jnsInventory'))
        print refJns[0].nama
        inventory.jenis = refJns[0]

    if requtil.hasKey('jnsMetode'):
        refMet = models.Referensi.objects.filter(id__exact=requtil.nvlGet('jnsMetode'))
        inventory.metode = refMet[0]
    if requtil.nvlGet('id', None) is None:
        inventory.save()
    else: inventory.save()
    return requtil.modelToDict(inventory)