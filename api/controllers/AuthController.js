/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');
module.exports = {
  login: function (req, res) {
    var email = req.param('email');
    var password = req.param('password');
    var userType = req.param('userType');
    var deviceType = req.param('deviceType');
    var deviceToken = req.param('deviceToken');

    if (!email || !password || !userType || !deviceType || !deviceToken) {
      return res.json({ status: 401, message: 'email, password, userType, deviceType and deviceToken required' });
    }

    Users.findOne({ email: email }, function (err, user) {
      if (!user) {
        return res.json({ status: 401, message: 'email or password incorrect' });
      }

      Users.comparePassword(password, user, function (err, valid) {
        if (err) {
          return res.json({ status: 403, message: 'forbidden' });
        }

        if (!valid) {
          return res.json({ status: 401, message: 'email or password incorrect' });
        } else {

          user.deviceToken = deviceToken;
          user.deviceType = deviceType;
          user.save(function (err) {
            if (err) {
              return res.send(err);
            }
            else {

              
              localStorage.setItem('userToken', user.deviceToken)//if you are sending token. 
              console.log(localStorage.getItem('userToken'));

              user.token = jwToken.issue({ id: user.id });
              res.json({
                status: 200,
                data: user,
                message: 'Logged In Successfully'
              });
            }
          });
        }
      });
    })
  },

  logout: function (req, res) {
    req.session.userId = null;
    req.session.authenticated = false;
    // req.session.destroy(function(err) {
    //   setTimeout(function(){
    //          return res.redirect('/');
    //      }, 1000);
    // });
  },

  sendNotificationToUser: function (req, res) {
    // var serviceAccount = require('/home/mobulous85/CyndyAWS/cyndyporter-2572d-firebase-adminsdk-2gsjc-9c72746f74.json');

    // if (!admin.apps.length) {
    //   admin.initializeApp({
    //     credential: admin.credential.cert(serviceAccount),
    //     databaseURL: "https://cyndyporter-2572d.firebaseio.com"
    //   });
    // }

    // var registrationToken = "evIpYSNATXo:APA91bFLGI1vvTB8321MuKkNsrbjwesV_YwBEYtDZvozSg1x8n4UZN8TDpaZw2dUSQhGxMyPHrr54mA89-IOM3fZdssG8Ypf9wITky9ypwkC_O9sScv5qE_cHPQUgqF-HmtRCMJTJqEH";
  
    // var data = localStorage.getItem('userToken');
var data1 = '../../cyndyporter-2572d-firebase-adminsdk-2gsjc-9c72746f74.json'; 
console.log(data1);
    var registrationToken = "eCztwtttQaw:APA91bGlq5k3Cs1lC2ktSJzAoiugeIKCqP_MMOr_PtloG2rm30MX3NUoe0LbQ3hSU8oHYMqQ1VLtXjXF6NUK2029wwhT_1p8B0BL9t4tbpLWQIL3tbjBXq59i9hxFQydAN2jE4aPd3FF";
    var payload = {
      'notification': {
        'title': 'Hello Cyndy',
        'body': 'welcome'
      },
      'data': {
        'styleId': '46567547'
      }
    };
    notificationService.sendNotification(registrationToken, payload);
    return res.send('sent');

    // var options = {
    //   priority: "high",
    //   timeToLive: 60 * 60 * 24
    // };

    // admin.messaging().sendToDevice(registrationToken, payload, options)
    //   .then(function (response) {
    //     console.log(response);
    //     return res.send({ status: 200, message: 'Notification sent successfully' });
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //     return res.send({ status: 200, data: error, message: 'Notification failed' });
    //   })

  },

};