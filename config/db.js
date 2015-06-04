module.exports = {

	getDev: function(username, password) {
		return 'mongodb://'+ username +':'+ password +'@ds049570.mongolab.com:49570/skyrimdev3';
	},
	getLive: function(username, password) {
		return 'mongodb://'+ username +':'+ password +'@ds027708.mongolab.com:27708/skyrim';
	},
	getLocal: function(username, password) {
		return 'localhost:27017/skyrim';
	}

};