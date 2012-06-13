/**
 * Created by PyCharm.
 * User: jote
 * Date: 5/14/12
 * Time: 4:28 PM
 * To change this template use File | Settings | File Templates.
 */
require([
    "dojo/parser",
    "dojo/_base/declare",
    "dijit/form/DateTextBox",
    "dojo/date/locale",
    "dojo/_base/lang"
], function (parser, declare, DateTextBox, locale, lang) {

    declare("lib.CustomDatebox", DateTextBox, {

        __constraints:undefined,

        postCreate:function () {
            this.openOnClick = false;
            this.inherited(arguments);
            this.openOnClick = false;
            // Activate our stuff only if no other datePattern has been set.
            // In this case, datePattern defaults to "dateFormat-short"
            //overide date Pattern to always user predefined long format
            this.constraints.datePattern = 'dd-MMM-yyyy';
            if (!this.constraints.datePattern) {
                var locale = dojo.i18n.normalizeLocale(dojo.locale),
                    bundle = dojo.date.locale._getGregorianBundle(locale);

                this.__constraints = lang.clone(this.constraints);
                //this.__constraints.datePattern = bundle["dateFormatItem-dMy"];
                this.__constraints.datePattern = "ddMMyyyy";
            } else {
                this.__constraints = lang.clone(this.constraints);
                this.__constraints.datePattern = "ddMMyy";
            }

        },
        openOnClick:false,
        onBlur:function () {
            this.inherited(arguments);
            // If the user's input is not valid, try to parse it with this.__constraints
            if (!this.isValid() && this.__constraints) {
                var result = this.parse(this.textbox.value, this.__constraints);
                if (result) {
                    this.set('value', result);
                } else {
                }
            }
        }
    });

})
;