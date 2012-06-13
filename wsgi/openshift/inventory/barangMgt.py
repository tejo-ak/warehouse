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
from barangBisnis import barangBisnis, barangJurnal
from pdfutil import render_to_pdf
import settings
if settings.ON_OPENSHIFT:
    import Image
else:
    from PIL import Image
import sys, zipfile, os, os.path


#this module basicly manage the
def dispatch(request):
    util = Utility(post=request.POST, get=request.GET)
    c = util.nvlGet('c');
    par = util.nvlGet('q', '')
    if c is not None:
        if 'formbarang' == c:
            return HttpResponse(json.dumps(prepareFormBarang(util.data)))
        if 'formpencarianbarang' == c:
            return render_to_response('inventory/form_barang_cari.html')
        if 'pencarianbarang' == c:
            return HttpResponse(json.dumps({'data': pencarianBarang(util.data)}))
        if 'barangsider' == c:
            return HttpResponse(json.dumps({'html': getBarangSider(util.data)}))
        if 'lookupbarang' == c:
            return HttpResponse(
                json.dumps(lookupBarang(util.nvlGet('katakunci', None), util.nvlGet('id'), util.nvlGet('max', None))));
        if 'lookupbdi' == c:
            return HttpResponse(
                json.dumps(lookupBdi(util.nvlGet('katakunci', None),
                    util.nvlGet('inventory_id', None), util.nvlGet('id'), util.nvlGet('max', None))));
        if 'caribarang' == c:
            return render_to_response('inventory/cari_kata_kunci.html')
        if 'formupload' == c:
            return HttpResponse(json.dumps({'html': render_to_string('inventory/form_barang_upload.html')}))
        if 'formuploadtes' == c:
            return render_to_response('inventory/form_barang_upload.html')
        if 'pdfsider' == c:
            slash = '/' if settings.ON_OPENSHIFT else '\\'
            return render_to_pdf('inventory/pdf/laporan.html', {'nama': 'tejo', 'merk': 'cocacola',
                                                                'font': '%s%s' % (
                                                                    os.path.join(settings.PROJECT_DIR, 'inventory',
                                                                        'static', 'img', 'font'), slash)})
        if 'upload' == c:
            f = request.FILES['uploadedfile']
            id = util.nvlGet('id', '-')
            url = saveGambarBarang(f, id)
            return HttpResponse('{"file":"%s","url":"%s","sukses":"true"}' % (f.name, url))
        if 'formlistbarang' == c:
            return HttpResponse(json.dumps(dict(
                    {'html': render_to_string('inventory/list_barang.html'),
                     'data': prepareListBarangByKataKunci(util.data)})))
        if 'formbahanbaku' == c:
            return HttpResponse(json.dumps(prepareFormBarang(util.data)))
        if 'barangbyname' == c:
            par = util.nvlGet('q', '')
            namas = []
            #g=500/0
            nama = 'noname'
            if len(par) > 2:
                pas = models.Barang.objects.filter(nama__icontains=par)[:util.nvlGet('a', 8)]
                for p in pas:
                    nama = util.modelToDicts([p])
                    namas.append(nama)
                    #return HttpResponseServerError('error dari server lhoo')
            data = dict({'eventid': util.nvlGet('eventid'), 'data': namas})
            return HttpResponse(json.dumps(data))
        if 'barangbyid' == c:
            brgs = models.Barang.objects.filter(id__exact=par)
            brg = models.Barang();
            if len(brgs):
                brg = brgs[0]
            return HttpResponse(json.dumps(util.modelToDicts([brg])))
        if 'baranginventorylist_bybarangid' == c:
            idBrg = util.nvlGet('id', None)
            jresp = {}
            jbdis = []
            if idBrg is not None:
                bdis = models.BarangDiInventory.objects.filter(barang__id__exact=idBrg)[:util.nvlGet('a', 8)]

                for bdi in bdis:
                    jbdi = util.modelToDicts([bdi.barang, bdi.inventory, bdi], replaces=['nama:nama_barang'])
                    jbdis.append(jbdi)
            jresp = dict({'html': render_to_string('inventory/list_saldo_barang.html'), 'data': jbdis})
            return HttpResponse(json.dumps(jresp))
        if 'barang_bynamamerktag' == c:
            jresp = dict({'data': prepareListBarangByKataKunci(util.data), 'eventid': util.nvlGet('eventid')})
            return HttpResponse(json.dumps(jresp))
        if 'hapusbarang' == c:
            barang = models.Barang.objects.filter(id__exact=util.nvlGet('id', 0));
            dp = {}
            if barang:
                #hapus semua barang di inventory
                barangs = models.BarangDiInventory.objects.filter(barang__id__exact=util.nvlGet('id', 0));
                #hapus semua harga
                hargas = models.Harga.objects.filter(barang__id__exact=util.nvlGet('id', 0));
                for brgInv in barangs:
                    brgInv.delete();
                for hrg in hargas:
                    hrg.delete();
                dp = util.modelToDict(barang[0])
                barang[0].delete()
            return HttpResponse(json.dumps(dp))
        if 'updatebarang' == c:
        #hanya untuk mengupdate data barang, bukan barang di inventory
            return HttpResponse(json.dumps(updateBarang(util.data)))
        if 'simpanbarang' == c:
            #simpanPasien(request.POST)
            return HttpResponse(json.dumps(saveUpdateBarangDiInventory(util.data)))
        if 'sidesaldo' == c:
            return HttpResponse(json.dumps({'html': prepareSideSaldo(util.data)}))
        if 'tesjurnal' == c:
            bj = barangJurnal();
            jbs = bj.getMonthlyJurnal(3, 2, date.today(), 'D')
            jbdis = []
            for jb in jbs:
                jbdi = util.modelToDicts([jb.barang.barang, jb])
                jbdis.append(jbdi)
            return HttpResponse(json.dumps(jbdis))
        if 'teskredit' == c:
            bb = barangBisnis()
            bb.kredit(1, 2, 50, 8500, 'Penjualan')
            return HttpResponse('Penjualan berhasil')
    return HttpResponseServerError('can''t find param')


