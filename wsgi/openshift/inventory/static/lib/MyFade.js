/**
 * Created by PyCharm.
 * User: User
 * Date: 6/25/12
 * Time: 4:10 PM
 * To change this template use File | Settings | File Templates.
 */
define(["dijit", "dojo", "dojox", "dojo/require!dojo/fx"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.widget.rotator.MyFade");
    dojo.require("dojo.fx");
    (function (d) {
        function fadeIt(theElement, serial) {
            var neksNode = theElement.next.node;
            d.style(neksNode, {display:"", opacity:0});
            theElement.node = theElement.current.node;
            console.log(theElement);
            console.log('observasi animasi fadeoutin\n' +
                theElement + '(the element)\n' +
                neksNode + '(neksNode)\n' +
                neksNode.id + '(neksNode id)\n' +
                d.marginBox(neksNode).l + '(marginbox l)-\n' +
                d.marginBox(neksNode).t + '(marginbox t)-\n' +
                d.marginBox(neksNode).w + '(marginbox)w-\n' +
                d.marginBox(neksNode).h + '(marginbox) h-\n'
            );
            return d.fx[serial]([d.fadeOut(theElement), d.fadeIn(d.mixin(theElement, {node:neksNode}))]);
        }

        ;
        function slideIt(theElement, serial) {
            var neksNode = theElement.next.node;
            d.style(neksNode, {display:"", opacity:0});
            theElement.node = theElement.current.node;
            var lbr = d.marginBox(theElement).w;
            var atas = d.marginBox(theElement).t;
            d.setMarginBox(theElement.current.node, {l:(0 - lbr)});
            var saEl = {
                node:theElement.current.node,
                top:atas,
                left:(0)
            }
            var saNext = {
                node:neksNode,
                top:atas.toString(),
                left:lbr
            }
            return d.fx.chain([d.fx.slideTo(d.mixin(theElement, saNext))]);
        }

        ;
        function slodet(dirrection, myElement) {
            var theElement = myElement.node = myElement.next.node, r = myElement.rotatorBox, m = dirrection % 2, s = (m ? r.w : r.h) * (dirrection < 2 ? -1 : 1);
            d.style(theElement, {display:"", zIndex:(d.style(myElement.current.node, "zIndex") || 1) + 1});
            if (!myElement.properties) {
                myElement.properties = {};
            }
            myElement.properties[m ? "left" : "top"] = {start:s, end:0};
            return d.animateProperty(myElement);
        }

        ;
        function slodeet(dirrection, myElement) {
            var theElement = myElement.node = myElement.next.node, r = myElement.rotatorBox, m = dirrection % 2, s = (m ? r.w : r.h) * (dirrection < 2 ? -1 : 1);
//            d.style(theElement, {display:"", zIndex:(d.style(myElement.current.node, "zIndex") || 1) + 1});
            if (!myElement.properties) {
                myElement.properties = {};
            }
            myElement.properties[m ? "left" : "top"] = {start:s, end:0};
            return d.animateProperty(myElement);
        }

        ;
        function sloodet(dirrection, myElement) {
            var theElement = myElement.node = myElement.current.node, r = myElement.rotatorBox, m = dirrection % 2, s = (m ? r.w : r.h) * (dirrection < 2 ? -1 : 1);
            //d.style(theElement, {display:"", zIndex:(d.style(myElement.current.node, "zIndex") || 1) + 1});
            if (!myElement.properties) {
                myElement.properties = {};
            }
            console.log('trow out props')
            console.log(s)
            myElement.properties[m ? "left" : "top"] = {start:0, end:-s};
            return d.animateProperty(myElement);
        }

        function gbg(el) {
            return d.fx.combine([sloodet(3, el), slodeet(3, el) ]);
        }


        d.mixin(dojox.widget.rotator, {
            fade:function (myElement) {
                return fadeIt(myElement, "chain");
            }, slidIt:function (myElement) {
                return slideIt(myElement);
            },
            crossFade:function (myElementt) {
                return fadeIt(myElementt, "chain");
            }});
    })(dojo);
}); 

