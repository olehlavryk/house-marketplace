import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import ListingsItems from '../components/ListingsItems';

function Offers() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchListing, setLastFetchListing] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // get reference
        const listingsRef = collection(db, 'listings');

        // create a query
        const q = query(
          listingsRef, where('offer', '==', true),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        // execute query
        const querySnap = await getDocs(q);

        const lastVisible = querySnap.docs[querySnap.docs.length - 1]

        setLastFetchListing(lastVisible);

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
  }, [])

  const onFetchMoreListings = async () => {
    try {
      // get reference
      const listingsRef = collection(db, 'listings');

      // create a query
      const q = query(
        listingsRef, where('offer', '==', true),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchListing),
        limit(10)
      );

      // execute query
      const querySnap = await getDocs(q);

      const lastVisible = querySnap.docs[querySnap.docs.length - 1]

      setLastFetchListing(lastVisible);

      const listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data()
        })
      })

      // set states
      setListings((prevState) => [...prevState, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error('Could not fetch listings');
    }
  }

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          Offers
        </p>
      </header>
      <main>
        {loading
          ? <Spinner />
          : listings && listings.length > 0
            ? <>
              <ul className="categoryListings">
                {listings.map((listing, index) => (
                  <ListingsItems listing={listing.data} id={listing.id} key={index} />
                ))}
              </ul>
              <br />
              <br />
              {lastFetchListing && (
                <p className="loadMore" onClick={onFetchMoreListings}>Load More</p>
              )}
            </>
            : <p>There are no current offers</p>}
      </main>
    </div>
  )
}

export default Offers