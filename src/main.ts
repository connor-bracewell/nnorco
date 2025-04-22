// Run init() once the document is loaded.
if (document.readyState != 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

// DOM helper functions.
function forAll(selector, f) {
  document.querySelectorAll(selector).forEach(f);
}
function hideEl(el) {
  el.setAttribute('hidden', '');
}
function unhideEl(el) {
  el.removeAttribute('hidden');
}

function init() {
  let params = new URLSearchParams(window.location.search);
  if (params.has('noscript') || params.has('nostyle')) {
    forAll('.nomodifiers', hideEl);
    forAll('.yesmodifiers', unhideEl);
  }
  if (params.has('nostyle')) {
    document.querySelector('#css').setAttribute('disabled', 'disabled');
  }
  if (params.has('noscript')) {
    // js-disabled behavior requested, don't do anything else.
    return;
  }

  // Hide fallback content and show script-only content.
  document.body.classList.remove("noscript");
  forAll('.noscript-only', hideEl);
  forAll('.script-only', unhideEl);
  // Remove the class from these elements to partially unhide them;
  // they keep the "hidden" attribute and must also be shown by CSS.
  forAll('.script-style-only', el => el.classList.remove("script-style-only"))

  // Disable direct image links used for NoScript.
  forAll('.img-directlink', el => el.addEventListener('click', ev => ev.preventDefault()));

  // Update all the panel IDs to match the data-show values instead of URL hashes.
  // eg. "#resume" has its ID set to "resume-panel".
  forAll('.navigation-list a', el => {
    const urlHash = el.getAttribute('href');
    const panelId = el.getAttribute('data-show').substring(1);
    if (urlHash == '') {
      // The main tab uses an empty href for noscript reasons, so the below approach won't work.
      // The associated panel should simply start with the "-panel" name applied in the DOM.
      return;
    }
    // By chance, the anchor prefix "#" and the id prefix "#" are the same,
    // so urlHash can be used directly as a selector without any fuss.
    document.querySelector(urlHash).setAttribute('id', panelId);
  });

  // Add click events to all the navigation links (including the ones in the body).
  forAll('a[data-show]', el => el.addEventListener("click", ev => {
    ev.preventDefault();
    // Hide all the content panels.
    forAll('.content-panel', hideEl);
    // Then show only the one corresponding to the clicked link.
    unhideEl(document.querySelector(el.getAttribute('data-show')));
    // Tag only the current tab as open.
    document.querySelector('.open')?.classList.remove('open');
    el.classList.add('open');
    // Update the URL to match the hash from the link.
    const hash = el.getAttribute('href');
    history.replaceState(
      null,
      document.title,
      window.location.pathname + window.location.search + hash
    );
  }));

  // On load, run the click event from the link corresponding to the URL hash;
  // this shows the requested panel and hides the other ones.
  let initial_url_hash = window.location.hash;
  let initial_link = document.querySelector(`.navigation-list a[href="${initial_url_hash}"]`);
  if (initial_link === null) {
    // If the hash doesn't point to a link, use the first entry (ie. the landing page) instead.
    initial_link = document.querySelector('.navigation-list a')
  }
  (initial_link as HTMLElement).click();

  // Scroll the viewport back to the top. This is necessary since anchored links can
  // move the viewport before the above scripts run and the page is re-drawn.
  if (window.performance && performance.navigation.type !== 1) {
    // If we can detect the load type and it wasn't a reload:
    window.scrollTo(0,0);
  }

  // Give the lightbox elements a name since they are used multiple times.
  let overlayEl = document.querySelector('.lightbox-overlay') as HTMLElement;
  let lightboxContentEl = document.querySelector('.lightbox-content') as HTMLElement;

  // Resize the open lightbox to fill the lightbox container as much as possible.
  function resizeLightbox() {
    if (!overlayEl.hasAttribute('hidden')) {
      let boundEl = document.querySelector('.lightbox-content') as HTMLElement;
      let boundX = boundEl.clientWidth;
      let boundY = boundEl.clientHeight;
      let boundR = boundX / boundY;
      let imageEl = document.querySelector('.lightbox-image:not([hidden])') as HTMLImageElement;
      let imageX = imageEl.naturalWidth;
      let imageY = imageEl.naturalHeight;
      let imageR = imageX / imageY;
      let contentX;
      let contentY;
      if (imageR <= boundR) {
        contentY = Math.min(boundY, imageY);
        contentX = contentY * imageR;
      } else {
        contentX = Math.min(boundX, imageX);
        contentY = contentX / imageR;
      }
      imageEl.setAttribute('style', `width: ${contentX}px; height: ${contentY}px;`);
    }
  }

  // Set the lightbox to resize whenever the window is resized.
  window.addEventListener('resize', resizeLightbox);

  // Show the lightbox after the image loads.
  function loadLightbox(imageSrc, imageAlt) {
    let imageEl = new Image();
    imageEl.src = imageSrc;
    imageEl.alt = imageAlt;
    imageEl.classList.add('lightbox-image');
    imageCache[imageSrc] = imageEl;
    lightboxContentEl.appendChild(imageEl);
    if (typeof imageEl.decode === "function") {
      // Use `decode()` if available.
      return imageEl.decode();
    }
    // Fall back to `onload`.
    return new Promise(resolve => {
      imageEl.onload = () => resolve();
    });
  }

  // Set the lightbox to close when clicked.
  overlayEl.addEventListener('click', ev => {
    overlayEl.setAttribute('hidden', '');
    forAll('.img-wrapper:not(.img-wrapper-default-hidden) .lightbox-source', el => el.removeAttribute("hidden"));
  });

  // Cache lightbox image elements to prevent further requests eg. in Chrome.
  let imageCache = {};

  // Set the lightbox to open with the clicked-on project image.
  forAll('.lightbox-source', el => el.addEventListener('click', async ev => {
    el.parentNode.appendChild(overlayEl);
    forAll('.lightbox-image', img_el => img_el.setAttribute('hidden', ''));
    let imageSrc = el.getAttribute("data-fullsize-src");
    if (imageCache[imageSrc]) {
      // Use cached image.
      imageCache[imageSrc].removeAttribute('hidden');
    } else {
      // Wait for the image to load.
      let imageAlt = el.getAttribute("alt");
      await loadLightbox(imageSrc, imageAlt);
    }
    el.setAttribute('hidden', '');
    overlayEl.removeAttribute('hidden');
    resizeLightbox();
  }));

}  // init
