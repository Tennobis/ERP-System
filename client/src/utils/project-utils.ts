const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

/**
 * Updates the total spent amount for a specific project
 * @param projectId - The ID of the project to update
 * @param amount - The amount to add to the existing total spent
 * @returns Promise with the response data
 */
export const updateProjectSpent = async (projectId: string, amount: number): Promise<any> => {
  try {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
    const response = await fetch(`${API_URL}/projects/${projectId}/update-spent`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ amount }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log("Project spent updated successfully:", result);
      return result;
    } else {
      const errorData = await response.json();
      console.error("Failed to update project spent:", errorData);
      throw new Error(errorData.error || "Failed to update project spent");
    }
  } catch (error) {
    console.error("Error updating project spent:", error);
    throw error;
  }
};
