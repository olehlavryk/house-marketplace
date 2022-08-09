import React, { useState, useEffect } from "react"
import Spinner from "../components/Spinner";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import shareIcon from '../assets/svg/shareIcon.svg';
import { Link, useNavigate, useParams } from "react-router-dom"
import { getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
import { Swiper, SwiperSlide } from 'swiper/react';
import { normalizePrice } from '../utils';
import 'swiper/swiper-bundle.css';
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])


const Listing = () => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(null);

  const nagivate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log(docSnap.data());
        setListing(docSnap.data());
        setLoading(false);
      }
    }

    fetchListing()

  }, [params.listingId])

  const onCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareLinkCopied(true);
    setTimeout(() => {
      setShareLinkCopied(false);
    }, 2000)
  }
  // TODO Remove this temporary fix
  const images = listing?.imageUrls ? listing?.imageUrls : listing?.imgUrls;

  if (loading) return <Spinner />
  return (
    <main>
      <Swiper slidesPerView={1} pagination={{ clickable: true }}>
        {images.map((url, index) => (
          <SwiperSlide key={index}>
            <div style={{
              background: `url(${images[index]}) center no-repeat`,
              backgroundSize: 'cover'
            }} className="swiperSlideDiv"></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="shareIconDiv" onClick={onCopyLink}>
        <img src={shareIcon} alt="Share" />
      </div>

      {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}

      <div className="listingDetails">
        <p className="listingName">
          {listing.name} - {' '}
          {listing.offer
            ? normalizePrice(listing.discountedPrice)
            : normalizePrice(listing.regularPrice)}
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType"> For {listing.type === 'rent' ? 'Rent' : "Sale"}</p>
        {listing.offer && (
          <p className="discountPrice">
            Discount {normalizePrice(listing.regularPrice - listing.discountedPrice)}
          </p>
        )}
        <ul className="listingDetailsList">
          <li>
            {listing.bedrooms}{' '}
            {listing.bedrooms > 1 ? 'bedrooms' : 'bedroom'}
          </li>
          <li>
            {listing.bathrooms}{' '}
            {listing.bathrooms > 1 ? 'bathrooms' : 'bathroom'}
          </li>
          {listing.parking && <li>Parking spot</li>}
          {listing.furnished && <li>Furnished</li>}
        </ul>
        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className='primaryButton'
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  )
}

export default Listing;
