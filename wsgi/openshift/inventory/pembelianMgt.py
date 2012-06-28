from datetime import datetime

__author__ = 'jote'
from django.http import HttpResponse, HttpResponseServerError
from django.template.loader import render_to_string
from django.shortcuts import render_to_response
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
        if 'formpembelian' == c:
            return HttpResponse(json.dumps(prepareFormBarang(util.data)))
        if 'formrencanapembelian' == c:
            return HttpResponse(json.dumps(prepareFormRencanaPembelian(util.data)))
        if 'simpanitempembelian' == c:
            ipbl = simpanItemPembelian(util.data)
            return HttpResponse(json.dumps(
                util.modelToDicts([ipbl.barang, ipbl.pembelian, ipbl.pembelian.supplier, ipbl],
                    replaces=['id:barang_id', 'id:id', 'id:supplier_id', 'id:id', 'id:itempembelian_id',
                              'tanggal:tgl_rencana_pembelian', 'nomor:no_rencana_pembelian'])))
        if 'getitempembelian' == c:
            ipbls = getItemPembelian(util.nvlGet('id', 0), util.nvlGet('a', 20))
            jitempembelians = []
            for ipbl in ipbls:
                jitem = util.modelToDicts([ipbl.barang, ipbl],
                    replaces=['id:barang_id'])
                jitempembelians.append(jitem)
            return HttpResponse(json.dumps(jitempembelians))
        if 'gethdrpembelian' == c:
            pbls = models.Pembelian.objects.filter(id__exact=util.nvlGet('id', 0))
            for pbl in pbls:
                jpbl = util.modelToDicts([pbl.supplier, pbl], prefiks=['supplier', ''])
                return HttpResponse(json.dumps({'data': jpbl}))
        if 'gettotalitempembelian' == c:
            y = 'nanti di garap'
        if 'formbrowsepembelian' == c:
            return render_to_response('inventory/form_pembelian_browse.html')
        if 'browsepembelian' == c:
            return HttpResponse(json.dumps({'data': browsePembelian(util.data)}))
        if 'simpanrencanapembelian' == c:
            bb = barangBisnis()
            pembelian_id = util.nvlGet('id', 0)
            html = '''
            <div class="formrow" style:font 12px verdana>Data rencana pembelian telah berhasil disimpang</div>
            <input type="button" value="Lanjut Perekaman" id="btnMore"/>
            '''
            if pembelian_id != 0:
                bb.debetPembelian(pembelian_id)
                return HttpResponse(
                    json.dumps({'sukses': True, 'message': 'Berhasil melakukan pembelian', 'html': html}))
            else: return HttpResponse(json.dumps({'sukses': False, 'message': 'Rencana pembelian tidak disimpan'}))
        if 'pembeliansider' == c:
            return HttpResponse(json.dumps({'html': getPembelianSider(util.data)}))
    return HttpResponseServerError('can''t find param')


def initPembelian(reqData):
    requtil = Utility(reqData=reqData);
    _apu = appUtil()
    #prepare inventory
    sups = models.Supplier.objects.filter(id__exact=requtil.nvlGet('supplier_id', 0))
    sup = None
    if len(sups):
        sup = sups[0];
    else: raise StandardError('Supplier ini tidak ditemukan')
    pbl = models.Pembelian()
    pbl.supplier = sup
    pbl.nomor = ('00000000000000%s' % (_apu.getIncrement(1)))[-6:]
    pbl.save()
    return pbl


def simpanPembelian(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)


def simpanItemPembelian(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)
    idBrg = requtil.nvlGet('barang_id', 0)
    pbl = None
    if id == 0:
        pbl = initPembelian(reqData)
    else:
        pbls = models.Pembelian.objects.filter(id__exact=id)
        if len(pbls):
            pbl = pbls[0]
            #prepare barang
    brg = None
    brgs = models.Barang.objects.filter(id__exact=idBrg)
    if len(brgs):
        brg = brgs[0]
    else:
        raise StandardError('Barang ini tidak ditemukan')
    ipbl = models.ItemPembelian()
    ipbl.barang = brg
    ipbl.pembelian = pbl
    ipbl.harga = requtil.nvlGet('barang_harga', 0)
    ipbl.jumlah = requtil.nvlGet('barang_qty', 0)
    ipbl.save()
    return ipbl


def getItemPembelian(id, a):
    ipbl = models.ItemPembelian.objects.filter(pembelian__id__exact=id)[:a]
    return ipbl


def prepareFormRencanaPembelian(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_rencana_pembelian.html', {})})
    data = {}
    if 'id' in reqData:
        id = requtil.nvlGet('id')
        if id > 0:
            cust = models.Customer.objects.get(id__exact=requtil.nvlGet('id'))
            data = requtil.modelToDicts([cust])
            jresp.update({'data': data});
    return jresp


def prepareFormBarang(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_pembelian.html', {})})
    data = {}
    if 'id' in reqData:
        id = requtil.nvlGet('id')
        if id > 0:
            brg = models.Barang.objects.get(id__exact=requtil.nvlGet('id'))
            data = requtil.modelToDicts([brg])
            jresp.update({'data': data});
    return jresp


def browsePembelian(reqData):
    requtil = Utility(reqData=reqData)
    farg = {};
    if requtil.nvlGet('par_nomor') is not None:
        farg['nomor__icontains'] = requtil.nvlGet('par_nomor')
    if requtil.nvlGet('par_nama') is not None:
        farg['supplier__nama__icontains'] = requtil.nvlGet('par_nama')
    if requtil.nvlGet('par_alamat') is not None:
        farg['supplier__alamat__icontains'] = requtil.nvlGet('par_alamat')
    if requtil.nvlDate('par_tanggal_awal', None) is not None:
        farg['tanggal__gte'] = requtil.nvlDate('par_tanggal_awal')
    if requtil.nvlDate('par_tanggal_akhir', None) is not None:
        farg['tanggal__lte'] = requtil.nvlDate('par_tanggal_akhir')
    if requtil.nvlGet('init') is not None:
        pas = models.Pembelian.objects.all(
        ).order_by(
            'tanggal')[0:requtil.nvlGet('n', 40)]
    else: pas = models.Pembelian.objects.filter(**farg).order_by(
        'waktu')[0:requtil.nvlGet('n', 40)]
    jdatas = [];
    for pa in pas:
        jdata = (Utility()).modelToDicts([pa.supplier, pa])
        jdatas.append(jdata);
    return jdatas;


def getPembelianSider(reqData):
    requtil = Utility(reqData=reqData)
    pas = models.Pembelian.objects.filter(id__exact=requtil.nvlGet('id'))
    if pas[0] is not None:
        jpas = requtil.modelToDicts([pas[0].supplier, pas[0]])
    items = models.ItemPembelian.objects.filter(pembelian__id__exact=pas[0].id)
    jitems = []
    jitem = {};
    if items[0] is not None:
        for item in items:
            jitem = requtil.modelToDicts([item.barang, item])
            jitems.append(jitem)
    jpas.update({'items': jitems})
    html = render_to_string('inventory/form_pembelian_sider.html', jpas)
    return html
