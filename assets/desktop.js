/**
 * @type {string[]} list of open window ids
 */
const openWindows = new Set([]);

/**
 * @type {number} highest z-index of all windows
 */
let highestZ = 0;

const setHighestZ = (highest) => {
	highestZ = highest;
	document.querySelector(':root').style.setProperty('--highest-z', highestZ);
}

/**
 * @type {boolean} if true the client is on a touch device
 */
const isMobile = () => {
	// check for minimum width to detect mobile devices
	return window.innerWidth <= 800;
}

// place global snap indicator to DOM
const snapIndicator = document.createElement('div');
snapIndicator.classList.add('snap');
document.body.appendChild(snapIndicator);

/**
 * Closes the window with the given id
 * @param {string} id
 */
const closeWindow = (id) => {
	const elem = document.getElementById(id);
	elem.remove();
	openWindows.delete(id);
	document.getElementById('taskbar-' + id).remove();

	// if all windows are closed, reset z-index
	openWindows.size === 0 && setHighestZ(0);
}

/**
 * Maximizes / minimizes the window with the given id
 * @param {string} id
 */
const toggleMaximize = (id) => {
	const elem = document.getElementById(id);
	const content = elem.querySelector('.content');
	const maximized = elem.classList.contains('maximized');
	elem.classList.toggle('maximized');

	// remove window snap
	elem.style.width = "";

	if (maximized) {
		dragElement(elem);
		// restore old position
		elem.style.top = elem.dataset.top;
		elem.style.left = elem.dataset.left;
		elem.removeAttribute("data-top");
		elem.removeAttribute("data-left");

		// restore old size
		content.style.width = content.dataset.width;
		content.style.height = content.dataset.height;
		content.removeAttribute("data-width");
		content.removeAttribute("data-height");

		elem.querySelector(".maximize").innerHTML = '<svg width="1em" height="1em"><use xlink:href="#icon-maximize"></use></svg>';
	} else {
		// save old position and then move to top left
		elem.dataset.top = elem.style.top;
		elem.dataset.left = elem.style.left;
		elem.style.top = '0px';
		elem.style.left = '0px';

		// save old size and then maximize
		content.dataset.width = content.style.width;
		content.dataset.height = content.style.height;
		content.removeAttribute("style");

		elem.querySelector(".maximize").innerHTML = '<svg width="1em" height="1em"><use xlink:href="#icon-restore"></use></svg>';
	}

	// make sure window stays in bounds
	if (elem.offsetTop < 0) {
		elem.style.top = "0px";
	}
	if (elem.offsetLeft < 0) {
		elem.style.left = "0px";
	}
	if (elem.offsetTop + elem.offsetHeight > window.innerHeight) {
		elem.style.top = window.innerHeight - elem.offsetHeight + "px";
	}
	if (elem.offsetLeft + elem.offsetWidth > window.innerWidth) {
		elem.style.left = window.innerWidth - elem.offsetWidth + "px";
	}
}

/**
 * @param {element} elem
 * @returns the id of the window element
 */
const closestId = (elem) => {
	return elem.closest('.window').id;
}

/**
 * Set the focus to the window with the given id
 * @param {string} id
 */
const setFocus = (id) => {
	const elem = document.getElementById(id);
	elem.style.zIndex = highestZ;
	setHighestZ(highestZ + 1);
	elem.classList.remove('minimized');
	// set blur class to all other windows
	openWindows.forEach((windowId) => {
		document.getElementById(windowId).querySelector('.shale-v1-header').classList.add('shale-v1--disabled');
		document.getElementById(`taskbar-${windowId}`).classList.remove('current');
	});
	// remove blur class from current window
	elem.querySelector('.shale-v1-header').classList.remove('shale-v1--disabled');
	document.getElementById(`taskbar-${id}`).classList.add('current');
	// literally give it focus
	elem.querySelector('a, button').focus();
}

