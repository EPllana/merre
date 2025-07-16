// controllers/review.js
import User from "../models/user.js";

export const addReviewToWorker = async (req, res) => {
  try {
    const workerId = req.params.id; // ID e punëtorit
    const { rating, comment } = req.body;

    // Kontrollo nëse është punëtor
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== "worker") {
      return res.status(404).json({ message: "Punëtori nuk u gjet." });
    }

    // Verifiko klientin
    const reviewerId = req.user.userId; // nga token
    if (reviewerId === workerId) {
      return res.status(403).json({ message: "Nuk mund të shkruani review për veten." });
    }

    // Shto review-n
    const newReview = {
      reviewer: reviewerId,
      rating,
      comment,
    };

    worker.reviews.push(newReview);

    // Llogarit mesataren
    const totalRatings = worker.reviews.reduce((acc, r) => acc + r.rating, 0);
    worker.averageRating = totalRatings / worker.reviews.length;

    await worker.save();

    res.status(201).json({ message: "Review u shtua me sukses.", reviews: worker.reviews });
  } catch (error) {
    console.error("Gabim gjatë shtimit të review:", error);
    res.status(500).json({ message: "Serveri deshtoi gjatë shtimit të review." });
  }
};



/// update review /////=================//==================////=================//==================////=================//==================//
export const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { reviewer, rating, comment, createdAt } = req.body;

    // Gjej user-in që ka këtë reviewId
    const user = await User.findOne({ "reviews._id": reviewId });

    if (!user) {
      return res.status(404).json({ message: "Review nuk ekziston" });
    }

    // Gjej review-in brenda user-it
    const review = user.reviews.id(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review nuk u gjet brenda user-it" });
    }

    // Përditëso fushat nëse ekzistojnë
    if (reviewer) review.reviewer = reviewer;
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (createdAt) review.createdAt = createdAt;

    await user.save(); // ruaj ndryshimet

    return res.status(200).json({ message: "Review u përditësua me sukses" });
  } catch (error) {
    console.error("Gabim gjatë përditësimit të review-it:", error.message);
    return res.status(500).json({ message: "Gabim serveri" });
  }
};
//=================//==================////=================//==================////=================//==================//
export const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Gjej user-in që ka review me id = reviewId dhe fshi review nga array reviews
    const user = await User.findOneAndUpdate(
      { "reviews._id": reviewId },
      { $pull: { reviews: { _id: reviewId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Review nuk ekziston" });
    }

    res.status(200).json({ message: "Review u fshi me sukses" });
  } catch (error) {
    console.log("Gabim në server:", error.message);
    res.status(500).json({ message: "Gabim në server gjatë fshirjes së review" });
  }
};




//=================//==================////=================//==================////=================//==================//
export const getAllWorkersReviews = async (req, res) => {
  try {
    const search = req.query.search;
    const limit = parseInt(req.query.limit) || 2;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const matchStage = {
      role: "worker"
    };

    // Nëse ka kërkim, shto kushtet
    if (search) {
      const ratingAsNumber = parseInt(search);
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { surname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "reviews.comment": { $regex: search, $options: "i" } },
        ...(isNaN(ratingAsNumber) ? [] : [{ "reviews.rating": ratingAsNumber }])
      ];
    }

    const workers = await User.aggregate([
      { $match: matchStage },

      // shpërndajmë çdo review si rresht veçmas
      { $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true } },

      // lidh reviewer-in nga koleksioni users
      {
        $lookup: {
          from: "users",
          localField: "reviews.reviewer",
          foreignField: "_id",
          as: "reviewerInfo"
        }
      },
      { $unwind: { path: "$reviewerInfo", preserveNullAndEmptyArrays: true } },

      // grupojmë prapë punëtorët me review-et e tyre
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          surname: { $first: "$surname" },
          averageRating: { $first: "$averageRating" },
          reviews: {
            $push: {
              $cond: [
                { $gt: ["$reviewerInfo._id", null] },
                {
                  _id: "$reviews._id",
                  rating: "$reviews.rating",
                  comment: "$reviews.comment",
                  createdAt: "$reviews.createdAt",
                  reviewer: {
                    _id: "$reviewerInfo._id",
                    name: "$reviewerInfo.name",
                    surname: "$reviewerInfo.surname"
                  }
                },
                "$$REMOVE"
              ]
            }
          }
        }
      },

      { $skip: skip },
      { $limit: limit }
    ]);

    const totalWorkers = await User.countDocuments({ role: "worker" });

    res.status(200).json({
      workers,
      totalWorkers,
      page,
      totalPages: Math.ceil(totalWorkers / limit)
    });
  } catch (error) {
    console.error("Gabim gjatë agregimit të review-ve:", error);
    res.status(500).json({ message: "Gabim në server gjatë marrjes së review-ve." });
  }
};

//// me im arr punetoret//====================================//===/=====/==/===/===/===/====/=======/=======
export const getWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: "worker" }).select("name surname email averageRating");
    res.status(200).json({ workers });
  } catch (error) {
    console.error("Gabim në marrjen e punëtorëve:", error);
    res.status(500).json({ message: "Serveri deshtoi gjatë marrjes së punëtorëve." });
  }
};
