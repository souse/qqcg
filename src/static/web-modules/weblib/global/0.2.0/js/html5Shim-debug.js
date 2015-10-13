/*! global - v0.2.0 - 2014-10-16*/
(function(win, doc) {
    //taken from modernizr
    if ( !(function(){ var elem = doc.createElement("div"); elem.innerHTML = "<elem></elem>"; return elem.childNodes.length !== 1; })()) {
        return;
    }
    var elems = 'abbr,article,aside,audio,canvas,datalist,details,figcaption,figure,footer,header,hgroup,menu,mark,meter,nav,output,progress,section,summary,time,video',
        elemsArr = elems.split(','),
        elemsArrLen = elemsArr.length,
        docFrag = doc.createDocumentFragment();

    function shim(doc) {
        var a = -1;
        while (++a < elemsArrLen) {
            // Use createElement so IE allows HTML5-named elements in a document
            doc.createElement(elemsArr[a]);
        }
    }

    // Shim the document and iepp fragment
    shim(doc);
    shim(docFrag);

})(this, document);


