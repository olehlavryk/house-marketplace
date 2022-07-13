import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = useParams()
  const categoryName = params.categoryName;



  useEffect(() => {
    const fetchListings = async () => {
      try {
        // get reference
        const listingsRef = collection(db, 'listings');

        // create a query
        const q = query(
          listingsRef, where('type', '==', categoryName),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        // execute query
        const querySnap = await getDocs(q);

        const listings = [];

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data()
          })
        })

        // set states
        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error('Could not fetch listings');
      }
    }

    fetchListings();
  }, [categoryName])

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {categoryName === 'rent'
            ? 'Places for rent'
            : 'Places for sale'}
        </p>
      </header>
      <main>
        {loading
          ? <Spinner />
          : listings && listings.length > 0
            ? <>
              <ul className="categoryListings">
                {listings.map((item, index) => (
                  <li key={index}>
                    <h3>{item.data.name}</h3>
                  </li>
                ))}
              </ul>
            </>
            : <p>No listings for {categoryName}</p>}
      </main>
    </div>
  )
}

export default Category