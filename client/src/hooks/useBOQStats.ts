import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { useUserFilter } from "@/contexts/UserFilterContext";

const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface BOQ {
  id: string;
  names: string;
  description: string;
  template: string;
  workPackage: string;
  unitSystem: string;
  currency: string;
  rateDatabase: string;
  analysisMethod: string;
  contingency: number;
  overhead: number;
  profitMargin: number;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    client: {
      name: string;
    };
  };
  createdBy: {
    name: string;
  };
}

interface BOQStats {
  totalBOQs: number;
  monthlyGrowth: number;
  activeProjects: number;
  avgProfitMargin: number;
  avgContingency: number;
  avgOverhead: number;
  pendingBOQs: number;
  totalValue: string;
  loading: boolean;
}

export const useBOQStats = (): BOQStats => {
  const [boqs, setBOQs] = useState<BOQ[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { targetUserId , currentUser , selectedUser, selectedUserId} = useUserFilter()
  const userID = targetUserId || user?.id || ""
  useEffect(() => {
    const fetchBOQs = async () => {
      // if (!userID) {
      //   setLoading(false);
      //   return;
      // }

      try {
        setLoading(true);
        const token =
          sessionStorage.getItem("jwt_token") ||
          localStorage.getItem("jwt_token_backup");

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const endpoint = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
          ? `${API_URL}/boqs`
          : `${API_URL}/boqs?userId=${userID}`;
        const response = await axios.get(endpoint, {
          headers,
        });
        setBOQs(response.data);
      } catch (error) {
        console.error("Error fetching BOQ stats:", error);
        setBOQs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBOQs();
  }, [userID]);

  // Calculate statistics
  const totalBOQs = boqs.length;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const monthlyGrowth = boqs.filter(
    (boq) => new Date(boq.createdAt) > thirtyDaysAgo
  ).length;

  const activeProjects = new Set(boqs.map((boq) => boq.project.id)).size;
  
  const avgProfitMargin = totalBOQs > 0 
    ? Math.round(
        boqs.reduce((sum, boq) => sum + boq.profitMargin, 0) / totalBOQs
      )
    : 0;

  const avgContingency = totalBOQs > 0
    ? Math.round(
        boqs.reduce((sum, boq) => sum + boq.contingency, 0) / totalBOQs
      )
    : 0;

  const avgOverhead = totalBOQs > 0
    ? Math.round(
        boqs.reduce((sum, boq) => sum + boq.overhead, 0) / totalBOQs
      )
    : 0;

  // For now, consider BOQs created in last 7 days as "pending"
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const pendingBOQs = boqs.filter(
    (boq) => new Date(boq.createdAt) > sevenDaysAgo
  ).length;

  // Estimated total value (this would need actual item calculations in a real system)
  const estimatedValuePerBOQ = 50000; // 50k average per BOQ
  const totalValue = `₹${Math.round((totalBOQs * estimatedValuePerBOQ) / 100000)}L`;

  return {
    totalBOQs,
    monthlyGrowth,
    activeProjects,
    avgProfitMargin,
    avgContingency,
    avgOverhead,
    pendingBOQs,
    totalValue,
    loading,
  };
};
