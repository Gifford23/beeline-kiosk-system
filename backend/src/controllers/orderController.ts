import { Request, Response } from "express";
import pool from "../config/db";

// 1. POST: Create a New Order
export const createOrder = async (req: Request, res: Response) => {
  // 1. Get order_type from the request body
  const { customer_name, total_amount, payment_method, items, order_type } =
    req.body;

  try {
    // Generate a Queue Number (e.g., Q-101)
    const queueNumber = `Q-${Math.floor(Math.random() * 1000)}`;

    // 2. Save the Main Order (Updated SQL to include order_type)
    const orderResult = await pool.query(
      `INSERT INTO orders (customer_name, total_amount, payment_method, queue_number, status, order_type) 
       VALUES ($1, $2, $3, $4, 'queued', $5) RETURNING id`,
      [
        customer_name,
        total_amount,
        payment_method,
        queueNumber,
        order_type || "dine-in", // Default to 'dine-in' if missing
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Save the Order Items (Loop through the cart)
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) 
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.quantity, item.price]
      );
    }

    res.status(201).json({ message: "Order Placed", orderId, queueNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to place order" });
  }
};

// 2. GET: Fetch all active orders for the Kitchen
export const getKitchenOrders = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id, o.queue_number, o.customer_name, o.status, o.total_amount, o.created_at, o.order_type, -- Added order_type
        json_agg(json_build_object('name', m.name, 'quantity', oi.quantity)) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE o.status != 'completed' -- Hide finished orders
      GROUP BY o.id
      ORDER BY o.created_at ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// 3. PUT: Update Status (e.g., "preparing" -> "ready")
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [
      status,
      id,
    ]);
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

// 4. GET: Fetch Dashboard Stats (Revenue & Counts) with Date Filtering
export const getOrderStats = async (req: Request, res: Response) => {
  // 1. Get the filter from URL (e.g., ?period=today)
  const { period } = req.query;

  let dateFilter = "";

  // 2. Build the SQL Date Logic based on filter
  if (period === "today") {
    // Matches only records created today
    dateFilter = "AND DATE(created_at) = CURRENT_DATE";
  } else if (period === "week") {
    // Matches records from start of current week
    dateFilter = "AND created_at >= DATE_TRUNC('week', CURRENT_DATE)";
  } else if (period === "month") {
    // Matches records from start of current month
    dateFilter = "AND created_at >= DATE_TRUNC('month', CURRENT_DATE)";
  }
  // If period is 'all' or undefined, dateFilter stays empty ""

  try {
    // A. Calculate Total Revenue (Only completed orders within date range)
    const revenueQuery = await pool.query(
      `SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed' ${dateFilter}`
    );

    // B. Count Orders by Status (All statuses within date range)
    // We use "WHERE 1=1" trick so we can easily append "AND ..."
    const countQuery = await pool.query(
      `SELECT status, COUNT(*) as count FROM orders WHERE 1=1 ${dateFilter} GROUP BY status`
    );

    const totalRevenue = revenueQuery.rows[0].total || 0;

    // Convert array to object
    const counts = countQuery.rows.reduce((acc: any, row: any) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});

    const totalOrders =
      (counts.completed || 0) +
      (counts.ready || 0) +
      (counts.preparing || 0) +
      (counts.queued || 0);

    res.json({
      revenue: totalRevenue,
      totalOrders: totalOrders,
      completedOrders: counts.completed || 0,
      activeOrders: (counts.preparing || 0) + (counts.queued || 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// 5. GET: Fetch Transaction History (For Admin Table)
export const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id, o.queue_number, o.customer_name, o.total_amount, o.status, o.payment_method, o.created_at, o.order_type, -- Added order_type
        json_agg(json_build_object('name', m.name, 'quantity', oi.quantity)) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.id
      GROUP BY o.id
      ORDER BY o.created_at DESC -- Newest first
      LIMIT 50 -- Only show last 50 orders for speed
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
