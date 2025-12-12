import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
    
        if (req.method === "OPTIONS") {
        return next();
    }


    const token = req.cookies.token;
    // console.log("is-auth api testing...",token);
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next(); // continue to the protected route
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
