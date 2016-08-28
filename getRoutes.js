module.exports = function(router, db) {
  router.get('/', function(req, res) {
    db.all("Select id, name, description from d_places", function(err, rows) {
      res.render('index.ejs', {data: rows});
    });
  });

  router.get('/places', function(req, res) {
    db.all("Select id, name, description from d_places", function(err, rows) {
      res.render('places.ejs', {data: rows});
    });
  });

  router.get('/manageCategories/edit/:id', function(req, res) {
    db.all("Select id, name from s_categories where id = "+ req.params.id, function(err, rows) {
      res.render('addCategory.ejs', {data: rows[0]});
    });
  });

  router.get('/manageCategories/remove/:id', function(req, res) {
    var stmt = db.prepare("delete from s_categories where id = ? ");
    stmt.run(req.params.id,  function(err) {
      console.log('removed')
    });
    stmt.finalize();
    res.redirect('/manageCategories');
  });

  router.get('/manageCategories/add', function(req, res) {
      res.render('addCategory.ejs', {});
  });

  router.get('/manageCategories', function(req, res) {
    db.all("Select id, name from s_categories", function(err, rows) {
      res.render('manageCategories.ejs', {data: rows});
    });
  });

  router.get('/places/add', function(req, res) {
    res.render('addObject.ejs', {});
  });

  router.get('/places/edit/:id', function(req, res) {
    var select = "Select dp.id, dp.name, dp.description, da.address, da.gps_lat, da.gps_lan, da.email, da.phone, da.website from d_places dp join d_address da on da.id = dp.address  and dp.id = " + req.params.id;

    db.all(select, function(err, rows) {

      res.render('addObject.ejs', {data: rows[0]});
    });
  });

};
