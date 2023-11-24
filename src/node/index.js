const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const port = 3322;

const cors = require("cors");
app.use(cors());

const { Pool } = require("pg");
const pool = new Pool({
  user: "user_3322", // PostgreSQLのユーザー名に置き換えてください
  host: "db",
  database: "crm_3322", // PostgreSQLのデータベース名に置き換えてください
  password: "pass_3322", // PostgreSQLのパスワードに置き換えてください
  port: 5432,
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/customers", async (req, res) => {
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.send(customerData.rows);
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/add-customer", async (req, res) => {
  try {
    const { companyName, industry, contact, location } = req.body;
    const newCustomer = await pool.query(
      "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [companyName, industry, contact, location]
    );
    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.use(express.static("public"));

// 既存のコードに追加
app.get("/customer/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const customerData = await pool.query("SELECT * FROM customers WHERE customer_id = $1", [customerId]);

    if (customerData.rows.length > 0) {
      res.json(customerData.rows[0]);
    } else {
      res.status(404).send("Customer not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// 既存のコードに追加
app.delete("/customer/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    console.log(`Deleting customer with ID: ${customerId}`);
    const deletedCustomer = await pool.query("DELETE FROM customers WHERE customer_id = $1 RETURNING *", [customerId]);

    if (deletedCustomer.rows.length > 0) {
      res.json({ success: true, customer: deletedCustomer.rows[0] });
    } else {
      res.status(404).send("Customer not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// 既存のコードに追加
app.put("/customer/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    console.log("PUT request to /customer/:customerId");
    // リクエストボディからデータを取得
    const { companyName, industry, contact, location } = req.body;

    // ここでデータベースの customers テーブルを更新するクエリを実行
    const updatedCustomer = await pool.query(
      "UPDATE customers SET company_name = $1, industry = $2, contact = $3, location = $4 WHERE customer_id = $5 RETURNING *",
      [companyName, industry, contact, location, customerId]
    );

    if (updatedCustomer.rows.length > 0) {
      res.json({ success: true, customer: updatedCustomer.rows[0] });
    } else {
      res.status(404).send("Customer not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
