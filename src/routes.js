module.exports = function(app, cors, jwt, corsOptions, scriptVersion) {

  /**
   *  Will need routes for option on each when token auth comes in
   */

	app.get('/api/users/count', cors(corsOptions), function(req, res) {
		Modlist.find({}, {_id:1}, function(err, _modlists) {
			if(_modlists) {
				res.set('Content-Type','text/plain');
				res.send(''+_modlists.length);
			} else {
				res.writeHead(404);
				res.end();
			}
		});
	});
	app.get('/', function(req, res) {
	  res.send('<html><body><form action="/auth/signin" method="POST"><input name="username"/><input type="password" name="password"/><input type="submit"/></form></body></html>');
	})
	app.get('/api/users/list', cors(corsOptions), function(req, res) {
		Modlist.find({}, {username:1}, function(err, _mods) {
			var mods_ = [];
			for(var i = _mods.length-1, j = 0; i >= 0; i--, j++) {
				mods_[j] = _mods[i].username;
			}
			res.set('Content-Type','text/json');
			res.send({"usernames":mods_});
		});
	});
	app.get('/api/script/version', cors(corsOptions), function(req, res) {
		res.set('Content-Type','text');
		res.send(scriptVersion);
	});
	app.get('/api/user/:username/plugins', cors(corsOptions), function(req, res) {
		Modlist.findOne({username: req.params.username}, {plugins:1}, function(err, _list) {
			if(!_list) {
				res.writeHead(404);
				res.end();
			} else {
				res.setHeader('Content-Type', 'application/json');

				res.end(JSON.stringify(_list.plugins));
			}
		});
	});
	app.get('/api/user/:username/modlist', cors(corsOptions), function(req, res) {
		Modlist.findOne({username: req.params.username}, {modlist:1}, function(err, _list) {
			if(!_list) {
				res.writeHead(404);
				res.end();
			} else {
				res.setHeader('Content-Type', 'application/json');

				res.end(JSON.stringify(_list.modlist));
			}
		});
	});
	app.get('/api/user/:username/ini', cors(corsOptions), function(req, res) {
		Modlist.findOne({username: req.params.username}, {ini:1}, function(err, _list) {
			if(!_list) {
				res.writeHead(404);
				res.end();
			} else {
				res.setHeader('Content-Type', 'application/json');

				res.end(JSON.stringify(_list.ini));
			}
		});
	});
	app.get('/api/user/:username/prefsini', cors(corsOptions), function(req, res) {
		Modlist.findOne({username: req.params.username}, {prefsini:1}, function(err, _list) {
			if(!_list) {
				res.writeHead(404);
				res.end();
			} else {
				res.setHeader('Content-Type', 'application/json');

				res.end(JSON.stringify(_list.prefsini));
			}
		});
	});
	app.get('/api/user/:username/skse', cors(corsOptions), function(req, res) {
		Modlist.findOne({username: req.params.username}, {skse:1}, function(err, _list) {
			if(!_list) {
				res.writeHead(404);
				res.end();
			} else {
				res.setHeader('Content-Type', 'application/json');

				res.end(JSON.stringify(_list.skse));
			}
		});
	});
	app.get('/api/user/:username/enblocal', cors(corsOptions), function(req, res) {
		Modlist.findOne({username: req.params.username}, {enblocal:1}, function(err, _list) {
			if(!_list) {
				res.writeHead(404);
				res.end();
			} else {
				res.setHeader('Content-Type', 'application/json');

				res.end(JSON.stringify(_list.enblocal));
			}
		});
	});
	app.get('/api/user/:username/profile', cors(corsOptions), function(req, res) {
	  Modlist.findOne({username: req.params.username}, {tag:1,enb:1,badge:1,timestamp:1,game:1,_id:0}, function(err, _list) {
	    if(!_list) {
				res.writeHead(404);
				res.end();
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(_list));
			}
	  });
	});
	app.get('/api/user/:username/files', cors(corsOptions), function(req, res) {
	  Modlist.findOne({username: req.params.username}, {plugins:1,modlist:1,ini:1,prefsini:1,skse:1,enblocal:1,_id:0}, function(err, _list) {
	    if(!_list) {
				res.writeHead(404);
				res.end();
			} else {
				res.setHeader('Content-Type', 'application/json');
				var _arr = [];
				if(_list.plugins.length > 0) {
				  _arr.push("plugins");
				} if(_list.modlist.length > 0) {
				  _arr.push("modlist");
				} if(_list.ini.length > 0) {
				  _arr.push("ini");
				} if(_list.prefsini.length > 0) {
				  _arr.push("prefsini");
				} if(_list.skse.length > 0) {
				  _arr.push("skse");
				} if(_list.enblocal.length > 0) {
				  _arr.push("enblocal");
				}
				res.end(JSON.stringify(_arr));
			}
	  });
	});
	app.get('/api/search/modlist/:querystring', cors(corsOptions), function(req, res) {
    Modlist.find({}, { modlist: 1, username: 1}, function(err, users) {
        var toReturn = [];
        var queryLower = req.params.querystring.toLowerCase();
        var modnameLower;
        for(var i = 0; users && i < users.length; i++) {
          for(var j = 0; j < users[i].modlist.length; j++) {
            modnameLower = users[i].modlist[j].name.toLowerCase();
            if(modnameLower.indexOf(queryLower) >= 0) {
              toReturn.push(users[i].username);
              break;
            }
          }
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({users: toReturn, length: toReturn.length}));
    });
  });
  /*app.get('/api/search/timestamp/:from/:to', cors(corsOptions), function(req, res) {
    Modlist.find({}, {username: 1, timestamp: 1}, function(err, users) {
        var toReturn = [];
        for(var i = 0; users && i < users.length; i++) {
          toReturn.push(users[i].timestamp > );
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({users: toReturn, length: toReturn.length}));
    });
  });*/

  app.post('/auth/checkToken', cors(corsOptions), function(req, res) {
    jwt.verify(req.body.token, process.env.JWTSECRET, function(err, decoded) {
      if(err) {
        res.writeHead(403);
        res.end();
      } else {
        res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({"username":decoded.username}));
      }
    });
  });

  app.post('/auth/signin', cors(corsOptions), function(req, res) {
    Modlist.findOne({"username":req.body.username}, function(err, user) {
      if(err) {
        res.writeHead(500);
        res.end();
      } else {
        if(user && user.validPassword(req.body.password)) {
          user.pic = jwt.sign({"username":user.username,"password":user.password}, process.env.JWTSECRET, {expiresInMinutes: 720});
          user.save(function(err, user) {
            if(err) {
              res.writeHead(500);
              res.end();
            } else {
              res.json({token: user.pic});
            }
          });
        } else {
          console.log(req.body.username);
          res.writeHead(403);
          res.end();
        }
      }
    });
  });

  app.post('/newTag/:username', cors(corsOptions), ensureAuthorized, function(req, res) {
		jwt.verify(req.token, JWTSECRET, function(err, decoded) {
		  if(err) {
		    res.writeHead(403);
		    res.end();
		  } else {
		    Modlist.findOne({username: req.params.username}, function(err, _list) {
  				if(_list) {
  					_list.tag = req.body.tag;
  					_list.save(function(err) {
  						if(err) {
  							console.log(err);
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

	app.post('/newENB/:username', cors(corsOptions), ensureAuthorized, function(req, res) {
		jwt.verify(req.token, JWTSECRET, function(err, decoded) {
		  if(err) {
		    res.writeHead(403);
		    res.end();
		  } else {
		    Modlist.findOne({username: req.params.username}, function(err, _list) {
  				if(_list) {
  					_list.enb = req.body.enb;
  					_list.save(function(err) {
  						if(err) {
  							console.log(err);
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

	/*app.post('/loadorder', cors(corsOptions), function(req, res) {
		Modlist.findOne({'username' : req.body.username}, function(err, _modlist) {
			if(_modlist) { // if the username exists in the db
				if(_modlist.validPassword(req.body.password)) {
					//_modlist.UpdateOldStyleModlist();
					console.log('password valid');
					_modlist.list = '';
					_modlist.modlisttxt = '';
					_modlist.skyrimini = '';
					_modlist.skyrimprefsini = '';

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
					_modlist.save(function(err) {
						if(err) {
							res.statusCode = 500;
							console.log(err);
							res.write(err);
							res.end();
							throw err;
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

				modlist.save(function(err) {
					if(err) {
						res.statusCode = 500;
						console.logor(err);
						res.write(err);
						res.end();
						throw err;
					}
					else {
						console.log("new user created");
						res.statusCode = 200;
						res.end();
					}
				});
			}
		});
	});
	app.post('/fullloadorder', function(req, res) {
		Modlist.findOne({'username' : req.body.username}, function(err, _modlist) {
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
        // console.log(req.body.username.match('^[a-zA-Z0-9_-]*$'));
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

var Modlist = require('./modlist.min.js');

function ensureAuthorized(req, res, next) {

    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next(req, res);
    } else {
        res.send(403);
    }
}