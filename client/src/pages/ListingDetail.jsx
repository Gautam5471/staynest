import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import BookingBox from '../components/BookingBox.jsx';
import Reviews from '../components/Reviews.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  const load = () =>
    api
      .get(`/listings/${id}`)
      .then(({ data }) => setListing(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!listing) return <Loader />;

  const images = listing.images?.length > 0 ? listing.images : [];
  const prevImage = () => setActiveImage((curr) => (curr > 0 ? curr - 1 : images.length - 1));
  const nextImage = () => setActiveImage((curr) => (curr < images.length - 1 ? curr + 1 : 0));

  return (
    <section>
      <h1>{listing.title}</h1>
      <p className="muted">
        {listing.reviewCount > 0 ? `★ ${listing.avgRating} · ${listing.reviewCount} reviews · ` : ''}
        {listing.city}, {listing.state}
      </p>

      {images.length > 0 && (
        <div className="gallery-container">
          <div className="gallery-main">
            <img src={images[activeImage] || images[0]} alt={`${listing.title} - ${activeImage + 1}`} />
            {images.length > 1 && (
              <>
                <button type="button" className="gallery-btn prev" onClick={prevImage} aria-label="Previous image">‹</button>
                <button type="button" className="gallery-btn next" onClick={nextImage} aria-label="Next image">›</button>
                <span className="gallery-badge">{activeImage + 1} / {images.length}</span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`gallery-thumb ${idx === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="detail-layout">
        <div>
          <h2>
            {listing.type} hosted by {listing.host?.name}
          </h2>
          <p className="muted">
            Up to {listing.maxGuests} guests · {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}
          </p>
          <p>{listing.description}</p>

          <h3>Amenities</h3>
          <ul className="amenities">
            {listing.amenities.map((a) => <li key={a}>✓ {a}</li>)}
          </ul>

          <h3>Location</h3>
          <p className="muted">{listing.address}, {listing.city}</p>
          {/* TODO: show a map (Leaflet + OpenStreetMap) - see issue tracker */}

          <Reviews listingId={listing._id} onReviewAdded={load} />
        </div>
        <BookingBox listing={listing} />
      </div>
    </section>
  );
}
