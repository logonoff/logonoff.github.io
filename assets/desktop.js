/**
 * @type {string[]} list of open window ids
 */
const openWindows = new Set([]);

/**
 * @type {number} highest z-index of all windows
 */
let highestZ = 0;

/**
 * @type {string[]} history of window foci
 */
let focusedWindows = [];

const unfocusWindow = (id) => {
	// set the focus to the last focused window if it exists
	focusedWindows = focusedWindows.filter((windowId) => windowId !== id);
	setFocus(focusedWindows.pop());
}

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
snapIndicator.classList.add('glass');
document.body.appendChild(snapIndicator);

/**
 * Closes the window with the given id
 * @param {string} id
 */
const closeWindow = (id) => {
	unfocusWindow(id);
	openWindows.delete(id);

	// target .window
	document.getElementById(id).remove();
	// target .taskbar-list-item li
	document.getElementById('taskbar-' + id).parentElement.remove();

	// all windows are closed, so there are no more z-indexes to track
	openWindows.size === 0 && setHighestZ(0);
}

/**
 * Maximizes / restores the window with the given id
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
		elem.style.setProperty('--top', elem.dataset.top);
		elem.style.setProperty('--left', elem.dataset.left);
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
		elem.dataset.top = getComputedStyle(elem).getPropertyValue('--top');
		elem.dataset.left = getComputedStyle(elem).getPropertyValue('--left');
		elem.style.setProperty('--top', '0px');
		elem.style.setProperty('--left', '0px');

		// save old size and then maximize
		content.dataset.width = content.style.width;
		content.dataset.height = content.style.height;
		content.removeAttribute("style");

		elem.querySelector(".maximize").innerHTML = '<svg width="1em" height="1em"><use xlink:href="#icon-restore"></use></svg>';
	}

	// make sure window stays in bounds
	if (elem.offsetTop < 0) {
		elem.style.setProperty('--top', "0px");
	}
	if (elem.offsetLeft < 0) {
		elem.style.setProperty('--left', "0px");
	}
	if (elem.offsetTop + elem.offsetHeight > window.innerHeight) {
		elem.style.setProperty('--top', window.innerHeight - elem.offsetHeight + "px");
	}
	if (elem.offsetLeft + elem.offsetWidth > window.innerWidth) {
		elem.style.setProperty('--left', window.innerWidth - elem.offsetWidth + "px");
	}
}

/**
 * Minimize a window
 */
