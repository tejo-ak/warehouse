__author__ = 'jote'
from inventory import models
from utility import Utility
from django.utils import simplejson as json
from decimal import Decimal
from appUtil import appUtil
from decimal import Decimal

class BcdtMapper:
    def setHdrText(self, hdr):
        self.car = self.getTeks(hdr, 0, 26)
        self.npwp = self.getTeks(hdr, 162, 177)
        self.ndpbm = self.get4Dec(hdr, 700, 709)
        self.valuta = self.getTeks(hdr, 697, 700)
        self.cif = self.get2Dec(hdr, 809, 827)
        print '=================='
        self.hdrText = hdr
        self.jhdr = {'car': self.car, 'ndpbm': self.ndpbm, 'valuta': self.valuta}


    def setBrgText(self, textbrgs):
        brgs = textbrgs.split('\n')
        self.jbrgs = []
        for brg in brgs:
            if brg != '':
                self.brgText = brg
                self.hs = self.getTeks(brg, 35, 47)
                self.urBrg = self.getTeks(brg, 48, 143)
                self.merk = self.getTeks(brg, 143, 158)
                self.tipe = self.getTeks(brg, 158, 173)
                self.cifBrg = self.get2Dec(brg, 236, 254)
                self.satuan = self.getTeks(brg, 254, 257)
                self.jumlah = self.get4Dec(brg, 257, 275)
                self.kemasan = self.getTeks(brg, 204, 206)
                self.jumlahKemasan = self.getTeks(brg, 206, 214)
                jbrg = {'hs': self.hs, 'nama': self.urBrg, 'merk': self.merk, 'cif': self.cifBrg,
                        'satuan': self.satuan, 'jumlah': self.jumlah, 'kemasan': self.kemasan,
                        'jumlahKemasan': self.jumlahKemasan}
                self.jbrgs.append(jbrg)

    def removeByCar(self, car):
        hdr = models.BcdtMap.objects.filter(car__exact=car)
        if hdr is not None and len(hdr) > 0:
            itms = models.ItemBcdtMap.objects.filter(bcdt__id__exact=hdr[0].id)
            for itm in itms:
                itm.delete();
            hdr.delete();

    def simpanMapping(self):
        _apu = appUtil()
        self.removeByCar(self.car)
        hdr = models.BcdtMap()
        util = Utility(reqData=self.jhdr)
        hdr = util.bindRequestModel(hdr);
        hdr.nomor = ('00000000000000%s' % (_apu.getIncrement(14)))[-6:]
        hdr.save()

        for jbrg in self.jbrgs:
            brg = models.ItemBcdtMap()
            utilBrg = Utility(reqData=jbrg)
            brg = utilBrg.bindRequestModel(brg)
            brg.bcdt = hdr
            brg.harga = Decimal(brg.cif) * Decimal(hdr.ndpbm)/Decimal(brg.jumlah)
            brg.save()
        return hdr


    def validateMapping(self):
        x = '222'

    def getTeks(self, teks, awal, akhir):
        if len(teks) > akhir + 0:
            val = teks[(awal + 0):(akhir + 0)]
        return val

    def get4Dec(self, teks, awal, akhir):
        dec = self.getTeks(teks, awal, akhir)
        hasil = dec[:-4] + '.' + dec[-4:]
        return Decimal(hasil)

    def get2Dec(self, teks, awal, akhir):
        dec = self.getTeks(teks, awal, akhir)
        hasil = dec[:-2] + '.' + dec[-2:]
        return Decimal(hasil)


