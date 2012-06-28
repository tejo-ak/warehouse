from datetime import datetime

__author__ = 'jote'
from django.http import HttpResponse, HttpResponseServerError
from django.template.loader import render_to_string
#from django.shortcuts import render_to_response
from django.utils import simplejson as json
from utility import Utility
from inventory import models
from barangBisnis import barangBisnis
from appUtil import appUtil
import settings

#this module basicly manage the
def dispatch(request):
    util = Utility(post=request.POST, get=request.GET)
    c = util.nvlGet('c');
    par = util.nvlGet('q', '')
    if c is not None:
        if 'formrencanapenjualan' == c:
            return HttpResponse(json.dumps(prepareFormRencanaPenjualan(util.data)))
        if 'simpanitempenjualan' == c:
            ipbl = simpanItemPenjualan(util.data)
            return HttpResponse(json.dumps(
                util.modelToDicts([ipbl.barang, ipbl.penjualan, ipbl.penjualan.customer, ipbl],
                    replaces=['id:barang_id', 'id:id', 'id:customer_id', 'id:id', 'id:itempenjualan_id',
                              'tanggal:tgl_rencana_penjualan', 'nomor:no_rencana_penjualan'])))
        if 'getitempenjualan' == c:
            ipbls = getItemPenjualan(util.nvlGet('id', 0), util.nvlGet('a', 20))
            jitempenjualans = []

            for ipbl in ipbls:
                jitem = util.modelToDicts([ipbl.barang, ipbl],
                    replaces=['id:barang_id'])
                jitempenjualans.append(jitem)
            return HttpResponse(json.dumps(jitempenjualans))
        if 'gettotalitempenjualan' == c:
            y = 'nanti di garap'
        if 'simpanrencanapenjualan' == c:
            bb = barangBisnis()
            penjualan_id = util.nvlGet('id', 0)
            html = '''
            <div class="formrow" style:font 12px verdana>Data rencana penjualan telah berhasil disimpang</div>
            <input type="button" value="Lanjut Perekaman" id="btnMore"/>
            '''
            if penjualan_id != 0:
                bb.kreditPenjualan(penjualan_id)
                return HttpResponse(
                    json.dumps({'sukses': True, 'message': 'Berhasil melakukan penjualan', 'html': html}))
            else: return HttpResponse(json.dumps({'sukses': False, 'message': 'Rencana penjualan tidak disimpan'}))
    return HttpResponseServerError('can''t find param')


def initPenjualan(reqData):
    requtil = Utility(reqData=reqData);
    _apu = appUtil()
    #prepare inventory
    sups = models.Customer.objects.filter(id__exact=requtil.nvlGet('customer_id', 0))
    sup = None
    if len(sups):
        sup = sups[0];
    else: raise StandardError('Customer ini tidak ditemukan')
    pbl = models.Penjualan()
    pbl.customer = sup
    pbl.nomor = ('00000000000000%s' % (_apu.getIncrement(2)))[-6:]
    pbl.save()
    return pbl


def simpanPenjualan(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)


def simpanItemPenjualan(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)
    idBrg = requtil.nvlGet('barang_id', 0)
    pbl = None
    if id == 0:
        pbl = initPenjualan(reqData)
    else:
        pbls = models.Penjualan.objects.filter(id__exact=id)
        if len(pbls):
            pbl = pbls[0]
            #prepare barang
    brg = None
    brgs = models.Barang.objects.filter(id__exact=idBrg)
    if len(brgs):
        brg = brgs[0]
    else:
        raise StandardError('Barang ini tidak ditemukan')
    ipbl = models.ItemPenjualan()
    ipbl.barang = brg
    ipbl.penjualan = pbl
    ipbl.harga = requtil.nvlGet('barang_harga', 0)
    ipbl.jumlah = requtil.nvlGet('barang_qty', 0)
    ipbl.save()
    return ipbl


def getItemPenjualan(id, a):
    ipbl = models.ItemPenjualan.objects.filter(penjualan__id__exact=id)[:a]
    return ipbl


def prepareFormRencanaPenjualan(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_rencana_penjualan.html', {})})
    data = {}
    if 'id' in reqData:
        id = requtil.nvlGet('id')
        if id > 0:
            cust = models.Customer.objects.get(id__exact=requtil.nvlGet('id'))
            data = requtil.modelToDicts([cust])
            jresp.update({'data': data});
    return jresp
