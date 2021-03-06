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

    var stmtRelations = db.prepare("delete from d_relationships where relationship = 1 and id_c =? ");
    stmtRelations.run(req.params.id,  function(err) {
      console.log('removed')
    });
    stmtRelations.finalize();

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
    var placeData;
    var categories;

    db.all(select, function(err, rows) {
      placeData =  rows[0];
      getCategories();
    });

    var getCategories = function() {
      db.all("Select sc.id, sc.name, dr.id as rid from s_categories sc left outer join d_relationships dr on dr.id_c = sc.id and dr.status=1 and dr.relationship=1 and dr.id_p = "+ req.params.id, function(err, rows) {
        
        categories= rows;
        renderResponse();
      });
      
    }

    var renderResponse = function(){
      res.render('addObject.ejs', {data: placeData, cat: categories});
    }
    
  });

  router.get('/places/remove/:id', function(req, res) {

    var stmtPlaces = db.prepare("delete from d_address where id = (Select address from d_places where id = ? ) ");
    stmtPlaces.run(req.params.id,  function(err) {
      console.log('removed address')
    });
    stmtPlaces.finalize();

    var stmtRelations = db.prepare("delete from d_relationships where relationship =1 and id_p = ?");
    stmtRelations.run(req.params.id,  function(err) {
      console.log('removed relationships')
    });
    stmtRelations.finalize();


    var stmt = db.prepare("delete from d_places where id = ? ");
    stmt.run(req.params.id,  function(err) {
      console.log('removed place')
    });
    stmt.finalize();
    
    res.redirect('/places');


  });

  router.get('/relationships/remove/:relationshipId/:parentId/:childId', function(req, res) {
    var stmt = db.prepare("delete from d_relationships where relationship = ? and id_p =? and id_c =? ");
    stmt.run(req.params.relationshipId,req.params.parentId,req.params.childId ,  function(err) {
      console.log('removed')
    });
    stmt.finalize();
    res.redirect('/places/edit/'+req.params.parentId);



  });

  router.get('/relationships/add/:relationshipId/:parentId/:childId', function(req, res) {
    var stmt = db.prepare("INSERT into d_relationships (relationship, id_p, id_c) VALUES (?,?,?)");
      stmt.run(req.params.relationshipId,req.params.parentId,req.params.childId , function(err) {
        console.warn("inserted id:", this.lastID);
      });
      stmt.finalize();
      res.redirect('/places/edit/'+req.params.parentId);


  });


  router.get('/generateJson', function(req, res) {
    var result = [];
    
    function sendResponse() {
      console.log('!!! Sending results');
      res.send(JSON.stringify(result));
    };

    function fillResult(){
      db.each("Select dp.id, dp.name, dp.description, da.address, da.gps_lat, da.gps_lan, da.email, da.phone, da.website from d_places dp join d_address da on da.id = dp.address", function(err, row) {
        console.log('error: '+err);
        db.all("Select * from d_relationships dr join s_categories sc on sc.id= dr.id_c and dr.status=1 and dr.relationship=1 and dr.id_p = "+ row.id, function(err, categories) {
          console.log('2error: '+err);
          row.cate = categories;
          console.log('-- pushing' + row);
          result.push(row);
          
        });

      }, sendResponse);
    };
    fillResult();
  });
  

};

