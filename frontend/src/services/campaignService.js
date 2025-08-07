import { getFirestore, collection, doc, addDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { app } from "../config/firebase";

const db = getFirestore(app);

// Function to create a new campaign
export const createCampaign = async (campaignData) => {
  try {
    const campaignsCollection = collection(db, 'campaigns');
    const newCampaignRef = await addDoc(campaignsCollection, {
      ...campaignData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Add DM as a member in a subcollection
    const membersCollection = collection(db, 'campaigns', newCampaignRef.id, 'members');
    await setDoc(doc(membersCollection, campaignData.dmId), { role: 'dm', joinedAt: new Date() });

    const newCampaignSnap = await getDoc(newCampaignRef);
    return { id: newCampaignSnap.id, ...newCampaignSnap.data() };
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
};

// Function to fetch all campaigns or campaigns by a specific user
export const fetchCampaigns = async (userId, type) => {
  try {
    let q = collection(db, 'campaigns');

    if (type === 'my' && userId) {
      // To fetch campaigns where the user is a member (either DM or player)
      // This requires a collection group query if members are in subcollections
      // For simplicity, assuming dmId is directly on campaign for 'my' campaigns
      // and members are checked separately for full membership.
      q = query(q, where('dmId', '==', userId));
    }

    const querySnapshot = await getDocs(q);
    const campaignsList = [];
    for (const docSnap of querySnapshot.docs) {
      const campaign = { id: docSnap.id, ...docSnap.data() };
      // Optionally fetch members for each campaign if needed here, but can be done on detail page
      campaignsList.push(campaign);
    }
    return campaignsList;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

// Function to join a campaign
export const joinCampaign = async (campaignId, userId) => {
  try {
    const memberDocRef = doc(db, 'campaigns', campaignId, 'members', userId);
    await setDoc(memberDocRef, { role: 'player', joinedAt: new Date() });
    console.log(`User ${userId} joined campaign ${campaignId}`);
  } catch (error) {
    console.error("Error joining campaign:", error);
    throw error;
  }
};

// Function to leave a campaign
export const leaveCampaign = async (campaignId, userId) => {
  try {
    const memberDocRef = doc(db, 'campaigns', campaignId, 'members', userId);
    await deleteDoc(memberDocRef);
    console.log(`User ${userId} left campaign ${campaignId}`);
  } catch (error) {
    console.error("Error leaving campaign:", error);
    throw error;
  }
};

// Function to fetch a single campaign by ID
export const fetchCampaignById = async (campaignId) => {
  try {
    const campaignDocRef = doc(db, 'campaigns', campaignId);
    const campaignSnap = await campaignDocRef.get();
    if (campaignSnap.exists()) {
      return { id: campaignSnap.id, ...campaignSnap.data() };
    } else {
      console.log("No such campaign!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching campaign by ID:", error);
    throw error;
  }
};

// Function to update a campaign
export const updateCampaign = async (campaignId, updateData) => {
  try {
    const campaignDocRef = doc(db, 'campaigns', campaignId);
    await updateDoc(campaignDocRef, { ...updateData, updatedAt: new Date() });
    console.log(`Campaign ${campaignId} updated successfully`);
  } catch (error) {
    console.error("Error updating campaign:", error);
    throw error;
  }
};

// Function to delete a campaign
export const deleteCampaign = async (campaignId) => {
  try {
    const campaignDocRef = doc(db, 'campaigns', campaignId);
    await deleteDoc(campaignDocRef);
    console.log(`Campaign ${campaignId} deleted successfully`);
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
};
