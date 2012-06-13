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
        if 'formopname' == c:
            return HttpResponse(json.dumps(prepareFormOpname(util.data)))
        if 'simpanitemopname' == c:
            iop = simpanItemOpname(util.data)
            return HttpResponse(json.dumps(
                util.modelToDicts([iop.barang, iop.opname, iop], prefiks=['barang_', 'opname_', ''])))
        if 'hapusitemopname' == c:
            iks = models.ItemOpname.objects.filter(id__exact=util.nvlGet('itemId'))
            for ik in iks:
                jik = util.modelToDicts([ik])
                ik.delete()
                return HttpResponse(json.dumps(jik))
        if 'getitemopname' == c:
            ipbls = getItemOpname(util.nvlGet('id', 0))
            jitemopnames = []
            for ipbl in ipbls:
                jitem = util.modelToDicts([ipbl.barang, ipbl],
                    prefiks=['barang_', ''])
                jitemopnames.append(jitem)
            return HttpResponse(json.dumps(jitemopnames))
        if 'prepareitemopname' == c:
            #mengambil data barang dari inventory tertentu
            print 'prepare opname barang'
            barangs = models.BarangDiInventory.objects.filter(
                inventory__id__exact=util.nvlGet('inventory_id'))
            jitemopnames = []
            for brg in barangs:
                jitem = util.modelToDicts([brg.barang, brg],
                    prefiks=['barang_', ''])
                jitem['opname'] = 0
                jitem['keterangan'] = ''
                jitemopnames.append(jitem)
            return HttpResponse(json.dumps(jitemopnames))
        if 'gethdropname' == c:
            pbls = models.Opname.objects.filter(id__exact=util.nvlGet('id', 0))
            for pbl in pbls:
                jpbl = util.modelToDicts([pbl])
                return HttpResponse(json.dumps({'data': jpbl}))
            return HttpResponse('No data with this id ')
        if 'gettotalitemopname' == c:
            y = 'nanti di garap'
        if 'formbrowseopname' == c:
            return render_to_response('inventory/form_opname_browse.html')
        if 'browseopname' == c:
            return HttpResponse(json.dumps({'data': browseOpname(util.data)}))
        if 'simpanopname' == c:
            bb = barangBisnis()
            opname_id = util.nvlGet('id', 0)
            html = '''
            <div class="formrow" style:font 12px verdana>Data rencana opname telah berhasil disimpang</div>
            <input type="button" value="Lanjut Perekaman" id="btnMore"/>
            '''
            if opname_id != 0:
                bb.opname(opname_id)
                return HttpResponse(
                    json.dumps({'sukses': True, 'message': 'Berhasil melakukan opname', 'html': html}))
            else: return HttpResponse(json.dumps({'sukses': False, 'message': 'Rencana opname tidak disimpan'}))
        if 'opnamesider' == c:
            return HttpResponse(json.dumps({'html': getOpnameSider(util.data)}))
    return HttpResponseServerError('can''t find param')


def initOpname(reqData):
    requtil = Utility(reqData=reqData);
    _apu = appUtil()
    #prepare inventory
    pbl = models.Opname()
    pbl.nomor = ('00000000000000%s' % (_apu.getIncrement(17)))[-6:]
    pbl.inventory = getInvById(requtil.nvlGet('inventory_id'))
    pbl.save()
    return pbl


def getInvById(id):
    return models.Inventory.objects.get(id=id)


def simpanOpname(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)


def simpanItemOpname(reqData):
    requtil = Utility(reqData=reqData);
    id = requtil.nvlGet('id', 0)
    idBrg = requtil.nvlGet('barang_id', 0)
    pbl = None
    if id == 0:
        pbl = initOpname(reqData)
    else:
        pbls = models.Opname.objects.filter(id__exact=id)
        if len(pbls):
            pbl = pbls[0]
            #prepare barang
    brg = None
    brgs = models.Barang.objects.filter(id__exact=idBrg)
    if len(brgs):
        brg = brgs[0]
    else:
        raise StandardError('Barang ini tidak ditemukan')
    iops = models.ItemOpname.objects.filter(barang__id=idBrg)
    itemopname = models.ItemOpname()
    if iops is not None:
        for iop in iops:
            itemopname = iop
            break
    itemopname.barang = brg
    itemopname.opname = pbl
    itemopname.saldo = requtil.nvlGet('saldo')
    itemopname.inspeksi = requtil.nvlGet('opname')
    itemopname.keterangan = requtil.nvlGet('keterangan')
    itemopname.harga = brg.harga
    itemopname.save()
    return itemopname


def getItemOpname(id ):
    ipbl = models.ItemOpname.objects.filter(
        opname__id__exact=id)
    return ipbl


def prepareFormOpname(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_opname.html', {})})
    data = {}
    if 'id' in reqData:
        id = requtil.nvlGet('id')
        if id > 0:
            cust = models.Customer.objects.get(id__exact=requtil.nvlGet('id'))
            data = requtil.modelToDicts([cust])
            jresp.update({'data': data});
    return jresp


def browseOpname(reqData):
    requtil = Utility(reqData=reqData)
    farg = {};
    if requtil.nvlGet('par_nomor') is not None:
        farg['nomor__icontains'] = requtil.nvlGet('par_nomor')
    if requtil.nvlDate('par_tanggal_awal', None) is not None:
        farg['tanggal__gte'] = requtil.nvlDate('par_tanggal_awal')
    if requtil.nvlDate('par_tanggal_akhir', None) is not None:
        farg['tanggal__lte'] = requtil.nvlDate('par_tanggal_akhir')
    if requtil.nvlGet('init') is not None:
        pas = models.Opname.objects.all(
        ).order_by(
            'tanggal')[0:requtil.nvlGet('n', 40)]
    else: pas = models.Opname.objects.filter(**farg).order_by(
        'waktu')[0:requtil.nvlGet('n', 40)]
    jdatas = [];
    for pa in pas:
        jdata = (Utility()).modelToDicts([pa])
        jdatas.append(jdata);
    return jdatas;


def getOpnameSider(reqData):
    requtil = Utility(reqData=reqData)
    pas = models.Opname.objects.filter(id__exact=requtil.nvlGet('id'))
    if pas[0] is not None:
        jpas = requtil.modelToDicts([pas[0].supplier, pas[0]])
    items = models.ItemOpname.objects.filter(opname__id__exact=pas[0].id)
    jitems = []
    jitem = {};
    if items[0] is not None:
        for item in items:
            jitem = requtil.modelToDicts([item.barang, item])
            jitems.append(jitem)
    jpas.update({'items': jitems})
    html = render_to_string('inventory/form_opname_sider.html', jpas)
    return html
