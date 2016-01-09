/*
global document: false
global window: false
global navigator: false
*/
var jsonFlickrFeed;
(function() {
    'use strict';
    var Pics = function() {
        var root = this; // we declare as variable so that we can use it without clashing with other "this" scopes

        // the function to go back and forth within the lightbox
        root.move = function(imageDiv, titleDiv, addendum) {
            var
                imgData = imageDiv.dataset,
                currentImage = imgData.imageOrder,
                nextImage = parseInt(currentImage) + addendum,
                nextImageElm = document.querySelector('.flickr-photo-set[data-user-id="' + imgData.imageAlbum + '"] [data-image-order="' + nextImage + '"]'),
                nextImageData = (nextImageElm ? nextImageElm.dataset : null),
                imgParent = imageDiv.parentElement,
                ipcl = imgParent.classList;
            if (nextImageData) {
                // we change stuff
                imageDiv.setAttribute('data-image-order', nextImageData.imageOrder);
                imageDiv.style.backgroundImage = 'url(' + nextImageData.imageLarge + ')';
                titleDiv.innerHTML = nextImageData.imageTitle;

                //now we modify the lightbox class for the arrows to inherit the proper first/last styles
                if (parseInt(nextImageData.imageOrder) === 0) {
                    ipcl.add('at-zero');
                } else {
                    if (ipcl.contains('at-zero') > -1) ipcl.remove('at-zero');
                }
                if (nextImageData.imageLast == "true") {
                    ipcl.add('at-end');
                } else {
                    if (ipcl.contains('at-end') > -1) ipcl.remove('at-end');
                }
            }
        };

        // a little helper to create buttons
        root.createButton = function(args) {
            var button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.setAttribute('id', args.id);
            button.setAttribute('class', args.className);
            button.innerHTML = args.html;
            button.addEventListener('click', args.clickFunction);
            return button;
        };

        // the function that fires up when clicking thumbs
        root.clickThumbnail = function(e) {
            this.classList.add('active');

            // we create the lightbox structure here so that the developer does not have to do it (you know, easy stuff)
            var
                lightbox = document.createElement('div'),
                extraClass = (this.dataset.imageOrder == "0" ? ' at-zero' : (this.dataset.imageLast == 'true' ? ' at-end' : ''));
            lightbox.setAttribute('class', 'pics-lightbox' + extraClass);

            var closeButton = root.createButton({
                id: 'pics-lightbox-close',
                html: '<span class="screen-readers-only">Close Lightbox</span>',
                clickFunction: function() {
                    this.parentElement.remove();
                    var activePic = document.querySelector('.flickr-photo-thumb.active');
                    activePic.focus();
                    activePic.classList.remove('active');
                },
                className: 'pics-lightbox-close'
            });

            var imgDiv = document.createElement('div');
            imgDiv.classList.add('pics-lightbox-image');
            imgDiv.setAttribute('id', 'pics-lightbox-image');
            imgDiv.setAttribute('title', this.dataset.imageTitle);
            imgDiv.setAttribute('data-image-order', this.dataset.imageOrder);
            imgDiv.setAttribute('data-image-album', this.dataset.imageAlbum);
            imgDiv.style.backgroundImage = 'url(' + this.dataset.imageLarge + ')';

            var picTitle = document.createElement('span');
            picTitle.classList.add('pics-lightbox-title');
            picTitle.innerHTML = this.dataset.imageTitle;
            picTitle.setAttribute('aria-hidden', 'true');
            picTitle.setAttribute('id', 'pics-lightbox-title');

            var prevButton = root.createButton({
                id: 'pics-lightbox-prev',
                html: '<span class="screen-readers-only">Previous Picture</span>',
                clickFunction: function() {
                    root.move(imgDiv, picTitle, -1);
                },
                className: 'pics-lightbox-arrow pics-lightbox-prev'
            });
            var nextButton = root.createButton({
                id: 'pics-lightbox-next',
                html: '<span class="screen-readers-only">Next Picture</span>',
                clickFunction: function() {
                    root.move(imgDiv, picTitle, 1);
                },
                className: 'pics-lightbox-arrow pics-lightbox-next'
            });

            lightbox.appendChild(closeButton);
            lightbox.appendChild(imgDiv);
            lightbox.appendChild(prevButton);
            lightbox.appendChild(picTitle);
            lightbox.appendChild(nextButton);
            document.getElementsByTagName('body')[0].appendChild(lightbox);

            // we focus the first button in the lightbox
            document.querySelector('#pics-lightbox-close').focus();
        };

        // the album rendering function (also the flickr callback)
        root.renderAlbum = jsonFlickrFeed = function(data) {
            if (data) {
                var
                    id = data.link.split('/')[4],
                    wrap = document.querySelector('.flickr-photo-set[data-user-id="' + id + '"]'),
                    photos = data.items,
                    pLength = photos.length;
                // we erase the loading message
                wrap.innerHTML = '';
                for (var j = 0; j < pLength; j++) {
                    var
                        photo = photos[j],
                        photoDiv = document.createElement('button'),
                        photoTitle = (photo.title === "" ? 'Untitled' : photo.title);

                    //pic url format: https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
                    photoDiv.classList.add('flickr-photo-thumb');
                    photoDiv.innerHTML = '<span class="photo-title">' + photoTitle + '</span>';
                    photoDiv.style.backgroundImage = 'url(' + photo.media.m.replace('_m.', '_z.') + ')';
                    photoDiv.setAttribute('data-image-large', photo.media.m.replace('_m.', '_b.'));
                    photoDiv.setAttribute('data-image-order', j);
                    photoDiv.setAttribute('data-image-album', id);
                    photoDiv.setAttribute('data-image-title', photoTitle);
                    photoDiv.setAttribute('data-image-last', (j == (pLength - 1) ? 'true' : 'false'));
                    photoDiv.addEventListener("click", root.clickThumbnail);
                    wrap.appendChild(photoDiv);
                }
                // we add the class done so that if the routine gets called again, does not pick up this div more than once
                wrap.classList.add('done');
            }
        };

        // hello flickr, it's me
        root.getData = function(album, atts) {
            if (atts.userId) {
                var jsonP = document.createElement('script');
                jsonP.src = '' +
                    'https://api.flickr.com/services/feeds/photos_faves.gne?id=' + atts.userId +
                    '&format=json';
                document.getElementsByTagName('body')[0].appendChild(jsonP);
            } else {
                album.innerHTML = 'Please provide a Flickr user id in the data-user-id attribute of this HTML element';
            }
        };

        // we initialize the routine

        // and the local vars
        var
            albums = document.querySelectorAll('.flickr-photo-set:not(.done)'), //we run through those that havent been rendered'
            isTouchDevice = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
        for (var i = 0; i < albums.length; i++) {
            var
                album = albums[i],
                albumData = album.dataset;
            // if it's touchable we add the touchable class to the body so that we do not have :hover pseudos for touch devices
            if (isTouchDevice) document.getElementsByTagName('body')[0].classList.add("is-touchable");

            // we display a loading message
            album.innerHTML = 'Loading data from FLICKR...';
            // we call flickr on the phone.
            root.getData(album, albumData);
        }
    };
    // we create the first instance of pics then if you add a new album dynamically, just create a new instance
    // since the query searches for the elements that do not have the class done (added while initializing)
    // already parsed elements wont get re-parsed.
    var initialInstance = new Pics();
}());
