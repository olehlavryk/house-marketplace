import { useState, useEffect } from "react";
import { getAuth, updateProfile } from 'firebase/auth';
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import ListingsItem from '../components/ListingsItems';
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'

const Profile = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);

  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'listings');

      const q = query(listingsRef, where('userRef', '==', auth.currentUser.uid), orderBy('timestamp', 'desc'));
      const querySnap = await getDocs(q);

      const listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data()
        })
      });

      setListings(listings);
      setLoading(false);
    }

    fetchUserListings();
  }, [auth.currentUser.uid])

  const [changeDetails, setChangeDetails] = useState(false);

  const { name, email } = formData;

  const onLogout = () => {
    auth.signOut();
    navigate("/sign-in")
  }

  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        // update displayName in firebase
        await updateProfile(auth.currentUser, {
          displayName: name
        })

        // update displayName in firestore
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          name
        })

        toast.success('Profile details was successfully updated')
      }
    } catch (error) {
      toast.error('Could not update profile details');
    }
  }

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value
    }))
  }

  const onDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete ?')) {
      await deleteDoc(doc(db, 'listings', listingId))
      const updatedListings = listings.filter((listing) => listing.id !== listingId);
      setListings(updatedListings);
      toast.success('successfully deleted listing');
    }
  }

  const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`)

  return <div className="profile">
    <header className="profileHeader">
      <p className="pageHeader">My profile</p>
      <button type="button" onClick={onLogout} className="logOut">Log out</button>
    </header>
    <main>
      <div className="profileDetailsHeader">
        <p className="profileDetailsText">Personal Details</p>
        <p className="changePersonalDetails" onClick={() => {
          changeDetails && onSubmit();
          setChangeDetails((prevState) => !prevState);
        }}>
          {changeDetails ? 'done' : 'change'}
        </p>
      </div>
      <div className="profileCard">
        <form>
          <input
            type="text"
            id="name"
            className={!changeDetails ? 'profileName' : 'profileNameActive'}
            disabled={!changeDetails}
            value={name}
            onChange={onChange}
          />
          <input
            type="email"
            id="email"
            className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
            disabled={!changeDetails}
            value={email}
            onChange={onChange}
          />
        </form>
      </div>
      <Link to="/create-listing" className="createListing">
        <img src={homeIcon} alt="Home" />
        <p>Sale or rent your home</p>
        <img src={arrowRight} alt="Arrow right" />
      </Link>

      {
        !loading && listings?.length > 0 && (
          <>
            <p className="listingsText">Your listings</p>
            <ul className="categoryListings">
              {listings.map((listing,) => (
                <ListingsItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)} />
              ))}
            </ul>
          </>
        )
      }
    </main>
  </div>
}

export default Profile