def saveGambarBarang(f, id):
    ct = f.content_type
    print ct
    if 'jpg' in f.name.lower() or 'gif' in f.name.lower() or 'png' in f.name.lower():
        fext = f.name.lower()[-4:]
        fname = "00000000000000000%s%s" % (id, '.jpg')
        nyimpen = os.path.join(settings.MEDIA_ROOT, settings.FOLDER_GAMBAR, fname[-10:])
        with open(nyimpen, 'wb+') as dest:
            for ch in f.chunks():
                dest.write(ch)
        img = Image.open(nyimpen);
        ukuran = 256, 256
        img.thumbnail(ukuran, Image.ANTIALIAS)
        img.save(nyimpen, 'JPEG')
        rt = os.path.split(os.path.dirname(settings.MEDIA_ROOT))[1]
        return os.path.join(rt, settings.FOLDER_GAMBAR, fname[-10:])
    else: print 'bukan file gambar'


def ekstrakFileZip(f):
    print 'observe file'
    ct = f.content_type
    if 'zip' in ct:
        nyimpen = os.path.join(settings.MEDIA_ROOT, settings.FOLDER_GAMBAR, f.name)
        print nyimpen
        with open(nyimpen, 'wb+') as dest:
            for ch in f.chunks():
                dest.write(ch)
        with open(nyimpen, 'r') as handel:
            zf = zipfile.ZipFile(handel)
            for nm in zf.namelist():
                if '.txt' in nm.lower():
                    mem = zf.read(nm)
                    print nm
                    print repr(mem[:20])
                else: print 'not a txt file'
        os.remove(nyimpen)
    else: print 'bukan file zip'


def prepareListBarangByKataKunci((reqData)):
    requtil = Utility(reqData=reqData)
    kunci = requtil.nvlGet('kunci', None)
    barangs = []
    if kunci is not None:
        barangs = models.Barang.objects.filter(
            Q(nama__icontains=kunci) | Q(merk__icontains=kunci) | Q(tag__icontains=kunci))[
                  :requtil.nvlGet('a', 8)]
    else:
        barangs = models.Barang.objects.all()[:requtil.nvlGet('a', 8)]
    jbarangs = [];
    for barang in barangs:
        jbarang = requtil.modelToDict(barang)
        jbarangs.append(jbarang)
    return jbarangs;


def prepareSideSaldo(reqData):
    requtil = Utility(reqData=reqData)
    barang_id = requtil.nvlGet('barang_id', 0)
    bdis = models.BarangDiInventory.objects.filter(barang__id__exact=barang_id)
    html = 'tes'
    if len(bdis):
        barang = bdis[0].barang
        barang_nama = barang.nama
        daftar_saldo = bdis
        bb = barangBisnis()
        saldo = bb.getSaldoBarang(barang.id)
        html = render_to_string('inventory/side_saldo_barang.html', {'barang_nama': barang_nama, 'total': saldo,
                                                                     'daftar_saldo': daftar_saldo})
        return html


def prepareFormBarang(reqData):
    requtil = Utility(reqData=reqData)
    jresp = dict({'html': render_to_string('inventory/form_barang_di_inventory.html', {})})
    data = {}
    if 'id' in reqData:
        id = requtil.nvlGet('id')
        if id > 0:
            brg = models.Barang.objects.get(id__exact=requtil.nvlGet('id'))
            data = requtil.modelToDicts([brg])
            jresp.update({'data': data});
    return jresp


