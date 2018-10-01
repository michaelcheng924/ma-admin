const jwt = require("jsonwebtoken");

const db = require("./db");

function authorize(req, res, next) {
  if (!req.headers.authorization) {
    res.send({
      success: false
    });

    return;
  }

  const token = req.headers.authorization.split(" ")[1];

  if (jwt.decode(token, process.env.JWTSECRET)) {
    next();
  } else {
    res.send({
      success: false
    });
  }
}

function routes(app) {
  app.get("/api/posts", (req, res) => {
    db.collection("posts")
      .get()
      .then(snapshot => {
        const posts = snapshot.docs.map(doc => doc.data());

        res.send({ posts });
      });
  });

  // ADMIN

  app.post("/api/admin/login", (req, res) => {
    if (req.body.pw === process.env.PW) {
      const token = jwt.sign(req.body.pw, process.env.JWTSECRET);

      res.send({
        success: true,
        token
      });
    } else {
      res.send({ success: false });
    }
  });

  app.post("/api/admin/checktoken", (req, res) => {
    const token = req.body.token;

    if (!token) {
      res.send({ success: false });
    } else {
      const isAuthenticated = jwt.decode(token, process.env.JWTSECRET);

      if (isAuthenticated) {
        res.send({ success: true });
      } else {
        res.send({ success: false });
      }
    }
  });
}

module.exports = routes;
