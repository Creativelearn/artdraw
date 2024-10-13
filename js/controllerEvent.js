function setupListeners(){
    document.addEventListener("mouseup", masterClick, false); 
    document.addEventListener("keydown", masterKeyDown, false);
    document.addEventListener("keyup", masterKeyUp, false);
    document.addEventListener("dblclick", masterDBLclick, false); 
    _hnd['svgHandler'].addEventListener("mousedown", controllerEventMouseDown, false);
    _hnd['svgHandler'].addEventListener("mousemove", controllerEventMouseMove, false);


    window.addEventListener("resize", updateRuler);

    document.addEventListener('contextmenu', function(evt) { 
      evt.preventDefault();
    }, false);
    
    document.onchange = function(evt){
      var mck = evt.target.getAttribute("change");
      if( mck!=null)fnCall(mck, evt);
    }

    contextMenu = document.querySelector(".wrapper"),
    shareMenu = contextMenu.querySelectorAll(".share-menu");

    _hnd['svgHandler'].addEventListener("contextmenu", e => {
        e.preventDefault();
        let x = e.offsetX, y = e.offsetY;

        x+=48; y+=42;
        var r=showRightMenu();
        if(r==false)return;

        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        //contextMenu.style.visibility = "visible";
        visibilityForSelection(".wrapper", "block");
    });
    setupZoomController();
}


function masterKeyDown(evt){
    evt = evt || window.event;     
    var ctrlDown = evt.ctrlKey||evt.metaKey; // Mac support
    _evtMsg['keycode']=evt.keyCode;
    if (evt.ctrlKey && evt.keyCode == 90)controlZundo();        // CTRZ Z
    else if (ctrlDown && (evt.keyCode == 67))toClipboard(false);     // CTRL C 
    else if (ctrlDown && (evt.keyCode == 86))pasteClipboard(evt);    // CTRL V
    else if (ctrlDown && (evt.keyCode == 88))toClipboard(true);      // CTRL X
    else if ( evt.keyCode == 33 )MCKapplyZorder(false, "forward");      // PageUP
    else if ( evt.keyCode == 34 )MCKapplyZorder(false, "backward");      // PageDown
    else if (ctrlDown && (evt.keyCode == 71)){evt.preventDefault();MCKbtnGroupClick(true);  }      // CTRL G Group/Ungroup
    else if (ctrlDown && (evt.keyCode == 80)){evt.preventDefault();OpenImageNewTab(true);  }       // CTRL P Print View
    else if (ctrlDown && (evt.keyCode == 75)){evt.preventDefault();MCKbtnCombineClick();  }        // CTRL K Combine
    else if( evt.keyCode == 27 )restoreKeys();                                                     // ESC
    else if( evt.keyCode == 46 )deleteSeleccion();                                                 // DELETE
    else if( evt.keyCode == 113 ){evt.preventDefault(); zoomMore(evt);      }                      // F2 ZoomMore
    else if( evt.keyCode == 114 ){evt.preventDefault(); zoomMinus(evt);      }                     // F3 ZoomMinus
    else if( evt.keyCode == 115 ){evt.preventDefault(); zoomFit();      }                          // F4 ZoomFit    
    
    else if (evt.shiftKey && evt.keyCode == 70){evt.preventDefault();copyFillStyle(); }            // Shift F Copy Fill Style
    else if (evt.altKey && evt.keyCode == 70){evt.preventDefault();pasteFillStyle(); }             // ALT F Paste Fill Style
    else if (evt.shiftKey && evt.keyCode == 66){evt.preventDefault();copyBorderStyle(); }          // Shift B Copy Border Style
    else if (evt.altKey && evt.keyCode == 66){evt.preventDefault();pasteBorderStyle(); }           // ALT B Paste Border Style

    //else if ( (ctrlDown || evt.shiftKey) && _evtMsg['zoomController']==false)setupZoomController();
}
function masterKeyUp(evt){
  _evtMsg['keycode']=null;
  if ( _evtMsg['zoomController']==true ){
    window.removeEventListener('wheel', controllerEventWheel);
    window.removeEventListener('DOMMouseScroll', controllerEventWheel);
    _evtMsg['zoomController']=false;
  }
}

function setupZoomController(){
  //https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners
  var passiveIfSupported = false;
  try {
    window.addEventListener( "test",  null,  Object.defineProperty({}, "passive", {
        get() { passiveIfSupported = { passive: true }; },
      })
    );
  } catch (err) {}

  window.addEventListener('wheel', controllerEventWheel );  //, { passive: false }
  window.addEventListener('DOMMouseScroll', controllerEventWheel );   //compatibilidad con firefox  
  _evtMsg['zoomController']=true;
}
function controllerEventWheel(evt){
  zoom(evt);
}

function masterClick(evt){
  //on release
  if( _evtMsg['waitFor']!=null ){
    fnCall(_evtMsg['waitFor'], evt);
    _evtMsg['waitFor']=null;
    return;
  }
  visibilityForSelection(".wrapper", "none");
  drawPolygon(evt,'click');
  dragScreen(evt, 'up');
  drawSelector(evt, 'up');
  var mck = evt.target.getAttribute("mouseUp");         
  if( mck!=null)fnCall(mck, evt);
}

function masterDBLclick(evt){
    //evt = evt || window.event;
    var dbck = evt.target.getAttribute("DblClick");
    if( dbck!=null)fnCall(dbck, evt);
}

function controllerEventMouseMove(evt){        
  var ctrlDown = evt.ctrlKey||evt.metaKey;  
  mouseMoveAreaWork(evt);
  if( ctrlDown || evt.shiftKey || (evt.buttons & 4) === 4  ){
    var r=dragScreen(evt, 'move');  
    if(r==true)return;
  }    
  drawSelector(evt, 'move');
  drawPolygon(evt,'move');  
}

function controllerEventMouseDown(evt){         
  dragScreen(evt, 'down');
  drawSelector(evt, 'down');
  var MouseDown = evt.target.getAttribute("MouseDown");
  if( MouseDown!=null){
    fnCall(MouseDown, evt);
    return;
  }
}

function addListenerFunSelector( _event, _selector, _fun){
  [...document.querySelectorAll(_selector)].forEach((element, index, array) => {
    element.addEventListener(_event, _fun , false);
  });
}

function listAllEventListeners() {
        const allElements = Array.prototype.slice.call(document.querySelectorAll('*'));
        allElements.push(document);
        allElements.push(window);      
        const types = [];
      
        for (let ev in window) {
          if (/^on/.test(ev)) types[types.length] = ev;
        }
      
        let elements = [];
        for (let i = 0; i < allElements.length; i++) {
          const currentElement = allElements[i];
          for (let j = 0; j < types.length; j++) {
            if (typeof currentElement[types[j]] === 'function') {
              elements.push({
                "node": currentElement,
                "type": types[j],
                "func": currentElement[types[j]].toString(),
              });
            }
          }
        }      
        return elements.sort(function(a,b) {
          return a.type.localeCompare(b.type);
        });
}
function spy(){
        console.table(listAllEventListeners());
}

function spy2(){
  var cta=0;
  Array.from(document.querySelectorAll("*")).forEach(element => {
      const events = getEventListeners(element);
      if (Object.keys(events).length !== 0) {
          console.log(element, events);
          cta++;
      }
  });
  console.log("Total Listeners:"+cta);
}

function fnCall(fn, ...args){
  let func = (typeof fn =="string")?window[fn]:fn;
  if (typeof func == "function") func(...args);
  else throw new Error(`${fn} is Not a function!`);
}
    
