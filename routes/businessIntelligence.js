var express = require('express');
var router = express.Router();
var _ = require('lodash');

/**************************************
* Route for BI main page
**************************************/
router.get('/', function(req, res, next) {
  appRepo.getAllAdmins().then((admins) => {
  			//Sort admins and group by time of account creation
  			var sortedAdmins = _.orderBy(admins, ['creation_time'], ['asc']);
  			var myJSONcreationTimes = JSON.stringify(getCreationTimes(sortedAdmins));
  			var myJSONlogins = JSON.stringify(getLoginAttempts(admins));
              //render page
  			res.render('businessIntelligenceAdmin', {
  				admins: admins,
  		        myJSONcreationTimes: myJSONcreationTimes, myJSONlogins: myJSONlogins,
  		        chartTitleAU: "Admin Account Creations By Date",
  		        chartTitleLogin: "Admin Login Attempts",
  		        thisReport: "allAdmins"
  		    });
	    }).catch(error => console.log('Error getting all admins: ', error));
});

/*************************************************************
* Route for Users, Admins, and Awards Business Intelligence
* requests. Returns and renders pages with data for
* associated tables and charts.
**************************************************************/
router.post('/', function(req, res, next) {
	if(req.body.custom == "custom"){
		res.redirect('customBI');
	}
	// Request:  All Admins
	if (req.body.adminRadio == "allAdmins" && !(req.body.userRadio) && !(req.body.awardRadio)) {
        appRepo.getAllAdmins().then((admins) => {
            //Sort admins and group by time of account creation
            var sortedAdmins = _.orderBy(admins, ['creation_time'], ['asc']);
            var myJSONcreationTimes = JSON.stringify(getCreationTimes(sortedAdmins));
            var myJSONlogins = JSON.stringify(getLoginAttempts(admins));
            //render page
            res.render('businessIntelligenceAdmin', {
                admins: admins,
                myJSONcreationTimes: myJSONcreationTimes, myJSONlogins: myJSONlogins,
                chartTitleAU: "Admin Account Creations By Date",
                chartTitleLogin: "Admin Login Attempts",
                thisReport: "allAdmins"
            });
        }).catch(error => console.log('Error getting all admins: ', error));
    });
	}

  	// Request for: all users
	else if (req.body.userRadio == "allUsers" && !(req.body.adminRadio) && !(req.body.awardRadio)) {
		appRepo.getAllUsers().then((users) => {
			var myJSONlogins = JSON.stringify(getLoginAttempts(users));
			//Sort and group users by time of account creation
			var sortedUsers = _.orderBy(users, ['creation_time'], ['asc']);
			var sortedUsersByRegion = _.orderBy(users, ['region'], ['asc']);
			var myJSONcreationTimes= JSON.stringify(getCreationTimes(sortedUsers));
			var myJSONregions = JSON.stringify(getRegions(sortedUsersByRegion));
			console.log(myJSONregions);
			res.render('businessIntelligence', {
		        users: users,
		        myJSONcreationTimes: myJSONcreationTimes,
		        queryTitle: "Users",
		        myJSONawardTypes: 0,
		        myJSONorgchart: 0, myJSONlogins: myJSONlogins, myJSONregions: myJSONregions,
		        title: "Business Intelligence",
		        chartTitleAU: "User Account Creations By Date",
		        chartTitleLogin: "User Login Attempts",
		        chartTitleLastLogin: "User Last Login",
		        chartTitleRegion: "Users by Region",
		        thisReport: "allUsers"
			});
	    }).catch(error => console.log('Error getting all users: ', error));
	}

	//Request for:  all awards
	else if (req.body.awardRadio == "allAwards" && !(req.body.userRadio) && !(req.body.adminRadio)) {
		appRepo.getAllAwards().then((awards) => {
			var sortedAwards = _.orderBy(awards, ['creation_time'], ['asc']);
	        var myJSONcreationTimes = JSON.stringify(getCreationTimes(sortedAwards));
			var myJSONawardTypes = JSON.stringify(awardPieChart(awards));
    		res.render('businessIntelligence', {
    		    awards: awards,
    		    queryTitle: "Awards",
				title: "Business Intelligence Reports",
    		    chartTitleA: "Award Creations by Date",
    		    chartTitle3: "Awards by Type",
    		    myJSONcreationTimes: myJSONcreationTimes, myJSONawardTypes: myJSONawardTypes, myJSONorgchart: 0, myJSONlogins: 0, myJSONregions: 0,
    		    thisReport: "allAwards"
    		});
    	}).catch(error => console.log('Error getting all awards: ', error));
  	}
});

