import { Request, Response } from "express";
import pool from "../config/db";

// Get all menu items
export const getMenu = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM menu_items ORDER BY category, name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ... keep getMenu ...

// 2. POST: Add a new Item
export const addMenuItem = async (req: Request, res: Response) => {
  const { name, price, category, image_url, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO menu_items (name, price, category, image_url, description) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, price, category, image_url, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add item" });
  }
};

// 3. PUT: Update an Item (e.g. change price)
export const updateMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, category, image_url, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE menu_items 
       SET name=$1, price=$2, category=$3, image_url=$4, description=$5 
       WHERE id=$6 RETURNING *`,
      [name, price, category, image_url, description, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
};

// 4. DELETE: Remove an Item
export const deleteMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM menu_items WHERE id = $1", [id]);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
};

// ... existing functions ...

// 5. PATCH: Toggle Availability (In Stock / Out of Stock)
export const toggleMenuItemStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // This SQL flips the boolean value (True -> False, False -> True)
    const result = await pool.query(
      "UPDATE menu_items SET is_available = NOT is_available WHERE id = $1 RETURNING *",
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
};
