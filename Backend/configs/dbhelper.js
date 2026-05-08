const db = require("./db.js");

exports.query = function (sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values)
      .then((result) => {
        resolve(result.rows);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
