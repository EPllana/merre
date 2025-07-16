export const getOperationPoints = (req, res) => {
    const points = [
      { order: 1, lat: 42.661902, lng: 21.136183, description: " Arberi, Pristina 10000" },
      { order: 2, lat: 42.650261, lng: 21.148253, description: " Kalabria, Pristina" },
      { order: 3, lat: 42.653165, lng: 21.144305, description: " Pristina" },
      { order: 4, lat: 42.661824, lng: 21.149607, description: " Arberi, Pristina 10000" },
      { order: 5, lat: 42.646887, lng: 21.185838, description: " Matiqan, Pristina 10000" },
      { order: 6, lat: 42.645378, lng: 21.181827, description: " Matiqan, Pristina 10000" },
      { order: 7, lat: 42.675877, lng: 21.166098, description: " Kodra e Trimave, Pristina" },
      { order: 8, lat: 42.631954, lng: 21.159180, description: " Veternik" }
    ];
  
    res.json(points);
  };
  