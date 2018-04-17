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


    uploadUserImage: function (req, res) {
        var file = req.file('image');
        var email = req.param('email');
        var timestamp = new Date().getTime();
        var randomNumber = Math.floor(Math.random() * 9999);
        var fileName = timestamp + '' + randomNumber + '.jpg';
        var path = '../../assets/images/';

        file.upload({ dirname: path, saveAs: fileName, maxBytes: 1 * 1024 * 1024 }, function (err, data) {
            if (err) {
                return res.send({ status: err.status, data: err, message: 'image upload failed' });
            }
            data[0].imageUrl = req.protocol + '://' + req.get('host') + '/images/' + fileName;
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
                        hair: '#ffffff',
                        skin: '#ffffff',
                        eyes: '#ffffff',
                        lips: '#ffffff',
                        metals: '#ffffff',
                        dress: '#ffffff'
                    }
                    UpdateImage.create({ image: imageJson, colors: colorJson }).exec(function (err, image) {
                        if (err) {
                            return res.send({ status: err.status, data: err, message: 'image upload failed' });
                        }
                        return res.send({ status: 200, data: result, message: 'image successfully uploaded' });
                    });
                }

            });
        })
    },

    // getImageByAdmin: function (req, res) {

    //     if (!req.body.imageId) {
    //         return res.send('please provide imageId');
    //     }
    //     UpdateImage.find().exec(function (err, result) {
    //         if (err) {
    //             return res.send(err);
    //         }
    //         else if (!result) {
    //             return res.send('image not available');
    //         }
    //         else {
    //             var imageData = result.filter(function (json) {
    //                 if (json.image.id == req.body.imageId) {
    //                     return json;
    //                 }
    //             });
    //             if (imageData.length == 0) {
    //                 return res.send('image not available');
    //             }
    //             return res.send(imageData);
    //         }

    //     })
    // }

    updateImageDetails: function (req, res) {
        if (!req.body.styleId || !req.body.colors) {
            return res.send({ status: 401, message: 'Please provide an StyleId and choose some colors' });
        }
        UpdateImage.update({ id: req.body.styleId }, { colors: req.body.colors, isUpdated: 1 }).exec(function (err, result) {
            if (err) {
                return res.send({ status: 401, data: err, message: 'image updation failed' });
            }
            return res.send({ status: 200, data: result, message: 'Image Update Success' });

        });
    },

    sendDetailsInPDF: function (req, res) {
        //    var report = require("jsreport");
        //    report.render({
        //         template: {
        //             content: "Hello world from {{#sayLoudly this.name}}",
        //             helpers: "function sayLoudly(str) { return str.toUpperCase(); }",
        //             engine: "handlebars"
        //         },
        //         data: { name: "jsreport" }
        //     }).then(function(out) {
        //         //pipes pdf with Hello world from JSREPORT
        //         out.stream.pipe(res);
        //     });

        var PDFDocument = require('pdfkit');
        var doc = new PDFDocument;
        // var doc = new PDFDocument();
        // var filename = 'aman';
        // // Stripping special characters
        // filename = encodeURIComponent(filename) + '.pdf'
        // // Setting response to 'attachment' (download).
        // // If you use 'inline' here it will automatically open the PDF
        // res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
        // res.setHeader('Content-type', 'application/pdf')
        // const content = 'this is a test';
        // doc.y = 300
        // doc.text(content, 50, 50)
        // doc.pipe(res)
        // doc.end()

    
        var test = 'aman';
        var myData = '<html><h1>Welcome</h1> <br></html>' + test;
        doc.font('Times-Roman')
            .fontSize(15)
            .text('User Name', 50, 50)
            .text(test, 200, 50)
            .text('User Image', 50, 100)
            .image('assets/images/152397260202686.jpg', 200, 100, { height: 150, width: 200 })
            .text('Skin Color', 50, 250)

        doc.circle(200, 250, 30)
            .fill("#6600FF");

        doc.end();
        var user = {
            email: 'amanniet@gmail.com'
        }
        emailService.sendPDF(user, doc);
        return res.send({ status: 200, message: 'pdf report successfully sent' });
    }
};