window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.loadMode = 1;
var loaded1 = false;
var loaded2 = false;

document.querySelector('html').setAttribute('class', 'js');

setTimeout(function() {
    document.querySelectorAll('[data-mail]').forEach(function(n) { 
        n.setAttribute('href', 'mailto:' + atob('bWFpbEBqdWxpYW5rZXJuLmNvbQ==')); 
    });
    
    document.querySelectorAll('[data-mail-text]').forEach(function(n) { 
        n.innerHTML = atob('bWFpbEBqdWxpYW5rZXJuLmNvbQ=='); 
    });
}, Math.floor(Math.random() * 10000))

function libloaded(name) {
    if (name === 'gmap1') { loaded1 = true; }
    else if (name === 'gmap2') { loaded2 = true; }

    if(loaded1 && loaded2) {
        var map = new GMaps({
            el: '.contact--map',
            lat: 52.5281296,
            lng: 13.4533448,
            zoom: 12
        });

        map.map.setOptions(
        { 
            styles: [
                {
                    stylers:
                    [
                        {hue:'#b73333'},
                        {visibility:'simplified'},
                        {gamma:0.5},
                        {weight:0.5}
                    ]
                },
                {
                    elementType:'labels.text.fill',
                    stylers:
                    [
                        {color:'#ffffff'},
                        {visibility:'simplified'}
                    ]
                },
                {
                    featureType:'water',
                    stylers:
                    [
                        {color:'#b73333'}
                    ]
                },
                {
                    featureType:'poi',
                    elementType:'labels',
                    stylers:
                    [
                        {visibility:'off'}
                    ]
                },
                {
                    featureType:'road',
                    elementType:'labels',
                    stylers:
                    [
                        {visibility:'off'}
                    ]
                }
            ]
        });

        map.map.panControl = false;
        map.map.mapTypeControl = false;
        map.map.overviewMapControl = false;
        map.map.streetViewControl = false;
        map.map.zoomControl = true;

        map.map.set('scrollwheel', false);

        map.drawOverlay({
            lat: 52.5281296,
            lng: 13.4533448,
            verticalAlign: 'top',
            horizontalAlign: 'center',
            content: '<div class="contact--map--marker"><img src="assets/svg/logo.svg" class="icon icon-logo" alt="juliankern.{{domain}} logo"></div>'
        });
    }
}

function submitContact(element) {
    event.preventDefault();

    var xhr = new XMLHttpRequest();
    xhr.open(element.method, element.action, true);
    xhr.send(new FormData(element));
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4 && xhr.status == 200) {
            // callback(xhr.responseText);
            var response = JSON.parse(xhr.responseText);
            
            document.querySelector('.mainscreen--form form').style.display = 'none';
            document.querySelector('.mainscreen--form .mainscreen--dummy').style.height = 0;
            document.querySelector('.mainscreen--form .tab').style.height = 'auto';
            
            if (response.error) {
                document.querySelector('.mainscreen--form .alert-error').style.display = 'block';
            } else {
                document.querySelector('.mainscreen--form .alert-success').style.display = 'block';
            }
        }
    }
    
    return false;
}

function recaptchaCallback(token) {
    document.querySelector('.g-recaptcha + button').removeAttribute('disabled');
}

function recaptchaExpiredCallback() {
    document.querySelector('.g-recaptcha + button').setAttribute('disabled', 'disabled');
}