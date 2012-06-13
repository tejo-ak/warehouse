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
        if 'formpengeluaranPabean' == c:
            return HttpResponse(json.dumps(prepareFormBarang(util.data)))
        if 'formpengeluaranpabean' == c:
            return HttpResponse(json.dumps(prepareFormPengeluaranPabean(util.data)))
        if 'simpanitempengeluaranpabean' == c:
            doc = simpanItemPengeluaranPabean(util.data)
            return HttpResponse(json.dumps(
                util.modelToDicts([doc.barang, doc, doc.dokumen], prefiks=['barang_', '', ''])))
        if 'getitempengeluaranpabean' == c:
            ipbls = getItemBarangPabean(util.nvlGet('id', 0), util.nvlGet('a', 20))
            jitempengeluaranPabeans = []
            for ipbl in ipbls:
                jitem = util.modelToDicts([ipbl.barang, ipbl],
                    replaces=['id:barang_id'])
                jitempengeluaranPabeans.append(jitem)
            return HttpResponse(json.dumps(jitempengeluaranPabeans))
        if 'gethdrpengeluaranpabean' == c:
            pbls = models.DokumenPabean.objects.filter(id__exact=util.nvlGet('id', 0))
            for pbl in pbls:
                jpbl = util.modelToDicts([pbl], prefiks=[''])
                return HttpResponse(json.dumps({'data': jpbl}))
        if 'gettotalitempengeluaranPabean' == c:
            y = 'nanti di garap'
        if 'formbrowsedokumenpabean' == c:
            return render_to_response('inventory/form_dokumen_pabean_browse.html')
        if 'browsedokumenpabean' == c:
            return HttpResponse(json.dumps({'data': browseDokumenPabean(util.data)}))
        if 'simpanpengeluaranpabean' == c:
            bb = barangBisnis()
            pengeluaranPabean_id = util.nvlGet('id', 0)
            html = '''
            <div class="formrow" style:font 12px verdana>Data rencana pengeluaranPabean telah berhasil disimpang</div>
            <input type="button" value="Lanjut Perekaman" id="btnMore"/>
            '''
            if pengeluaranPabean_id != 0:
                bb.pengeluaranPabean(pengeluaranPabean_id)
                return HttpResponse(
                    json.dumps({'sukses': True, 'message': 'Berhasil melakukan pengeluaranPabean', 'html': html}))
            else: return HttpResponse(
                json.dumps({'sukses': False, 'message': 'Rencana pengeluaranPabean tidak disimpan'}))
        if 'pengeluaranPabeansider' == c:
            return HttpResponse(json.dumps({'html': getPengeluaranPabeanSider(util.data)}))

        ## FORM PEMASUKAN PABEAN
        if 'formpemasukanpabean' == c:
            return HttpResponse(json.dumps(prepareFormPemasukanPabean(util.data)))
        if 'simpanitempemasukanpabean' == c:
            doc = simpanItemPengeluaranPabean(util.data)
            return HttpResponse(json.dumps(
                util.modelToDicts([doc.barang, doc, doc.dokumen], prefiks=['barang_', '', ''])))
        if 'getitempemasukanpabean' == c:
            ipbls = getItemBarangPabean(util.nvlGet('id', 0), util.nvlGet('a', 20))
            jitempengeluaranPabeans = []
            for ipbl in ipbls:
                jitem = util.modelToDicts([ipbl.barang, ipbl],
                    replaces=['id:barang_id'])
                jitempengeluaranPabeans.append(jitem)
            return HttpResponse(json.dumps(jitempengeluaranPabeans))
        if 'gethdrpemasukanpabean' == c:
            pbls = models.DokumenPabean.objects.filter(id__exact=util.nvlGet('id', 0))
            for pbl in pbls:
                jpbl = util.modelToDicts([pbl], prefiks=[''])
                return HttpResponse(json.dumps({'data': jpbl}))
        if 'simpanpemasukanpabean' == c:
            bb = barangBisnis()
            pengeluaranPabean_id = util.nvlGet('id', 0)
            html = '''
            <div class="formrow" style:font 12px verdana>Data rencana pengeluaranPabean telah berhasil disimpang</div>
            <input type="button" value="Lanjut Perekaman" id="btnMore"/>
            '''
            if pengeluaranPabean_id != 0:
                bb.pemasukanPabean(pengeluaranPabean_id)
                return HttpResponse(
                    json.dumps({'sukses': True, 'message': 'Berhasil melakukan pengeluaranPabean', 'html': html}))
            else: return HttpResponse(
                json.dumps({'sukses': False, 'message': 'Rencana pengeluaranPabean tidak disimpan'}))
        if 'getjenisdokumen' == c:
            pbls = models.Referensi.objects.filter(id__exact=util.nvlGet('jenisDokumen', 0))
            for pbl in pbls:
                return HttpResponse(json.dumps({'data': pbl.nama}))
    return HttpResponseServerError('can''t find param')


