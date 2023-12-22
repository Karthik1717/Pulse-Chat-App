const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const asyncHandler = require("express-async-handler");

//Check if user is logged in
const protect = asyncHandler(async (req, res, next) => {
	let token;
	2;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			token = req.headers.authorization.split(" ")[1];

			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			req.user = await User.findById(decoded.id).select("-password");
			next();
		} catch (err) {
			res.status(401);
			throw new Error("Not Authorized, token failed!");
		}
	}
});

module.exports = protect;
