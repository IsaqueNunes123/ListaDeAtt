const mysql = require('mysql2')
const connection = mysql.createConnection({
    host: 'nozomi.proxy.rlwy.net',
    database: 'railway',
    user: 'root',
    password: 'aqinZaUuCbesUTGKJhcizfhudlDApsih',
    port: '25875'
});

connection.connect((err) =>{
    if(err){
        console.error('erro ao conectar ao banco de dados: ' + err.stack);
        return;
    }
    console.log('conectado ao banco de dados');
});
module.exports = connection;