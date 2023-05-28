const cors = require('cors');
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3001;

const pool = new Pool({
  user: 'postgres',
  password: 'abc123',
  host: 'localhost',
  port: 5432,
  database: 'movie',
});

app.use(cors());
app.use(express.json()); // Parse JSON request body

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

app.post('/api/movie-reviews', async (req, res) => {
  try {
    const { title, rating, review, reviewer } = req.body;
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO movies (title, rating, review, reviewer) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, rating, review, reviewer]
    );
    const newMovieReview = result.rows[0];
    client.release();
    res.status(201).json(newMovieReview);
  } catch (error) {
    console.error('Error inserting movie review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

app.patch('/api/movie-reviews/update-selected', async (req, res) => {
  try {
    const { selectedReviews, title, rating, review, reviewer } = req.body;
    const client = await pool.connect();
    const updatePromises = selectedReviews.map(async (reviewId) => {
      const result = await client.query(
        'UPDATE movies SET title = $1, rating = $2, review = $3, reviewer = $4 WHERE id = $5 RETURNING *',
        [title, rating, review, reviewer, reviewId]
      );
      return result.rows[0];
    });
    const updatedMovieReviews = await Promise.all(updatePromises);
    client.release();
    res.json(updatedMovieReviews);
  } catch (error) {
    console.error('Error updating selected movie reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.listen(port, () => {
  console.log(`Backend API server is running on http://localhost:${port}`);
});
