import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../../../../firebase/firebase';

const TotalProductValue = () => {
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const calculateTotalValue = async () => {
      try {
        const productsCollection = collection(firestore, 'products');
        const unsubscribe = onSnapshot(productsCollection, async (querySnapshot) => {
          let totalValue = 0;
          const promises = querySnapshot.docs.map(async (productDoc) => {
            const productId = productDoc.id;
            const productData = productDoc.data();
            const purchaseQuantity = await getTotalQuantity('purchases', productId);
            const saleQuantity = await getTotalQuantity('sales', productId);
            const availableQuantity = purchaseQuantity - saleQuantity;
            const purchaseRate = productData.purchaseRate || 0;
            const productValue = availableQuantity * purchaseRate;
            totalValue += productValue;
          });
          await Promise.all(promises);
          setTotalValue(totalValue);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error('Error calculating total product value:', error.message);
      }
    };

    calculateTotalValue();
  }, []);

  const getTotalQuantity = async (collectionName, productId) => {
    try {
      const collectionRef = collection(firestore, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      let totalQuantity = 0;
      querySnapshot.forEach((doc) => {
        const productData = doc.data().products.find((p) => p.productId === productId);
        totalQuantity += productData ? productData.quantity : 0;
      });
      return totalQuantity;
    } catch (error) {
      console.error(`Error fetching total quantity for ${collectionName}:`, error.message);
      return 0;
    }
  };

  return (
    <div>
      <div className="">
        <span>{totalValue.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default TotalProductValue;
