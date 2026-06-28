import api from './api';
import { toast } from 'react-hot-toast';

/**
 * Downloads the official beautiful donation receipt PDF from the backend.
 * 
 * @param {Object} donation - The donation details containing _id.
 */
export const generateDonationReceipt = async (donation) => {
  const toastId = toast.loading("Downloading receipt...");
  try {
    const response = await api.get(`/donations/${donation._id}/receipt`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const receiptNo = donation.receiptNumber || donation.donationReference || donation._id;
    link.setAttribute('download', `Donation_Receipt_${receiptNo}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Receipt downloaded successfully!", { id: toastId });
  } catch (error) {
    console.error("Failed to download receipt PDF:", error);
    toast.error("Failed to download receipt PDF.", { id: toastId });
    throw error;
  }
};
