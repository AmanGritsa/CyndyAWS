/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var bcrypt = require('bcrypt')
module.exports = {
    signup: function (req, res) {
        Users.findOne({ email: req.body.email }).exec(function (err, data) {
            if (err) {
                return res.json({ status: err.status, data: err, message: 'Signup Failed' });
            }
            else if (data) {
                return res.json({ status: 401, message: 'Email already exist!' });
            }
            else {
                Users.create(req.body).exec(function (err, user) {
                    if (err) {
                        return res.json({ status: err.status, data: err, message: 'Signup Failed' });
                    }
                    // If user created successfuly we return user as response
                    if (user) {
                        user.token = jwToken.issue({ id: user.id });
                        res.json({ status: 200, data: user, message: 'Signup Successfully' });
                    }
                });
            }

        });
    },

    getAllUsers: function (req, res) {
        Users.find().exec(function (err, users) {
            if (err) {
                return res.send({ status: err.status, data: err, message: 'User List Not Fetched' });
            }
            return res.send({ status: 200, data: users, message: 'User List Fetched Successfully' });
        })
    },

    getUserProfile: function (req, res) {
        var email = req.param('email');
        if (!req.body.email) {
            return res.send({ status: 401, message: 'email required' });
        }
        Users.findOne({ email: email }).exec(function (err, user) {
            if (err) {
                return res.send({ status: err.status, data: user, message: 'User List Not Fetched' });
            }
            else if (!user) {
                return res.send({ status: 401, message: 'User not found' });
            }
            return res.send({ status: 200, data: user, message: 'User Profile Fetched Successfully' });
        });
    },

    sendPasswordResetLink: function (req, res) {
        var email = req.param('email');
        var user = Users.findOne({ email: email }).exec(function (err, result) {

            try {
                if (err) {
                    return res.json(apiResponse.failure(err));
                } else {
                    if (result) {
                        var emailDetails = result;

                        emailDetails["email"] = req.body.email;
                        emailDetails["resetToken"] = jwToken.issue({ id: emailDetails.id });
                        emailService.sendResetPasswordToken(emailDetails);
                        result.resetPasswordToken = emailDetails.resetToken;
                        result.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                        result.save(function (err) {
                            if (err) {
                                return res.send({ status: 400, data: err, message: "Password reset link can't be sent" });
                            }
                            else {
                                return res.json({ status: 200, message: 'Reset Password link has sent on your registered mail. Please check your mail' });
                            }
                        });


                    }
                    else {
                        return res.json({ status: 400, message: 'Email does not exist. Please enter the registered email' });
                    }

                }
            } catch (ex) {
                return res.end(ex.message);
            }
        });
    },

    resetPassword: function (req, res) {
        var token = req.param('token');
        var currentTime = Date.now();
        Users.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $gt: currentTime
            }
        }).exec(function (err, user) {
            if (!err && user) {

                if (req.body.newPassword === req.body.confirmPassword) {
                    user.password = bcrypt.hashSync(req.body.newPassword, 10);
                    user.resetPasswordToken = null;
                    user.resetPasswordExpires = null;
                    user.save(function (err) {
                        if (err) {
                            return res.send(err);
                        }
                        else {
                            emailService.passwordResetConfirmation(user);
                            return res.send('Password successfully changed');
                        }
                    });
                }
                else {
                    return res.send("New Password and Confirm Password doesn't match");
                }
            }
            else {
                return res.send('Invalid token or link expired');
            }

        })
    }

};