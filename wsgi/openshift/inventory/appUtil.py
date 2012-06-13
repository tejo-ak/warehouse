__author__ = 'jote'
from inventory import models
from datetime import date
from django.db.models import Q
from django.db import transaction
import settings

class appUtil():
    def getIncrement(self, typeid):
        sql = 'select id,nama,num from %sreferensi where id=%s for update' % (settings.INVENTORY_PREFIX, typeid)
        print 'sql = ' + sql
        numint = 0
        with transaction.commit_on_success():
            refs = models.Referensi.objects.raw(sql)
            ref = refs[0]
            numint = ref.num
            numint = numint + 1
            ref.num = numint
            ref.save()
        return numint