/**
 * Generates a draggable window with an iframe inside
 * @param {string} url url to load in the iframe
 * @param {string?} title title of the window
 * @param {number?} top initial top position
 * @param {number?} left initial left position
 * @param {string?} templateId element id of the template to use
 * @param {boolean?} noClose if true, the window will not close
 * @param {boolean?} maximized if true, the window will be maximized
 * @param {number?} width the requested width of the window in px
 * @param {number?} height the requested height of the window in px
 * @returns the id of the window element
 */
const spawnDraggable = (url, title, top, left, templateId, noClose, maximized, width = 300, height = 150) => {
	if (!templateId) { templateId = 'window-template'; }
	const template = document.getElementById(templateId);
	let clone = template.content.cloneNode(true);

	if (templateId === 'window-template' && isMobile()) {
		// open new tab instead
		window.open(url, '_blank');
		return;
	}

	const id = 'window-' + Math.random().toString(36).substr(2);

	clone.querySelector('.window').id = id;

	document.body.appendChild(clone);

	const elem = document.getElementById(id);

	if (top) {
		elem.style.top = top + 'px';
	} else {
		elem.style.top = Math.max(Math.floor(Math.random() * document.body.clientHeight - (height ?? 0)), 0) + 'px';
	}

	if (left) {
		elem.style.left = left + 'px';
	} else {
		elem.style.left = Math.max(Math.floor(Math.random() * document.body.clientWidth - (width ?? 0)), 0) + 'px';
	}

	if (elem.querySelector('iframe')) {
		elem.querySelector('iframe').src = url;
	}

	if (width) {
		elem.querySelector('.content').style.width = Math.min(width, window.innerWidth) + 'px';
	}

	if (height) {
		elem.querySelector('.content').style.height = Math.min(height, window.innerHeight) + 'px';
	}

	if (!title) { title = url; }

	if (elem.querySelector('.titlebar .titlebar-title')) {
		// vulnerable to XSS but I control the HTML
		elem.querySelector('.titlebar .titlebar-title').innerHTML = title;
		elem.querySelector('.titlebar .titlebar-title').id = 'title-' + id;
	}

	// add aira to iframe
	elem.querySelector('iframe').setAttribute('aria-labelledby', 'title-' + id);
	elem.setAttribute('aria-labelledby', 'title-' + id);

	dragElement(elem);

	// add event listeners
	if (elem.querySelector('.close') && !noClose) {
		elem.querySelector('.close').addEventListener('click', () => closeWindow(id));
	}
	if (elem.querySelector('.maximize')) {
		elem.querySelector('.maximize').addEventListener('click', () => toggleMaximize(id));
	}
	if (elem.querySelector('.minimize')) {
		elem.querySelector('.minimize').addEventListener('click', () => elem.classList.toggle('minimized'));
	}
	if (elem.querySelector('.titlebar')) {
		elem.querySelector('.titlebar').addEventListener('dblclick', () => toggleMaximize(id));
	}
	elem.addEventListener('mousedown', () => setFocus(id));
	elem.addEventListener('touchstart', () => setFocus(id));

	openWindows.add(id);
	spawnTaskbarItem(id, title, noClose);
	setFocus(id);

	if (maximized) {
		toggleMaximize(id);
	}

	return id;
}

/**
 * Create a taskbar item for the given window
 * @param {string} id id of the window
 * @param {string} title title of the window
 * @param {boolean?} noClose if true, the window will not close
 */
const spawnTaskbarItem = (id, title, noClose) => {
	const template = document.getElementById('taskbar-item-template');
	let windowElem = document.getElementById(id);
	let clone = template.content.cloneNode(true);

	clone.querySelector('.taskbar-item').id = 'taskbar-' + id;
	// vulnerable to XSS but I control the HTML
	clone.querySelector('.taskbar-item').innerHTML = title;

	document.getElementById('taskbar').appendChild(clone);

	const elem = document.getElementById('taskbar-' + id);

	elem.addEventListener('click', () => {
		if (windowElem.classList.contains('minimized') || windowElem.classList.contains('blur')) {
			setFocus(id);
		} else {
			windowElem.classList.add('minimized');
		}
	});

	if (!noClose) {
		elem.addEventListener('auxclick', (e) => {
			e.preventDefault();
			closeWindow(id);
			e.stopPropagation();
		});
	}
}

