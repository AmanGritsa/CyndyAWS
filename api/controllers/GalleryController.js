/**
 * GalleryController
 *
 * @description :: Server-side logic for managing galleries
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');

var AWS = require('aws-sdk');

var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');

module.exports = {

    uploadUserImage: function (req, res) {
        var file = req.file('image');
        var email = req.param('email');
        if (!email) {
            return res.send({ status: 401, message: 'Email and Image are mandatory' });
        }
        else {
            var timestamp = new Date().getTime();
            var randomNumber = Math.floor(Math.random() * 9999);
            var fileName = timestamp + '' + randomNumber + '.jpg';
            var path = '../../assets/images/';

            file.upload({ dirname: path, saveAs: fileName, maxBytes: 1 * 1024 * 1024 }, function (err, data) {
                if (err) {
                    return res.send({ status: err.status, data: err, message: 'Image upload failed' });
                }
                else if (data.length == 0) {
                    return res.send({ status: 401, message: 'Please select an image first' });
                }
                data[0].imageUrl = req.protocol + '://' + req.get('host') + '/images/' + fileName;
                Gallery.create({ email: email, imageUrl: data[0].imageUrl }).exec(function (err, result) {
                    if (err) {
                        return res.send({ status: err.status, data: err, message: 'Image upload failed' });
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
                                return res.send({ status: err.status, data: err, message: 'Image upload failed' });
                            }
                            return res.send({ status: 200, data: result, message: 'Image successfully uploaded' });
                        });
                    }

                });
            })
        }

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

        if (!req.body.styleId || !req.body.colors || !req.body.email) {
            return res.send({ status: 401, message: 'Please provide an StyleId and choose some colors' });
        }
        UpdateImage.update({ id: req.body.styleId }, { colors: req.body.colors, isUpdated: 1 }).exec(function (err, result) {
            if (err) {
                return res.send({ status: 401, data: err, message: 'image updation failed' });
            }
            else {
                var currentTime = new Date().getTime();
                var registrationToken = localStorage.getItem('deviceToken');
                var payload = [{
                    'notification': {
                        'title': 'Congratulations',
                        'body': 'Your image has been styled by Cyndy Porter'
                    },
                    'data': {
                        'styleId': result[0].id,
                        'imageUrl': result[0].image.imageUrl
                    }
                }];

                Notification.findOne({ email: req.body.email }).exec(function (err, data) {
                    if (err) {
                        return res.send(err);
                    }
                    else if (!data) {
                        Notification.create({ email: req.body.email, deviceToken: registrationToken, notifications: payload }).exec(function (err, result) {
                            if (err) {
                                return res.send(err);
                            }
                            notificationService.sendNotification(registrationToken, payload[0]);
                            return res.send({ status: 200, data: result, message: 'Image Update Success' });
                        })
                    }
                    else {
                        var a = data.notifications;
                        a.push(payload[0]);
                        data.notifications = a;
                        data.save(function (err) {
                            if (err) {
                                return res.send(err);
                            }
                            else {
                                notificationService.sendNotification(registrationToken, payload[0]);
                                return res.send({ status: 200, data: result, message: 'Image Update Success' });
                            }
                        })
                    }
                })

            }
        });
    },

};