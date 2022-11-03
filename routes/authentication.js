const express = require('express');
const router = express.Router();
const fs = require('firebase-admin');
const {getAuth, signInWithEmailAndPassword, signInWithCustomToken} = require("firebase/auth");

router.post('/signUp',async  (req, res) => {

  let customTkn = "...";

  fs.auth().createUser({
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        displayName: req.body.displayName,
    })
    .then((userRecord) => {
      const data = {
        "email": req.body.email,
        "phoneNumber": req.body.phoneNumber,
        "displayName": req.body.displayName,
        "uid" : userRecord.uid
      };
      fs.auth()
      .createCustomToken(userRecord.uid)
      .then((customToken) => {
        customTkn = customToken;
        const db = fs.firestore(); 
        db.collection("Users").doc(userRecord.uid).set(data);
        res.status(200).send({"loginDetails" : userRecord, "customToken" : customTkn});
      })
      .catch((error) => {
        const db = fs.firestore(); 
        db.collection("Users").doc(userRecord.uid).set(data);
        res.status(200).send({"loginDetails" : userRecord, "customToken" : customTkn});
      });  
    })
    .catch((error) => {
      console.log('Error creating new user:', error);
      res.status(400).send({
        "error" : error.message
      });
    });
});

router.post('/signIn',async  (req, res) => {

  const auth = getAuth();
  let customTkn = "...";
  signInWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then((userCredential) => {
      fs.auth()
      .createCustomToken(userCredential.user.uid)
      .then((customToken) => {
        customTkn = customToken;
        const user = userCredential.user;
        res.status(200).send({"loginDetails" : user, "customToken" : customTkn});
      })
      .catch((error) => {
        const user = userCredential.user;
        res.status(200).send({"loginDetails" : user, "customToken" : customTkn});
      }); 
    })
    .catch((error) => {
      res.status(400).send({
        "error" : error.message
      });
    });
});

module.exports = router;