__author__ = 'jote'
from inventory import models
from django.db import transaction
from django.db.models.aggregates import Sum, Min, Max
import settings
from decimal import Decimal
from utility import Utility

class barangBisnis:
    def ensureBarangInInventory(self, barang_id, inventory_id):
        #make sure a known barang already there in inventory
        brgs = models.Barang.objects.filter(id__exact=barang_id)
        bdiss = [];
        for brg in brgs:
            bdis = models.BarangDiInventory.objects.filter(barang__id__exact=barang_id,
                inventory__id__exact=inventory_id)
            for bdi in bdis:
                return bdis
            bd = models.BarangDiInventory()
            bd.barang = brg
            bd.inventory = models.Inventory.objects.get(id=inventory_id)
            bd.saldo = 0
            bd.save()
            return self.ensureBarangInInventory(barang_id, inventory_id)

    def debet(self, barang_id, inventory_id, jml, hrg, keterangan):
    #        bdis = models.BarangDiInventory.objects.filter(barang__id__exact=barang_id, inventory__id__exact=inventory_id)
        #simpan jurnal barang
        bdis = self.ensureBarangInInventory(barang_id, inventory_id)
        jurnal_id = None;
        jumlah = Decimal(jml)
        harga = Decimal(hrg)
        numint = 0
        jl = models.JurnalLayerStock()
        if len(bdis) > 0:
            with transaction.commit_on_success():
                bdi = bdis[0]
                numint = self.addSaldoBarangDiInventory(bdi.barang.id, bdi.inventory.id, jumlah)
                #simpan jurnal
                jurnal = models.JurnalBarang()
                jurnal.barang = bdi
                jurnal.jumlah = jumlah
                jurnal.harga = harga
                jurnal.kredebit = "D"
                jurnal.keterangan = keterangan
                jurnal.saldo = numint
                jurnal.jenisTransaksi = models.Referensi.objects.get(id=11)
                jurnal.save()
                jurnal_id = jurnal.id
                #simpan layer
                layer = models.LayerStock()
                layer.harga = harga
                layer.saldo = jumlah
                layer.barang = bdi
                layer.save()
                #simpan jurnal layer
                jl.layer = layer
                jl.jurnal = jurnal
                jl.jumlah = jumlah
                jl.save()
        return jl

    def kredit(self, barang_id, inventory_id, jml, hrg, keterangan):
        print 'observe kredit'
        print barang_id
        print inventory_id
        bdis = self.ensureBarangInInventory(barang_id, inventory_id)
        jurnal_id = None;
        jumlah = Decimal(jml)
        harga = Decimal(hrg)
        numint = 0
        jl = models.JurnalLayerStock()
        if len(bdis) > 0:
            with transaction.commit_on_success():
                bdi = bdis[0]
                numint = self.addSaldoBarangDiInventory(bdi.barang.id, bdi.inventory.id, -jumlah)
                #simpan jurnal
                jurnal = models.JurnalBarang()
                jurnal.barang = bdi
                jurnal.jumlah = jumlah
                jurnal.harga = harga
                jurnal.kredebit = "K"
                jurnal.jenisTransaksi = models.Referensi.objects.get(id=12)
                jurnal.keterangan = keterangan
                jurnal.saldo = numint
                jurnal.save()
                jurnal_id = jurnal.id
                #ambil layer untuk inventory ini
                sqlLS = 'select * from %slayerstock where barang_id=%s order by id %s for update' % (
                    settings.INVENTORY_PREFIX, bdi.id, 'DESC')
                layers = models.LayerStock.objects.raw(sqlLS)
                workingjumlah = jumlah
                for layer in layers:
                    selesai = False
                    partjumlah = 0
                    if workingjumlah <= layer.saldo:
                        layer.saldo = layer.saldo - workingjumlah;
                        partjumlah = workingjumlah
                        selesai = True
                    else:
                        workingjumlah = workingjumlah - layer.saldo
                        partjumlah = layer.saldo
                        layer.saldo = 0
                    layer.save()
                    jl = models.JurnalLayerStock()
                    jl.layer = layer
                    jl.jurnal = jurnal
                    jl.jumlah = partjumlah
                    jl.save()
                    if selesai == True:
                        break
                        #simpan jurnal layer
            return jurnal

    def debetPembelian(self, pembelian_id):
        ipbls = models.ItemPembelian.objects.filter(pembelian__id__exact=pembelian_id)
        pbl = models.Pembelian.objects.filter(id__exact=pembelian_id)
        for ipbl in ipbls:
            jl = self.debet(ipbl.barang.id, settings.MAIN_WAREHOUSE, ipbl.jumlah, ipbl.harga, "Pembelian")
            jn = jl.jurnal;
            jn.nomorDokumen = pbl[0].nomor
            jn.tanggalDokumen = pbl[0].tanggal
            jn.save();
            ipbl.jurnal = jn
            ipbl.save()
        for pb in pbl:
            pb.status = 2
            pb.save()
            break

    def debetBc23(self, bcdt_id):
        ipbls = models.ItemBcdtMap.objects.filter(bcdt__id__exact=bcdt_id)
        pbl = models.BcdtMap.objects.filter(id__exact=bcdt_id)
        for ipbl in ipbls:
            jl = self.debet(ipbl.barang.id, settings.MAIN_WAREHOUSE, ipbl.jumlah, ipbl.harga, "BC 2.3")
            jn = jl.jurnal;
            jn.nomorDokumen = pbl[0].nomor
            jn.tanggalDokumen = pbl[0].tanggal
            jn.save();
            ipbl.jurnal = jn
            ipbl.save()
        for pb in pbl:
            pb.status = 2
            pb.save()
            break

    def pengeluaranPabean(self, dokumenPabean_id):
        idocs = models.ItemDokumenPabean.objects.filter(dokumen__id__exact=dokumenPabean_id)
        doc = models.DokumenPabean.objects.get(id__exact=dokumenPabean_id)
        for idoc in idocs:
            jl = self.kredit(idoc.barang.id, doc.inventory_id, idoc.jumlah, idoc.harga, doc.jenisDokumen.nama)
            jl.nomorDokumen = doc.nomor
            jl.tanggalDokumen = doc.tanggal
            jl.save();
            idoc.jurnal = jl
            idoc.save()
        doc.status = 2
        doc.save()

    def pemasukanPabean(self, dokumenPabean_id):
        idocs = models.ItemDokumenPabean.objects.filter(dokumen__id__exact=dokumenPabean_id)
        doc = models.DokumenPabean.objects.get(id__exact=dokumenPabean_id)
        for idoc in idocs:
            jl = self.debet(idoc.barang.id, doc.inventory_id, idoc.jumlah, idoc.harga, doc.jenisDokumen.nama)
            jn = jl.jurnal;
            jn.nomorDokumen = doc.nomor
            jn.tanggalDokumen = doc.tanggal
            jn.save();
            idoc.jurnal = jn
            idoc.save()
        doc.status = 2
        doc.save()

    def mutasiInventory(self, mutasi_id):
        ipbls = models.ItemMutasi.objects.filter(mutasi__id__exact=mutasi_id)
        pbl = models.Mutasi.objects.filter(id__exact=mutasi_id)
        mts = None;
        for pb in pbl:
            mts = pb
            break
        for ipbl in ipbls:
            jl = self.debet(ipbl.barang.id, ipbl.mutasi.tujuan_id, ipbl.jumlah, ipbl.harga,
                "Mutasi dari %s" % (ipbl.mutasi.asal.nama))
            jn = jl.jurnal;
            jn.nomorDokumen = mts.nomor
            jn.tanggalDokumen = mts.tanggal
            jn.save();
            ipbl.jurnalDebet = jn
            ipbl.save()
        for ipbl in ipbls:
            jl = self.kredit(ipbl.barang.id, ipbl.mutasi.asal_id, ipbl.jumlah, ipbl.harga,
                "Mutasi ke %s" % (ipbl.mutasi.tujuan.nama))
            #jn = jl.jurnal;
            jl.nomorDokumen = mts.nomor
            jl.tanggalDokumen = mts.tanggal
            jl.save();
            ipbl.jurnalKredit = jl
            ipbl.save()
        mts.status = 2
        mts.save()

    def konversiProduksi(self, konversi_id):
        kvrInputs = models.ItemKonversi.objects.filter(konversi__id__exact=konversi_id, kredebit='K')
        kvrProduks = models.ItemKonversi.objects.filter(konversi__id__exact=konversi_id, kredebit='D')
        konversis = models.Konversi.objects.filter(id__exact=konversi_id)
        konversi = None;
        for kvr in konversis:
            konversi = kvr
            break
        for kvp in kvrProduks:
            jl = self.debet(kvp.barang.id, kvp.konversi.inventory_id, kvp.jumlah, kvp.harga,
                "Konversi")
            jn = jl.jurnal;
            jn.nomorDokumen = konversi.nomor
            jn.tanggalDokumen = konversi.tanggal
            jn.save();
            kvp.jurnal = jn
            kvp.save()
        for kvi in kvrInputs:
            jl = self.kredit(kvi.barang.id, kvi.konversi.inventory_id, kvi.jumlah, kvi.harga,
                "Konversi")
            #jn = jl.jurnal;
            jl.nomorDokumen = konversi.nomor
            jl.tanggalDokumen = konversi.tanggal
            jl.save();
            kvi.jurnal = jl
            kvi.save()
        konversi.status = 2
        konversi.save()

    def opname(self, opname_id):
        iops = models.ItemOpname.objects.filter(opname__id__exact=opname_id)
        ops = models.Opname.objects.filter(id__exact=opname_id)
        opn = None
        for op in ops:
            opn = op
            break
        for iop in iops:
            selisih = iop.saldo - iop.inspeksi
            if selisih > 0:
                #saldo lebih besar, berarti harus di kreditkan
                jl = self.kredit(iop.barang.id, iop.opname.inventory_id, selisih, iop.harga,
                    "Stock Opname")
                #jn = jl.jurnal;
                jl.nomorDokumen = opn.nomor
                jl.tanggalDokumen = opn.tanggal
                jl.save();
                iop.jurnal = jl
                iop.save()
            elif selisih < 0:
                #saldo lebih besar, berarti harus di kreditkan
                jl = self.debet(iop.barang.id, iop.opname.inventory_id, selisih, iop.harga,
                    "Stock Opname")
                jn = jl.jurnal;
                jn.nomorDokumen = opn.nomor
                jn.tanggalDokumen = opn.tanggal
                jn.save();
                iop.jurnal = jn
                iop.save()
        opn.status = 2
        opn.save()


    def kreditPenjualan(self, penjualan_id):
        ipbls = models.ItemPenjualan.objects.filter(penjualan__id__exact=penjualan_id)
        for ipbl in ipbls:
            jn = self.kredit(ipbl.barang.id, settings.MAIN_WAREHOUSE, ipbl.jumlah, ipbl.harga, "Penjualan")
            jn.ref_id = ipbl.id
            #jn.itemPenjualan = ipbl
            jn.save();

    def addSaldoBarangDiInventory(self, barang_id, inventory_id, jumlah):
        sql = 'select * from %sbarangdiinventory where barang_id=%s and inventory_id=%s for update' % (
            settings.INVENTORY_PREFIX, barang_id, inventory_id)
        print 'sql = ' + sql
        numint = None
        with transaction.commit_on_success():
            refs = models.BarangDiInventory.objects.raw(sql)
            ref = refs[0]
            if ref is not None:
                numint = ref.saldo
                numint = numint + jumlah
                ref.saldo = numint
                ref.save()
        return numint

    def addSaldoJurnal(self, jurnal_id, jumlah):
        y = 'x'

    def getSaldoBarangDiInventory(self, barang_id, inventory_id):
    #getsaldo barang di inventory
        y = 'x'

    def getSaldoBarang(self, barang_id):
        bdis = models.BarangDiInventory.objects.filter(barang__id__exact=barang_id).aggregate(Sum(
            'saldo'))
        return bdis['saldo__sum']
        #get saldo barang


