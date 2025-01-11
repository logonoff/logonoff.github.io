$(".window").draggable({ handle: ".titlebar" });

$(".window").resizable({
	handles: 'ne, nw, se, sw'
 }); 

 $(".window").resizable("destroy").animate({
	width: 1000,
	height: 550,
	top: 0
  }, function() {
	$(".window").resizable()
  })

  var today = new Date();

  setTimeout(function(){ document.getElementById("time").innerHTML = today.getHours() + ":" + today.getMinutes(); }, 3000);

jQuery.fn.extend({
	maxim: function() {
		$(this).closest('.window').toggleClass("maxim");

		if ($(this).closest('.window').css('top') == '0px' && $(this).closest('.window').css('height') != '550px') {
			$(this).closest('.window').css('height', 550).css('width', 1000);
		} else {
			console.log( $(this).closest('.window').css('top'));
			$(this).closest('.window').css('height', '100vh').css('top', 0).css('left',0).css('width', '100vw');
		}
		return this;
	},

	minim: function() {
		$(this).closest('.window').css('display', 'none');
		return this;
	},

	close: function() {
		$(this).closest('.window').remove();
		return this;
	}
})

// draggy thingy
// http://jsfiddle.net/jLqHv/
var div = document.getElementById('draggy-thing'), x1 = 0, y1 = 0, x2 = 0, y2 = 0;
function reCalc() {
    var x3 = Math.min(x1,x2);
    var x4 = Math.max(x1,x2);
    var y3 = Math.min(y1,y2);
    var y4 = Math.max(y1,y2);
    div.style.left = x3 + 'px';
    div.style.top = y3 + 'px';
    div.style.width = x4 - x3 + 'px';
    div.style.height = y4 - y3 + 'px';
}

// Add the event listeners for mousedown, mousemove, and mouseup
// https://stackoverflow.com/a/36767290
var isOnDiv = false;
$("div").mouseenter(function(){isOnDiv=true;});
$("div").mouseleave(function(){isOnDiv=false;});

document.body.addEventListener('mousedown', e => {
	if ( isOnDiv===false ) {
		div.hidden = 0;
		x1 = e.clientX;
		y1 = e.clientY;
		reCalc();
	} else {
		return;
	}
});
  
window.addEventListener('mousemove', e => {
	x2 = e.clientX;
	y2 = e.clientY;
	reCalc();
});
  
window.addEventListener('mouseup', e => {
	div.hidden = 1;
});
