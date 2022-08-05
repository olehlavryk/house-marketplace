import React, { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
import Spinner from "../components/Spinner";
import { normalizePrice } from '../utils';
import shareIcon from '../assets/svg/shareIcon.svg';

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

  if (loading) return <Spinner />

  return (
    <main>
      {/* Slider */}
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
        <p className="listingLocationTitle">Location</p>
        {/* Map */}
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
