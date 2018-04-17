/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var admin = require('firebase-admin');
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
          user.token = jwToken.issue({ id: user.id });
          // req.session.userId = user.id;
          // req.session.authenticated = true;
          res.json({
            status: 200,
            data: user,
            message: 'Logged In Successfully'
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

  sendNotification: function (req, res) {
    var serviceAccount = require('/home/mobulous85/CyndyAWS/cyndyporter-2572d-firebase-adminsdk-2gsjc-46d433d14e.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://cyndyporter-2572d.firebaseio.com"
    });

    var registrationToken = "cDarF-16kwQ:APA91bHWXUBnBHTjTMU-7-cksPzvt61l1idEQ8nUV3fv0LOXwdJ9CFWHH1opKUVdDMT05S7FnKSTzeyzenplTnIs3UeD2XU6GbxKGrgetFJU0q4_t8toG10_WKebXzQ6REAfIC861z97";

    var payload = {
      data: {
        key1: 'Hello Cyndy'
      }
    };
    var options = {
      priority: "high",
      timeToLive: 60 * 60 * 24
    };

    admin.messaging().sendToDevice(registrationToken, payload, options)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      })

  },


};

