var img, canvas;
var xcan, ycan, xcan0, ycan0;
var click_count = 0,
	x1, y1, x2, y2;
var os, browser;

window.onload = function() {

	var os = GetOS();
	var obj;
	if (os == "MacOS")
		obj = document.getElementById('inst2');
	else if (os == "iOS")
		obj = document.getElementById('inst3');
	else if (os == "Android")
		obj = document.getElementById('inst4');
	else
		obj = document.getElementById('inst1');

	var imgdiv1 = document.getElementById('imgdiv1');
	var imgdiv2 = document.getElementById('imgdiv2');

	canvas = GetCanvas();
	canvas.style.display = 'none';

	browser = get_browser();
	if (browser == 'Chrome') {
		imgdiv2.style.display = 'none';
		imgdiv1.style.display = '';
	} else if (browser == 'Firefox') {
		imgdiv1.style.display = 'none';
		imgdiv2.style.display = '';
		imgdiv2.focus();
	} else {
		imgdiv2.style.display = 'none';
		imgdiv1.style.display = '';
		alert('Pixel ruler may not be supported with this browser\nPlease try with Chrome or Firefox');
	}

	if (browser == 'Firefox') {
		document.onpaste = function(event) {
			var Draw2 = function() {
				img = GetImage();
				if (!img) img = this;
				var canvas = GetCanvas();
				canvas.width = img.width;
				canvas.height = img.height;
				canvas.style.width = img.width + 'px';
				canvas.style.height = img.height + 'px';
				canvas.getContext("2d").drawImage(img, 0, 0);
				canvas.style.cursor = "crosshair"; //"default"
				xcan0 = xcan = img.width;
				ycan0 = ycan = img.height;
				img.style.display = 'none';
				canvas.style.display = '';
				document.getElementById('isize').value = xcan + "x" + ycan;
			};
			//img = GetImage();
			//if(img.complete)
			//	Draw2();
			//else
			//	img.onload = Draw2;
			setTimeout(Draw2, 300);
		};
	} else {
		document.onpaste = function(event) {
			// use event.originalEvent.clipboard for newer chrome versions
			var clipboardData = event.clipboardData || event.originalEvent.clipboardData;
			var items = clipboardData.items;
			console.log(JSON.stringify(items)); // will give you the mime types
			// find pasted image among pasted items
			var blob;
			for (var i = 0; i < items.length; i++) {
				if (items[i].type.indexOf("image") === 0) {
					blob = items[i].getAsFile();
				}
			}
			// load image if there is a pasted image
			if (blob !== null) {
				var reader = new FileReader();
				reader.onload = function(event) {
					//console.log(event.target.result); // data url!
					img = document.getElementById("pastedImage");
					img.src = event.target.result;
					if (img.complete)
						DrawCanvas(0);
					else
						img.onload = function() {
							DrawCanvas(0);
						};
				};

				reader.readAsDataURL(blob);
			}
		};
	}

	canvas.onmousedown = function(event) {
		if (click_count == 0) {
			click_count++;
			canvas = GetCanvas();
			p = GetPos(canvas, event);
			ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0);
			x1 = p.x * xcan0 / xcan;
			y1 = p.y * ycan0 / ycan;
		}
	};

	canvas.onmouseup = function(event) {
		if (click_count == 1) {
			canvas = GetCanvas();
			p = GetPos(canvas, event);
			x = p.x * xcan0 / xcan;
			y = p.y * ycan0 / ycan;
			if (x != x1 && y != y1) {
				click_count++;
				click_count = 0;
			}
		}
	};

	canvas.onmousemove = function(event) {
		if (click_count == 1) {
			canvas = GetCanvas();
			p = GetPos(canvas, event);
			x2 = p.x * xcan0 / xcan;
			y2 = p.y * ycan0 / ycan;
			if (x2 > x1) {
				x1 = Math.floor(x1);
				x2 = Math.ceil(x2);
			} else if (x2 < x1) {
				x2 = Math.floor(x2);
				x1 = Math.ceil(x1);
			} else {
				x1 = Math.round(x1);
				x2 = Math.round(x2);
			}
			if (y2 > y1) {
				y1 = Math.floor(y1);
				y2 = Math.ceil(y2);
			} else if (y2 < y1) {
				y2 = Math.floor(y2);
				y1 = Math.ceil(y1);
			} else {
				y1 = Math.round(y1);
				y2 = Math.round(y2);
			}
			img = GetImage();
			DrawCanvas(1);
			ctx = canvas.getContext("2d");
			//ctx.setLineDash([5]);
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#000000";
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#808080";
			//ctx.setLineDash([5]);
			ctx.beginPath();
			ctx.rect(x1, y1, x2 - x1, y2 - y1);
			ctx.stroke();
			
			dx = Math.abs(x2 - x1);
			dy = Math.abs(y2 - y1);
	        var fontSize = 0;
			var tempSize = dx / 10;
			if(tempSize < 7) fontSize = 7;
			else fontSize = tempSize;
			
			console.log("font: ",fontSize);
			
			ctx.font = fontSize+'pt Calibri';
	        ctx.strokeStyle = 'blue';
		    ctx.strokeText(x1 + '\u00D7' + y1 + ' (' + dx + '\u00D7' + dy + ')', x1 + 15, y1 - 10);
			
			document.getElementById('position').value = x1 + '\u00D7' + y1;
			document.getElementById('len').value = Math.round(Math.sqrt(dx * dx + dy * dy)) + '';
			document.getElementById('size').value = dx + '\u00D7' + dy;
		}
	};

	DrawCanvas(0);
	ZoomOut();
	ZoomOut();
	ZoomOut();
	ZoomOut();
	ZoomOut();
	ZoomOut();
};
var outputPlist 			= {};
outputPlist.coordinates 	= [];

