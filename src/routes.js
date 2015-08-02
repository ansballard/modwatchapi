var Modlist = require("./modlist.min.js");

var supportedFiletypes = [
	"plugins",
	"modlist",
	"ini",
	"prefsini",
	"skse",
	"enblocal"
];

var validFiletype = function validFileType(filetype) { "use strict";
	return supportedFiletypes.indexOf(filetype) >= 0;
};

var ensureAuthorized = function ensureAuthorized(req, res, next) { "use strict";

	var bearerToken;
	var bearerHeader = req.headers.authorization;
	if (typeof bearerHeader !== "undefined") {
		var bearer = bearerHeader.split(" ");
		bearerToken = bearer[1];
		req.token = bearerToken;
		next(req, res);
	} else {
		res.send(403);
	}
};

module.exports = function(app, jwt, scriptVersion) { "use strict";

  /**
   *  Will need routes for option on each when token auth comes in
   */

	app.get("/api/users/count", function(req, res) {
		Modlist.find({}, {_id: 1}, function(err, _modlists) {
			if(_modlists) {
				res.set("Content-Type", "text/plain");
				res.send("" + _modlists.length);
			} else {
				res.writeHead(404);
				res.end();
			}
		});
	});
	app.get("/api/users/list", function(req, res) {
		Modlist.find({}, {username: 1}, function(err, _mods) {
			var mods = [];
			for(var i = _mods.length - 1, j = 0; i >= 0; i--, j++) {
				mods[j] = _mods[i].username;
			}
			res.set("Content-Type", "text/json");
			res.send({"usernames": mods});
		});
	});
	app.get("/api/script/version", function(req, res) {
		res.set("Content-Type", "text/plain");
		res.end(scriptVersion);
	});
	app.get("/api/user/:username/file/:filetype", function(req, res) {
		if(validFiletype(req.params.filetype)) {
			var filetypeJSON = {};
			filetypeJSON[req.params.filetype] = 1;
			Modlist.findOne({username: req.params.username}, filetypeJSON, function(err, _list) {
				if(!_list) {
					res.writeHead(404);
					res.end();
				} else {
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify(_list[req.params.filetype]));
				}
			});
		} else {
			res.sendStatus(500);
		}
	});
	app.get("/api/user/:username/rawfile/:filetype", function(req, res) {
		if (validFiletype(req.params.filetype)) {
			var filetypeJSON = {};
			filetypeJSON[req.params.filetype] = 1;
			Modlist.findOne({
				username: req.params.username
			}, filetypeJSON, function(err, _list) {
				if (!_list) {
					res.writeHead(404);
					res.end();
				} else {
					res.setHeader("Content-Type", "text/plain");
					var textList = [];
					for(var i = 0; i < _list[req.params.filetype].length; i++) {
						textList.push(_list[req.params.filetype][i].name);
					}
					res.end(textList.join("\n"));
				}
			});
		} else {
			res.sendStatus(500);
		}
	});
	app.get("/api/user/:username/profile", function(req, res) {
		Modlist.findOne({username: req.params.username}, {tag: 1, enb: 1, badge: 1, timestamp: 1, game: 1, _id: 0}, function(err, _list) {
			if(!_list) {
				res.writeHead(404);
				res.end();
			} else {
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(_list));
			}
		});
	});
	app.get("/api/user/:username/files", function(req, res) {
		Modlist.findOne({username: req.params.username}, {plugins: 1, modlist: 1, ini: 1, prefsini: 1, skse: 1, enblocal: 1, _id: 0}, function(err, _list) {
			if(!_list) {
				res.writeHead(404);
				res.end();
			} else {
				res.setHeader("Content-Type", "application/json");
				var arr = [];
				if(_list.plugins.length > 0) {
					arr.push("plugins");
				} if(_list.modlist.length > 0) {
					arr.push("modlist");
				} if(_list.ini.length > 0) {
					arr.push("ini");
				} if(_list.prefsini.length > 0) {
					arr.push("prefsini");
				} if(_list.skse.length > 0) {
					arr.push("skse");
				} if(_list.enblocal.length > 0) {
					arr.push("enblocal");
				}
				res.end(JSON.stringify(arr));
			}
		});
	});
	app.get("/api/search/file/:filetype/:querystring", function(req, res) {
		if(validFiletype(req.params.filetype)) {
			var filetypeJSON = {username: 1};
			filetypeJSON[req.params.filetype] = 1;
			Modlist.find({}, filetypeJSON, function(err, users) {
				var toReturn = [];
				var queryLower = req.params.querystring.toLowerCase();
				var fileLower;
				for(var i = 0; users && i < users.length; i++) {
					for(var j = 0; j < users[i][req.params.filetype].length; j++) {
						fileLower = users[i][req.params.filetype][j].name.toLowerCase();
						if(fileLower.indexOf(queryLower) >= 0) {
							toReturn.push(users[i].username);
							break;
						}
					}
				}
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({users: toReturn, length: toReturn.length}));
			});
		} else {
			res.sendStatus(500);
		}

  });
  /*app.get("/api/search/timestamp/:from/:to", function(req, res) {
    Modlist.find({}, {username: 1, timestamp: 1}, function(err, users) {
        var toReturn = [];
        for(var i = 0; users && i < users.length; i++) {
          toReturn.push(users[i].timestamp > );
        }
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({users: toReturn, length: toReturn.length}));
    });
  });*/

  app.post("/auth/checkToken", function(req, res) {
    jwt.verify(req.body.token, process.env.JWTSECRET, function(err, decoded) {
      if(err) {
        res.writeHead(403);
        res.end();
      } else {
        res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({"username": decoded.username}));
      }
    });
  });

  app.post("/auth/signin", function(req, res) {
    Modlist.findOne({"username": req.body.username}, function(err, user) {
      if(err) {
        res.writeHead(500);
        res.end();
      } else {
        if(user && user.validPassword(req.body.password)) {
          user.pic = jwt.sign({"username": user.username, "password": user.password}, process.env.JWTSECRET, {expiresInMinutes: 720});
          user.save(function(saveErr, saveUser) {
            if(saveErr) {
              res.writeHead(500);
              res.end();
            } else {
              res.json({token: saveUser.pic});
            }
          });
        } else {
          //console.log(req.body.username);
          res.writeHead(403);
          res.end();
        }
      }
    });
  });

  app.post("/api/newTag/:username", ensureAuthorized, function(req, res) {
		jwt.verify(req.token, process.env.JWTSECRET, function(err, decoded) {
			if(err) {
				res.writeHead(403);
				res.end();
			} else {
				Modlist.findOne({username: req.params.username}, function(findErr, _list) {
					if(_list) {
						_list.tag = req.body.tag;
						_list.save(function(saveErr) {
							if(saveErr) {
								res.writeHead(500);
								res.end();
							} else {
								res.statusCode = 200;
								res.end();
							}
						});
					} else {
						res.writeHead(404);
						res.end();
					}
				});
			}
		});
	});

	app.post("/api/newENB/:username", ensureAuthorized, function(req, res) {
		jwt.verify(req.token, process.env.JWTSECRET, function(err, decoded) {
			if(err) {
				res.writeHead(403);
				res.end();
			} else {
				Modlist.findOne({username: req.params.username}, function(findErr, _list) {
					if(_list) {
						_list.enb = req.body.enb;
						_list.save(function(saveErr) {
							if(saveErr) {
								res.writeHead(500);
								res.end();
							} else {
								res.statusCode = 200;
								res.end();
							}
						});
					} else {
						res.writeHead(404);
						res.end();
					}
				});
			}
		});
	});
	app.post("/loadorder", function(req, res) {
		Modlist.findOne({"username": req.body.username}, function(err, _modlist) {
			if(_modlist) { // if the username exists in the db
				if(_modlist.validPassword(req.body.password)) {
					if(_modlist.list || _modlist.modlisttxt || _modlist.skyrimini || _modlist.skyrimprefsini) {
						_modlist.list = undefined;
						_modlist.modlisttxt = undefined;
						_modlist.skyrimini = undefined;
						_modlist.skyrimprefsini = undefined;
					}
					_modlist.plugins = req.body.plugins;
					_modlist.modlist = req.body.modlist;
					_modlist.ini = req.body.ini;
					_modlist.prefsini = req.body.prefsini;
					_modlist.skse = req.body.skse;
					_modlist.enblocal = req.body.enblocal;
					_modlist.enb = req.body.enb;
					_modlist.game = req.body.game;
					_modlist.tag = req.body.tag;
					_modlist.timestamp = Date.now();
					/*_modlist.save(function(saveErr) {
						if(saveErr) {
							res.statusCode = 500;
							res.write(saveErr);
							res.end();
							throw saveErr;
						} else {
							res.statusCode = 200;
							res.end();
						}
					});*/
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify(_modlist));
				}
				else {
					res.statusCode = 403;
					res.write("Access denied, incorrect password");
					res.end();
				}
			}
			else { // if the username does not exist
				var modlist = new Modlist();
				modlist.plugins = req.body.plugins;
				modlist.modlist = req.body.modlist;
				modlist.ini = req.body.ini;
				modlist.prefsini = req.body.prefsini;
				modlist.skse = req.body.skse;
				modlist.enblocal = req.body.enblocal;
				modlist.enb = req.body.enb;
				modlist.game = req.body.game;
				modlist.tag = req.body.tag;
				modlist.timestamp = Date.now();
				modlist.username = req.body.username;
				modlist.password = modlist.generateHash(req.body.password);
				/*modlist.save(function(saveErr) {
					if(saveErr) {
						res.statusCode = 500;
						res.write(saveErr);
						res.end();
						throw saveErr;
					}
					else {
						console.log("new user created");
						res.statusCode = 200;
						res.end();
					}
				});*/
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify(modlist));
			}
		});
	});
	/*
	app.post("/fullloadorder", function(req, res) {
		Modlist.findOne({"username" : req.body.username}, function(err, _modlist) {
			if(_modlist) { // if the username exists in the db
				//console.log(req.body.modlisttxt);
				if(_modlist.validPassword(req.body.password)) {
					_modlist.list = req.body.plugins;
					_modlist.modlisttxt = req.body.modlisttxt;
					_modlist.skyrimini = req.body.skyrimini;
					_modlist.skyrimprefsini = req.body.skyrimprefsini;
					_modlist.timestamp = Date.now();
					_modlist.save(function(err) {
						if(err) {
							res.statusCode = 500;
							console.logor(err);
							res.write(err);
							res.end();
							throw err;
						} else {
							_modlist.UpdateOldStyleModlist();
							res.statusCode = 200;
							res.end();
						}
					});
				}
				else {
					res.statusCode = 403;
					res.write("Access denied, incorrect password");
					res.end();
				}
			}
			else { // if the username does not exist
        // ^[a-zA-Z0-9_-]*$
        // console.log(req.body.username.match("^[a-zA-Z0-9_-]*$"));
        // if match then create, else error out
				var modlist = new Modlist();
				modlist.list = req.body.plugins;
				modlist.modlisttxt = req.body.modlisttxt;
				modlist.skyrimini = req.body.skyrimini;
				modlist.skyrimprefsini = req.body.skyrimprefsini;
				modlist.username = req.body.username;
				modlist.timestamp = Date.now();
				modlist.password = modlist.generateHash(req.body.password);

				modlist.save(function(err) {
					if(err) {
						res.statusCode = 500;
						console.logor(err);
						res.write(err);
						res.end();
						throw err;
					}
					else {
						modlist.UpdateOldStyleModlist();
						res.statusCode = 200;
						res.end();
					}
				});
			}
		});
	});*/
};