def initPengeluaranPabean(reqData):
    requtil = Utility(reqData=reqData);
    _apu = appUtil()
    #prepare inventory
    pbl = models.DokumenPabean()
    pbl = requtil.bindRequestModel(pbl)
    pbl.nomor = ('00000000000000%s' % (_apu.getIncrement(21)))[-6:]
    pbl.inventory = models.Inventory.objects.get(id__exact=requtil.nvlGet('inventory_id'))
    pbl.save()
    return pbl


def simpanPengeluaranPabean(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)


def simpanItemPengeluaranPabean(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)
    idBrg = requtil.nvlGet('barang_id', 0)
    print 'observer barang id'
    print idBrg
    pbl = None
    if id == 0:
        pbl = initPengeluaranPabean(reqData)
    else:
        pbls = models.DokumenPabean.objects.filter(id__exact=id)
        if len(pbls):
            pbl = pbls[0]
            #prepare barang
    brg = None
    brgs = models.Barang.objects.filter(id__exact=idBrg)
    if len(brgs):
        brg = brgs[0]
    else:
        raise StandardError('Barang ini tidak ditemukan')
    docpb = models.ItemDokumenPabean()
    #reset the id

    docpb = requtil.bindRequestModel(docpb)
    docpb.id = None#reset the id
    docpb.barang = brg
    docpb.dokumen = pbl
    docpb.harga = requtil.nvlGet('barang_harga', 0)
    docpb.jumlah = requtil.nvlGet('barang_qty', 0)
    docpb.save()
    return docpb


def simpanItemPemasukanPabean(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)
    idBrg = requtil.nvlGet('barang_id', 0)
    print 'observer barang id'
    print idBrg
    pbl = None
    if id == 0:
        pbl = initPengeluaranPabean(reqData)
    else:
        pbls = models.DokumenPabean.objects.filter(id__exact=id)
        if len(pbls):
            pbl = pbls[0]
            #prepare barang
    brg = None
    brgs = models.Barang.objects.filter(id__exact=idBrg)
    if len(brgs):
        brg = brgs[0]
    else:
        raise StandardError('Barang ini tidak ditemukan')
    docpb = models.ItemDokumenPabean()
    #reset the id

    docpb = requtil.bindRequestModel(docpb)
    docpb.id = None#reset the id
    docpb.barang = brg
    docpb.dokumen = pbl
    docpb.harga = requtil.nvlGet('barang_harga', 0)
    docpb.jumlah = requtil.nvlGet('barang_qty', 0)
    docpb.save()
    return docpb


def getItemBarangPabean(id, a):
    ipbl = models.ItemDokumenPabean.objects.filter(dokumen__id__exact=id)[:a]
    return ipbl


def prepareFormPengeluaranPabean(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_pengeluaran_pabean.html', {})})
    data = {}
    return jresp


def prepareFormPemasukanPabean(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_pemasukan_pabean.html', {})})
    data = {}
    return jresp


def prepareFormBarang(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_pengeluaranPabean.html', {})})
    data = {}
    if 'id' in reqData:
        id = requtil.nvlGet('id')
        if id > 0:
            brg = models.Barang.objects.get(id__exact=requtil.nvlGet('id'))
            data = requtil.modelToDicts([brg])
            jresp.update({'data': data});
    return jresp


def browseDokumenPabean(reqData):
    requtil = Utility(reqData=reqData)
    farg = {};
    if requtil.nvlGet('par_nomor') is not None:
        farg['nomor__icontains'] = requtil.nvlGet('par_nomor')
    if requtil.nvlDate('par_tanggal_awal', None) is not None:
        farg['tanggal__gte'] = requtil.nvlDate('par_tanggal_awal')
    if requtil.nvlDate('par_tanggal_akhir', None) is not None:
        farg['tanggal__lte'] = requtil.nvlDate('par_tanggal_akhir')
    if requtil.nvlGet('init') is not None:
        pas = models.DokumenPabean.objects.all(
        ).order_by(
            'tanggal')[0:requtil.nvlGet('n', 40)]
    else: pas = models.DokumenPabean.objects.filter(**farg).order_by(
        'waktu')[0:requtil.nvlGet('n', 40)]
    jdatas = [];
    for pa in pas:
        jdata = (Utility()).modelToDicts([pa.jenisDokumen, pa], prefiks=['doc_', ''])
        jdatas.append(jdata);
    return jdatas;


def getPengeluaranPabeanSider(reqData):
    requtil = Utility(reqData=reqData)
    pas = models.PengeluaranPabean.objects.filter(id__exact=requtil.nvlGet('id'))
    if pas[0] is not None:
        jpas = requtil.modelToDicts([pas[0].supplier, pas[0]])
    items = models.ItemPengeluaranPabean.objects.filter(pengeluaranPabean__id__exact=pas[0].id)
    jitems = []
    jitem = {};
    if items[0] is not None:
        for item in items:
            jitem = requtil.modelToDicts([item.barang, item])
            jitems.append(jitem)
    jpas.update({'items': jitems})
    html = render_to_string('inventory/form_pengeluaranPabean_sider.html', jpas)
    return html
