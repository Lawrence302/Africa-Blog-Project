// connecting to the database
import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

let pool = mysql
  .createPool({
    connectionLimit: 10,
    waitForConnections: true,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD,
  })
  .promise();

// const results = await pool.query('SELECT * FROM students LIMIT 5');

export default pool;

// console.log(results[0]);
//////////////////////////////////

// pool.getConnection(function (err, connection) {
//   if (err) {
//     console.log(err);
//   } // not connected

// use the connection
//   connection.query(
//     'SELECT * FROM students LIMIT 5',
//     function (err, results, fields) {
//       console.log(results);
//       console.log(fields[0].name, fields[1].name);
//       console.log('success success');
//       // release the connection
//       connection.release();

//       // handle error after the release
//       if (err) {
//         console.log(err);
//       }
//     }
//   );
// });
