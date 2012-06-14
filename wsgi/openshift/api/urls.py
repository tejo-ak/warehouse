__author__ = 'User'
from django.conf.urls.defaults import *
from piston.resource import Resource
from api.handler import SupplierHandler

supplier_handdler = Resource(SupplierHandler)
urlpatterns = patterns('',
    url(r'^suppliers/(?P<supplier_id>[^/]+)/', supplier_handdler),
    url(r'^suppliers/', supplier_handdler),
)