import { useState, useEffect } from "react";
import turniData from "../data/turni.json"; // ✅ Import diretto

export const useLoadTurni = () => {
  const [turni, setTurni] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTurni = async () => {
      try {
        setTurni(turniData); // ✅ Nessun bisogno di leggere il file manualmente
      } catch (error) {
        console.error("Errore nel caricamento dei turni:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTurni();
  }, []);

  return { turni, loading };
};
