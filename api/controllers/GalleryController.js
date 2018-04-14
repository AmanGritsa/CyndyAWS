/**
 * GalleryController
 *
 * @description :: Server-side logic for managing galleries
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');

var AWS = require('aws-sdk');
module.exports = {

    //  uploadFile: function (req, res) {
    //     upload: function(req, res) {
    //         req.file('image').upload({
    //           adapter: require('skipper-s3-resize'),
    //           key: <YOUR_S3_KEY>,
    //           secret: <YOUR_S3_SECRET>,
    //           bucket: <YOUR_S3_BUCKET>,
    //           resize: {
    //             width: <WIDTH>,
    //             height: <HEIGHT>,
    //             options: <GRAPHICMAGICK_OPTIONS>
    //           }
    //         }, function(err, uploadedFiles) {
    //           if(err) return res.serverError(err);
    //             res.ok();
    //           });
    //         }

    //  },

    // uploadFile: function (req, res) {
    //     req.file('image').upload({
    //         adapter: require('skipper-s3'),
    //         key: 'AKIAIT3XENLYSNXUCKOA',
    //         secret: '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',
    //         bucket: 'cyndyporter'
    //     }, function (err, filesUploaded) {
    //         if (err) return res.serverError(err);
    //         return res.ok({
    //             files: filesUploaded,
    //             // textParams: req.allParams()
    //         });
    //     });
    // },



    // uploadImage: function (req, res) {
    //     var email = req.body.email;
    //     var dir = 'assets/images/' + email;
    //     if (!fs.existsSync(dir)) {
    //         fs.mkdirSync(dir);
    //     }
    //     return res.send('success');


        // var data = fs.readFileSync('input.txt');
        // return res.send(data);


        //     var email = req.param('email');
        //     req.file('image').upload(function (error, uploadedFiles) {
        //         // do something after file was uploaded...
        //         if (error) {
        //             return res.send(error);
        //         }
        //         // return res.send(uploadedFiles);
        //         else if (!uploadedFiles) {
        //             return res.send({ status: 401, message: 'image not uploaded' })
        //         }
        //         else {

        //             Gallery.create({ email: email, image: uploadedFiles[0].filename }).exec(function (err, data) {
        //                 if (err) {
        //                     return res.send(err);
        //                 }
        //                 return res.send(data);
        //             })
        //         }
        //     });
    // },

    uploadUserImage: function (req, res) {
        var file = req.file('image');
        var email = req.body.email;
        var timestamp = new Date().getTime();
        var randomNumber = Math.floor(Math.random() * 9999);
        var fileName = timestamp + '' + randomNumber + '.jpg';
        // var path = '../../assets/images/' + email;
        var path = '../../assets/images/';

        file.upload({ dirname: path, saveAs: fileName, maxBytes: 1 * 1024 * 1024 }, function (err, data) {
            if (err) {
                return res.send(err);
            }
            // delete data[0].fd;
            // return res.send(data);
            data[0].imageUrl = 'http://ec2-54-183-184-110.us-west-1.compute.amazonaws.com/images/' + fileName;
            // data[0].imageUrl = 'images/' + '/' + fileName;
            Gallery.create({ email: email, imageUrl: data[0].imageUrl }).exec(function (err, result) {
                if (err) {
                    return res.send({ status: err.status, data: err, message: 'image upload failed' });
                }

                else {
                    var imageJson = {
                        email: result.email,
                        id: result.id,
                        imageUrl: result.imageUrl
                    }
                    var colorJson = {
                        hair: null,
                        skin: null,
                        eyes: null,
                        lips: null,
                        metals: null,
                        dress: null
                    }
                    UpdateImage.create({ image: imageJson, colors: colorJson }).exec(function (err, image) {
                        if (err) {
                            return res.send({ status: err.status, data: err, message: 'image upload failed' });
                        }
                        return res.send({ status: 200, data: result, message: 'image successfully uploaded' });
                    })
                }

            });
        })
    },

    getImageByAdmin: function (req, res) {

        if (!req.body.imageId) {
            return res.send('please provide imageId');
        }
        UpdateImage.find().exec(function (err, result) {
            if (err) {
                return res.send(err);
            }
            else if (!result) {
                return res.send('image not available');
            }
            else {
                var imageData = result.filter(function (json) {
                    if (json.image.id == req.body.imageId) {
                        return json;
                    }
                });
                if (imageData.length == 0) {
                    return res.send('image not available');
                }
                return res.send(imageData);
            }

        })
    }
};