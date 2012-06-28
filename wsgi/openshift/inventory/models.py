from django.db import models

# Create your models here.

class Perusahaan(models.Model):
    nama = models.CharField(max_length=64, null=True, blank=True)
    alamat = models.CharField(max_length=128, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)
    pemilik = models.CharField(max_length=64, null=True, blank=True)
    area = models.CharField(max_length=4, null=True, blank=True)
    telp = models.CharField(max_length=8, null=True, blank=True)
    mobile = models.CharField(max_length=16, null=True, blank=True)
    email = models.CharField(max_length=32, null=True, blank=True)


class UserGrup(models.Model):
#    klinik = models.ForeignKey('Klinik', related_name='usergrups', null=True)
    nama = models.CharField(max_length=32, null=True, blank=True)


class Role(models.Model):
#    klinik = models.ForeignKey('Klinik', related_name='userroles', null=True)
    nama = models.CharField(max_length=32, null=True, blank=True)
    kode = models.CharField(max_length=3, null=True, blank=True)


class GrupRole(models.Model):
    grup = models.ForeignKey('UserGrup', related_name='grups', null=True)
    role = models.ForeignKey('Role', related_name='roles', null=True)


class User(models.Model):
    grup = models.ForeignKey('UserGrup', related_name='users', null=True)
    username = models.CharField(max_length=64, null=True, blank=True)
    password = models.CharField(max_length=64, null=True, blank=True)


class Referensi(models.Model):
    grup = models.IntegerField()
    kode = models.CharField(max_length=5, null=True, blank=True)
    nama = models.CharField(max_length=32, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)
    nilai = models.CharField(max_length=64, null=True, blank=True)
    num = models.BigIntegerField(default=0)


class Inventory(models.Model):
    nama = models.CharField(max_length=64, null=True, blank=True)
    alamat = models.CharField(max_length=128, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)
    jenis = models.ForeignKey('Referensi', related_name='inventories', null=True)
    metode = models.ForeignKey('Referensi', related_name='metodes', null=True)
    perusahaan = models.ForeignKey('Perusahaan', null=True)


class Customer(models.Model):
    nama = models.CharField(max_length=64, null=True, blank=True)
    alamat = models.CharField(max_length=128, null=True, blank=True)
    area = models.CharField(max_length=4, null=True, blank=True)
    telp = models.CharField(max_length=8, null=True, blank=True)
    mobile = models.CharField(max_length=16, null=True, blank=True)
    email = models.CharField(max_length=32, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)


class Penjualan(models.Model):
    nomor = models.CharField(max_length=16, null=True, blank=True)
    tanggal = models.DateField(auto_now=True)
    customer = models.ForeignKey('Customer')


class ItemPenjualan(models.Model):
    barang = models.ForeignKey('Barang')
    penjualan = models.ForeignKey('Penjualan')
    jumlah = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    realisasi = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    harga = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)


class Supplier(models.Model):
    nama = models.CharField(max_length=64, null=True, blank=True)
    alamat = models.CharField(max_length=128, null=True, blank=True)
    negara = models.CharField(max_length=32, null=True, blank=True)
    area = models.CharField(max_length=4, null=True, blank=True)
    telp = models.CharField(max_length=8, null=True, blank=True)
    mobile = models.CharField(max_length=16, null=True, blank=True)
    email = models.CharField(max_length=32, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)


class Pembelian(models.Model):
    nomor = models.CharField(max_length=16, null=True, blank=True)
    tanggal = models.DateField(auto_now=True)
    supplier = models.ForeignKey('Supplier')
    status = models.IntegerField(default=1)
    waktu = models.DateTimeField(auto_now=True)


class ItemPembelian(models.Model):
    barang = models.ForeignKey('Barang')
    pembelian = models.ForeignKey('Pembelian')
    jurnal = models.OneToOneField('JurnalBarang', null=True)
    jumlah = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    realisasi = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    harga = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)


class Mutasi(models.Model):
    asal = models.ForeignKey('Inventory', related_name='asalMutasi')
    tujuan = models.ForeignKey('Inventory', related_name='tujuanMutasi')
    nomor = models.CharField(max_length=16, null=True, blank=True)
    tanggal = models.DateField(auto_now=True)
    status = models.IntegerField(default=1)
    waktu = models.DateTimeField(auto_now=True)


class ItemMutasi(models.Model):
    barang = models.ForeignKey('Barang')
    mutasi = models.ForeignKey('Mutasi')
    jurnalDebet = models.OneToOneField('JurnalBarang', null=True, related_name='mutasi_debet')
    jurnalKredit = models.OneToOneField('JurnalBarang', null=True, related_name='mutasi_kredit')
    jumlah = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    harga = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)


