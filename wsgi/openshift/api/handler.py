__author__ = 'User'
from piston.handler import BaseHandler
from inventory import models

class SupplierHandler(BaseHandler):
    model = models.Supplier
    allowed_methods = ('GET',)

    def read(self, request, supplier_id=None):
        base = models.Supplier.objects
        if supplier_id:
            print supplier_id
            return base.filter(id__exact=int(supplier_id))
        else:
            return base.all()