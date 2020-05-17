'use strict';

const BASE_URL = '{base_url}';
const LEVEL = '{level}';
const LESSON = '{lesson}';
const ANCHOR = '{anchor}';

$(document).ready(function () {
    $($('h2')[0]).addClass('pt-0');
    window.MathJax.startup.promise.then(function () {
        // TITLE NUMBERING

        let h2Index = 1;
        let h3Index = 1;
        $('h2, h3').each(function () {
            let title = $(this);
            if (title.prop('tagName') === 'H3') {
                title.html((h3Index++) + '. ' + title.html());
            } else {
                h3Index = 1;
                title.html(romanize(h2Index++) + ' – ' + title.html());
            }
        });

        // ANCHORS AND LINKS

        anchors.add('h2, h3');

        goToHash(event, ANCHOR);

        $('a').click(function(event) {
            let level = $(this).attr('data-api-v2-level');
            let lesson = $(this).attr('data-api-v2-lesson');
            let hash = $(this).attr('data-api-v2-hash');
            if (typeof level !== 'undefined' && typeof lesson !== 'undefined') {
                let object = {
                    level: level,
                    lesson: lesson,
                }

                if (typeof hash !== 'undefined') {
                    object['hash'] = hash;
                }

                Navigation.postMessage(JSON.stringify(object));
                event.preventDefault();
                return;
            }

            if (typeof hash !== 'undefined') {
                goToHash(event, decodeURI(this.hash));
            }
        });
    });

    // PROOFS AND BUBBLES

    $('.proof').each(function () {
        let proof = $(this);
        let proofLabel = $('<span class="proof-label"><span class="toggle-icon">&#9654;</span> Démonstration</span>');
        let proofContent = $('<div class="bubble proof-content d-none clearfix tex2jax_ignore"></div>');
        proofContent.html(proof.html());
        proofContent.append($('<span class="float-right">&#8718;</span>'));

        proofLabel.click(function () {
            proofContent.toggleClass('d-none');
            proofLabel.toggleClass('mb-0');

            if(proofContent.hasClass('d-none')) {
                proofLabel.find('.toggle-icon').html('&#9654;');
            }
            else {
                proofLabel.find('.toggle-icon').html('&#9660;');
            }

            if (proofContent.hasClass('tex2jax_ignore')) {
                proofContent.removeClass('tex2jax_ignore');
                MathJax.typeset([proofContent.get(0)]);
            }
        });

        proof.empty();
        proof.append(proofLabel);
        proof.append(proofContent);
    });

    $('.formula, .tip').addClass('bubble');

    // REPRESENTATIONS

    let plots = $('.plot');
    if (typeof GGBApplet === 'undefined') {
        plots.each(function () {
            let plot = $(this);
            let imageUrl = BASE_URL + '/assets/img/lessons/' + LEVEL + '/' + LESSON + "/" + plot.attr('id') + '.png';
            plot.html('<a href="' + imageUrl + '"><img src="' + imageUrl + '" title="' + plot.attr('id') + '" alt="' + plot.attr('id') + '"></a>');
        });
    }
    else {
        plots.each(function () {
            let plot = $(this);
            createGeoGebraInstance(plot.attr('data-api-v2-geogebra-id')).inject(plot.attr('id'));
        });
    }

    // SYNTAX HIGHLIGHTING

    $('.highlight code').each(function() {
       let code = $(this);
       code.html(code.html().replace(new RegExp('\t', 'g'), '    '))
    });
});

/**
 * Found here : http://stackoverflow.com/a/9083076/3608831
 */

function romanize(num) {
    if (!+num) {
        return false;
    }
    let digits = String(+num).split(""),
        key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
        roman = "",
        i = 3;
    while (i--) {
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    }
    return Array(+digits.join("") + 1).join("M") + roman;
}

/**
 * Found here : https://stackoverflow.com/a/18365991/3608831
 */

function goToHash(event, hash) {
    if (hash.length === 0) {
        return;
    }
    let jqueryHash = $(hash);
    if (!jqueryHash.length) {
        return;
    }
    if (typeof event !== 'undefined') {
        event.preventDefault();
    }
    $('html, body').animate({
        scrollTop: jqueryHash.offset().top
    }, 500);
}

function createGeoGebraInstance(materialId) {
    let windowWidth = window.screen.width;
    let scale = 1;
    if (windowWidth < 992) {
        scale = 2;
    }
    if (windowWidth < 768) {
        scale = 4;
    }

	return new GGBApplet({
        'id': materialId,
        'material_id': materialId,
        'showResetIcon': true,
        'enableLabelDrags': false,
        'scale': scale,
        'allowUpscale': true,
        'scaleContainerClass': 'plot',
        //'showZoomButtons': true,
        'preventFocus': true,
        'enableShiftDragZoom': true,
        'borderColor': 'rgba(0, 0, 0, 0.5)',
	}, true);
}