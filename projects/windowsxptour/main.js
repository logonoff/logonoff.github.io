$(".window").draggable({ handle: ".title-bar" });

function DisplayCurrentTime() {
	var date = new Date();
	var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
	var am_pm = date.getHours() >= 12 ? "PM" : "AM";
	hours = hours < 10 ? "0" + hours : hours;
	var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	time = hours + ":" + minutes + " " + am_pm;
	var lblTime = document.getElementById("time");
	lblTime.innerHTML = time;
};

setTimeout(function(){ DisplayCurrentTime(); }, 5);

jQuery.fn.extend({
	max: function() {
		$(this).closest('.window').toggleClass("maxim");

		if ($(this).closest('.window').css('top') == '0px' && $(this).closest('.window').css('height') != '550px') {
			$(this).closest('.window').css('height', 550).css('width', 1000);
		} else {
			console.log( $(this).closest('.window').css('top'));
			$(this).closest('.window').css('height', '100vh').css('top', 0).css('left',0).css('width', '100vw');
		}
		return this;
	},

	min: function() {
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
$("#window-1").mouseenter(function(){isOnDiv=true;});
$("#window-1").mouseleave(function(){isOnDiv=false;});

onmousedown = function(e) {
	if (!isOnDiv) {
		div.hidden = 0;
		x1 = e.clientX;
		y1 = e.clientY;
		reCalc();
	}
};

onmousemove = function(e) {
	x2 = e.clientX;
	y2 = e.clientY;
	reCalc();
};


onmouseup = function(e) {
	div.hidden = 1;
	$('.active').removeClass('active');
};

function submit() {
	if (document.getElementById("flash").checked) {
		window.location.href = 'mmTour/index.html';
	} else if (document.getElementById("html").checked) {
		window.location.href = 'https://mirror0.logonoff.co/5a757eb07b9569d39d28559ff7c874622e7e6e59/rtm/htmlTour/default.htm';
	}
}