/**************************************
* Prepares login_attempts data
* for chartjs formatting requirements,
* Returns array of login attempts and ids
**************************************/
function getLoginAttempts(group)
{
	var myarray = new Array();
	for (var i = 0; i < group.length; i++) {
		myarray.push([]);
		myarray[i][0] = group[i].id;
		myarray[i][1] = group[i].login_attempts;
	}
	return myarray;
}

/***************************************
* Prepares user region data for
* googlecharts formatting requirements
* Returns array of regions and count
***************************************/
function getRegions(group){
	var myarray2 = new Array();
	myarray2.push([]);
	myarray2[0][0] = group[0].region;
	myarray2[0][1] = 1;
	for(var i = 0; i < group.length; i++){
	   	if(group.length > 1){
			if(i == 0){
				if(myarray2[0][0] == group[1].region){
					var temp = myarray2[0][1];
					myarray2[0][1] = 2;
				}
				else{
					myarray2.push([]);
					myarray2[1][0] = group[1].region;
					myarray2[1][1] = 1;
				}
			}else{
				if(myarray2[myarray2.length - 1][0] == group[i].region){
					var temp = myarray2[myarray2.length - 1][1];
					temp++;
					myarray2[myarray2.length - 1][1] = temp;
				}
				else{
					myarray2.push([]);
					myarray2[myarray2.length - 1][0] = group[i].region;
					myarray2[myarray2.length - 1][1] = 1;
				}
			}
		}
	}
	return myarray2;
}

/***************************************
* Prepares creation_time data for
* chartjs formatting requirements.
* Returns array of creation times with
* UTC short date
***************************************/
function getCreationTimes(sortedUsers)
{
	var myarray = new Array();
 	for (var i = 0; i < sortedUsers.length; i++) {
	    var date1 = new Date(sortedUsers[i].creation_time);
        var year = date1.getFullYear();
        var month = ('0' + (date1.getMonth() + 1)).slice(-2);
		var date = ('0' + date1.getDate()).slice(-2);
		var shortDate = month + '/' + date + '/' + year;
		if(i != 0){
	    	if(myarray[myarray.length - 1][0] == shortDate){
				var temp = myarray[myarray.length - 1][1];
				temp++;
				myarray[myarray.length - 1][1] = temp;
			}
			else{
				myarray.push([]);
				myarray[myarray.length - 1][0] = shortDate;
   				myarray[myarray.length - 1][1] = 1;
			}
		}else{
			myarray.push([]);
			myarray[0][0] = shortDate;
   			myarray[0][1] = 1;
		}
	}
    return myarray;
}
/***************************************
* Prepares and groups award type data
* for chartjs formatting.  Returns
* Returns array award types and counts.
***************************************/
function awardPieChart(awards)
{
	var myarray2 = new Array();
    myarray2.push([]);
	myarray2[0][0] = "Week";
	myarray2[0][1] = 0;
	myarray2.push([]);
	myarray2[1][0] = "Month";
	myarray2[1][1] = 0;
	myarray2.push([]);
    myarray2[2][0] = "Year";
	myarray2[2][1] = 0;
	for(var i = 0; i < awards.length; i++){
		switch(awards[i].award_type){
	    	case "Week":
			 	var temp = myarray2[0][1];
			  	temp++;
				myarray2[0][1] = temp;
			  	break;
			case "Month":
				var temp = myarray2[1][1];
			  	temp++;
		  		myarray2[1][1] = temp;
		  		break;
			case "Year":
				var temp = myarray2[2][1];
			  	temp++;
		  		myarray2[2][1] = temp;
		  		break;
	    }
	}
	return myarray2;
}

module.exports = router;