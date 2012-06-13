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
        if 'formcustomer' == c:
            return HttpResponse(json.dumps(prepareFormCustomer(util.data)))
        if 'formpencariancustomer' == c:
            return render_to_response('inventory/form_customer_cari.html')
        if 'pencariancustomer' == c:
            return HttpResponse(json.dumps({'data': pencarianCustomer(util.data)}))
        if 'customersider' == c:
            return HttpResponse(json.dumps({'html': getCustomerSider(util.data)}))
        if 'caricustomer' == c:
            return render_to_response('inventory/cari_kata_kunci.html')
        if 'lookupcustomer' == c:
            return HttpResponse(json.dumps(
                lookupCustomer(util.nvlGet('katakunci', None), util.nvlGet('id', None), util.nvlGet('max', None))));
        if 'formlistcustomer' == c:
            return HttpResponse(json.dumps(dict(
                    {'html': render_to_string('inventory/list_customer.html'),
                     'data': prepareListCustomerByKataKunci(util.data)})))
        if 'customerbyname' == c:
            par = util.nvlGet('q', '')
            namas = []
            #g=500/0
            nama = 'noname'
            if len(par) > 2:
                pas = models.Customer.objects.filter(nama__icontains=par)[:util.nvlGet('a', 8)]
                for p in pas:
                    nama = util.modelToDicts([p])
                    namas.append(nama)
                    #return HttpResponseServerError('error dari server lhoo')
            data = dict({'eventid': util.nvlGet('eventid'), 'data': namas})
            return HttpResponse(json.dumps(data))
        if 'customerbyid' == c:
            cuss = models.Customer.objects.filter(id__exact=par)
            for cus in cuss:
                return HttpResponse(json.dumps(util.modelToDict(cus)))
            return HttpResponse({'message': 'no customer'})
        if 'customer_bynamalamat' == c:
            jresp = dict({'data': prepareListCustomerByKataKunci(util.data), 'eventid': util.nvlGet('eventid')})
            return HttpResponse(json.dumps(jresp))
        if 'hapuscustomer' == c:
            custs = models.Supplier.objects.filter(id__exact=util.nvlGet('id', 0));
            dp = {}
            if custs:
                #hapus semua barang di inventory
                dp = util.modelToDict(custs[0])
                custs[0].delete()
            return HttpResponse(json.dumps(dp))
        if 'updatesupplier' == c:
        #hanya untuk mengupdate data barang, bukan barang di inventory
            return HttpResponse(json.dumps(saveUpdateCustomer(util.data)))
        if 'simpancustomer' == c:
            #simpanPasien(request.POST)
            return HttpResponse(json.dumps(saveUpdateCustomer(util.data)))

    return HttpResponseServerError('can''t find param')


def prepareListCustomerByKataKunci((reqData)):
    requtil = Utility(reqData=reqData)
    kunci = requtil.nvlGet('kunci', None)
    if kunci is not None:
        custs = models.Customer.objects.filter(
            Q(nama__icontains=kunci) | Q(alamat__icontains=kunci))[
                :requtil.nvlGet('a', 8)]
    else:
        custs = models.Customer.objects.all()[:requtil.nvlGet('a', 8)]
    jcusts = [];
    for cust in custs:
        jcust = requtil.modelToDict(cust)
        jcusts.append(jcust)
    return jcusts;


def prepareFormCustomer(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_customer.html', {})})
    data = {}
    if 'id' in reqData:
        id = requtil.nvlGet('id')
        if id > 0:
            cust = models.Customer.objects.get(id__exact=requtil.nvlGet('id'))
            data = requtil.modelToDicts([cust])
            jresp.update({'data': data});
    return jresp


def saveUpdateCustomer(reqData):
    requtil = Utility(reqData=reqData)
    cust = models.Customer()
    #init barang object
    cust = requtil.bindRequestModel(cust)
    if requtil.nvlGet('id', None) is None:
        #barang baru di inventory
        #init barang di inventory object

        cust.save()
    else: cust.save()
    return requtil.modelToDicts([cust])


def getCustomerSider(reqData):
    requtil = Utility(reqData=reqData)
    pas = models.Customer.objects.filter(id__exact=requtil.nvlGet('id'))
    if pas[0] is not None:
        id = pas[0].id
        jpas = requtil.modelToDicts([pas[0]])
    html = render_to_string('inventory/form_customer_sider.html', jpas)
    return html


def pencarianCustomer(reqData):
    requtil = Utility(reqData=reqData)
    farg = {};
    if requtil.nvlGet('par_nama') is not None:
        print(requtil.nvlGet('par_nama'))
        farg['nama__icontains'] = requtil.nvlGet('par_nama')
    if requtil.nvlGet('par_alamat') is not None:
        farg['alamat__icontains'] = requtil.nvlGet('par_alamat')
    if requtil.nvlGet('init') is not None:
        pas = models.Customer.objects.all(
        ).order_by(
            'nama')[0:requtil.nvlGet('n', 40)]
    else: pas = models.Customer.objects.filter(**farg).order_by(
        'nama')[0:requtil.nvlGet('n', 40)]
    jdatas = [];
    for pa in pas:
        jdata = (Utility()).modelToDicts([pa])
        jdatas.append(jdata);
    return jdatas;


def lookupCustomer(katakunci, id, max):
    requtil = Utility()
    if max is None:
        max = 40;
    pasiens = []
    if katakunci is not None and '' != katakunci and id is None:
        print katakunci
        print max
        pasiens = models.Customer.objects.filter(
            Q(nama__icontains=katakunci) | Q(alamat__icontains=katakunci))[
                  :max]
    elif id is not None:
        pasiens = models.Customer.objects.filter(
            id__exact=id)[
                  :max]
    else:
        pasiens = models.Customer.objects.all()[:max]
    jpasiens = [];
    for pasien in pasiens:
        jpasien = requtil.modelToDicts([pasien])
        jpasiens.append(jpasien)
    return jpasiens;