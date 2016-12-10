module.exports = function(router, db) {

  router.post('/addCategory', function(req,res){
    if( typeof req.body.id == 'undefined'){
      console.log('we are in !');
      var stmt = db.prepare("INSERT into s_categories (name) VALUES (?)");
      stmt.run(req.body.name, function(err) {
        console.warn("inserted id:", this.lastID);
      });
      stmt.finalize();
    }else{
      console.log('we are out !' + req.body.id);
      var updateStmt1 = db.prepare("UPDATE s_categories set name=? where id=?");
      updateStmt1.bind(req.body.name, req.body.id);
      updateStmt1.run(function(err) {
          if(err != null){
            console.log("1phii " + err)
          }
      });
    }
    res.redirect('/manageCategories');
  });

  router.post('/places/add', function(req,res){
    console.log(typeof req.body.id);
    var objectId;
    if(req.body.id === ''){
      console.log("ID IS NULL");
      var addressId;

      var stmt = db.prepare("INSERT into d_address(address,gps_lat,gps_lan,email,phone,website) VALUES (?,?,?,?,?,?)");
      stmt.run(req.body.address, req.body.lat, req.body.lan, req.body.email, req.body.phone, req.body.website,
      function(err) {
          // err is null if insertion was successful
          console.warn("inserted id:", this.lastID);
          addressId = this.lastID;

          var stmt2 = db.prepare("INSERT into d_places(name,description,address) VALUES (?,?,?)");
          stmt2.run(req.body.name, req.body.description, addressId,
          function(err) {
              // err is null if insertion was successful
              console.warn("inserted id:", this.lastID);
              addressId = this.lastID
              objectId = this.lastID;
              red();
          });
          var test = stmt2.finalize();


      });
      stmt.finalize();
      
    }else{
      console.log("Got ID " + req.body.id);
      var updateStmt1 = db.prepare("UPDATE d_places set name=?, description=? where id=?");
      updateStmt1.bind(req.body.name, req.body.description, req.body.id);
      updateStmt1.run(function(err) {
          if(err != null){
            console.log("1phii " + err)
          }
      });

      var updateStmt2 = db.prepare("UPDATE d_address set address=?, gps_lat=?, gps_lan=?, email=?, phone=?, website=? where id = (select address from d_places where id = ?)");
      updateStmt2.bind(req.body.address, req.body.lat, req.body.lan, req.body.email, req.body.phone, req.body.website, req.body.id );
      updateStmt2.run(function(err) {
          if(err != null){
            console.log("2phii " + err)
          }
      });
      objectId = req.body.id;
      red();
    }
    /**/
    var red = function(){
      res.redirect('/places/edit/'+objectId);
    }
    
  });

}
