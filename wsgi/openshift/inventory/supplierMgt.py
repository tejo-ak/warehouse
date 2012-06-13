from datetime import datetime

__author__ = 'jote'
from django.http import HttpResponse, HttpResponseServerError
from django.template.loader import render_to_string
from django.shortcuts import render_to_response
from django.utils import simplejson as json
from utility import Utility
from inventory import models
from datetime import date
from django.db.models import Q

#this module basicly manage the
def dispatch(request):
    util = Utility(post=request.POST, get=request.GET)
    c = util.nvlGet('c');
    par = util.nvlGet('q', '')
    if c is not None:
        if 'formsupplier' == c:
            return HttpResponse(json.dumps(prepareFormSupplier(util.data)))
        if 'formpencariansupplier' == c:
            return render_to_response('inventory/form_supplier_cari.html')
        if 'pencariansupplier' == c:
            return HttpResponse(json.dumps({'data': pencarianSupplier(util.data)}))
        if 'suppliersider' == c:
            return HttpResponse(json.dumps({'html': getSupplierSider(util.data)}))
        if 'carisupplier' == c:
            return render_to_response('inventory/cari_kata_kunci.html')
        if 'lookupsupplier' == c:
            return HttpResponse(json.dumps(
                lookupSupplier(util.nvlGet('katakunci', None), util.nvlGet('id', None), util.nvlGet('max', None))));
        if 'formlistsupplier' == c:
            return HttpResponse(json.dumps(dict(
                    {'html': render_to_string('inventory/list_supplier.html'),
                     'data': prepareListSupplierByKataKunci(util.data)})))
        if 'supplierbyname' == c:
            par = util.nvlGet('q', '')
            namas = []
            #g=500/0
            nama = 'noname'
            if len(par) > 2:
                pas = models.Supplier.objects.filter(nama__icontains=par)[:util.nvlGet('a', 8)]
                for p in pas:
                    nama = util.modelToDicts([p])
                    namas.append(nama)
                    #return HttpResponseServerError('error dari server lhoo')
            data = dict({'eventid': util.nvlGet('eventid'), 'data': namas})
            return HttpResponse(json.dumps(data))
        if 'supplierbyid' == c:
            print 'parameter supplier by id' + str(par)
            sups = models.Supplier.objects.filter(id__exact=par)
            sup = models.Supplier()
            if len(sups):
                sup = sups[0]
            return HttpResponse(json.dumps(util.modelToDict(sup)))
        if 'supplier_bynamalamat' == c:
            jresp = dict({'data': prepareListSupplierByKataKunci(util.data), 'eventid': util.nvlGet('eventid')})
            return HttpResponse(json.dumps(jresp))
        if 'hapussupplier' == c:
            sups = models.Supplier.objects.filter(id__exact=util.nvlGet('id', 0));
            dp = {}
            if sups:
                #hapus semua barang di inventory
                dp = util.modelToDict(sups[0])
                sups[0].delete()
            return HttpResponse(json.dumps(dp))
        if 'updatesupplier' == c:
        #hanya untuk mengupdate data barang, bukan barang di inventory
            return HttpResponse(json.dumps(saveUpdateSupplier(util.data)))
        if 'simpansupplier' == c:
            #simpanPasien(request.POST)
            return HttpResponse(json.dumps(saveUpdateSupplier(util.data)))

    return HttpResponseServerError('can''t find param')


def pencarianSupplier(reqData):
    requtil = Utility(reqData=reqData)
    farg = {};
    if requtil.nvlGet('par_nama') is not None:
        print(requtil.nvlGet('par_nama'))
        farg['nama__icontains'] = requtil.nvlGet('par_nama')
    if requtil.nvlGet('par_alamat') is not None:
        farg['alamat__icontains'] = requtil.nvlGet('par_alamat')
    if requtil.nvlGet('init') is not None:
        pas = models.Supplier.objects.all(
        ).order_by(
            'nama')[0:requtil.nvlGet('n', 40)]
    else: pas = models.Supplier.objects.filter(**farg).order_by(
        'nama')[0:requtil.nvlGet('n', 40)]
    jdatas = [];
    for pa in pas:
        jdata = (Utility()).modelToDicts([pa])
        jdatas.append(jdata);
    return jdatas;


def prepareListSupplierByKataKunci((reqData)):
    requtil = Utility(reqData=reqData)
    kunci = requtil.nvlGet('kunci', None)
    jsups = []
    if kunci is not None:
        sups = models.Supplier.objects.filter(
            Q(nama__icontains=kunci) | Q(alamat__icontains=kunci))[
               :requtil.nvlGet('a', 8)]
    else:
        sups = models.Supplier.objects.all()[:requtil.nvlGet('a', 8)]
    for sup in sups:
        jsup = requtil.modelToDict(sup)
        jsups.append(jsup)
    return jsups;


def prepareFormSupplier(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_supplier.html', {})})
    data = {}
    if 'id' in reqData:
        id = requtil.nvlGet('id')
        if id > 0:
            sup = models.Supplier.objects.get(id__exact=requtil.nvlGet('id'))
            data = requtil.modelToDicts([sup])
            jresp.update({'data': data});
    return jresp


def saveUpdateSupplier(reqData):
    requtil = Utility(reqData=reqData)
    sup = models.Supplier()
    sup = requtil.bindRequestModel(sup)
    if requtil.nvlGet('id', None) is None:
        #barang baru di inventory
        #init barang di inventory object
        #init barang object

        sup.save()
    else: sup.save()
    return requtil.modelToDicts([sup])


def getSupplierSider(reqData):
    requtil = Utility(reqData=reqData)
    pas = models.Supplier.objects.filter(id__exact=requtil.nvlGet('id'))
    if pas[0] is not None:
        id = pas[0].id
        jpas = requtil.modelToDicts([pas[0]])
    html = render_to_string('inventory/form_supplier_sider.html', jpas)
    return html


def lookupSupplier(katakunci, id, max):
    requtil = Utility()
    if max is None:
        max = 40;
    pasiens = []
    if katakunci is not None and '' != katakunci and id is None:
        print katakunci
        print max
        pasiens = models.Supplier.objects.filter(
            Q(nama__icontains=katakunci) | Q(alamat__icontains=katakunci))[
                  :max]
    elif id is not None:
        pasiens = models.Supplier.objects.filter(
            id__exact=id)[
                  :max]
    else:
        pasiens = models.Supplier.objects.all()[:max]
    jpasiens = [];
    for pasien in pasiens:
        jpasien = requtil.modelToDicts([pasien])
        jpasiens.append(jpasien)
    return jpasiens;