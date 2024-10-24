const express = require('express')
const mysql = require('mysql')
const app = express()
const expressPort = 3000

// PERMET A L'API DE COMMUNIQUER AVEC JSON
app.use(express.json())

//CONFIGURATION DE LA DB ( ADRESSE, ET IDENTIFICATION ADMIN , PORTS, ect...)
const dataBase = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'RestApi2'
})
dataBase.connect((err) =>{
    if(err){
        console.log('ERREUR DE CONNEXION A LA DATABASE !')
    } else {
        console.log('BRAVO, VOUS ÊTES CONNECTÉ A LA DATABASE!')
    }
});

app.listen(expressPort,() => {
    console.log('MON SERVEUR TOURNE SUR LE PORT : ' , expressPort);
});

app.get('/items',(req,res)=>{
    const sql ='SELECT * FROM items;'

    dataBase.query(sql, (err, results)=>{
        if (err){
            return res.status(500).json({ error : ' ERREUR DU SERVEUR '})
        }
    else{
        return res.status(200).json(results);
    }
    
    });

});

app.post('/creItem', (req, res) => {
    const { name, price, category, description } = req.body;

    
    console.log('Données reçues :', req.body);

   
    const sql = 'INSERT INTO items (name, price, category,description) VALUES (?, ?, ?, ?)';

    dataBase.query(sql, [name, price, category,description], (err, result) => {
        if (err) {
            console.log('Erreur MySQL :', err); 
            return res.status(500).json();
        }
        return res.status(200).json(result);
    });
});

app.put('/updateItem/:id', (req, res) => {
   
    const { name, price, category, description } = req.body; 
    const { id } = req.params; 
    const sql = 'UPDATE items SET name = ?, price = ?, category = ?, description = ? WHERE id = ?';

    dataBase.query(sql, [name, price, category, description, id], (err, result) => {
        if (err) {
            console.log('Erreur MySQL :', err); 
            return res.status(500).json({ error: 'Erreur du serveur lors de la mise à jour' });
        }

        else if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item non trouvé' });
        }

        return res.status(200).json({ message: 'Item mis à jour avec succès' });
    });
});

app.delete('/deleteItem/:id', (req, res) => {
    const { id } = req.params; 
    const sql = 'DELETE FROM items WHERE id = ?';

    dataBase.query(sql, [id], (err, result) => {
        if (err) {
            console.log('Erreur MySQL :', err); 
            return res.status(500).json({ error: 'Erreur du serveur lors de la suppression' });
        }
         return res.status(200).json({ message: 'Item supprimé avec succès' });
    });
});
    
app.get('/items2',(req,res)=>{
    const sql = `SELECT items.id AS item_id, category.id AS category_id
    FROM items
    INNER JOIN items_category ON items.id = items_category.items_id
    INNER JOIN category ON items_category.items_category = category.id;
`;
    dataBase.query(sql, (err, results)=>{
        if (err){
            return res.status(500).json({ error : ' ERREUR DU SERVEUR '})
        }
    else{
        return res.status(200).json(results);
    }

    });
})

app.get('/items3', (req, res) => {
    const sql = `
        SELECT items.name AS items_name
        FROM items
        INNER JOIN items_category ON items.id = items_category.items_id
        INNER JOIN category ON items_category.items_category = category.id
        WHERE category.name = 'plats'
    `;
    
    dataBase.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'ERREUR DU SERVEUR' });
        } else {
            return res.status(200).json(results);
        }
    });
});


app.post("/createItem2", (req, res) => {
    const { name, price, description, category_id } = req.body;

    
    const sqlItem = 'INSERT INTO items (name, price, description,) VALUES (?, ?, ?)';
    dataBase.query(sqlItem, [name, price, description], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: "Erreur lors de l'insertion de l'item dans la base de données."
            });
        }

        
        const itemId = result.insertId;
        const sqlItemCategory = 'INSERT INTO items_category (items_id, category_id) VALUES (?, ?)';
        dataBase.query(sqlItemCategory, [itemId, category_id], (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: "Erreur lors de l'insertion de la relation item-catégorie."
                });
            }

            return res.status(200).json({ message: "L'item a été créé avec succès et associé à la catégorie." });
        });
    });
});
  
  app.delete("/deleteItem2/:category", (req, res) => {
    const { category } = req.params;
const sql = `
    DELETE items
        FROM items 
        INNER JOIN items_category ON items.id = items_category.items_id
        INNER JOIN category ON items_category.category_id = category.id
        WHERE category.name = ?;
    `;
    
    dataBase.query(sql, [category], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ERREUR DU SERVEUR" });
        } else if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Aucun item trouvé pour cette catégorie" });
        } else {
            return res.status(200).json({ message: "Items supprimés avec succès." });
        }
    });
});