class Konversi(models.Model):
    inventory = models.ForeignKey('Inventory', related_name='konversi')
    nomor = models.CharField(max_length=16, null=True, blank=True)
    tanggal = models.DateField(auto_now=True)
    status = models.IntegerField(default=1)
    waktu = models.DateTimeField(auto_now=True)


class ItemKonversi(models.Model):
    barang = models.ForeignKey('Barang')
    konversi = models.ForeignKey('Konversi')
    jurnal = models.OneToOneField('JurnalBarang', null=True)
    jumlah = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    harga = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    kredebit = models.CharField(max_length=1, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)
    jenisProduk = models.IntegerField(null=True, blank=True)


class Opname(models.Model):
    inventory = models.ForeignKey('Inventory', related_name='opnames')
    nomor = models.CharField(max_length=16, null=True, blank=True)
    tanggal = models.DateField(auto_now=True)
    status = models.IntegerField(default=1)
    waktu = models.DateTimeField(auto_now=True)


class ItemOpname(models.Model):
    barang = models.ForeignKey('Barang')
    opname = models.ForeignKey('Opname')
    jurnal = models.OneToOneField('JurnalBarang', null=True)
    saldo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    inspeksi = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    harga = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)


class BcdtMap(models.Model):
    supplier = models.ForeignKey('Supplier', null=True)
    nomor = models.CharField(max_length=16, null=True, blank=True)
    tanggal = models.DateField(auto_now=True)
    car = models.CharField(max_length=26, null=True, blank=True)
    nomorDokumen = models.CharField(max_length=16, null=True, blank=True)
    tanggalDokumen = models.DateField(auto_now=False, null=True, blank=True)
    nomorInvoice = models.CharField(max_length=16, null=True, blank=True)
    tanggalInvoice = models.DateField(auto_now=False, null=True, blank=True)
    nomorBl = models.CharField(max_length=16, null=True, blank=True)
    tanggalBl = models.DateField(auto_now=False, null=True, blank=True)
    nomorBc11 = models.CharField(max_length=16, null=True, blank=True)
    tanggalBc11 = models.DateField(auto_now=False, null=True, blank=True)
    valuta = models.CharField(max_length=3, null=True, blank=True)
    ndpbm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.IntegerField(default=1)
    waktu = models.DateTimeField(auto_now=True)


class ItemBcdtMap(models.Model):
    bcdt = models.ForeignKey('BcdtMap')
    barang = models.ForeignKey('Barang', null=True)
    jurnal = models.OneToOneField('JurnalBarang', null=True)
    hs = models.CharField(max_length=12, null=True, blank=True)
    harga = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    harga_asing = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)
    nama = models.CharField(max_length=256, null=True, blank=True)
    merk = models.CharField(max_length=64, null=True, blank=True)
    satuan = models.CharField(max_length=3, null=True, blank=True)
    jumlah = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cif = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    kemasan = models.CharField(max_length=6, null=True, blank=True)
    jumlahKemasan = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)


class Barang(models.Model):
    nama = models.CharField(max_length=32, null=True, blank=True)
    uraian = models.CharField(max_length=64, null=True, blank=True)
    merk = models.CharField(max_length=32, null=True, blank=True)
    kode = models.CharField(max_length=6, null=True, blank=True)
    harga = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    satuan = models.ForeignKey('Referensi', related_name='satuanBarang', null=True)
    kemasan = models.ForeignKey('Referensi', related_name='kemasanBarang', null=True)
    tag = models.CharField(max_length=64, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)
    perusahaan = models.ForeignKey('Perusahaan', null=True)
    hs = models.ForeignKey('Hs', null=True)


class Pelabuhan(models.Model):
    kode = models.CharField(max_length=5, null=True, blank=True)
    nama = models.CharField(max_length=64, null=True, blank=True)


class Negara(models.Model):
    kode = models.CharField(max_length=5, null=True, blank=True)
    nama = models.CharField(max_length=64, null=True, blank=True)


class Kantor(models.Model):
    kode = models.CharField(max_length=6, null=True, blank=True)
    nama = models.CharField(max_length=64, null=True, blank=True)
    super = models.ForeignKey('Kantor', related_name='cabang', null=True)


