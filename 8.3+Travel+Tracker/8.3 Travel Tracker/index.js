import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "password",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
  console.log(result.rows);
  const countries = await checkVisited();
  res.render("index.ejs", { countries: countries, total: countries.length});
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  try {    
    // Check if the country exists in the database
    const result = await db.query("SELECT country_code FROM countries WHERE country_name = $1", [input]);

    const countryCode = result.rows[0].country_code;
    console.log(countryCode);
    

    // Check if the country is already in the visited_countries table
    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode]);
      res.redirect("/");
    } catch (err) {
      // Country already added
      const countries = await checkVisited();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
      // return res.status(400).json({ message: "Country already added." });
    }
  } catch (error) {
    console.error("Error adding country:", error);
    const countries = await checkVisited();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
