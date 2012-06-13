from datetime import datetime

__author__ = 'jote'
import calendar
from django.http import HttpResponse, HttpResponseServerError
from django.template.loader import render_to_string
from django.shortcuts import render_to_response
from django.utils import simplejson as json
from utility import Utility
from inventory import models
from datetime import date, datetime
from django.db.models import Q
from barangBisnis import barangBisnis, barangJurnal
#this module basicly manage the
def dispatch(request):
    util = Utility(post=request.POST, get=request.GET)
    c = util.nvlGet('c');
    par = util.nvlGet('q', '')
    if c is not None:
        if 'formledger' == c:
            return HttpResponse(json.dumps({'html': render_to_string('inventory/form_ledger.html')}))
        if 'taccount_bdi_form' == c:
            barang_id = util.nvlGet('barang_id', 0)
            inventory_id = util.nvlGet('inventory_id', 1)
            tgl = util.nvlDate('tanggal', None)
            if(tgl is None):
                return HttpResponseServerError('Request Parameter Invalid')
            bj = barangJurnal()
            debet = bj.getMonthlyJurnal(barang_id, inventory_id, tgl, 'D')
            kredit = bj.getMonthlyJurnal(barang_id, inventory_id, tgl, 'K')
            saldoawal = bj.getMonthlyStartSaldo(barang_id, inventory_id, tgl)
            saldoakhir = bj.getMonthlyEndSaldo(barang_id, inventory_id, tgl)
            saldototal = bj.getMonthlyTotalTransaction(barang_id, inventory_id, tgl)
            range = calendar.monthrange(tgl.year, tgl.month)
            tglsaldoawal = date(tgl.year, tgl.month, 1)
            tglsaldoakhir = date(tgl.year, tgl.month, range[1])
            print 'range %s ' % (range[0])
            if tglsaldoakhir > date.today():
                tglsaldoakhir = date.today()
            data = {'debet': debet, 'kredit': kredit, 'saldoawal': saldoawal, 'saldoakhir': saldoakhir,
                    'saldototal': saldototal
                , 'tglsaldoawal': tglsaldoawal, 'tglsaldoakhir': tglsaldoakhir}
            return HttpResponse(
                json.dumps({'html': render_to_string('inventory/t_account_barang_inventory.html', data)}))
    return  HttpResponse('tes respons')