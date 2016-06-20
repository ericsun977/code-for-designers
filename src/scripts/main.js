$(function () {
    'use strict';

    var _URL = window.URL || window.webkitURL;
    var targetImage = {};
    var sizeDimensions = $('.size-dimensions');

    var wizard = $("#wizard").steps({
        headerTag: 'h3',
        bodyTag: 'section',
        transitionEffect: "slideLeft",
        autoFocus: true
    });

    $("#fileuploader").uploadFile({
        url:"http://localhost:8080/uploads",
        onSelect:function(files) {
            console.log(files[0])
            var file, img;
            if ((file = files[0])) {
                img = new Image();
                img.onload = function () {
                    targetImage.width = this.width;
                    targetImage.height = this.height;
                    targetImage.src = this.src;
                    targetImage.name = this.name;
                    targetImage.size = this.size;
                    targetImage.type = this.type;
                    procressImage();
                };
                img.src = _URL.createObjectURL(file);
            }
            return false;
            // return true; //to allow file submission.
        }
    });


    function procressImage() {
        $('.image-preview').remove();
        $('<img class="image-preview" />').attr('src', targetImage.src).appendTo('.ajax-file-upload-container');

        var printedSize = pixelsToInches(targetImage.width, targetImage.height);

        $('.size-dimensions').find('.width').text(printedSize.width);
        $('.size-dimensions').find('.height').text(printedSize.height);
    }

    function pixelsToInches(width, height, dpi) {
        dpi = dpi || 300;
        return {
          width: width/dpi,
          height: height/dpi
        };
    }



});