def pencarianBarang(reqData):
    requtil = Utility(reqData=reqData)
    farg = {};
    if requtil.nvlGet('par_nama') is not None:
        print(requtil.nvlGet('par_nama'))
        farg['barang__nama__icontains'] = requtil.nvlGet('par_nama')
    if requtil.nvlGet('par_merk') is not None:
        farg['barang__merk__icontains'] = requtil.nvlGet('par_merk')
    if requtil.nvlGet('par_kode') is not None:
        farg['barang__kode__icontains'] = requtil.nvlGet('par_kode')
    farg['inventory__id__exact'] = settings.MAIN_WAREHOUSE
    if requtil.nvlGet('init') is not None:
        pas = models.BarangDiInventory.objects.filter(
            inventory__id__exact=settings.MAIN_WAREHOUSE).order_by(
            'barang__nama')[0:requtil.nvlGet('n', 40)]
    else: pas = models.BarangDiInventory.objects.filter(**farg).order_by(
        'barang__nama')[0:requtil.nvlGet('n', 40)]
    jdatas = [];
    for pa in pas:
        jdata = (Utility()).modelToDicts([pa.barang])
        jdatas.append(jdata);
    return jdatas;


def updateBarang(reqData):
    requtil = Utility(reqData=reqData)
    if requtil.nvlGet('id', None) is not None:
        #update barang
        barang = models.Barang();
        barang = requtil.bindRequestModel(barang);
        barang.save()
        hargas = models.Harga.objects.filter(barang__id__exact=barang.id, akhir__isnull=True).exclude(
            harga__exact=barang.harga)
        print len(hargas)
        found = False
        for harga in hargas:
            found = True
            harga.akhir = date.today();
            harga.save()
        if found:
            hrg = models.Harga()
            hrg.harga = barang.harga
            hrg.awal = date.today()
            hrg.barang = barang
            hrg.keterangan = 'proses update barang'
            hrg.save()
        return requtil.modelToDicts([barang])


def saveUpdateBarangDiInventory(reqData):
    requtil = Utility(reqData=reqData)
    if requtil.nvlGet('id', None) is None:
        #barang baru di inventory
        #init barang di inventory object
        bdi = models.BarangDiInventory()
        #init barang object
        brg = models.Barang()
        brg = requtil.bindRequestModel(brg)
        brg.save()
        #safe harga
        hrg = models.Harga();
        hrg = requtil.bindRequestModel(hrg)
        hrg.awal = date.today();
        hrg.barang = brg;
        hrg.keterangan = 'initial value'
        hrg.save()
        #set default inventory to main ware house in case it doesn't exists;
        inventory_id = requtil.nvlGet('inventory_id', settings.MAIN_WAREHOUSE)
        #check the inventory entry
        inv = models.Inventory.objects.filter(id__exact=inventory_id)
        #the inventory will be defined by reference later
        if inv is not None and len(inv) > 0:
            bdi.inventory = inv[0]
        bdi.barang = brg
        bdi.saldo = 0
        bdi.save()
    return requtil.modelToDicts([inv, hrg, brg, bdi])


def getBarangSider(reqData):
    requtil = Utility(reqData=reqData)
    pas = models.Barang.objects.filter(id__exact=requtil.nvlGet('id'))
    if pas[0] is not None:
        id = pas[0].id
        jpas = requtil.modelToDicts([pas[0]])
        urlss = "000000%s.jpg" % (id)
        jpas['url'] = urlss[-10:]
    html = render_to_string('inventory/form_barang_sider.html', jpas)
    return html


def lookupBarang(katakunci, id, max):
    requtil = Utility()
    if max is None:
        max = 40;
    pasiens = []
    if katakunci is not None and '' != katakunci and id is None:
        print 'katakunci'
        print max
        pasiens = models.Barang.objects.filter(
            Q(nama__icontains=katakunci) | Q(merk__icontains=katakunci) | Q(kode__icontains=katakunci))[
                  :max]
    elif id is not None:
        print 'id'
        pasiens = models.Barang.objects.filter(id__exact=id)
        print 'query from id'
        #lookup specific id, to set id value
    else:
        print 'other'
        print id
        print katakunci
        pasiens = models.Barang.objects.all()[:max]
    jpasiens = [];
    for pasien in pasiens:
        jpasien = requtil.modelToDicts([pasien])
        jpasiens.append(jpasien)
    return jpasiens;


def lookupBdi(katakunci, inventory_id, id, max):
    requtil = Utility()
    if max is None:
        max = 40;
    pasiens = []
    if katakunci is not None and '' != katakunci and id is None:
        print 'katakunci'
        print max
        pasiens = models.BarangDiInventory.objects.filter(
            Q(barang__nama__icontains=katakunci) | Q(barang__merk__icontains=katakunci) |
            Q(barang__kode__icontains=katakunci, inventori__id__exact=inventory_id))[
                  :max]
    elif id is not None:
        print 'id'
        pasiens = models.BarangDiInventory.objects.filter(barang__id__exact=id)
        print 'query from id'
        #lookup specific id, to set id value
    else:
        print 'other'
        print id
        print katakunci
        pasiens = models.BarangDiInventory.objects.filter(inventory__id__exact=inventory_id)[:max]
    jpasiens = [];
    for bdi in pasiens:
        jpasien = requtil.modelToDicts([bdi.barang])
        jpasiens.append(jpasien)
    return jpasiens;