/**
 * Makes an element draggable
 * @link https://www.w3schools.com/howto/howto_js_draggable.asp
 * @param {Element} element
 */
const dragElement = (element) => {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	var snap = "";

	// the header is where you move the DIV from:
	if (element.querySelector(".titlebar-title")) {
		element.querySelector(".titlebar-title").onmousedown = (e) => { dragMouseDown(e); unMaximize(e) };
		element.querySelector(".titlebar-title").ontouchstart = (e) => { dragMouseDown(e); unMaximize(e.touches[0]) };
	}

	function dragMouseDown(e) {
		e = e || window.event;

		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		document.ontouchend = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
		document.ontouchmove = (e) => elementDrag(e.touches[0]);
	}

	function unMaximize (e) {
		e = e || window.event;

		// unmaximize the window if it is maximized
		if (element.classList.contains('maximized')) {
			// get the position of the mouse relative to the window in percentage
			let x = (e.clientX - element.offsetLeft) / element.clientWidth;
			let y = (e.clientY - element.offsetTop) / element.clientHeight;

			// unmaximize the window
			toggleMaximize(element.id);

			// remove snap if it is set
			element.style.width = "";

			// set the window to the position of the mouse
			element.style.left = (e.clientX - x * element.clientWidth) + "px";
			element.style.top = (e.clientY - y * element.clientHeight) + "px";
		}
	}

	function elementDrag(e) {
		e = e || window.event;
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

		// check out of bounds based on cursor position
		if (element.offsetTop - pos2 < 0) {
			snap = "top";
			snapIndicator.classList = 'snap visible top';
		} else if (element.offsetLeft - pos1 < 0) {
			snap = "left";
			snapIndicator.classList = 'snap visible left';
		} else if (element.offsetLeft + element.offsetWidth - pos1 > window.innerWidth) {
			snap = "right";
			snapIndicator.classList = 'snap visible right';
		} else {
			snap = "";
			snapIndicator.classList = 'snap';
		}

		// set the element's new position:
		element.style.top = (element.offsetTop - pos2) + "px";
		element.style.left = (element.offsetLeft - pos1) + "px";
	}

	function closeDragElement() {
		if (snap != "") {
			// maximize the window
			if (!element.classList.contains('maximized')) {
				toggleMaximize(element.id);
			}

			if (snap === "right") { // snap to right snaps to the right
				element.style.left = "50%";
				element.style.width = "50%";
			}
			else if (snap === "left") { // snap to left snaps to the left
				element.style.left = "0px";
				element.style.width = "50%";
			}
		}

		snapIndicator.classList = 'snap';

		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
		document.ontouchend = null;
		document.ontouchmove = null;
	}
}

/**
 * Get all details-component and spawn windows instead of opening links
 */
const allDetails = document.querySelectorAll('[data-open-in-window] .details-component a:not([target="_blank"])');

allDetails.forEach((detail) => {
	detail.addEventListener('click', (e) => {
		// prevent default link behavior
		e.preventDefault();
		// get titlebar icon
		const icon = detail.querySelector('.icon').cloneNode(true);
		icon.setAttribute('width', '1em');
		icon.setAttribute('height', '1em');
		icon.classList.remove('icon');
		// get titlebar title
		const title = `${icon.outerHTML}<div>${detail.querySelector('.title').innerText}</div>`;
		// spawn draggable window
		spawnDraggable(detail.href,
		               title,
					   undefined,
					   undefined,
					   undefined,
					   undefined,
					   detail.dataset.openFullscreen,
					   detail.dataset.requestedWidth,
					   detail.dataset.requestedHeight);
	});
});
