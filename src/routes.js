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

var tokenEnsureAuthorized = function tokenEnsureAuthorized(req, res, next) { "use strict";

	var bearerToken;
	var bearerHeader = req.headers.authorization;
	if (typeof bearerHeader !== "undefined") {
		var bearer = bearerHeader.split(" ");
		bearerToken = bearer[1];
		req.token = bearerToken;
		next();
	} else {
		res.sendStatus(403);
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
		Modlist.find({}, {username: 1, timestamp: 1, score: 1}, function(err, _mods) {
			var mods = [];
			for(var i = _mods.length - 1, j = 0; i >= 0; i--, j++) {
				mods[j] = {"username": _mods[i].username, "score": _mods[i].score, "timestamp": _mods[i].timestamp};
			}
			res.set("Content-Type", "application/json");
			res.send(mods);
		});
	});
	app.get("/api/script/version", function(req, res) {
		res.set("Content-Type", "text/plain");
		res.end(scriptVersion["0.2"]);
	});
	app.get("/api/script/version/3", function(req, res) {
		res.set("Content-Type", "text/plain");
		res.end(scriptVersion["0.3"]);
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
					_list.shrinkArrays();
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
					_list.shrinkArrays();
					res.setHeader("Content-Type", "text/plain");
					var textList = [];
					for(var i = 0; i < _list[req.params.filetype].length; i++) {
						textList.push(_list[req.params.filetype][i]);
					}
					res.end(textList.join("\n"));
				}
			});
		} else {
			res.sendStatus(500);
		}
	});
	app.get("/api/user/:username/profile", function(req, res) {
		Modlist.findOne({username: req.params.username}, {tag: 1, enb: 1, badge: 1, timestamp: 1, game: 1, score: 1, _id: 0}, function(err, _list) {
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
					users[i].shrinkArrays();
					for(var j = 0; j < users[i][req.params.filetype].length; j++) {
						fileLower = users[i][req.params.filetype][j].toLowerCase();
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

  app.post("/api/newTag/:username", tokenEnsureAuthorized, function(req, res) {
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
	app.post("/api/newENB/:username", tokenEnsureAuthorized, function(req, res) {
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
	app.post("/auth/upvote/:votee", tokenEnsureAuthorized, function(req, res) {
		jwt.verify(req.token, process.env.JWTSECRET, function(jwtVerifyErr, decoded) {
			if(jwtVerifyErr) {
				res.writeHead(403);
				res.write("jwt verification error");
				res.end();
			} else if(decoded.username === req.params.votee) {
				res.writeHead(403);
				res.write("You can't vote for yourself");
				res.end();
			} else if(decoded) {
				Modlist.findOne({"username": decoded.username}, function(voterFindErr, voter) {
					var voterInfo = voter.votedOnUser(req.params.votee);
					if(voter && !voterInfo.upvoted) {
						Modlist.findOne({"username": req.params.votee}, function(findVoteeErr, votee) {
							if(votee) {
								if(voterInfo.index === -1) {
									votee.score += 1;
								} else {
									votee.score += 2;
								}
								votee.save(function saveVotee(voteeSaveErr) {
									if(voteeSaveErr) {
										res.writeHead(500);
										res.write("Error saving votee info");
										res.end();
									} else {
										res.setHeader("Content-Type", "application/json");
										res.end(JSON.stringify({"score": votee.score}));
									}
								});
								if(voterInfo.index !== -1) {
									voter.votedon[voterInfo.index].upvoted = true;
								} else {
									voter.votedon.push({"username": req.params.votee, "upvoted": true});
								}
								voter.save(function saveVoter(saveVoterErr) {
									if(saveVoterErr) {
										console.log(saveVoterErr);
									} else {
										console.log("Saved voter.votedon");
									}
								});
							} else {
								res.writeHead(404);
								res.write("jwt verification error");
								res.end();
							}
						});
					} else {
						res.writeHead(403);
						if(!voter) {
							res.write("Voter not found");
						} else {
							res.write("Voter already voted");
						}
						res.end();
					}
				});
			} else {
				res.writeHead(403);
				res.write("Voter not found");
				res.end();
			}
		});
	});
	app.post("/auth/downvote/:votee", tokenEnsureAuthorized, function(req, res) {
		jwt.verify(req.token, process.env.JWTSECRET, function(jwtVerifyErr, decoded) {
			if(jwtVerifyErr) {
				res.writeHead(403);
				res.write("jwt verification error");
				res.end();
			} else if(decoded.username === req.params.votee) {
				res.writeHead(403);
				res.write("Why would you downvote yourself?");
				res.end();
			} else if(decoded) {
				Modlist.findOne({"username": decoded.username}, function(voterFindErr, voter) {
					var voterInfo = voter.votedOnUser(req.params.votee);
					if(voter && (voterInfo.index === -1 || voterInfo.upvoted)) {
						Modlist.findOne({"username": req.params.votee}, function(findVoteeErr, votee) {
							if(votee) {
								if(voterInfo.index === -1) {
									votee.score -= 1;
								} else {
									votee.score -= 2;
								}
								votee.save(function saveVotee(voteeSaveErr) {
									if(voteeSaveErr) {
										res.writeHead(500);
										res.write("Error saving votee info");
										res.end();
									} else {
										res.setHeader("Content-Type", "application/json");
										res.end(JSON.stringify({"score": votee.score}));
									}
								});
								if(voterInfo.index !== -1) {
									voter.votedon[voterInfo.index].upvoted = false;
								} else {
									voter.votedon.push({"username": req.params.votee, "upvoted": false});
								}
								voter.save(function saveVoter(saveVoterErr) {
									if(saveVoterErr) {
										console.log(saveVoterErr);
									} else {
										console.log("Saved voter.votedon");
									}
								});
							} else {
								res.writeHead(404);
								res.write("jwt verification error");
								res.end();
							}
						});
					} else {
						res.writeHead(403);
						if(!voter) {
							res.write("Voter not found");
						} else {
							res.write("Voter already voted");
						}
						res.end();
					}
				});
			} else {
				res.writeHead(403);
				res.write("Voter not found");
				res.end();
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
					_modlist.save(function(saveErr) {
						if(saveErr) {
							res.statusCode = 500;
							res.write("Saving to server failed");
							res.end();
						} else {
							res.statusCode = 200;
							res.write("Access denied, incorrect password");
							res.end();
						}
					});
					//res.setHeader("Content-Type", "application/json");
					//res.end(JSON.stringify({body: req.body, modlist: _modlist}));
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
				modlist.save(function(saveErr) {
					if(saveErr) {
						res.statusCode = 500;
						res.end();
					}
					else {
						res.statusCode = 200;
						res.end();
					}
				});
				//res.setHeader("Content-Type", "application/json");
				//res.end(JSON.stringify(modlist));
			}
		});
	});
	app.post("/fullloadorder", function(req, res) {
		Modlist.findOne({"username": req.body.username}, function(err, _modlist) {
			if(_modlist) { // if the username exists in the db
				if(_modlist.validPassword(req.body.password)) {
					_modlist.plugins = _modlist.updateFile(req.body.plugins, "plugins");
					_modlist.modlist = _modlist.updateFile(req.body.modlisttxt, "modlist");
					_modlist.ini = _modlist.updateFile(req.body.skyrimini, "ini");
					_modlist.prefsini = _modlist.updateFile(req.body.skyrimprefsini, "prefsini");
					_modlist.timestamp = Date.now();
					_modlist.save(function(saveErr) {
						if(saveErr) {
							res.statusCode = 500;
							res.end();
						} else {
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
				var modlist = new Modlist();
				modlist.plugins = modlist.updateFile(req.body.plugins, "plugins");
				modlist.modlist = modlist.updateFile(req.body.modlisttxt, "modlist");
				modlist.ini = modlist.updateFile(req.body.skyrimini, "ini");
				modlist.prefsini = modlist.updateFile(req.body.skyrimprefsini, "prefsini");
				modlist.username = req.body.username;
				modlist.password = modlist.generateHash(req.body.password);
				modlist.timestamp = Date.now();
				modlist.save(function(saveErr) {
					if(saveErr) {
						res.statusCode = 500;
						res.end();
					}
					else {
						res.statusCode = 200;
						res.end();
					}
				});
			}
		});
	});
};