const minimizeWindow = (id) => {
	document.getElementById(id).classList.toggle('minimized');
	unfocusWindow(id);
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
 * @param {string?} id
 */
const setFocus = (id) => {
	if (!id || !openWindows.has(id)) {
		return;
	}

	focusedWindows.push(id);
	// set the focus
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
 * @param {object} options options for the window
 *
 * @param {string} options.url url to load in the iframe
 * @param {string?} options.title title of the window
 * @param {string?} options.templateId element id of the template to use
 * @param {number?} options.width the requested width of the window in px
 * @param {number?} options.height the requested height of the window in px
 * @param {boolean?} options.maximized if true, the window will be maximized
 * @param {number?} options.top initial top position
 * @param {number?} options.left initial left position
 * @param {boolean?} options.noClose if true, the window will not close
 * @param {boolean?} options.glass wether the content should be glassy
 * @returns the id of the window element
 */
const spawnDraggable = ({
	url = "about:blank",
	title = url,
	templateId = 'window-template',
	width = 300,
	height = 150,
	maximized = false,
	top = Math.max(Math.floor(Math.random() * document.body.clientHeight - (height ?? 0)), 0),
	left = Math.max(Math.floor(Math.random() * document.body.clientWidth - (width ?? 0)), 0),
	noClose = false,
	glass = false,
}) => {
	/** @type {HTMLTemplateElement} */
	const template = document.getElementById(templateId);

	let clone = template.content.cloneNode(true);

	if (templateId === 'window-template' && isMobile()) {
		// open new tab instead
		window.open(url, '_blank');
		return;
	}

	const id = 'window-' + Math.random().toString(36).substr(2);

	clone.querySelector('.window').id = id;

	// insert before taskbar so that we can use the ~ selector on it
	document.body.insertBefore(clone, document.getElementById('taskbar-container'));

	const elem = document.getElementById(id);

	elem.style.setProperty('--top', top + 'px');
	elem.style.setProperty('--left', left + 'px');

	if (elem.querySelector('iframe')) {
		elem.querySelector('iframe').src = url;
	}

	if (glass) {
		elem.classList.add('glass');
	}

	if (width) {
		elem.querySelector('.content').style.width = Math.min(width, window.innerWidth) + 'px';
	}

	if (height) {
		elem.querySelector('.content').style.height = Math.min(height, window.innerHeight) + 'px';
	}

	if (elem.querySelector('.titlebar .titlebar-title')) {
		// vulnerable to XSS but I control the HTML
		elem.querySelector('.titlebar .titlebar-title').innerHTML = title;
		elem.querySelector('.titlebar .titlebar-title').id = 'title-' + id;
	}

	// add aria to iframe
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
		elem.querySelector('.minimize').addEventListener('click', () => minimizeWindow(id));
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
			element.style.setProperty('--left', (e.clientX - x * element.clientWidth) + "px");
			element.style.setProperty('--top', (e.clientY - y * element.clientHeight) + "px");
		}
	}

	function elementDrag(e) {
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

		// check out of bounds based on cursor position
		if (element.offsetTop - pos2 < 0) {
			snap = "top";
			snapIndicator.classList = 'snap glass visible top';
		} else if (element.offsetLeft - pos1 < 0) {
			snap = "left";
			snapIndicator.classList = 'snap glass visible left';
		} else if (element.offsetLeft + element.offsetWidth - pos1 > window.innerWidth) {
			snap = "right";
			snapIndicator.classList = 'snap glass visible right';
			snapIndicator.style.setProperty('--left', '50%'); // parallax
		} else {
			snap = "";
			snapIndicator.classList = 'snap glass';
			snapIndicator.style.removeProperty('--left');
		}

		// set the element's new position:
		element.style.setProperty('--top', (element.offsetTop - pos2) + "px");
		element.style.setProperty('--left', (element.offsetLeft - pos1) + "px");
	}

	function closeDragElement() {
		if (snap != "") {
			// maximize the window
			if (!element.classList.contains('maximized')) {
				toggleMaximize(element.id);
			}

			if (snap === "right") { // snap to right snaps to the right
				element.style.setProperty('--left', '50%');
				element.style.width = "50%";
			}
			else if (snap === "left") { // snap to left snaps to the left
				element.style.setProperty('--left', '0');
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
const allDetails = document.querySelectorAll('[data-open-in-window] a:not([target="_blank"])');

allDetails.forEach((detail) => {
	detail.addEventListener('click', (e) => {
		// prevent default link behavior
		e.preventDefault();
		// get titlebar icon
		let icon = { outerHTML: '' };
		if (detail.querySelector('.icon')) {
			icon = detail.querySelector('.icon').cloneNode(true);
			icon.setAttribute('width', '1em');
			icon.setAttribute('height', '1em');
			icon.classList.remove('icon');
			icon.classList.add('titlebar-icon');
		}
		// get titlebar title
		const title = `${icon.outerHTML}<div>${detail.querySelector('.title').innerText}</div>`;
		// spawn draggable window
		spawnDraggable({
			url: detail.href,
			title: title,
			maximized: detail.dataset.openFullscreen,
			width: detail.dataset.requestedWidth,
			height: detail.dataset.requestedHeight,
			glass: detail.dataset.glass
		});
	});
});

/* konami code accent colour rainbow */
(function() {
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let pos = 0;

  document.addEventListener("keydown", (e) => {
    pos = e.key === KONAMI[pos] ? pos + 1 : 0;
    if (pos === KONAMI.length) {
      pos = 0;
      let hue = 0;
      setInterval(() => {
        hue = (hue + 1) % 360;
        document.documentElement.style.setProperty(
          "--shale-v1-accent",
          `hsl(${hue}, 100%, 50%)`,
          "important"
        );
      }, 20);
    }
  });
})();