function OutputPlist() {
	//sort outputPlist.coordinates by children
	var plistString = PlistParser.toPlist(outputPlist);
	console.log(plistString);
	alert(plistString);
	debugger;
}

function StorePosition() {
	var coordinateName = document.getElementById('coordinateName').value;
	outputPlist.coordinates[coordinateName] = {};
	outputPlist.coordinates[coordinateName].position 	= document.getElementById('position').value;
	outputPlist.coordinates[coordinateName].size 	= document.getElementById('size').value;
	outputPlist.coordinates[coordinateName].length 	= document.getElementById('len').value;

	console.log("add logic to check if coordinate with that name already exists. If yes, reject the save with alert")

	// make canvas box draggable: http://jsfiddle.net/Zevan/QZejF/3/

	ctx = canvas.getContext("2d");
	ctx.strokeStyle="#FF0000";
	ctx.stroke();
	
	debugger;
	
	console.log("saved coordinate: ", outputPlist);
	var dataURL = canvas.toDataURL();
	img.src = dataURL;


	//debugger;

}

function GetPos(obj, e) {
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	var currentElement = obj;

	if (browser == 'Chrome') {
		x = event.offsetX;
		y = event.offsetY;
	} else {
		do {
			totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
			totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
		}
		while (currentElement = currentElement.offsetParent)

		x = e.pageX - totalOffsetX;
		y = e.pageY - totalOffsetY;
	}

	return {
		x: x,
		y: y
	};
}

function DrawCanvas(f) {
	img = GetImage();
	canvas = GetCanvas();

	canvas.style.cursor = "crosshair"; //"default"
	if (f == 0) {
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.style.width = img.width + 'px';
		canvas.style.height = img.height + 'px';
		xcan0 = xcan = img.width;
		ycan0 = ycan = img.height;
		document.getElementById('isize').value = xcan + "x" + ycan;
	} else {
		x = Math.round(xcan);
		y = Math.round(ycan);
		canvas.style.width = x + 'px';
		canvas.style.height = y + 'px';
	}

	canvas.getContext("2d").drawImage(img, 0, 0);
	canvas.style.display = '';
	img.style.display = 'none';
	//canvas.getContext("2d").save();
}

function ZoomOut() {
	canvas = GetCanvas();
	xcan *= 0.9;
	ycan *= 0.9;
	x = Math.round(xcan);
	y = Math.round(ycan);
	canvas.style.width = x + 'px';
	canvas.style.height = y + 'px';
}

function ZoomIn() {
	canvas = GetCanvas();
	xcan /= 0.9;
	ycan /= 0.9;
	x = Math.round(xcan);
	y = Math.round(ycan);
	canvas.style.width = x + 'px';
	canvas.style.height = y + 'px';
}

function GetImage() {
	var img;
	if (browser == 'Firefox') {
		//img = document.getElementsByTagName("img")[5];
		arr = document.getElementsByTagName("img");
		len = arr.length;
		img = arr[len - 1];
	} else
		img = document.getElementById('pastedImage');
	return img;
}

function GetCanvas() {
	var can;
	if (browser == 'Firefox')
		can = document.getElementById('can2');
	else
		can = document.getElementById('can');
	return can;
}

function Paste() {
	os = GetOS();
	if (os == "UNIX")
		alert("Press Ctrl+Shift+V to paste image");
	else if (os == "MacOS")
		alert("Press Command+V to paste image");
	else if (os == "iOS")
		alert("Tap on entry field and press the paste button to paste image");
	else if (os == "Android")
		alert("Press Menu+V or long tap on entry field and press the paste button to paste image");
	else
		alert("Press Ctrl+V to paste image");
}

function Save() {
	var img = GetImage();
	canvas = GetCanvas();
	if (canvas.style.display == 'none') return;

	document.getElementById("getFilename").style.display = "";

	return false;
}

function Delete() {
	canvas = GetCanvas();
	canvas.style.display = 'none';
	if (browser == 'Firefox') {
		var img = GetImage();
		img.parentNode.removeChild(img);
		var imgdiv2 = document.getElementById('imgdiv2');
		imgdiv2.focus();
	}
	document.getElementById('len').value = '';
	document.getElementById('size').value = '';
	click_count = 0;
}

function cancelSaveFile() {
	document.getElementById("getFilename").style.display = "none";
}

function saveFile() {
	cancelSaveFile();
	var name = document.getElementById("filename").value;
	if (name == '') name = 'filename.png';

	var img = GetImage();
	var canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	canvas.getContext("2d").drawImage(img, 0, 0);

	canvas.toBlob(function(blob) {
		saveAs(blob, name);
	});
}
