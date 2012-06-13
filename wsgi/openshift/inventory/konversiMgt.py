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
        if 'formkonversi' == c:
            return HttpResponse(json.dumps(prepareFormKonversi(util.data)))
        if 'simpanitemkonversi' == c:
            ipbl = simpanItemKonversi(util.data)
            return HttpResponse(json.dumps(
                util.modelToDicts([ipbl.barang, ipbl.konversi, ipbl], prefiks=['barang_', 'konversi_'])))
        if 'hapusitemkonversi' == c:
            iks = models.ItemKonversi.objects.filter(id__exact=util.nvlGet('itemId'))
            for ik in iks:
                jik = util.modelToDicts([ik])
                ik.delete()
                return HttpResponse(json.dumps(jik))
        if 'getitemkonversi' == c:
            ipbls = getItemKonversi(util.nvlGet('id', 0), util.nvlGet('kredebit'), util.nvlGet('jenisProduk', 1),
                util.nvlGet('a', 20))
            jitemkonversis = []
            for ipbl in ipbls:
                jitem = util.modelToDicts([ipbl.barang, ipbl],
                    replaces=['id:barang_id'])
                jitemkonversis.append(jitem)
            return HttpResponse(json.dumps(jitemkonversis))
        if 'gethdrkonversi' == c:
            pbls = models.Konversi.objects.filter(id__exact=util.nvlGet('id', 0))
            for pbl in pbls:
                jpbl = util.modelToDicts([pbl])
                return HttpResponse(json.dumps({'data': jpbl}))
            return HttpResponse('No data with this id ')
        if 'gettotalitemkonversi' == c:
            y = 'nanti di garap'
        if 'formbrowsekonversi' == c:
            return render_to_response('inventory/form_konversi_browse.html')
        if 'browsekonversi' == c:
            return HttpResponse(json.dumps({'data': browseKonversi(util.data)}))
        if 'simpankonversi' == c:
            bb = barangBisnis()
            konversi_id = util.nvlGet('id', 0)
            html = '''
            <div class="formrow" style:font 12px verdana>Data rencana konversi telah berhasil disimpang</div>
            <input type="button" value="Lanjut Perekaman" id="btnMore"/>
            '''
            if konversi_id != 0:
                bb.konversiProduksi(konversi_id)
                return HttpResponse(
                    json.dumps({'sukses': True, 'message': 'Berhasil melakukan konversi', 'html': html}))
            else: return HttpResponse(json.dumps({'sukses': False, 'message': 'Rencana konversi tidak disimpan'}))
        if 'konversisider' == c:
            return HttpResponse(json.dumps({'html': getKonversiSider(util.data)}))
    return HttpResponseServerError('can''t find param')


def initKonversi(reqData):
    requtil = Utility(reqData=reqData);
    _apu = appUtil()
    #prepare inventory
    pbl = models.Konversi()
    pbl.nomor = ('00000000000000%s' % (_apu.getIncrement(16)))[-6:]
    pbl.inventory = getInvById(requtil.nvlGet('inventory_id'))
    pbl.save()
    return pbl


def getInvById(id):
    return models.Inventory.objects.get(id=id)


def simpanKonversi(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)


def simpanItemKonversi(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)
    idBrg = requtil.nvlGet('barang_id', 0)
    pbl = None
    if id == 0:
        pbl = initKonversi(reqData)
    else:
        pbls = models.Konversi.objects.filter(id__exact=id)
        if len(pbls):
            pbl = pbls[0]
            #prepare barang
    brg = None
    brgs = models.Barang.objects.filter(id__exact=idBrg)
    if len(brgs):
        brg = brgs[0]
    else:
        raise StandardError('Barang ini tidak ditemukan')
    ipbl = models.ItemKonversi()
    ipbl.barang = brg
    ipbl.konversi = pbl
    ipbl.kredebit = requtil.nvlGet('kredebit')
    ipbl.jenisProduk = requtil.nvlGet('jenisProduk')
    ipbl.harga = brg.harga
    ipbl.jumlah = requtil.nvlGet('barang_qty', 0)
    ipbl.save()
    return ipbl


def getItemKonversi(id, kredebit, jenisProduk, a):
    if 'K' == kredebit:
        print 'observing get item conversion'
        print kredebit
        print id
        print a
        ipbl = models.ItemKonversi.objects.filter(
            konversi__id__exact=id, kredebit__exact=kredebit)[:a]
        print len(ipbl)
    else:
        ipbl = models.ItemKonversi.objects.filter(
            konversi__id__exact=id, kredebit__exact=kredebit, jenisProduk__exact=jenisProduk)[:a]
    return ipbl


def prepareFormKonversi(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_konversi.html', {})})
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
    jresp = dict({'html': render_to_string('inventory/form_konversi.html', {})})
    data = {}
    if 'id' in reqData:
        id = requtil.nvlGet('id')
        if id > 0:
            brg = models.Barang.objects.get(id__exact=requtil.nvlGet('id'))
            data = requtil.modelToDicts([brg])
            jresp.update({'data': data});
    return jresp


def browseKonversi(reqData):
    requtil = Utility(reqData=reqData)
    farg = {};
    if requtil.nvlGet('par_nomor') is not None:
        farg['nomor__icontains'] = requtil.nvlGet('par_nomor')
    if requtil.nvlDate('par_tanggal_awal', None) is not None:
        farg['tanggal__gte'] = requtil.nvlDate('par_tanggal_awal')
    if requtil.nvlDate('par_tanggal_akhir', None) is not None:
        farg['tanggal__lte'] = requtil.nvlDate('par_tanggal_akhir')
    if requtil.nvlGet('init') is not None:
        pas = models.Konversi.objects.all(
        ).order_by(
            'tanggal')[0:requtil.nvlGet('n', 40)]
    else: pas = models.Konversi.objects.filter(**farg).order_by(
        'waktu')[0:requtil.nvlGet('n', 40)]
    jdatas = [];
    for pa in pas:
        jdata = (Utility()).modelToDicts([pa])
        jdatas.append(jdata);
    return jdatas;


def getKonversiSider(reqData):
    requtil = Utility(reqData=reqData)
    pas = models.Konversi.objects.filter(id__exact=requtil.nvlGet('id'))
    if pas[0] is not None:
        jpas = requtil.modelToDicts([pas[0].supplier, pas[0]])
    items = models.ItemKonversi.objects.filter(konversi__id__exact=pas[0].id)
    jitems = []
    jitem = {};
    if items[0] is not None:
        for item in items:
            jitem = requtil.modelToDicts([item.barang, item])
            jitems.append(jitem)
    jpas.update({'items': jitems})
    html = render_to_string('inventory/form_konversi_sider.html', jpas)
    return html