class barangJurnal:
    def getMonthlyJurnal(self, barang_id, inventory_id, tgl, kredebit):
        jbs = models.JurnalBarang.objects.filter(barang__barang__id__exact=barang_id,
            barang__inventory__id__exact=inventory_id, kredebit=kredebit, waktu__month=tgl.month, waktu__year=tgl.year)
        return jbs

    def getMonthlyStartSaldo(self, barang_id, inventory_id, tgl ):
        jbs = models.JurnalBarang.objects.filter(barang__barang__id__exact=barang_id,
            barang__inventory__id__exact=inventory_id, waktu__month=tgl.month,
            waktu__year=tgl.year).aggregate(Min('id'))
        min = jbs['id__min']
        jbs = models.JurnalBarang.objects.filter(id=min)
        if len(jbs):
            return jbs[0].saldo - (1 if 'D' == jbs[0].kredebit else -1) * jbs[0].jumlah
        return 0
        #doing all saldo calculation here
        #how to acquire lattest date of specified month

    def getMonthlyEndSaldo(self, barang_id, inventory_id, tgl):
        jbs = models.JurnalBarang.objects.filter(barang__barang__id__exact=barang_id,
            barang__inventory__id__exact=inventory_id, waktu__month=tgl.month,
            waktu__year=tgl.year).aggregate(Max('id'))
        max = jbs['id__max']
        jbs = models.JurnalBarang.objects.filter(id=max)
        if len(jbs):
            return jbs[0].saldo
        return 0
        #doing all saldo calculation here
        #how to acquire the youngest date of specified month

    def getMonthlyTotalTransaction(self, barang_id, inventory_id, tgl):
        jbs = models.JurnalBarang.objects.filter(barang__barang__id__exact=barang_id,
            barang__inventory__id__exact=inventory_id, kredebit='D', waktu__month=tgl.month,
            waktu__year=tgl.year).aggregate(Sum('jumlah'))
        jsum = 0 if jbs['jumlah__sum'] is None else jbs['jumlah__sum']
        jml = jsum + self.getMonthlyStartSaldo(barang_id, inventory_id, tgl)
        return jml
        #doing all saldo calculation here