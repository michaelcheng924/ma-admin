const fs = require("fs");
const jwt = require("jsonwebtoken");
const { isArray } = require("lodash");
const request = require("request");

const db = require("./db");
const data = require("../backup");

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

function resetPosts(res, collection, collectionData) {
  const deleteBatch = db.batch();

  db.collection(collection)
    .get()
    .then(snapshot => {
      snapshot.docs.forEach(doc => {
        deleteBatch.delete(doc.ref);
      });

      deleteBatch.commit().then(() => {
        const addBatch = db.batch();

        collectionData.forEach(post => {
          const ref = post.id
            ? db.collection(collection).doc(post.id)
            : db.collection(collection).doc();
          addBatch.set(ref, post);
        });

        addBatch.commit().then(() => {
          res.send({ success: true });
        });
      });
    });
}

function update(res, collection, post) {
  if (!validate(post, true)) {
    res.status(400);
    res.send({ success: false, message: "Failed validation" });
    return;
  }

  db.collection(collection)
    .doc(post.id)
    .set(post)
    .then(() => {
      res.send({ success: true });
    });
}

function create(res, collection, post) {
  if (!validate(post)) {
    res.status(400);
    res.send({ success: false, message: "Failed validation" });
    return;
  }

  db.collection(collection)
    .doc()
    .set(post)
    .then(() => {
      res.send({ success: true });
    });
}

function validate(post, isUpdate) {
  let validated = true;

  const keys = [
    "title",
    "subtitle",
    "imageUrl",
    "imageUrlSmall",
    "url",
    "content"
  ];

  if (isUpdate) {
    keys.push("id");
  }

  keys.forEach(key => {
    if (!post[key]) {
      validated = false;
    }
  });

  if (!post.tags || !isArray(post.tags)) {
    validated = false;
  }

  return validated;
}

function routes(app) {
  app.get("/api/posts", (req, res) => {
    db.collection("posts")
      .get()
      .then(snapshot => {
        const posts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        res.send({ posts });
      });
  });

  // BACKUP AND RESET
  app.post("/api/admin/backup", authorize, (req, res) => {
    db.collection("posts_staging")
      .get()
      .then(snapshot => {
        fs.writeFile(
          "./backup.js",
          `module.exports = ${JSON.stringify(
            snapshot.docs.map(doc => doc.data())
          )}`,
          () => {
            res.send({ success: true });
          }
        );
      });
  });

  app.post("/api/admin/resetposts", authorize, (req, res) => {
    resetPosts(res, "posts", data);
  });

  app.post("/api/admin/resetstaging", authorize, (req, res) => {
    resetPosts(res, "posts_staging", data);
  });

  app.get("/api/admin/getdb", authorize, (req, res) => {
    db.collection("posts")
      .get()
      .then(postsSnapshot => {
        db.collection("posts_staging")
          .get()
          .then(stagingSnapshot => {
            res.send({
              posts: postsSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
              })),
              staging: stagingSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
              })),
              backup: data
            });
          });
      });
  });

  app.post("/api/admin/migrate", authorize, (req, res) => {
    db.collection("posts_staging")
      .get()
      .then(snapshot => {
        resetPosts(
          res,
          "posts",
          snapshot.docs.map(doc => {
            return {
              ...doc.data(),
              id: doc.id
            };
          })
        );
      });
  });

  app.post("/api/admin/sitemap", authorize, (req, res) => {
    db.collection("sitemap")
      .doc("sitemap")
      .set({
        sitemap: req.body.sitemap
      })
      .then(() => {
        res.send({ success: true });
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

  app.post("/api/admin/updatepost", authorize, (req, res) => {
    const { post } = req.body;

    update(res, "posts", post);
  });

  app.post("/api/admin/updatestaging", authorize, (req, res) => {
    const { post } = req.body;

    update(res, "posts_staging", post);
  });

  app.post("/api/admin/createpost", authorize, (req, res) => {
    const { post } = req.body;

    create(res, "posts", post);
  });

  app.post("/api/admin/createstaging", authorize, (req, res) => {
    const { post } = req.body;

    create(res, "posts_staging", post);
  });
}

module.exports = routes;