class DokumenPabean(models.Model):
    supplier = models.ForeignKey('Partner', related_name='dokSuppliers', null=True)
    customer = models.ForeignKey('Partner', related_name='dokCustomers', null=True)
    ppjk = models.ForeignKey('Partner', related_name='dokPpjk', null=True)
    inventory = models.ForeignKey('Inventory', null=True)
    jenisDokumen = models.ForeignKey('Referensi', related_name='dokPabeans', null=True)
    tujuanBarang = models.ForeignKey('Referensi', related_name='tujuanBarang', null=True)
    kondisiBarang = models.ForeignKey('Referensi', related_name='kondisiNarang', null=True)
    jenisDokumen = models.ForeignKey('Referensi', related_name='dokPabeans', null=True)
    jenisDokumen = models.ForeignKey('Referensi', related_name='dokPabeans', null=True)
    nomor = models.CharField(max_length=16, null=True, blank=True)
    tanggal = models.DateField(auto_now=True)
    car = models.CharField(max_length=26, null=True, blank=True)
    nomorDokumen = models.CharField(max_length=16, null=True, blank=True)
    tanggalDokumen = models.DateField(auto_now=False, null=True, blank=True)
    kantor = models.ForeignKey('Kantor', related_name='kantors', null=True)
    kantorAwas = models.ForeignKey('Kantor', related_name='awas', null=True)
    kantorBongkar = models.ForeignKey('Kantor', related_name='bongkars', null=True)
    kantorAsal = models.ForeignKey('Kantor', related_name='asals', null=True)
    kantorTujuan = models.ForeignKey('Kantor', related_name='tujuans', null=True)
    nomorInvoice = models.CharField(max_length=16, null=True, blank=True)
    tanggalInvoice = models.DateField(auto_now=False, null=True, blank=True)
    nomorBl = models.CharField(max_length=16, null=True, blank=True)
    tanggalBl = models.DateField(auto_now=False, null=True, blank=True)
    nomorBc11 = models.CharField(max_length=16, null=True, blank=True)
    pos = models.CharField(max_length=16, null=True, blank=True)
    subpos = models.CharField(max_length=16, null=True, blank=True)
    tanggalBc11 = models.DateField(auto_now=False, null=True, blank=True)
    valuta = models.CharField(max_length=3, null=True, blank=True)
    ndpbm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    moda = models.ForeignKey('Referensi', related_name='modas', null=True)
    angkutNama = models.CharField(max_length=32, null=True, blank=True)
    angkutNomor = models.CharField(max_length=32, null=True, blank=True)
    pelabuhanMuat = models.ForeignKey('Pelabuhan', related_name='muats', null=True)
    pelabuhanTransit = models.ForeignKey('Pelabuhan', related_name='transits', null=True)
    pelabuhanBongkar = models.ForeignKey('Pelabuhan', related_name='bongkars', null=True)
    fob = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    asuransi = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    diskon = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    freight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cif = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    bruto = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    bruto = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    netto = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.IntegerField(default=1)
    kredebit = models.CharField(max_length=1, null=True, blank=True)
    waktu = models.DateTimeField(auto_now=True)


class ItemDokumenPabean(models.Model):
    dokumen = models.ForeignKey('DokumenPabean')
    hs = models.ForeignKey('Hs', null=True)
    barang = models.ForeignKey('Barang', null=True)
    jurnal = models.OneToOneField('JurnalBarang', null=True)
    hs = models.CharField(max_length=12, null=True, blank=True)
    harga = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    harga_asing = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)
    uraian = models.CharField(max_length=256, null=True, blank=True)
    merk = models.CharField(max_length=64, null=True, blank=True)
    satuan = models.ForeignKey('Referensi', related_name='satuanItemDokumen', null=True)
    jumlah = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cif = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    kemasan = models.ForeignKey('Referensi', related_name='kemasanItemDokumen', null=True)
    jumlahKemasan = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tarifBm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tarifPpn = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tarifPpnBm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tarifCukai = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    nilaiBm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    nilaiPpn = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    nilaiPpnBm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    nilaiCukai = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    pungutanBayar = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    pungutanBebas = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)


class DpDokumen(models.Model):
    dokumen = models.ForeignKey('DokumenPabean')
    jenis = models.ForeignKey('Referensi', related_name='jenisDokumen', null=True)
    nomor = models.CharField(max_length=32, null=True, blank=True)
    tanggal = models.DateField(auto_now=False, null=True, blank=True)


class DpKontainer(models.Model):
    dokumen = models.ForeignKey('DokumenPabean')
    ukuran = models.CharField(max_length=2, null=True, blank=True)
    nomor = models.CharField(max_length=32, null=True, blank=True)
    nomorSegel = models.CharField(max_length=32, null=True, blank=True)


class DpKemasan(models.Model):
    dokumen = models.ForeignKey('DokumenPabean')
    jenis = models.ForeignKey('Referensi', related_name='jenisKemasan', null=True)
    merk = models.CharField(max_length=32, null=True, blank=True)
    qty = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)


