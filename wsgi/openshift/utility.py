__author__ = 'jote'
from datetime import datetime, date
from decimal import Decimal


class Utility:
    def __init__(self, post={}, get={}, reqData={}):
        self.post = post
        self.get = get
        self.data = dict(post.items() + get.items() + reqData.items())

    def setPost(self, post):
        self.post = post

    def get(self, key):
        if key in self.post:
            return self.data[key]
        else: return ''

    def nvlGet(self, key, default=None):
        if key in self.data and '' != self.data[key]:
            return self.data[key]
        else: return default

    def nvlDate(self, key, default=None):
        st = self.nvlGet(key)
        if st is not None:
            try:
                return datetime.strptime(st[:28], '%a %b %d %Y %H:%M:%S %Z')
            except:
                try:
                    return datetime.strptime(st, '%d-%b-%Y')
                except:
                    raise ValueError('format tanggal tidak valid')
        else: return default

    def hasKey(self, key):
        return key in self.data

    def bindRequestModel(self, model):
        data = self.data
        if model is not None and data is not None:
            for k, v in data.iteritems():
                if hasattr(model, k):
                    if k.lower().startswith('tanggal') or k.lower().startswith('tgl'):
                        setattr(model, k, self.nvlDate(k))
                    else: setattr(model, k, self.nvlGet(k))
            return model

    def modelToDict(self, model, replaces=None, prefik=None):
        data = {};

        if model is not None:
            c = 0

            for k, v in model.__dict__.iteritems():
                if replaces is not None:
                    crep = 0
                    for rpl in replaces:
                        s = rpl.split(':')
                        if k == s[0]:
                            print 'replacement %s with %s in model %s' % (k, rpl, model._meta.verbose_name)
                            k = s[1]
                            replaces.remove(rpl)

                if v is not None:
                    kl = k.lower()
                    if isinstance(v, Decimal):
                        data[self._cvtPrefix(prefik, k)] = str(v)
                    elif isinstance(v, date):
                        data[self._cvtPrefix(prefik, k)] = v.strftime('%Y-%m-%d')
                    elif kl.startswith('tanggal') or kl.startswith(
                        'tgl') or  kl.startswith('awal') or  kl.startswith('akhir'):
                        data[self._cvtPrefix(prefik, k)] = v.strftime('%Y-%m-%d')
                    elif k.lower() in 'query-model':
                        t = k
                        #do nothing for exception
                    elif k.startswith('_'):
                        t = k
                        #do nothing
                    else:
                        data[self._cvtPrefix(prefik, k)] = v
                    c = c + 1
        return data

    #convert key with prefix
    def _cvtPrefix(self, prefik, orig):
        if prefik is not None: return '%s%s' % (prefik, orig)
        else: return orig

    def modelToDicts(self, daftarModel, replaces=None, prefiks=None):
        data = {};
        if daftarModel is not None and len(daftarModel) > 0:
            ca = 0
            for dm in daftarModel:
                prefik = None
                if prefiks is not None and len(prefiks) > ca:
                    prefik = prefiks[ca]
                    ca = ca + 1
                data.update(self.modelToDict(dm, replaces, prefik))
        return data

    def createSelects(self, models):
        sel = {}
        if models is not None:
            for model in models:
                prefix = model._meta.db_table
                for k, v in model.__dict__.iteritems():
                    if '_state' == k:
                        a = 0
                    else: sel['%s_%s' % (prefix, k)] = '%s.%s' % (prefix, k)
            return sel


