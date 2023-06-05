
//importing required dependencies
const cors = require('cors');
const express = require('express');

//create instance for express application
const app = express();

//configure port servers
const port = 3001;

//pgsql database connection setting
const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'abc123',
  host: 'localhost',
  port: 5432,
  database: 'movie',
});

//enable Cross-Origin Resource Sharing
app.use(cors());
// Parse JSON request body
app.use(express.json()); 

//API for fetch data from database
app.get('/api/movie-reviews', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM movies');
    const movieReviews = result.rows;
    client.release();
    res.json(movieReviews);
  } catch (error) {
    console.error('Error fetching movie reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//API for inserting data into database
app.post('/api/movie-reviews', async (req, res) => {
  try {
    const { title, rating, review, reviewer ,genre} = req.body;
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO movies (title, rating, review, reviewer ,genre) VALUES ($1, $2, $3, $4 ,$5) RETURNING *',
      [title, rating, review, reviewer,genre]
    );
    const newMovieReview = result.rows[0];
    client.release();
    res.status(201).json(newMovieReview);
  } catch (error) {
    console.error('Error inserting movie review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//API for data deletion from database
app.delete('/api/movie-reviews', async (req, res) => {
  try {
    const { ids } = req.body;
    const client = await pool.connect();
    const result = await client.query('DELETE FROM movies WHERE id = ANY($1::int[]) RETURNING *', [ids]);
    const deletedMovieReviews = result.rows;
    client.release();
    res.json(deletedMovieReviews);
  } catch (error) {
    console.error('Error deleting movie reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//starting backend server
app.listen(port, () => {
  console.log(`Backend API server is running on http://localhost:${port}`);
});
