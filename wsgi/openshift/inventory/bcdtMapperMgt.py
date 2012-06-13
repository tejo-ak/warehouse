__author__ = 'jote'
from django.http import HttpResponse, HttpResponseServerError
from django.template.loader import render_to_string
from django.shortcuts import render_to_response
from django.utils import simplejson as json
from utility import Utility
from inventory import models
from barangBisnis import barangBisnis
from appUtil import appUtil
import sys, zipfile, os, os.path, io
import settings
from BcdtMapper import  BcdtMapper

def dispatch(request):
    util = Utility(post=request.POST, get=request.GET)
    c = util.nvlGet('c');
    par = util.nvlGet('q', '')
    if c is not None:
        if 'formbcdtmap' == c:
            return HttpResponse(json.dumps({'html': render_to_string('inventory/form_bcdtmap.html')}))
        if 'getmapping' == c:
            return HttpResponse(json.dumps({'items': getMaping(util.nvlGet('id'))}))
        if 'getmapheader' == c:
            return HttpResponse(json.dumps({'hdr': getMapHeader(util.nvlGet('id'))}))
        if 'mapbarang' == c:
            return HttpResponse(json.dumps({'item': mapBarang(
                util.nvlGet('item_id'),
                util.nvlGet('barang_id'))}))
        if 'upload' == c:
            f = request.FILES['uploadedfile']
            hdr = ekstrakFileZip(f)
            if hdr is not None: return HttpResponse('{"sukses":true,"id":%s}' % (hdr.id))
            else: return HttpResponse('{"sukses":false}')
        if 'formbrowsebcdtmap' == c:
            return render_to_response('inventory/form_bcdtmap_browse.html')
        if 'browsebcdtmap' == c:
            return HttpResponse(json.dumps({'data': browseMapping(util.data)}))
        if 'simpanmapping' == c:
            bb = barangBisnis()
            bcdt_id = util.nvlGet('id', 0)
            html = '''
            <div class="formrow" style:font 12px verdana>Data mapping BC 2.3 telah berhasil disimpang</div>
            '''
            print 'simpan dokumen mapping'
            print bcdt_id
            if bcdt_id != 0:
                bb.debetBc23(bcdt_id)
                return HttpResponse(
                    json.dumps({'sukses': True, 'message': 'Berhasil melakukan mapping dokumen BC 2.3', 'html': html}))
            else: return HttpResponse(json.dumps({'sukses': False, 'message': 'Rencana pembelian tidak disimpan'}))
    return HttpResponseServerError('can''t find param')


def mapBarang(item_id, barang_id):
    util = Utility()
    items = models.ItemBcdtMap.objects.filter(id__exact=item_id)
    brgs = models.Barang.objects.filter(id__exact=barang_id)
    for item in items:
        for brg in brgs:
            item.barang = brg;
            item.save()
            break
        break
    hsl = util.modelToDicts([item.barang, item], prefiks=['barang_', None])
    print hsl
    return hsl


def getMaping(id):
    util = Utility()
    items = models.ItemBcdtMap.objects.filter(bcdt__id__exact=id)
    jitems = [];
    for item in items:
        if item.barang is not None:
            jitem = util.modelToDicts([item.barang, item],
                replaces=['id:barang_id', 'nama:barang_nama', 'merk:barang_merk'])
        else:
            jitem = util.modelToDicts([item.barang, item])
        jitems.append(jitem)

    return jitems


def getMapHeader(id):
    util = Utility()
    items = models.BcdtMap.objects.filter(id__exact=id)
    jitems = [];
    for item in items:
        return util.modelToDicts([item.supplier, item])


def ekstrakFileZip(f):
    mapper = BcdtMapper()
    ct = f.content_type
    print ct
    if 'zip' in ct or 'octet-stream' in ct:
        with f as handel:
            zf = zipfile.ZipFile(handel)
            for nm in zf.namelist():
                nama = nm.lower()
                if '.txt' in nama and 'bc23h.txt' in nama:
                    mem = zf.read(nm)
                    mapper.setHdrText(str(mem))
                elif '.txt' in nama and 'bc23dtl.txt' in nama:
                    mem = zf.read(nm)
                    mapper.setBrgText(str(mem))
            hdr = mapper.simpanMapping()
            handel.close()
            return hdr
    else: print 'bukan file zip'


def browseMapping(reqData):
    requtil = Utility(reqData=reqData)
    farg = {};
    if requtil.nvlGet('par_nomor') is not None:
        farg['nomor__icontains'] = requtil.nvlGet('par_nomor')
    if requtil.nvlGet('par_car') is not None:
        farg['car__icontains'] = requtil.nvlGet('par_car')
    if requtil.nvlDate('par_tanggal_awal', None) is not None:
        farg['tanggal__gte'] = requtil.nvlDate('par_tanggal_awal')
    if requtil.nvlDate('par_tanggal_akhir', None) is not None:
        farg['tanggal__lte'] = requtil.nvlDate('par_tanggal_akhir')
    if requtil.nvlGet('par_status', None) is not None:
        farg['status__exact'] = requtil.nvlGet('par_status')
    if requtil.nvlGet('init') is not None:
        pas = models.BcdtMap.objects.all(
        ).order_by(
            'waktu')[0:requtil.nvlGet('n', 40)]
    else: pas = models.BcdtMap.objects.filter(**farg).order_by(
        'waktu')[0:requtil.nvlGet('n', 40)]
    jdatas = [];
    for pa in pas:
        jdata = (Utility()).modelToDicts([pa])
        jdatas.append(jdata);
    return jdatas;
