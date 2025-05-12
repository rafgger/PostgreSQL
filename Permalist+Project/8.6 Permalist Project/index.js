import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "password",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getItems(){
  try {
    const result = await db.query("SELECT * FROM items");
    // console.log(result.rows);
    items = result.rows;
    // let items = [];
    // result.rows.forEach((item) => {
    //   items.push(item.title);
    // });
  return items;
  } catch (err) {
    console.log(err);   
  }
}


app.get("/", async (req, res) => {
  const items = await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;

  try {
    // Insert the new item into the database
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).send("Error adding item");
  }
});

app.post("/edit", async (req, res) => { 

  const itemId  = req.body.updatedItemId;
  const itemTitle  = req.body.updatedItemTitle;

  try {
      await db.query(
      "UPDATE items SET title = $1 WHERE id = $2 RETURNING *;",
      [itemTitle, itemId]
    ); 
    res.redirect("/");
    } catch (err) {
    console.log(err);   
  } 
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  //  const id = result.rows[0].id;
  //  currentUserId = id; 
});


app.post("/delete", async (req, res) => {
  
  const itemId  = req.body.deleteItemId;

  try {
    await db.query(
    "DELETE FROM items WHERE id = $1;",
    [itemId]
    ); 
  res.redirect("/");
  } catch (err) {
  console.log(err);   
} 
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
