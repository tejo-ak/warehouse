import os
from django.conf.urls.defaults import *

##########
#django piston
from piston.resource import Resource

import  settings
# Uncomment the next two lines to enable the admin:
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'inventory.views.bcdt'),


    url(r'^api/', include('openshift.api.urls')),
    url(r'^bcdt/$', 'inventory.views.bcdt'),


    url(r'^inventory/$', 'inventory.views.index'),
    url(r'^inventory/inventories/$', 'inventory.inventoryMgt.dispatch'),
    url(r'^inventory/barang/$', 'inventory.barangMgt.dispatch'),
    url(r'^inventory/bcdt/$', 'inventory.bcdtMapperMgt.dispatch'),
    url(r'^inventory/report/$', 'inventory.reportMgt.dispatch'),
    url(r'^inventory/supplier/$', 'inventory.supplierMgt.dispatch'),
    url(r'^inventory/customer/$', 'inventory.customerMgt.dispatch'),
    url(r'^inventory/pembelian/$', 'inventory.pembelianMgt.dispatch'),
    url(r'^inventory/penjualan/$', 'inventory.penjualanMgt.dispatch'),
    url(r'^inventory/mutasi/$', 'inventory.mutasiMgt.dispatch'),
    url(r'^inventory/konversi/$', 'inventory.konversiMgt.dispatch'),
    url(r'^inventory/opname/$', 'inventory.opnameMgt.dispatch'),
    url(r'^inventory/pabean/$', 'inventory.transaksiPabeanMgt.dispatch'),
    url(r'^site_media/(?P<path>.*)$', 'django.views.static.serve',
            {'document_root': os.path.join(settings.PROJECT_DIR, 'inventory', 'static')}),
    # url(r'^openshift/', include('openshift.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
