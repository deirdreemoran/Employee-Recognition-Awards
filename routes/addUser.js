var express = require('express');
var router = express.Router();

const AwardDao = require('../dao');
const AppRepository = require('../app_repository');
const dao = new AwardDao('./mydb.db3');
const appRepo = new AppRepository(dao);

/* GET home page. */
router.post('/', function(req, res, next) {
	appRepo.createUser(req.body.name, req.body.email, "12345", req.body.region, "%$%#")
	  .then((data) => console.log('Succesfully created user'))
.catch((error) => console.log('Error creating user', error));

appRepo.getAllUsers().then((users) => {
	res.render('adminMain',  {users: users, title: "Accounts" });
  }).catch(error => console.log('Error getting all admin: ', error));
});

module.exports = router;
