var pics = function(){
    this.clickThumbnail = function(e){
        this.classList.add('active');
        var lightbox = document.createElement('div');
        lightbox.classList.add('pics-lightbox');

        var closeButton = document.createElement('button');
        closeButton.setAttribute('id','pics-lightbox-close');
        closeButton.setAttribute('type','button');
        closeButton.innerHTML = '<span class="screen-readers-only">Close Lightbox</span>';
        closeButton.addEventListener('click',function(){
            this.parentElement.remove();
            var activePic = document.querySelector('.flickr-photo-thumb.active');
            activePic.focus();
            activePic.classList.remove('active');
        });
        closeButton.classList.add('pics-lightbox-close');


        var imgDiv = document.createElement('div');
        imgDiv.classList.add('pics-lightbox-image');
        imgDiv.style.backgroundImage = 'url('+this.dataset.bigImage+')';


        lightbox.appendChild(closeButton).appendChild(imgDiv);
        document.getElementsByTagName('body')[0].appendChild(lightbox);
        document.querySelector('#pics-lightbox-close').focus();
    };
    this.renderAlbum=jsonFlickrApi=function(data){
        console.log(data);
        if(data.stat=='ok'){
            var
                ps = data.photoset,
                wrap = document.querySelector('.flickr-photo-set[data-photo-set="'+ps.id+'"]'),
                photos = ps.photo
            ;
            for (var j=0;j<photos.length;j++){
                var
                    photo = photos[j],
                    photoDiv = document.createElement('button')
                ;
                /*
                pic url format
                https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
                */
                photoDiv.classList.add('flickr-photo-thumb');
                photoDiv.innerHTML = '<span class="photo-title">'+photo.title+'</span>';
                photoDiv.style.backgroundImage = 'url(https://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_z.jpg)';
                photoDiv.setAttribute('data-big-image','https://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_b.jpg');
                photoDiv.addEventListener("click", this.clickThumbnail);
                wrap.appendChild(photoDiv);
            }
            console.log(wrap);
        } else {
            alert(data.message);
        }
    };
    this.getData=function(atts){
        console.log(atts);
        if(atts.photoSet && atts.apiKey && atts.apiSignature){
            var jsonP = document.createElement('script');
            jsonP.src = ''+
                'https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&'+
                'api_key='+atts.apiKey+
                '&photoset_id='+atts.photoSet+
                '&format=json&api_sig='+atts.apiSignature
            ;
            document.getElementsByTagName('head')[0].appendChild(jsonP);
        } else {
            alert('you are missing data');
        }
    };
    var
        albums = document.querySelectorAll('.flickr-photo-set'),
        isTouchDevice = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))
    ;
    for (var i = 0; i<albums.length; i++){
        var
            album = albums[i],
            albumData = album.dataset
        ;
        if(isTouchDevice) document.getElementsByTagName('body')[0].classList.add("is-touchable");
        this.getData(albumData);
    }
}();
