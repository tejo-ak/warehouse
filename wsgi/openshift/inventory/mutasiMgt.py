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
        if 'formmutasi' == c:
            return HttpResponse(json.dumps(prepareFormMutasi(util.data)))
        if 'simpanitemmutasi' == c:
            ipbl = simpanItemMutasi(util.data)
            return HttpResponse(json.dumps(
                util.modelToDicts([ipbl.barang, ipbl.mutasi, ipbl], prefiks=['barang_', 'mutasi_'])))
        if 'getitemmutasi' == c:
            ipbls = getItemMutasi(util.nvlGet('id', 0), util.nvlGet('a', 20))
            jitemmutasis = []
            for ipbl in ipbls:
                jitem = util.modelToDicts([ipbl.barang, ipbl],
                    replaces=['id:barang_id'])
                jitemmutasis.append(jitem)
            return HttpResponse(json.dumps(jitemmutasis))
        if 'gethdrmutasi' == c:
            pbls = models.Mutasi.objects.filter(id__exact=util.nvlGet('id', 0))
            for pbl in pbls:
                jpbl = util.modelToDicts([pbl])
                return HttpResponse(json.dumps({'data': jpbl}))
            return HttpResponse('No data with this id ')
        if 'gettotalitemmutasi' == c:
            y = 'nanti di garap'
        if 'formbrowsemutasi' == c:
            return render_to_response('inventory/form_mutasi_browse.html')
        if 'browsemutasi' == c:
            return HttpResponse(json.dumps({'data': browseMutasi(util.data)}))
        if 'simpanmutasi' == c:
            bb = barangBisnis()
            mutasi_id = util.nvlGet('id', 0)
            html = '''
            <div class="formrow" style:font 12px verdana>Data rencana mutasi telah berhasil disimpang</div>
            <input type="button" value="Lanjut Perekaman" id="btnMore"/>
            '''
            if mutasi_id != 0:
                bb.mutasiInventory(mutasi_id)
                return HttpResponse(
                    json.dumps({'sukses': True, 'message': 'Berhasil melakukan mutasi', 'html': html}))
            else: return HttpResponse(json.dumps({'sukses': False, 'message': 'Rencana mutasi tidak disimpan'}))
        if 'mutasisider' == c:
            return HttpResponse(json.dumps({'html': getMutasiSider(util.data)}))
    return HttpResponseServerError('can''t find param')


def initMutasi(reqData):
    requtil = Utility(reqData=reqData);
    _apu = appUtil()
    #prepare inventory
    pbl = models.Mutasi()
    pbl.nomor = ('00000000000000%s' % (_apu.getIncrement(4)))[-6:]
    pbl.asal = getInvById(requtil.nvlGet('inventory_asal_id'))
    pbl.tujuan = getInvById(requtil.nvlGet('inventory_tujuan_id'))
    pbl.save()
    return pbl


def getInvById(id):
    return models.Inventory.objects.get(id=id)


def simpanMutasi(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)


def simpanItemMutasi(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)
    idBrg = requtil.nvlGet('barang_id', 0)
    pbl = None
    if id == 0:
        pbl = initMutasi(reqData)
    else:
        pbls = models.Mutasi.objects.filter(id__exact=id)
        if len(pbls):
            pbl = pbls[0]
            #prepare barang
    brg = None
    brgs = models.Barang.objects.filter(id__exact=idBrg)
    if len(brgs):
        brg = brgs[0]
    else:
        raise StandardError('Barang ini tidak ditemukan')
    ipbl = models.ItemMutasi()
    ipbl.barang = brg
    ipbl.mutasi = pbl
    ipbl.harga = brg.harga
    ipbl.jumlah = requtil.nvlGet('barang_qty', 0)
    ipbl.save()
    return ipbl


def getItemMutasi(id, a):
    ipbl = models.ItemMutasi.objects.filter(mutasi__id__exact=id)[:a]
    return ipbl


def prepareFormMutasi(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_mutasi.html', {})})
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
    jresp = dict({'html': render_to_string('inventory/form_mutasi.html', {})})
    data = {}
    if 'id' in reqData:
        id = requtil.nvlGet('id')
        if id > 0:
            brg = models.Barang.objects.get(id__exact=requtil.nvlGet('id'))
            data = requtil.modelToDicts([brg])
            jresp.update({'data': data});
    return jresp


def browseMutasi(reqData):
    requtil = Utility(reqData=reqData)
    farg = {};
    if requtil.nvlGet('par_nomor') is not None:
        farg['nomor__icontains'] = requtil.nvlGet('par_nomor')
    if requtil.nvlDate('par_tanggal_awal', None) is not None:
        farg['tanggal__gte'] = requtil.nvlDate('par_tanggal_awal')
    if requtil.nvlDate('par_tanggal_akhir', None) is not None:
        farg['tanggal__lte'] = requtil.nvlDate('par_tanggal_akhir')
    if requtil.nvlGet('init') is not None:
        pas = models.Mutasi.objects.all(
        ).order_by(
            'tanggal')[0:requtil.nvlGet('n', 40)]
    else: pas = models.Mutasi.objects.filter(**farg).order_by(
        'waktu')[0:requtil.nvlGet('n', 40)]
    jdatas = [];
    for pa in pas:
        jdata = (Utility()).modelToDicts([pa])
        jdatas.append(jdata);
    return jdatas;


def getMutasiSider(reqData):
    requtil = Utility(reqData=reqData)
    pas = models.Mutasi.objects.filter(id__exact=requtil.nvlGet('id'))
    if pas[0] is not None:
        jpas = requtil.modelToDicts([pas[0].supplier, pas[0]])
    items = models.ItemMutasi.objects.filter(mutasi__id__exact=pas[0].id)
    jitems = []
    jitem = {};
    if items[0] is not None:
        for item in items:
            jitem = requtil.modelToDicts([item.barang, item])
            jitems.append(jitem)
    jpas.update({'items': jitems})
    html = render_to_string('inventory/form_mutasi_sider.html', jpas)
    return html