class DpPungutan(models.Model):
    dokumen = models.ForeignKey('DokumenPabean')
    jenis = models.ForeignKey('Referensi', related_name='jenisPungutan', null=True)
    fasilitas = models.ForeignKey('Referensi', related_name='jenisFasilitasTPB', null=True)
    nilai = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)


class DpPengangkut(models.Model):
    dokumen = models.ForeignKey('DokumenPabean')
    jenis = models.ForeignKey('Referensi', related_name='jenisPengangkut', null=True)
    nomor = models.CharField(max_length=16, null=True, blank=True)
    nilai = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)


class Hs(models.Model):
    kode = models.CharField(max_length=10, null=True, blank=True)
    uraian = models.CharField(max_length=256, null=True, blank=True)
    tarifBm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tarifCept = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tarifPpn = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tarifPpnBm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    lartas = models.CharField(max_length=1, default='N')


class Pic(models.Model):
    nama = models.CharField(max_length=64, null=True, blank=True)
    alamat = models.CharField(max_length=128, null=True, blank=True)
    area = models.CharField(max_length=4, null=True, blank=True)
    telp = models.CharField(max_length=8, null=True, blank=True)
    mobile = models.CharField(max_length=16, null=True, blank=True)
    email = models.CharField(max_length=32, null=True, blank=True)


class Jaminan(models.Model):
    jenis = models.ForeignKey('Referensi', related_name='jenisJaminan', null=True)
    nomor = models.CharField(max_length=32, null=True, blank=True)
    tanggal = models.DateField(auto_now=False, null=True, blank=True)
    nilai = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tempo = models.DateField(auto_now=False, null=True, blank=True)
    penjamin = models.ForeignKey('Partner', related_name='jaminans', null=True)
    bukti_nomor = models.CharField(max_length=32, null=True, blank=True)
    bukti_tanggal = models.DateField(auto_now=False, null=True, blank=True)


class Partner(models.Model):
    nama = models.CharField(max_length=64, null=True, blank=True)
    alamat = models.CharField(max_length=128, null=True, blank=True)
    npwp = models.CharField(max_length=15, null=True, blank=True)
    sk_nomor = models.CharField(max_length=32, null=True, blank=True)
    sk_tanggal = models.DateField(auto_now=False, null=True, blank=True)
    niper = models.CharField(max_length=32, null=True, blank=True)
    api = models.CharField(max_length=32, null=True, blank=True)
    kodeApi = models.CharField(max_length=3, null=True, blank=True)
    negara = models.CharField(max_length=32, null=True, blank=True)
    area = models.CharField(max_length=4, null=True, blank=True)
    telp = models.CharField(max_length=8, null=True, blank=True)
    mobile = models.CharField(max_length=16, null=True, blank=True)
    email = models.CharField(max_length=32, null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)
    jenisIdentitas = models.ForeignKey('Referensi', related_name='jenisIDentitasPartner', null=True)
    jenisUsaha = models.ForeignKey('Referensi', related_name='jenisUsahaPartner', null=True)
    bentukUsaha = models.ForeignKey('Referensi', related_name='bentukUsahaPartner', null=True)


class Harga(models.Model):
    harga = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    awal = models.DateField(null=True, blank=True)
    akhir = models.DateField(null=True, blank=True)
    keterangan = models.CharField(max_length=512, null=True, blank=True)
    barang = models.ForeignKey('Barang', related_name='logharga')


class BarangDiInventory(models.Model):
    barang = models.ForeignKey('Barang', related_name='bdis')
    inventory = models.ForeignKey('Inventory', related_name='bdis')#barang di inventories
    saldo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)


class LayerStock(models.Model):
    harga = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    saldo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    nilai = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    barang = models.ForeignKey('BarangDiInventory', related_name='layerStock')
    waktu = models.DateTimeField(auto_now=True)


class JurnalBarang(models.Model):
    barang = models.ForeignKey('BarangDiInventory', related_name='jurnals')
    jumlah = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    saldo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    harga = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    nilai = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ref_id = models.IntegerField(blank=True, null=True)
    nomorDokumen = models.CharField(max_length=16, null=True, blank=True)
    tanggalDokumen = models.DateField(auto_now=True)
    jenisTransaksi = models.ForeignKey('Referensi', related_name='jenisTransaksi')
    keterangan = models.CharField(max_length=512, null=True, blank=True)
    kredebit = models.CharField(max_length=1, null=True, blank=True)
    waktu = models.DateTimeField(auto_now=True)


class JurnalLayerStock(models.Model):
    layer = models.ForeignKey('LayerStock', related_name='jurnals')
    jumlah = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    kredebit = models.CharField(max_length=1, null=True, blank=True)
    nilai = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    jurnal = models.ForeignKey('JurnalBarang', related_name='jurnals')
    waktu = models.DateTimeField(auto_now=True)

