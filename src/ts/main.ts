let params = new URLSearchParams(window.location.search);

if (params.has('noscript')) {
  // NoScript behavior requested. Do nothing.
} else if (document.readyState != 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

// DOM helper function.
function forall(selector, f) {
  document.querySelectorAll(selector).forEach(f);
}

function init() {
  // Hide fallback content and show script-only content.
  forall('.noscript-only', el => el.setAttribute('hidden', ''));
  forall('.script-only', el => el.removeAttribute('hidden'));

  // Disable direct image links used for NoScript.
  forall('.img-directlink', el => el.addEventListener('click', ev => ev.preventDefault()));

  // Apply light theme if requested.
  if (params.has('light')) {
    document.body.classList.add('light');
  }

  // Update all the panel IDs to match the data-show values instead of URL hashes.
  // eg. "#resume" has its ID set to "resume-panel".
  forall('.navigation-list a', el => {
    let url_hash = el.getAttribute('href');
    let panel_id = el.getAttribute('data-show').substring(1);
    if (url_hash == '') {
      // The main tab uses an empty href for noscript reasons, so the below approach won't work.
      // The associated panel should simply start with the "-panel" name applied.
      return;
    }
    // By chance, the anchor prefix "#" and the id prefix "#" are the same,
    // so url_hash can be used directly as a selector without any fuss.
    document.querySelector(url_hash).setAttribute('id', panel_id);
  });

  // Add click events to all the navigation links (including the ones in the body).
  forall('a[data-show]', el => el.addEventListener("click", ev => {
    ev.preventDefault();
    // Hide all the content panels.
    forall('.content-panel', el => el.setAttribute('hidden', ''));
    // Then show only the one corresponding to the clicked link.
    let show_selector = el.getAttribute('data-show');
    document.querySelector(show_selector).removeAttribute('hidden');
    // Tag only the current tab as open.
    document.querySelector('.open')?.classList.remove('open');
    el.classList.add('open');
    // Update the URL to match the hash from the link.
    let hash = el.getAttribute('href');
    history.replaceState(
      null,
      document.title,
      window.location.pathname + window.location.search + hash
    );
  }));

  // Don't show focus styles for nav links that are clicked on.
  // This is (somewhat of) an alternative for the :focus-visible
  // pseudo-class, which isn't well suppported right now.
  forall('.navigation-list a', el => el.addEventListener('mousedown', ev => {
    let click_time = ev.timeStamp;
    el.classList.add('hide-focus');
    el.classList.add('just-clicked');
    el.setAttribute('data-last-clicked', click_time);
    let remove_just_clicked = () => {
      if (el.getAttribute('data-last-clicked') === click_time.toString()) {
        el.classList.remove('just-clicked');
      }
    };
    setTimeout(remove_just_clicked, 50);
  }));
  // Remove the hide-focus class when a nav link regains focus.
  // (Unless it is being focused from _just_ being clicked; see above)
  forall('.navigation-list a', el => el.addEventListener('focus', ev => {
    if (!el.classList.contains('just-clicked')) {
      el.classList.remove('hide-focus');
    }
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

  // Scroll the viewport back to the top. This is necessary since anchored links
  // move the viewport before the above scripts run and the page is re-drawn.
  if (window.performance && performance.navigation.type !== 1) {
    // If we can detect the load type and it wasn't a reload:
    window.scrollTo(0,0);
  }

  // Give the lightbox elements a name since they are used multiple times.
  let overlayEl = document.querySelector('.lightbox-overlay') as HTMLElement;

  function ignoreBubble(f) {
    function impl(ev) {
      if (ev.target == this) {
        f(ev);
      }
    }
    return impl;
  }

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
  function showLightbox(imageSrc, imageAlt) {
    let imageEl = new Image();
    imageEl.src = imageSrc;
    imageEl.alt = imageAlt;
    imageEl.classList.add('lightbox-image');
    imageCache[imageSrc] = $(imageEl);
    $(".lightbox-content").append(imageEl);
    if (typeof imageEl.decode === "function") {
      // Use `decode()` if available.
      imageEl.decode().then(function() {
        overlayEl.removeAttribute('hidden');
        resizeLightbox();
      });
    } else {
      // Else, fallback to `onload`.
      imageEl.onload = function() {
        overlayEl.removeAttribute('hidden');
        resizeLightbox();
      }
    }
  }

  // Set the lightbox to close when clicked.
  overlayEl.addEventListener('click', ev => {
    overlayEl.setAttribute('hidden', '');
  });

  // Cache lightbox image elements to prevent further requests eg. in Chrome.
  let imageCache = {};

  // Set the lightbox to open with the clicked-on project image.
  $(".lightbox-source").click(function() {
    $(".lightbox-image").hide();
    forall('.lightbox-image', el => el.setAttribute('hidden', ''));
    let sourceEl = $(this);
    let imageSrc = sourceEl.attr("data-fullsize-src");
    if (imageCache[imageSrc]) {
      // Use cached image.
      imageCache[imageSrc].show();
      imageCache[imageSrc].get(0).removeAttribute('hidden');
      overlayEl.removeAttribute('hidden');
      resizeLightbox();
    } else {
      let imageAlt = sourceEl.attr("alt");
      showLightbox(imageSrc, imageAlt);
    }
  });
}  // init
