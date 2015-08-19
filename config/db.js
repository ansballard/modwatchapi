module.exports = {

	getDev: function(username, password) {
		"use strict";
		return "mongodb://" + username + ":" + password + "@ds055210.mongolab.com:55210/skyrimdev2";
	},
	getLive: function(username, password) {
		"use strict";
		return "mongodb://" + username + ":" + password + "@ds027708.mongolab.com:27708/skyrim";
	},
	getLocal: function(username, password) {
		"use strict";
		return "localhost:27017/skyrim";
	}

};
