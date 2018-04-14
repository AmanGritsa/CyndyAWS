/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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

  logout: function(req, res) {
    req.session.userId = null;
    req.session.authenticated = false;
    // req.session.destroy(function(err) {
    //   setTimeout(function(){
    //          return res.redirect('/');
    //      }, 1000);
    // });
}
};

