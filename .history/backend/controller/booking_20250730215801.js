import Booking from '../models/booking.js';
import User from '../models/user.js';

export const createBooking = async (req, res) => {
  try {
    const { worker, date, timeSlot, location,pricePerPerson } = req.body;
    const user = req.user.userId; // Merr userId nga token

    if (!worker || !date || !timeSlot || !location) {
      return res.status(400).json({ message: 'Ju lutem plotësoni të gjitha fushat.' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Nuk je i autorizuar.' });
    }

    const foundWorker = await User.findById(worker);
    if (!foundWorker || foundWorker.role !== 'worker') {
      return res.status(404).json({ message: 'Punëtori nuk u gjet.' });
    }

    const newBooking = new Booking({
      user,
      worker,
      date,
      timeSlot,
      location
    });

    await newBooking.save();

    res.status(201).json({ 
      message: 'Booking u krijua me sukses.', 
      booking: newBooking 
    });

  } catch (err) {
    console.error('Gabim në createBooking:', err);
    res.status(500).json({ message: 'Gabim në server.', error: err.message });
  }
};


export const updateBookings = async (req, res) => {
  try{
  
   const bookingId = req.params.id;
   const { date, timeSlot, location } = req.body;
   const booking = await Booking.findByIdAndUpdate(bookingId)
   if(!booking){return res.status(404).json({message:"Booking doesnt exist"})}

     // Kontrollo nëse përdoruesi është pronari ose admin
  const userId = req.user.userId;
  const userRole = req.user.role; 

  if (booking.user.toString() !== userId && userRole !== 'admin') {//Nëse ID-ja e përdoruesit që ka krijuar booking-un (booking.user) nuk është e njëjtë me ID-në e përdoruesit të kyçur (userId), 
    //dhe për më tepër roli i përdoruesit të kyçur nuk është 'admin', atëherë… (duhet të ndalojmë veprimin)"

    return res.status(403).json({ message: "Nuk ke të drejtë të përditësosh këtë booking." });
  }

   if(date)booking.date=date;
   if(timeSlot)booking.timeSlot=timeSlot;
   if(location)booking.location=location;

   const updatedBookings = await booking.save();
   res.status(200).json({
    message: "Booking u përditësua me sukses.",
    booking: updatedBookings
});

  } catch (err) {
    console.error("Gabim në updateBookings:", err);
    res.status(500).json({ message: "Gabim në server.", error: err.message });
}
};
   

export const getBookings = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!userId) {
      return res.status(401).json({ message: 'Nuk je i autorizuar.' });
    }

    let filter = {};

    // Nëse nuk je admin, shfaq vetëm rezervimet e tua
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    // Nëse ka status në query, filtro sipas tij
    if (status) {
      filter.status = status;
    }

    // Nëse ka search, filtro sipas emrit të user ose worker
    if (search) {
      const matchingUsers = await User.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');

      const matchingUserIds = matchingUsers.map(user => user._id);

      filter.$or = [
        { user: { $in: matchingUserIds } },
        { worker: { $in: matchingUserIds } }
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('worker', 'name email')
      .populate('user', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      bookings
    });

  } catch (err) {
    console.error('Gabim në getBookings:', err);
    res.status(500).json({ message: 'Gabim në server.', error: err.message });
  }
};


export const confirmedBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking-u nuk u gjet." });
    }

    // ✅ Vetëm punëtori që e ka booking-un ose admini mund ta konfirmojë
    if (booking.worker.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: "Nuk ke të drejtë ta konfirmosh këtë booking." });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({ message: "Booking-u u konfirmua me sukses.", booking });
  } catch (err) {
    console.error('Gabim në confirmedBooking:', err);
    res.status(500).json({ message: "Gabim në server.", error: err.message });
  }
};



export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking-u nuk u gjet." });
    }

    // ✅ Vetëm punëtori që e ka booking-un ose admini mund ta anulojë
    if (booking.worker.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: "Nuk ke të drejtë ta anulosh këtë booking." });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({ message: "Booking-u u anulua me sukses.", booking });
  } catch (err) {
    console.error('Gabim në cancelBooking:', err);
    res.status(500).json({ message: "Gabim në server.", error: err.message });
  }
};


export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking nuk u gjet.' });
    }

    // Vetëm pronari i booking ose admini mund të fshijë
    if (booking.user.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Nuk ke të drejtë të fshish këtë booking.' });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({ message: 'Booking u fshi me sukses.' });

  } catch (err) {
    console.error('Gabim në deleteBooking:', err);
    res.status(500).json({ message: 'Gabim në server.', error: err.message });
  }
};
