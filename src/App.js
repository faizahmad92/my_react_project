import React, { useState, useEffect } from 'react';
import './App.css';

const MainPage = () => {
  const [movieReviews, setMovieReviews] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: '',
    rating: '',
    review: '',
    reviewer: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(5);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);


  useEffect(() => {
    fetchMovieReviews();
  }, []);

  const fetchMovieReviews = async () => {
    try {
      const response = await fetch('http://172.19.160.1:3001/api/movie-reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch movie reviews');
      }
      const movieReviewsData = await response.json();
      setMovieReviews(movieReviewsData);
    } catch (error) {
      console.error('Error fetching movie reviews:', error);
    }
  };

  const togglePopup = () => {
    setShowPopup((prevShowPopup) => {
      if (!prevShowPopup && selectedMovie) {
        setNewMovie(selectedMovie);
      }
      return !prevShowPopup;
    });
  };
  
  

  const handleInputChange = (e) => {
    setNewMovie({ ...newMovie, [e.target.name]: e.target.value });
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://172.19.160.1:3001/api/movie-reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMovie),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to insert movie review');
        }
        togglePopup();
        fetchMovieReviews();
      })
      .catch((error) => {
        console.error('Error inserting movie review:', error);
      });
      setSuccessMessage('Movie review successfully added!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000); // Delay of 2000 milliseconds (2 seconds)

     //clear form with pre-filled old data.

      setNewMovie({
        title: '',
        rating: '',
        review: '',
        reviewer: ''
      });
  };

  const handleCheckboxChange = (e, id) => {
    if (e.target.checked) {
      setSelectedReviews((prevSelected) => [...prevSelected, id]);
    } else {
      setSelectedReviews((prevSelected) => prevSelected.filter((reviewId) => reviewId !== id));
    }
  };

  const handleUpdateSelected = async () => {
    if (selectedReviews.length === 0) {
      return;
    }
  
    try {
      const response = await fetch('http://172.19.160.1:3001/api/movie-reviews/update-selected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedReviews,
          title: newMovie.title,
          rating: newMovie.rating,
          review: newMovie.review,
          reviewer: newMovie.reviewer,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch selected movie reviews');
      }
  
      const selectedMovieReviews = await response.json();
      setSelectedMovie(selectedMovieReviews[0]);
      togglePopup();
    } catch (error) {
      console.error('Error fetching selected movie reviews:', error);
    }
  };


  const handleDeleteSelected = () => {
    if (selectedReviews.length === 0) {
      return;
    }
  
    const confirmation = window.confirm('Are you sure you want to delete the selected reviews?');
    if (confirmation) {
      fetch('http://172.19.160.1:3001/api/movie-reviews', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedReviews }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to delete movie reviews');
          }
          fetchMovieReviews();
          setSelectedReviews([]);
        })
        .catch((error) => {
          console.error('Error deleting movie reviews:', error);
        });
        setDeleteMessage('Movie review successfully deleted!');
        setTimeout(() => {
          setDeleteMessage('');
        }, 2000); // Delay of 2000 milliseconds (2 seconds)
    }
  };
  

  // Get current reviews
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = movieReviews.slice(indexOfFirstReview, indexOfLastReview);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="main-page">
      <header className="header">
        <h1 className="title">
          <img src={require('./PISANGKUNING.png')} alt="Movie Reviews" />
        </h1>
      </header>

<div className="movie-review-list">
  {currentReviews.map((review) => (
    <div className="movie-review" key={review.id}>
      <h2 className="movie-title">
        <input
          type="checkbox"
          checked={selectedReviews.includes(review.id)}
          onChange={(e) => handleCheckboxChange(e, review.id)}
        />
        {review.title}
      </h2>
      <p>Rating: {review.rating}</p>
      <p> {review.review}</p>
      <p>Reviewed by: {review.reviewer}</p>
    </div>
  ))}
</div>


{/* Pagination */}
<div className="pagination">
  {movieReviews.length > reviewsPerPage && (
    <div>
      <span>Show reviews per page:</span>
      <select value={reviewsPerPage} onChange={(e) => setReviewsPerPage(parseInt(e.target.value))}>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </select>
    </div>
  )}

  {movieReviews.length > reviewsPerPage && (
    <ul className="pagination-list">
      {Array.from({ length: Math.ceil(movieReviews.length / reviewsPerPage) }).map((_, index) => (
        <li key={index} className={currentPage === index + 1 ? 'active' : ''}>
          <button onClick={() => paginate(index + 1)}>{index + 1}</button>
        </li>
      ))}
    </ul>
  )}
</div>


      <button onClick={togglePopup} className="button-style">Add Movie Review</button>
      <button onClick={handleDeleteSelected}className="button-style">Delete Selected</button>
      <button onClick={handleUpdateSelected} className="button-style">Update Selected</button>

      {showPopup && (
  <div className="popup">
    <div className="popup-content">
      <h2>Add a review</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={newMovie.title}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="rating">Rating:</label>
          <input
            type="text"
            id="rating"
            name="rating"
            value={newMovie.rating}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="review">Review:</label>
          <textarea
            id="review"
            name="review"
            value={newMovie.review}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="reviewer">Reviewer:</label>
          <input
            type="text"
            id="reviewer"
            name="reviewer"
            value={newMovie.reviewer}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <button type="submit" className="button-style">Submit</button>
          <button type="button" onClick={togglePopup} className="button-style">Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}


{successMessage && (
        <div className="popup">
          <div className="popup-content success">
            <h2>Success!</h2>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

{deleteMessage && (
        <div className="popup">
          <div className="popup-content delete">
            <h2>Success!</h2>
            <p>{deleteMessage}</p>
          </div>
        </div>
      )}

      <div className="copyright">&copy; Faiz Ahmad React App Dev 2023</div>
    </div>
  );
};

export default MainPage;
